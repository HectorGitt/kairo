// Kairo Background Service Worker

let currentTab = null;
let startTime = null;
let apiUrl = '';
let authToken = '';
let tabSwitchCount = 0;

// Distraction sites - can be customized by user
const distractionSites = [
  'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
  'reddit.com', 'tiktok.com', 'netflix.com', 'twitch.tv'
];

const productiveSites = [
  'github.com', 'stackoverflow.com', 'docs.', 'developer.',
  'notion.so', 'figma.com', 'canva.com', 'trello.com'
];

// Load settings from storage
chrome.storage.local.get(['apiUrl', 'authToken'], (result) => {
  if (result.apiUrl) apiUrl = result.apiUrl;
  if (result.authToken) authToken = result.authToken;
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.apiUrl) apiUrl = changes.apiUrl.newValue;
  if (changes.authToken) authToken = changes.authToken.newValue;
});

// Categorize URL
function categorizeUrl(url) {
  if (!url) return 'neutral';
  
  const domain = new URL(url).hostname.toLowerCase();
  
  // Check if it's a distraction site
  for (const site of distractionSites) {
    if (domain.includes(site)) return 'distraction';
  }
  
  // Check if it's a productive site
  for (const site of productiveSites) {
    if (domain.includes(site)) return 'productive';
  }
  
  return 'neutral';
}

// Send browsing session to backend
async function sendSession(tab, timeSpent) {
  if (!apiUrl || !authToken || !tab.url) return;
  
  try {
    const url = new URL(tab.url);
    const category = categorizeUrl(tab.url);
    
    const sessionData = {
      url: tab.url,
      title: tab.title || 'Untitled',
      domain: url.hostname,
      category: category,
      time_spent: Math.floor(timeSpent / 1000) // Convert to seconds
    };
    
    await fetch(`${apiUrl}/browsing/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(sessionData)
    });
    
    // Show nudge for distractions
    if (category === 'distraction' && timeSpent > 300000) { // 5 minutes
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Kairo Nudge',
        message: `You've been on ${url.hostname} for ${Math.floor(timeSpent / 60000)} minutes. Ready to refocus?`,
        priority: 1
      });
    }
  } catch (error) {
    console.error('Failed to send session:', error);
  }
}

// Track active tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Save previous tab data
  if (currentTab && startTime) {
    const timeSpent = Date.now() - startTime;
    if (timeSpent > 5000) { // Only track if more than 5 seconds
      await sendSession(currentTab, timeSpent);
    }
  }
  
  // Start tracking new tab
  const tab = await chrome.tabs.get(activeInfo.tabId);
  currentTab = tab;
  startTime = Date.now();
});

// Track tab updates (URL changes)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    // Save previous data if URL changed
    if (currentTab && currentTab.url !== tab.url && startTime) {
      const timeSpent = Date.now() - startTime;
      if (timeSpent > 5000) {
        await sendSession(currentTab, timeSpent);
      }
    }
    
    currentTab = tab;
    startTime = Date.now();
  }
});

// Track window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus
    if (currentTab && startTime) {
      const timeSpent = Date.now() - startTime;
      if (timeSpent > 5000) {
        sendSession(currentTab, timeSpent);
      }
      startTime = null;
    }
  } else {
    // Browser gained focus
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
      if (tabs[0]) {
        currentTab = tabs[0];
        startTime = Date.now();
      }
    });
  }
});

// Periodic save (every 2 minutes)
chrome.alarms.create('saveSession', { periodInMinutes: 2 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'saveSession' && currentTab && startTime) {
    const timeSpent = Date.now() - startTime;
    if (timeSpent > 5000) {
      sendSession(currentTab, timeSpent);
      startTime = Date.now(); // Reset timer
    }
  }
});