// Kairo Background Service Worker

let currentTab = null;
let startTime = null;
let apiUrl = '';
let authToken = '';
let tabSwitchCount = 0;
let focusMode = false;
let pomodoroActive = false;
let pomodoroTimeLeft = 0;

// Dynamic categorization rules (fetched from backend)
let productiveSites = [];
let distractionSites = [];
let customSites = [];
let profileSet = false;

// Default fallback rules
const defaultProductiveSites = [
  'github.com', 'stackoverflow.com', 'docs.', 'developer.',
  'notion.so', 'figma.com', 'canva.com', 'trello.com'
];

const defaultDistractionSites = [
  'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
  'reddit.com', 'tiktok.com', 'netflix.com', 'twitch.tv'
];

// Initialize with defaults
productiveSites = [...defaultProductiveSites];
distractionSites = [...defaultDistractionSites];

// Load settings from storage
chrome.storage.local.get(['apiUrl', 'authToken', 'focusMode', 'customSites'], (result) => {
  if (result.apiUrl) apiUrl = result.apiUrl;
  if (result.authToken) {
    authToken = result.authToken;
    fetchCategorizationRules(); // Fetch personalized rules on startup
  }
  if (result.focusMode) focusMode = result.focusMode;
  if (result.customSites) {
    productiveSites = result.customSites.productive || productiveSites;
    distractionSites = result.customSites.distraction || distractionSites;
  }
});

// Fetch personalized categorization rules from backend
async function fetchCategorizationRules() {
  if (!apiUrl || !authToken) return;
  
  try {
    const response = await fetch(`${apiUrl}/profile/categorization-rules`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.ok) {
      const rules = await response.json();
      productiveSites = rules.productive || defaultProductiveSites;
      distractionSites = rules.distraction || defaultDistractionSites;
      customSites = rules.custom_sites || [];
      profileSet = rules.profile_set || false;
      
      // Store in local storage for offline access
      chrome.storage.local.set({
        customSites: {
          productive: productiveSites,
          distraction: distractionSites,
          custom: customSites
        },
        profileSet: profileSet
      });
      
      console.log('Personalized categorization rules loaded:', {
        productive: productiveSites.length,
        distraction: distractionSites.length,
        custom: customSites.length,
        profileSet: profileSet
      });
    }
  } catch (error) {
    console.error('Failed to fetch categorization rules:', error);
  }
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.apiUrl) apiUrl = changes.apiUrl.newValue;
  if (changes.authToken) {
    authToken = changes.authToken.newValue;
    if (authToken) fetchCategorizationRules(); // Refresh rules when token changes
  }
  if (changes.focusMode) focusMode = changes.focusMode.newValue;
});

// Categorize URL with personalized rules
function categorizeUrl(url) {
  if (!url) return 'neutral';
  
  const domain = new URL(url).hostname.toLowerCase();
  
  // Check custom sites first (highest priority)
  for (const site of customSites) {
    if (domain.includes(site.domain)) {
      return site.category;
    }
  }
  
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

// Block site if in focus mode
function checkFocusMode(tab) {
  if (!focusMode || !tab.url) return;
  
  const category = categorizeUrl(tab.url);
  if (category === 'distraction') {
    // Send message to content script to show focus mode overlay
    chrome.tabs.sendMessage(tab.id, {
      action: 'showFocusBlock',
      site: new URL(tab.url).hostname
    });
  }
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
      time_spent: Math.floor(timeSpent / 1000), // Convert to seconds
      tab_switches: tabSwitchCount
    };
    
    await fetch(`${apiUrl}/browsing/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(sessionData)
    });
    
    // Reset tab switch count for next session
    tabSwitchCount = 0;
    
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
  // Increment tab switch counter
  tabSwitchCount++;
  
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
  
  // Check focus mode
  checkFocusMode(tab);
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
    
    // Check focus mode
    checkFocusMode(tab);
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