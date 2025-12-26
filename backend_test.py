import requests
import sys
import json
from datetime import datetime, timezone

import os

class KairoAPITester:
    def __init__(self, base_url=None):
        self.base_url = base_url or os.environ.get("API_URL", "http://localhost:8000/api")
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"PASS: {name}")
        else:
            print(f"FAIL: {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\nTesting {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout (30s)")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Request error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        return success

    def test_register(self):
        """Test user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_user_data = {
            "email": f"test_user_{timestamp}@example.com",
            "username": f"testuser_{timestamp}",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Registered user: {response['user']['username']}")
            return True
        return False

    def test_login(self):
        """Test user login with existing credentials"""
        # Try to login with the registered user
        if not hasattr(self, 'test_email'):
            return False
            
        login_data = {
            "email": self.test_email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        }
        
        success, response = self.run_test(
            "Invalid Login (Should Fail)",
            "POST",
            "auth/login",
            401,
            data=invalid_data
        )
        return success

    def test_browsing_session_creation(self):
        """Test creating browsing session"""
        if not self.token:
            self.log_test("Browsing Session Creation", False, "No auth token available")
            return False
            
        session_data = {
            "url": "https://github.com/user/repo",
            "title": "GitHub Repository",
            "domain": "github.com",
            "category": "productive",
            "time_spent": 300  # 5 minutes
        }
        
        success, response = self.run_test(
            "Create Browsing Session",
            "POST",
            "browsing/session",
            200,
            data=session_data
        )
        return success

    def test_browsing_stats(self):
        """Test getting browsing statistics"""
        if not self.token:
            self.log_test("Browsing Stats", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Get Browsing Stats",
            "GET",
            "browsing/stats",
            200
        )
        
        if success:
            print(f"   Stats: {json.dumps(response, indent=2)}")
        return success

    def test_browsing_sessions_list(self):
        """Test getting browsing sessions list"""
        if not self.token:
            self.log_test("Browsing Sessions List", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Get Browsing Sessions",
            "GET",
            "browsing/sessions",
            200
        )
        return success

    def test_ai_insights_generation(self):
        """Test AI insights generation"""
        if not self.token:
            self.log_test("AI Insights Generation", False, "No auth token available")
            return False
            
        print("   Note: AI insights may take 10-15 seconds to generate...")
        success, response = self.run_test(
            "Generate AI Insights",
            "POST",
            "insights/generate",
            200,
            data={}
        )
        
        if success and 'insights' in response:
            print(f"   Generated insights: {response['insights'][:100]}...")
        return success

    def test_daily_insights_list(self):
        """Test getting daily insights"""
        if not self.token:
            self.log_test("Daily Insights List", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Get Daily Insights",
            "GET",
            "insights/daily",
            200
        )
        return success

    def test_focus_goals_creation(self):
        """Test creating focus goals"""
        if not self.token:
            self.log_test("Focus Goals Creation", False, "No auth token available")
            return False
            
        goal_data = {
            "goal_type": "daily_focus_hours",
            "target_value": 6
        }
        
        success, response = self.run_test(
            "Create Focus Goal",
            "POST",
            "goals",
            200,
            data=goal_data
        )
        return success

    def test_focus_goals_list(self):
        """Test getting focus goals"""
        if not self.token:
            self.log_test("Focus Goals List", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Get Focus Goals",
            "GET",
            "goals",
            200
        )
        return success

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access (Should Fail)",
            "GET",
            "browsing/stats",
            403
        )
        
        # Restore token
        self.token = original_token
        return success

    def test_extension_download(self):
        """Test extension download endpoint (HIGH PRIORITY)"""
        print("   Testing extension download endpoint...")
        url = f"{self.base_url}/extension/download"
        
        try:
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                # Check content type
                content_type = response.headers.get('content-type', '')
                if 'application/zip' in content_type or 'application/octet-stream' in content_type:
                    # Check content disposition
                    content_disposition = response.headers.get('content-disposition', '')
                    if 'kairo-extension.zip' in content_disposition or len(response.content) > 0:
                        self.log_test("Extension Download", True, f"Downloaded {len(response.content)} bytes")
                        return True
                    else:
                        self.log_test("Extension Download", False, f"Invalid content disposition: {content_disposition}")
                        return False
                else:
                    self.log_test("Extension Download", False, f"Invalid content type: {content_type}")
                    return False
            else:
                self.log_test("Extension Download", False, f"HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("Extension Download", False, f"Request error: {str(e)}")
            return False

    def test_profile_get(self):
        """Test getting user profile"""
        if not self.token:
            self.log_test("Get Profile", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "profile",
            200
        )
        
        if success:
            print(f"   Profile data: {json.dumps(response, indent=2)}")
        return success

    def test_profile_update(self):
        """Test updating user profile"""
        if not self.token:
            self.log_test("Update Profile", False, "No auth token available")
            return False
            
        profile_data = {
            "profession": "Software Developer",
            "work_focus": ["web development", "API design"],
            "important_sites": [
                {"domain": "github.com", "category": "productive", "reason": "Code repository"},
                {"domain": "stackoverflow.com", "category": "productive", "reason": "Technical help"}
            ],
            "interests": ["technology", "programming"],
            "learning_goals": ["FastAPI", "React"]
        }
        
        success, response = self.run_test(
            "Update User Profile",
            "POST",
            "profile",
            200,
            data=profile_data
        )
        return success

    def test_categorization_rules(self):
        """Test getting categorization rules"""
        if not self.token:
            self.log_test("Categorization Rules", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Get Categorization Rules",
            "GET",
            "profile/categorization-rules",
            200
        )
        
        if success:
            print(f"   Rules: {json.dumps(response, indent=2)}")
            # Verify expected structure
            if 'productive' in response and 'distraction' in response:
                self.log_test("Categorization Rules Structure", True, "Contains productive and distraction arrays")
            else:
                self.log_test("Categorization Rules Structure", False, "Missing expected structure")
        return success

    def test_weekly_summary(self):
        """Test getting weekly summary"""
        if not self.token:
            self.log_test("Weekly Summary", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Get Weekly Summary",
            "GET",
            "browsing/weekly-summary",
            200
        )
        
        if success:
            print(f"   Weekly summary: {json.dumps(response, indent=2)}")
        return success

    def test_integrations_list(self):
        """Test getting integrations list"""
        if not self.token:
            self.log_test("Integrations List", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Get Integrations",
            "GET",
            "integrations",
            200
        )
        return success

    def test_browsing_history(self):
        """Test browsing history endpoint"""
        print("\nTesting Browsing History...")
        
        if not self.token:
            self.log_test("Browsing History", False, "No auth token available")
            return False

        # Test Log View
        success_log, response_log = self.run_test(
            "Browsing History (Log View)",
            "GET", 
            "browsing/history?view=log&page=1&limit=10",
            200
        )
        
        if success_log and "history" in response_log:
            print(f"  Log View: Retrieved {len(response_log['history'])} entries")
        
        # Test Sites View
        success_sites, response_sites = self.run_test(
            "Browsing History (Sites View)",
            "GET", 
            "browsing/history?view=sites&page=1&limit=10",
            200
        )
        
        if success_sites and "history" in response_sites:
            print(f"  Sites View: Retrieved {len(response_sites['history'])} entries")
            # Verify aggregation fields exist
            if len(response_sites['history']) > 0:
                site = response_sites['history'][0]
                if "total_duration" in site and "visit_count" in site:
                    self.log_test("Browsing History (Sites) Aggregation", True, "Contains aggregation fields")
                else:
                    self.log_test("Browsing History (Sites) Aggregation", False, "Missing Aggregation Fields")
            else:
                self.log_test("Browsing History (Sites) Aggregation", True, "Empty History (no aggregation to check)")
        
        return success_log and success_sites

    def run_all_tests(self):
        """Run all API tests"""
        print("Starting Kairo API Tests")
        print("=" * 50)
        
        # Basic tests
        self.test_health_check()
        
        # HIGH PRIORITY: Extension download test (no auth required)
        print("\nHIGH PRIORITY TESTS:")
        self.test_extension_download()
        
        # Auth tests
        if self.test_register():
            # Store email for login test
            timestamp = datetime.now().strftime("%H%M%S")
            self.test_email = f"test_user_{timestamp}@example.com"
        
        self.test_invalid_login()
        self.test_unauthorized_access()
        
        # Protected endpoint tests (require authentication)
        if self.token:
            print("\nPROFILE MANAGEMENT TESTS:")
            self.test_profile_get()
            self.test_profile_update()
            self.test_categorization_rules()
            
            print("\nBROWSING & STATS TESTS:")
            self.test_browsing_session_creation()
            self.test_browsing_stats()
            self.test_browsing_sessions_list()
            self.test_weekly_summary()
            
            print("\nGOALS & INSIGHTS TESTS:")
            self.test_focus_goals_creation()
            self.test_focus_goals_list()
            self.test_daily_insights_list()
            
            print("\nINTEGRATIONS TESTS:")
            self.test_integrations_list()
            
            # AI insights test (may be slow)
            print("\nAI TESTS (may take 10-15 seconds):")
            self.test_ai_insights_generation()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"Test Results: {self.tests_passed}/{self.tests_run} passed")
def main():
    tester = KairoAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())