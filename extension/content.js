// Kairo Content Script
// This script runs on all web pages and can be used for future features
// like showing focus reminders directly on distracting websites

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showNudge') {
    showFocusNudge(request.message);
  }
});

// Show a gentle nudge overlay
function showFocusNudge(message) {
  // Create nudge overlay
  const nudgeOverlay = document.createElement('div');
  nudgeOverlay.id = 'kairo-nudge';
  nudgeOverlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(14, 165, 233, 0.3);
    z-index: 999999;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  
  nudgeOverlay.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <span style="font-size: 20px;">🧠</span>
      <div>
        <strong style="display: block; margin-bottom: 0.25rem;">Kairo Nudge</strong>
        <span style="font-size: 13px; opacity: 0.9;">${message}</span>
      </div>
    </div>
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(nudgeOverlay);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    nudgeOverlay.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => nudgeOverlay.remove(), 300);
  }, 5000);
}