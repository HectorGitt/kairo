// Kairo Popup Script

const apiUrlInput = document.getElementById('apiUrl');
const authTokenInput = document.getElementById('authToken');
const saveBtn = document.getElementById('saveBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const successMsg = document.getElementById('successMsg');
const dashboardLink = document.getElementById('dashboardLink');
const focusModeToggle = document.getElementById('focusModeToggle');
const startPomodoroBtn = document.getElementById('startPomodoro');
const stopPomodoroBtn = document.getElementById('stopPomodoro');
const pomodoroTimer = document.getElementById('pomodoroTimer');
const refreshStats = document.getElementById('refreshStats');
const setupProfileBtn = document.getElementById('setupProfile');

let pomodoroInterval = null;

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding panel
    tab.classList.add('active');
    const panelId = tab.dataset.tab + '-panel';
    document.getElementById(panelId).classList.add('active');
  });
});

// Load saved settings
chrome.storage.local.get(['apiUrl', 'authToken', 'focusMode', 'profileSet'], (result) => {
  if (result.apiUrl) {
    apiUrlInput.value = result.apiUrl;
    
    // Set dashboard link
    const baseUrl = result.apiUrl.replace('/api', '');
    dashboardLink.href = `${baseUrl}/dashboard`;
  }
  
  if (result.authToken) {
    authTokenInput.value = result.authToken;
  }
  
  // Update status
  updateStatus(result.apiUrl && result.authToken);
  
  // Set focus mode toggle
  if (result.focusMode) {
    focusModeToggle.checked = result.focusMode;
  }
  
  // Hide profile prompt if already set
  if (result.profileSet) {
    document.getElementById('profilePrompt').style.display = 'none';
  }
  
  // Load stats if configured
  if (result.apiUrl && result.authToken) {
    loadStats();
  }
});

// Save settings
saveBtn.addEventListener('click', () => {
  const apiUrl = apiUrlInput.value.trim();
  const authToken = authTokenInput.value.trim();
  
  if (!apiUrl || !authToken) {
    alert('Please fill in all fields');
    return;
  }
  
  chrome.storage.local.set({ apiUrl, authToken }, () => {
    updateStatus(true);
    
    // Show success message
    successMsg.style.display = 'block';
    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 3000);
    
    // Update dashboard link
    const baseUrl = apiUrl.replace('/api', '');
    dashboardLink.href = `${baseUrl}/dashboard`;
    
    // Refresh personalization rules
    chrome.runtime.sendMessage({ action: 'refreshRules' });
    
    // Load stats
    loadStats();
  });
});

// Update status indicator
function updateStatus(isConfigured) {
  if (isConfigured) {
    statusDot.classList.remove('inactive');
    statusDot.classList.add('active');
    statusText.textContent = 'Active & Tracking';
  } else {
    statusDot.classList.add('inactive');
    statusDot.classList.remove('active');
    statusText.textContent = 'Not Configured';
  }
}

// Load today's stats
async function loadStats() {
  try {
    const { apiUrl, authToken } = await chrome.storage.local.get(['apiUrl', 'authToken']);
    if (!apiUrl || !authToken) return;
    
    const response = await fetch(`${apiUrl}/browsing/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.ok) {
      const stats = await response.json();
      
      // Update UI
      document.getElementById('focusScore').textContent = stats.focus_score + '%';
      document.getElementById('focusTime').textContent = formatTime(stats.productive_time);
      document.getElementById('distractionTime').textContent = formatTime(stats.distraction_time);
      document.getElementById('tabSwitches').textContent = stats.context_switches || 0;
      document.getElementById('sessions').textContent = stats.session_count || 0;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// Format time helper
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Refresh stats button
refreshStats.addEventListener('click', loadStats);

// Focus mode toggle
focusModeToggle.addEventListener('change', () => {
  chrome.runtime.sendMessage(
    { action: 'toggleFocusMode' },
    (response) => {
      console.log('Focus mode:', response.focusMode ? 'ON' : 'OFF');
    }
  );
});

// Pomodoro timer
startPomodoroBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'startPomodoro', duration: 25 }, () => {
    startPomodoroBtn.style.display = 'none';
    stopPomodoroBtn.style.display = 'block';
    startPomodoroInterval();
  });
});

stopPomodoroBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'stopPomodoro' }, () => {
    stopPomodoroBtn.style.display = 'none';
    startPomodoroBtn.style.display = 'block';
    stopPomodoroInterval();
    pomodoroTimer.textContent = '25:00';
  });
});

function startPomodoroInterval() {
  pomodoroInterval = setInterval(() => {
    chrome.runtime.sendMessage({ action: 'getPomodoroStatus' }, (response) => {
      if (response.active) {
        const minutes = Math.floor(response.timeLeft / 60);
        const seconds = response.timeLeft % 60;
        pomodoroTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else {
        stopPomodoroInterval();
        stopPomodoroBtn.style.display = 'none';
        startPomodoroBtn.style.display = 'block';
        pomodoroTimer.textContent = '25:00';
      }
    });
  }, 1000);
}

function stopPomodoroInterval() {
  if (pomodoroInterval) {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
  }
}

// Check pomodoro status on load
chrome.runtime.sendMessage({ action: 'getPomodoroStatus' }, (response) => {
  if (response && response.active) {
    startPomodoroBtn.style.display = 'none';
    stopPomodoroBtn.style.display = 'block';
    startPomodoroInterval();
  }
});

// Refresh personalization rules
refreshRulesBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'refreshRules' }, () => {
    successMsg.textContent = '✓ Personalization rules refreshed!';
    successMsg.style.display = 'block';
    setTimeout(() => {
      successMsg.style.display = 'none';
      successMsg.textContent = '✓ Settings saved successfully!';
    }, 3000);
  });
});

// Setup profile button
setupProfileBtn.addEventListener('click', async () => {
  const { apiUrl } = await chrome.storage.local.get(['apiUrl']);
  if (apiUrl) {
    const baseUrl = apiUrl.replace('/api', '');
    chrome.tabs.create({ url: `${baseUrl}/dashboard` });
  } else {
    alert('Please configure API settings first in the Settings tab');
  }
});

// Download extension button
const downloadExtensionBtn = document.getElementById('downloadExtension');
downloadExtensionBtn.addEventListener('click', async () => {
  const { apiUrl } = await chrome.storage.local.get(['apiUrl']);
  if (apiUrl) {
    // Open download link in new tab
    chrome.tabs.create({ url: `${apiUrl}/extension/download` });
    
    // Show success message
    successMsg.textContent = '📥 Extension download started!';
    successMsg.style.display = 'block';
    setTimeout(() => {
      successMsg.style.display = 'none';
      successMsg.textContent = '✓ Settings saved successfully!';
    }, 3000);
  } else {
    alert('Please configure API URL first in the Settings tab');
  }
});