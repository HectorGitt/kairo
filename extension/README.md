# Kairo Chrome Extension

Your AI Accountability Partner for staying focused and productive.

## Features

- **Real-time Browsing Tracking**: Automatically categorizes sites as productive, neutral, or distracting
- **Smart Nudges**: Gentle notifications when you've been distracted for too long
- **Focus Mode**: Block access to distracting sites during focus sessions
- **Pomodoro Timer**: Built-in 25-minute focus sessions with automatic focus mode
- **Personalized Rules**: Dynamically syncs categorization rules based on your profile
- **Tab Switch Tracking**: Monitors context switching to help you maintain flow

## Installation

1. Download the extension from your Kairo dashboard
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the extracted Kairo extension folder
6. The extension icon should appear in your toolbar

## Setup

1. Click the Kairo extension icon
2. Go to the "Settings" tab
3. Enter your API URL: `https://your-kairo-domain.com/api`
4. Enter your authentication token (available in the web app)
5. Click "Save Settings"
6. Click "Refresh Personalization Rules" to sync your custom rules

## Notifications

**Important**: Notifications work continuously in the background, even when the popup is closed.

The extension uses Chrome's alarm API to:
- Check every minute if you're on a distraction site
- Send gentle nudges every 5 minutes if you're still distracted
- Keep the service worker alive for reliable notifications

### Troubleshooting Notifications

If notifications aren't working:
1. Check Chrome notification permissions for the extension
2. Ensure notifications are enabled in your OS settings
3. Reload the extension in `chrome://extensions`

## Usage

### Stats Tab
- View today's focus score
- See focus time vs distraction time
- Track tab switches and session count
- Click "Refresh Stats" to update

### Focus Tab
- Toggle Focus Mode to block distracting sites
- Start a 25-minute Pomodoro timer
- Set up your profile for personalized tracking

### Settings Tab
- Configure API connection
- Refresh personalization rules
- Download latest extension version
- Open web dashboard

## Privacy

Kairo collects:
- Website URLs and domains
- Time spent on each site
- Tab switching behavior
- Session timestamps

Kairo does NOT collect:
- Page content or text
- Passwords or credentials
- Form inputs
- Personal messages
- Search queries

All data is encrypted and stored securely in your private account.

## Technical Details

- **Manifest Version**: 3
- **Service Worker**: Persistent background tracking with alarm-based keep-alive
- **Permissions**: tabs, storage, alarms, notifications, host_permissions
- **API**: RESTful communication with FastAPI backend
- **Storage**: Chrome local storage for offline rules caching

## Updates

To get the latest version:
1. Go to Profile Settings in the web app
2. Scroll to "Chrome Extension" section
3. Click "Download Extension"
4. Replace the old extension folder with the new one
5. Click "Reload" in `chrome://extensions`

Or simply click "Refresh Personalization Rules" to sync the latest categorization without re-downloading!

## Support

For issues or questions:
- Check the web dashboard for detailed analytics
- Review your personalization settings
- Ensure your token is valid and API URL is correct

Built with ❤️ by Kairo