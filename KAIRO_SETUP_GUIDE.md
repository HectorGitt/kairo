# Kairo - AI Accountability Partner

## Complete Setup Guide

### Overview
Kairo is your AI-powered accountability partner that helps you stay focused and intentional through:
- **Web Dashboard**: View insights, track progress, and see your focus trends
- **Chrome Extension**: Real-time browsing tracking with gentle nudges

---

## 🚀 Quick Start

### 1. Access the Web App
Visit: `https://mindful-tabs.preview.emergentagent.com`

### 2. Create Your Account
- Click "Need an account? Sign up"
- Enter username, email, and password
- You'll be automatically logged in

### 3. Install the Chrome Extension

#### Download Extension Files
The extension is located in `/app/extension/` with the following structure:
```
extension/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

#### Install in Chrome
1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `/app/extension/` folder
5. The Kairo extension icon will appear in your toolbar

#### Configure Extension
1. Click the Kairo extension icon
2. Enter your **API URL**: Copy from the dashboard setup page
3. Enter your **Auth Token**: Copy from the dashboard setup page
4. Click "Save Settings"
5. Status should change to "Active & Tracking"

---

## 🎯 Features

### Web Dashboard
- **Focus Score**: Daily productivity metric (0-100)
- **Time Tracking**: Total, productive, and distraction time
- **AI Insights**: Personalized feedback from Claude Sonnet 4
- **Top Distractions**: See which sites pull you away most
- **Weekly Trends**: Track improvement over time

### Chrome Extension
- **Automatic Tracking**: Monitors time spent on each website
- **Smart Categorization**: 
  - Productive: GitHub, StackOverflow, documentation sites
  - Neutral: General browsing
  - Distraction: Social media, entertainment sites
- **Gentle Nudges**: Notifications after 5+ minutes on distracting sites
- **Real-time Sync**: Data sent to dashboard every 2 minutes

---

## 🔧 Technical Details

### Backend API Endpoints
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/browsing/session` - Log browsing session
- `GET /api/browsing/stats` - Get focus statistics
- `POST /api/insights/generate` - Generate AI insights
- `GET /api/insights/daily` - Get recent insights

### AI Integration
- **Provider**: Claude Sonnet 4 (Anthropic)
- **Purpose**: Personalized insights and actionable recommendations
- **Style**: Empathetic, encouraging, and constructive feedback

### Data Privacy
- All data is private to your account
- No third-party sharing
- Stored securely in MongoDB
- You control your data

---

## 📊 How It Works

### Browsing Tracking Flow
1. Extension monitors active tabs
2. Tracks time spent per domain
3. Categorizes sites automatically
4. Sends data to backend API
5. Dashboard displays real-time stats

### AI Insights Generation
1. Collect day's browsing data
2. Calculate focus metrics
3. Send to Claude Sonnet 4
4. Receive personalized insights
5. Store and display on dashboard

### Focus Score Calculation
```
Focus Score = (Productive Time / Total Time) × 100
```

---

## 🎨 Customization

### Add Custom Site Categories
Edit `/app/extension/background.js`:

```javascript
// Add to distractionSites array
const distractionSites = [
  'youtube.com',
  'your-site.com',  // Add here
];

// Add to productiveSites array
const productiveSites = [
  'github.com',
  'your-work-site.com',  // Add here
];
```

### Adjust Nudge Timing
In `background.js`, change the threshold:
```javascript
if (category === 'distraction' && timeSpent > 300000) { // 5 minutes
  // Change to 600000 for 10 minutes
}
```

---

## 🐛 Troubleshooting

### Extension Not Tracking
1. Check extension settings (click icon)
2. Verify API URL and token are correct
3. Ensure extension has permissions
4. Check Chrome's extension logs

### Dashboard Shows No Data
1. Verify extension is configured and active
2. Browse for at least 5 seconds on a site
3. Wait 2 minutes for sync
4. Refresh dashboard

### AI Insights Not Generating
1. Ensure you have browsing data for the day
2. Click "Generate Today's Insights"
3. Wait 5-10 seconds for Claude to respond
4. Check backend logs for errors

---

## 📝 Development Notes

### Environment Variables
```bash
# Backend (.env)
MONGO_URL=mongodb://localhost:27017
DB_NAME=kairo_db
JWT_SECRET=your_secret_key
EMERGENT_LLM_KEY=sk-emergent-xxx
```

### Testing
Run comprehensive tests:
```bash
python /app/backend_test.py
```

### Logs
- Backend: `/var/log/supervisor/backend.*.log`
- Extension: Chrome DevTools → Extensions → Kairo → Inspect views

---

## 🎯 Usage Tips

1. **Install the extension first** - It's the core of the experience
2. **Check daily insights** - Generated from your actual patterns
3. **Review top distractions** - Awareness is the first step
4. **Track weekly progress** - Focus improves with consistency
5. **Use nudges as reminders** - Not punishments, but gentle guides

---

## 🚀 Next Steps

After setup:
1. ✅ Browse naturally for a day
2. ✅ Check your focus score
3. ✅ Generate AI insights
4. ✅ Review patterns
5. ✅ Set focus goals (coming soon)
6. ✅ Track improvement over time

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review extension console logs
- Check backend API logs
- Verify all credentials are correct

---

**Built with:** FastAPI, React, MongoDB, Claude Sonnet 4, Chrome Extensions API
**Focus approach:** Gentle, empathetic, progress-oriented
**Philosophy:** Awareness → Intention → Consistency → Mastery
