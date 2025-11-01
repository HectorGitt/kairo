from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import zipfile
import io


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = os.environ['JWT_ALGORITHM']
JWT_EXPIRATION_HOURS = int(os.environ['JWT_EXPIRATION_HOURS'])

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    user: User

class BrowsingSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    url: str
    title: str
    domain: str
    category: str  # productive, neutral, distraction
    time_spent: int  # in seconds
    tab_switches: int = 0  # number of context switches during this session
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BrowsingSessionCreate(BaseModel):
    url: str
    title: str
    domain: str
    category: str
    time_spent: int
    tab_switches: int = 0

class DailyInsight(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str  # YYYY-MM-DD
    total_time: int  # in seconds
    productive_time: int
    distraction_time: int
    focus_score: int  # 0-100
    ai_insights: str
    top_distractions: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FocusGoal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    goal_type: str  # daily_focus_hours, limit_distractions, etc.
    target_value: int
    current_value: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FocusGoalCreate(BaseModel):
    goal_type: str
    target_value: int

class Integration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    integration_type: str  # notion, google_calendar, slack, google_fit, chrome_extension
    status: str = "disconnected"  # connected, disconnected
    credentials: dict = {}
    settings: dict = {}
    connected_at: Optional[datetime] = None
    last_synced: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IntegrationConnect(BaseModel):
    integration_type: str
    credentials: dict = {}
    settings: dict = {}

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    profession: str = ""
    work_focus: List[str] = []
    important_sites: List[dict] = []  # [{"domain": "twitter.com", "category": "productive", "reason": "Social media management"}]
    interests: List[str] = []
    learning_goals: List[str] = []
    custom_rules: List[dict] = []  # [{"pattern": "youtube.com", "category": "productive", "condition": "work hours"}]
    ai_generated: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProfileCreate(BaseModel):
    profession: str = ""
    work_focus: List[str] = []
    important_sites: List[dict] = []
    interests: List[str] = []
    learning_goals: List[str] = []

class UserProfileAIRequest(BaseModel):
    description: str  # User's free-form description of their work/life

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return User(**user)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username
    )
    
    # Store user with hashed password
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['password_hash'] = hash_password(user_data.password)
    
    await db.users.insert_one(user_doc)
    
    # Create token
    token = create_token(user.id, user.email)
    
    return TokenResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(credentials.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Convert timestamp back to datetime
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    token = create_token(user.id, user.email)
    
    return TokenResponse(token=token, user=user)

# ==================== BROWSING SESSION ROUTES ====================

@api_router.post("/browsing/session", response_model=BrowsingSession)
async def create_browsing_session(
    session_data: BrowsingSessionCreate,
    current_user: User = Depends(get_current_user)
):
    session = BrowsingSession(
        user_id=current_user.id,
        **session_data.model_dump()
    )
    
    session_doc = session.model_dump()
    session_doc['timestamp'] = session_doc['timestamp'].isoformat()
    
    await db.browsing_sessions.insert_one(session_doc)
    return session

@api_router.get("/browsing/sessions", response_model=List[BrowsingSession])
async def get_browsing_sessions(
    date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    query = {"user_id": current_user.id}
    
    if date:
        # Filter by specific date
        start_date = datetime.fromisoformat(date)
        end_date = start_date + timedelta(days=1)
        query["timestamp"] = {
            "$gte": start_date.isoformat(),
            "$lt": end_date.isoformat()
        }
    
    sessions = await db.browsing_sessions.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    
    # Convert timestamps
    for session in sessions:
        if isinstance(session['timestamp'], str):
            session['timestamp'] = datetime.fromisoformat(session['timestamp'])
    
    return sessions

@api_router.get("/browsing/stats")
async def get_browsing_stats(
    date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    query = {"user_id": current_user.id}
    
    if date:
        start_date = datetime.fromisoformat(date)
        end_date = start_date + timedelta(days=1)
        query["timestamp"] = {
            "$gte": start_date.isoformat(),
            "$lt": end_date.isoformat()
        }
    
    sessions = await db.browsing_sessions.find(query, {"_id": 0}).to_list(10000)
    
    total_time = sum(s['time_spent'] for s in sessions)
    productive_time = sum(s['time_spent'] for s in sessions if s['category'] == 'productive')
    distraction_time = sum(s['time_spent'] for s in sessions if s['category'] == 'distraction')
    neutral_time = sum(s['time_spent'] for s in sessions if s['category'] == 'neutral')
    
    # Calculate focus score (0-100)
    focus_score = 0
    if total_time > 0:
        focus_score = int((productive_time / total_time) * 100)
    
    # Get top distractions
    distraction_domains = {}
    for session in sessions:
        if session['category'] == 'distraction':
            domain = session['domain']
            distraction_domains[domain] = distraction_domains.get(domain, 0) + session['time_spent']
    
    top_distractions = sorted(distraction_domains.items(), key=lambda x: x[1], reverse=True)[:5]
    top_distractions = [{'domain': d[0], 'time': d[1]} for d in top_distractions]
    
    # Get top productive sites
    productive_domains = {}
    for session in sessions:
        if session['category'] == 'productive':
            domain = session['domain']
            productive_domains[domain] = productive_domains.get(domain, 0) + session['time_spent']
    
    top_productive = sorted(productive_domains.items(), key=lambda x: x[1], reverse=True)[:5]
    top_productive = [{'domain': d[0], 'time': d[1]} for d in top_productive]
    
    # Calculate context switches
    total_switches = sum(s.get('tab_switches', 0) for s in sessions)
    
    # Calculate average focus streak (average session time for productive sessions)
    productive_sessions = [s for s in sessions if s['category'] == 'productive']
    avg_focus_streak = 0
    if productive_sessions:
        avg_focus_streak = sum(s['time_spent'] for s in productive_sessions) / len(productive_sessions)
    
    # Peak focus hours (hour with most productive time)
    hourly_productive = {}
    for session in sessions:
        if session['category'] == 'productive':
            timestamp = session['timestamp']
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp)
            hour = timestamp.hour
            hourly_productive[hour] = hourly_productive.get(hour, 0) + session['time_spent']
    
    peak_hours = []
    if hourly_productive:
        sorted_hours = sorted(hourly_productive.items(), key=lambda x: x[1], reverse=True)
        peak_hours = [h[0] for h in sorted_hours[:3]]
    
    return {
        "total_time": total_time,
        "productive_time": productive_time,
        "distraction_time": distraction_time,
        "neutral_time": neutral_time,
        "focus_score": focus_score,
        "top_distractions": top_distractions,
        "top_productive": top_productive,
        "session_count": len(sessions),
        "context_switches": total_switches,
        "avg_focus_streak": int(avg_focus_streak),
        "peak_focus_hours": peak_hours,
        "switches_per_hour": round(total_switches / (total_time / 3600), 1) if total_time > 0 else 0
    }

@api_router.get("/browsing/weekly-summary")
async def get_weekly_summary(current_user: User = Depends(get_current_user)):
    """Get comprehensive weekly metrics including streaks and attention health"""
    
    # Get last 7 days of insights
    today = datetime.now(timezone.utc)
    seven_days_ago = today - timedelta(days=7)
    
    insights = await db.daily_insights.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("date", -1).limit(7).to_list(7)
    
    if not insights:
        return {
            "focus_streak": 0,
            "weekly_improvement": 0,
            "attention_health": 0,
            "total_focus_time": 0,
            "badges": [],
            "weekly_trend": []
        }
    
    # Calculate focus streak (consecutive days with focus_score > 60)
    focus_streak = 0
    for insight in sorted(insights, key=lambda x: x['date'], reverse=True):
        if insight['focus_score'] >= 60:
            focus_streak += 1
        else:
            break
    
    # Calculate weekly improvement
    if len(insights) >= 7:
        recent_avg = sum(i['focus_score'] for i in insights[:4]) / 4
        older_avg = sum(i['focus_score'] for i in insights[4:]) / len(insights[4:])
        weekly_improvement = int(((recent_avg - older_avg) / older_avg) * 100) if older_avg > 0 else 0
    else:
        weekly_improvement = 0
    
    # Calculate attention health score (0-100)
    # Weighted combination of: consistency (30%), focus_score (40%), streak (20%), improvement (10%)
    avg_focus = sum(i['focus_score'] for i in insights) / len(insights) if insights else 0
    consistency = (len(insights) / 7) * 100  # percentage of days tracked
    streak_score = min(focus_streak * 10, 100)  # cap at 100
    improvement_score = max(0, min(weekly_improvement + 50, 100))  # normalize to 0-100
    
    attention_health = int(
        (avg_focus * 0.4) +
        (consistency * 0.3) +
        (streak_score * 0.2) +
        (improvement_score * 0.1)
    )
    
    # Calculate total weekly focus time
    total_focus_time = sum(i['productive_time'] for i in insights)
    
    # Determine badges
    badges = []
    if focus_streak >= 3:
        badges.append({"name": "3-Day Streak", "icon": "🔥", "color": "#f59e0b"})
    if focus_streak >= 5:
        badges.append({"name": "5-Day Streak", "icon": "⭐", "color": "#10b981"})
    if focus_streak >= 7:
        badges.append({"name": "Weekly Champion", "icon": "🏆", "color": "#8b5cf6"})
    if total_focus_time >= 10800:  # 3 hours
        badges.append({"name": "3-Hour Flow", "icon": "🌊", "color": "#06b6d4"})
    if avg_focus >= 80:
        badges.append({"name": "Focus Ninja", "icon": "🥷", "color": "#ef4444"})
    if attention_health >= 90:
        badges.append({"name": "Elite Focus", "icon": "💎", "color": "#a855f7"})
    
    # Weekly trend data
    weekly_trend = []
    for insight in sorted(insights, key=lambda x: x['date']):
        date_obj = datetime.fromisoformat(insight['date']) if isinstance(insight['date'], str) else insight['date']
        weekly_trend.append({
            "date": insight['date'],
            "day": date_obj.strftime("%a"),
            "focus_score": insight['focus_score'],
            "productive_time": insight['productive_time'],
            "distraction_time": insight['distraction_time']
        })
    
    return {
        "focus_streak": focus_streak,
        "weekly_improvement": weekly_improvement,
        "attention_health": attention_health,
        "total_focus_time": total_focus_time,
        "badges": badges,
        "weekly_trend": weekly_trend,
        "avg_focus_score": int(avg_focus),
        "consistency_rate": int(consistency)
    }

# ==================== AI INSIGHTS ROUTES ====================

@api_router.post("/insights/generate")
async def generate_insights(
    date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    # Get stats for the date
    if not date:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    query = {"user_id": current_user.id}
    start_date = datetime.fromisoformat(date)
    end_date = start_date + timedelta(days=1)
    query["timestamp"] = {
        "$gte": start_date.isoformat(),
        "$lt": end_date.isoformat()
    }
    
    sessions = await db.browsing_sessions.find(query, {"_id": 0}).to_list(10000)
    
    if not sessions:
        return {"insights": "No browsing data available for this date. Start using Kairo to track your focus!"}
    
    # Prepare data for AI
    total_time = sum(s['time_spent'] for s in sessions)
    productive_time = sum(s['time_spent'] for s in sessions if s['category'] == 'productive')
    distraction_time = sum(s['time_spent'] for s in sessions if s['category'] == 'distraction')
    
    # Get top distractions
    distraction_domains = {}
    for session in sessions:
        if session['category'] == 'distraction':
            domain = session['domain']
            distraction_domains[domain] = distraction_domains.get(domain, 0) + session['time_spent']
    
    top_distractions = sorted(distraction_domains.items(), key=lambda x: x[1], reverse=True)[:3]
    top_distractions_str = ", ".join([f"{d[0]} ({d[1]//60} min)" for d in top_distractions])
    
    # Generate AI insights using Claude Sonnet 4
    try:
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=f"insights_{current_user.id}_{date}",
            system_message="You are Kairo, an empathetic AI accountability partner. Provide encouraging, actionable insights about the user's focus patterns. Be warm, understanding, and constructive. Keep insights concise (2-3 paragraphs)."
        ).with_model("anthropic", "claude-3-7-sonnet-20250219")
        
        prompt = f"""Analyze this user's browsing activity for today:

Total time: {total_time//60} minutes
Productive time: {productive_time//60} minutes ({int((productive_time/total_time)*100) if total_time > 0 else 0}%)
Distraction time: {distraction_time//60} minutes ({int((distraction_time/total_time)*100) if total_time > 0 else 0}%)
Top distractions: {top_distractions_str if top_distractions_str else 'None'}

Provide personalized insights:
1. Celebrate what went well
2. Identify patterns in distractions
3. Suggest one specific, actionable improvement for tomorrow

Be encouraging and human. This is about progress, not perfection."""
        
        user_message = UserMessage(text=prompt)
        insights = await chat.send_message(user_message)
        
        # Store insights
        focus_score = int((productive_time / total_time) * 100) if total_time > 0 else 0
        daily_insight = DailyInsight(
            user_id=current_user.id,
            date=date,
            total_time=total_time,
            productive_time=productive_time,
            distraction_time=distraction_time,
            focus_score=focus_score,
            ai_insights=insights,
            top_distractions=[d[0] for d in top_distractions]
        )
        
        insight_doc = daily_insight.model_dump()
        insight_doc['created_at'] = insight_doc['created_at'].isoformat()
        
        # Upsert (update if exists, insert if not)
        await db.daily_insights.replace_one(
            {"user_id": current_user.id, "date": date},
            insight_doc,
            upsert=True
        )
        
        return {"insights": insights, "focus_score": focus_score}
    
    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate insights")

@api_router.get("/insights/daily", response_model=List[DailyInsight])
async def get_daily_insights(
    limit: int = 7,
    current_user: User = Depends(get_current_user)
):
    insights = await db.daily_insights.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("date", -1).limit(limit).to_list(limit)
    
    for insight in insights:
        if isinstance(insight['created_at'], str):
            insight['created_at'] = datetime.fromisoformat(insight['created_at'])
    
    return insights

# ==================== FOCUS GOALS ROUTES ====================

@api_router.post("/goals", response_model=FocusGoal)
async def create_goal(
    goal_data: FocusGoalCreate,
    current_user: User = Depends(get_current_user)
):
    goal = FocusGoal(
        user_id=current_user.id,
        **goal_data.model_dump()
    )
    
    goal_doc = goal.model_dump()
    goal_doc['created_at'] = goal_doc['created_at'].isoformat()
    
    await db.focus_goals.insert_one(goal_doc)
    return goal

@api_router.get("/goals", response_model=List[FocusGoal])
async def get_goals(current_user: User = Depends(get_current_user)):
    goals = await db.focus_goals.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(100)
    
    for goal in goals:
        if isinstance(goal['created_at'], str):
            goal['created_at'] = datetime.fromisoformat(goal['created_at'])
    
    return goals

# ==================== USER PROFILE ROUTES ====================

@api_router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get user's personalization profile"""
    profile = await db.user_profiles.find_one(
        {"user_id": current_user.id},
        {"_id": 0}
    )
    
    if not profile:
        return {
            "user_id": current_user.id,
            "profession": "",
            "work_focus": [],
            "important_sites": [],
            "interests": [],
            "learning_goals": [],
            "custom_rules": [],
            "ai_generated": False
        }
    
    if isinstance(profile.get('created_at'), str):
        profile['created_at'] = datetime.fromisoformat(profile['created_at'])
    if isinstance(profile.get('updated_at'), str):
        profile['updated_at'] = datetime.fromisoformat(profile['updated_at'])
    
    return profile

@api_router.post("/profile")
async def update_profile(
    profile_data: UserProfileCreate,
    current_user: User = Depends(get_current_user)
):
    """Update user's personalization profile"""
    # Check if profile exists
    existing = await db.user_profiles.find_one({"user_id": current_user.id})
    
    if existing:
        # Update existing
        await db.user_profiles.update_one(
            {"user_id": current_user.id},
            {"$set": {
                **profile_data.model_dump(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        # Create new
        profile = UserProfile(
            user_id=current_user.id,
            **profile_data.model_dump()
        )
        profile_doc = profile.model_dump()
        profile_doc['created_at'] = profile_doc['created_at'].isoformat()
        profile_doc['updated_at'] = profile_doc['updated_at'].isoformat()
        await db.user_profiles.insert_one(profile_doc)
    
    return {"message": "Profile updated successfully"}

@api_router.post("/profile/generate-ai")
async def generate_ai_profile(
    data: UserProfileAIRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate personalized profile using AI"""
    try:
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=f"profile_gen_{current_user.id}",
            system_message="You are a focus productivity expert. Analyze user descriptions and generate personalized site categorization rules."
        ).with_model("anthropic", "claude-3-7-sonnet-20250219")
        
        prompt = f\"\"\"Based on this description, generate a personalized focus profile:

\"{data.description}\"

Return a JSON object with:
1. profession: Their job/role
2. work_focus: Array of work areas (e.g., ["social media", "content creation"])
3. important_sites: Array of sites critical for their work with categorization
   Format: [{{"domain": "twitter.com", "category": "productive", "reason": "Social media management"}}]
4. interests: Array of personal interests
5. learning_goals: Array of what they're learning

Be specific about which sites should be productive vs distraction for THIS person.
Consider: content creators need social media, developers need GitHub/StackOverflow, etc.

Return ONLY the JSON object, no explanation.\"\"\"
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse AI response
        import json
        try:
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                ai_data = json.loads(response[json_start:json_end])
            else:
                ai_data = json.loads(response)
            
            # Create profile
            profile = UserProfile(
                user_id=current_user.id,
                profession=ai_data.get('profession', ''),
                work_focus=ai_data.get('work_focus', []),
                important_sites=ai_data.get('important_sites', []),
                interests=ai_data.get('interests', []),
                learning_goals=ai_data.get('learning_goals', []),
                ai_generated=True
            )
            
            profile_doc = profile.model_dump()
            profile_doc['created_at'] = profile_doc['created_at'].isoformat()
            profile_doc['updated_at'] = profile_doc['updated_at'].isoformat()
            
            # Replace existing profile
            await db.user_profiles.replace_one(
                {"user_id": current_user.id},
                profile_doc,
                upsert=True
            )
            
            return {
                "message": "AI profile generated successfully",
                "profile": profile
            }
        
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {response}")
            raise HTTPException(status_code=500, detail="Failed to parse AI response")
    
    except Exception as e:
        logger.error(f"Error generating AI profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate AI profile")

@api_router.get("/profile/categorization-rules")
async def get_categorization_rules(current_user: User = Depends(get_current_user)):
    """Get dynamic categorization rules for the extension"""
    profile = await db.user_profiles.find_one(
        {"user_id": current_user.id},
        {"_id": 0}
    )
    
    if not profile:
        # Return default generic rules
        return {
            "productive": ["github.com", "stackoverflow.com", "docs.", "developer.", "notion.so"],
            "distraction": ["youtube.com", "facebook.com", "twitter.com", "instagram.com", "reddit.com", "tiktok.com"],
            "custom_sites": [],
            "profile_set": False
        }
    
    # Build custom rules based on profile
    productive_sites = ["github.com", "stackoverflow.com", "docs.", "developer."]
    distraction_sites = ["youtube.com", "facebook.com", "instagram.com", "tiktok.com"]
    
    # Add user's important sites
    custom_sites = []
    for site in profile.get('important_sites', []):
        domain = site['domain']
        category = site['category']
        
        if category == 'productive' and domain not in productive_sites:
            productive_sites.append(domain)
            custom_sites.append(site)
        elif category == 'distraction' and domain in distraction_sites:
            distraction_sites.remove(domain)
    
    return {
        "productive": productive_sites,
        "distraction": distraction_sites,
        "custom_sites": custom_sites,
        "profile_set": True,
        "profession": profile.get('profession', ''),
        "work_focus": profile.get('work_focus', [])
    }

# ==================== INTEGRATIONS ROUTES ====================

@api_router.get("/integrations", response_model=List[Integration])
async def get_integrations(current_user: User = Depends(get_current_user)):
    """Get all integrations for the user"""
    integrations = await db.integrations.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(100)
    
    for integration in integrations:
        if isinstance(integration.get('created_at'), str):
            integration['created_at'] = datetime.fromisoformat(integration['created_at'])
        if integration.get('connected_at') and isinstance(integration['connected_at'], str):
            integration['connected_at'] = datetime.fromisoformat(integration['connected_at'])
        if integration.get('last_synced') and isinstance(integration['last_synced'], str):
            integration['last_synced'] = datetime.fromisoformat(integration['last_synced'])
    
    return integrations

@api_router.post("/integrations/connect")
async def connect_integration(
    data: IntegrationConnect,
    current_user: User = Depends(get_current_user)
):
    """Connect a new integration"""
    # Check if integration already exists
    existing = await db.integrations.find_one({
        "user_id": current_user.id,
        "integration_type": data.integration_type
    })
    
    if existing:
        # Update existing
        await db.integrations.update_one(
            {"user_id": current_user.id, "integration_type": data.integration_type},
            {"$set": {
                "status": "connected",
                "credentials": data.credentials,
                "settings": data.settings,
                "connected_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        return {"message": "Integration updated successfully"}
    
    # Create new integration
    integration = Integration(
        user_id=current_user.id,
        integration_type=data.integration_type,
        status="connected",
        credentials=data.credentials,
        settings=data.settings,
        connected_at=datetime.now(timezone.utc)
    )
    
    integration_doc = integration.model_dump()
    integration_doc['created_at'] = integration_doc['created_at'].isoformat()
    integration_doc['connected_at'] = integration_doc['connected_at'].isoformat()
    
    await db.integrations.insert_one(integration_doc)
    return {"message": "Integration connected successfully"}

@api_router.post("/integrations/{integration_type}/disconnect")
async def disconnect_integration(
    integration_type: str,
    current_user: User = Depends(get_current_user)
):
    """Disconnect an integration"""
    result = await db.integrations.update_one(
        {"user_id": current_user.id, "integration_type": integration_type},
        {"$set": {"status": "disconnected", "connected_at": None}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    return {"message": "Integration disconnected successfully"}

@api_router.get("/integrations/{integration_type}/data")
async def get_integration_data(
    integration_type: str,
    current_user: User = Depends(get_current_user)
):
    """Get data for a specific integration dashboard"""
    integration = await db.integrations.find_one({
        "user_id": current_user.id,
        "integration_type": integration_type
    }, {"_id": 0})
    
    if not integration or integration['status'] != 'connected':
        raise HTTPException(status_code=404, detail="Integration not connected")
    
    # Return mock data for now - in production, this would call actual APIs
    return {
        "integration_type": integration_type,
        "status": "connected",
        "data": {
            "tasks_completed": 12,
            "focus_sessions": 8,
            "last_sync": integration.get('last_synced', 'Never'),
            "stats": {}
        }
    }

# ==================== EXTENSION DOWNLOAD ====================

@api_router.get("/extension/download")
async def download_extension():
    """Create and serve the extension as a zip file"""
    try:
        extension_path = Path("/app/extension")
        zip_path = Path("/tmp/kairo-extension.zip")
        
        # Create zip file
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add all extension files
            for file_path in extension_path.rglob("*"):
                if file_path.is_file():
                    arcname = file_path.relative_to(extension_path.parent)
                    zipf.write(file_path, arcname)
        
        return FileResponse(
            path=str(zip_path),
            media_type="application/zip",
            filename="kairo-extension.zip"
        )
    except Exception as e:
        logger.error(f"Error creating extension zip: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create extension package")

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "Kairo API is running"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()