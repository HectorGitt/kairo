// Kairo Popup Script

const apiUrlInput = document.getElementById('apiUrl');
const authTokenInput = document.getElementById('authToken');
const saveBtn = document.getElementById('saveBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const successMsg = document.getElementById('successMsg');
const dashboardLink = document.getElementById('dashboardLink');

// Load saved settings
chrome.storage.local.get(['apiUrl', 'authToken'], (result) => {
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
  });
});

// Update status indicator
function updateStatus(isConfigured) {
  if (isConfigured) {
    statusDot.classList.remove('inactive');
    statusText.textContent = 'Active & Tracking';
  } else {
    statusDot.classList.add('inactive');
    statusText.textContent = 'Not Configured';
  }
}