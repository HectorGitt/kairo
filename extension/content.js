// Kairo Content Script
// This script runs on all web pages

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showNudge') {
    showFocusNudge(request.message);
  } else if (request.action === 'showFocusBlock') {
    showFocusBlockOverlay(request.site);
  }
});

// Show a gentle nudge overlay (improved design)
function showFocusNudge(message) {
  // Remove existing nudge if any
  const existing = document.getElementById('kairo-nudge');
  if (existing) existing.remove();
  
  // Create nudge overlay
  const nudgeOverlay = document.createElement('div');
  nudgeOverlay.id = 'kairo-nudge';
  nudgeOverlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
    padding: 1.25rem 1.5rem;
    border-radius: 16px;
    box-shadow: 0 12px 32px rgba(14, 165, 233, 0.4);
    z-index: 999999;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    max-width: 350px;
    animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  `;
  
  nudgeOverlay.innerHTML = `
    <div style="display: flex; align-items: start; gap: 1rem;">
      <div style="flex-shrink: 0; width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
        🧠
      </div>
      <div style="flex: 1;">
        <strong style="display: block; margin-bottom: 0.5rem; font-size: 15px;">Kairo Nudge</strong>
        <p style="margin: 0; font-size: 13px; opacity: 0.95; line-height: 1.5;">${message}</p>
      </div>
      <button id="kairo-nudge-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px; padding: 0; line-height: 1; opacity: 0.7; transition: opacity 0.2s;">&times;</button>
    </div>
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
    #kairo-nudge-close:hover {
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(nudgeOverlay);
  
  // Close button
  document.getElementById('kairo-nudge-close').addEventListener('click', () => {
    nudgeOverlay.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => nudgeOverlay.remove(), 300);
  });
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (document.getElementById('kairo-nudge')) {
      nudgeOverlay.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => nudgeOverlay.remove(), 300);
    }
  }, 8000);
}

// Show focus mode block overlay
function showFocusBlockOverlay(siteName) {
  // Remove existing overlay if any
  const existing = document.getElementById('kairo-focus-block');
  if (existing) return; // Don't create multiple overlays
  
  // Create full-screen overlay
  const overlay = document.createElement('div');
  overlay.id = 'kairo-focus-block';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.97) 100%);
    z-index: 9999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    animation: fadeIn 0.3s ease-out;
  `;
  
  overlay.innerHTML = `
    <div style="text-align: center; max-width: 500px; padding: 2rem;">
      <div style="font-size: 64px; margin-bottom: 1.5rem; animation: pulse 2s ease-in-out infinite;">🧘‍♂️</div>
      <h2 style="color: white; font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">Focus Mode Active</h2>
      <p style="color: rgba(255,255,255,0.8); font-size: 1.125rem; line-height: 1.6; margin-bottom: 2rem;">
        You're trying to access <strong style="color: #0ea5e9;">${siteName}</strong> during your focus session.
        <br><br>
        Take a breath. Do you really need this right now?
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button id="kairo-refocus-btn" style="
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          border: none;
          padding: 0.875rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        ">
          Stay Focused
        </button>
        <button id="kairo-allow-btn" style="
          background: transparent;
          color: rgba(255,255,255,0.6);
          border: 2px solid rgba(255,255,255,0.2);
          padding: 0.875rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">
          I Really Need This
        </button>
      </div>
    </div>
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      #kairo-refocus-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(14, 165, 233, 0.4);
      }
      #kairo-allow-btn:hover {
        border-color: rgba(255,255,255,0.4);
        color: rgba(255,255,255,0.9);
      }
    </style>
  `;
  
  document.body.appendChild(overlay);
  
  // Refocus button - go back
  document.getElementById('kairo-refocus-btn').addEventListener('click', () => {
    window.history.back();
  });
  
  // Allow button - remove overlay temporarily
  document.getElementById('kairo-allow-btn').addEventListener('click', () => {
    overlay.style.animation = 'fadeIn 0.3s ease-out reverse';
    setTimeout(() => overlay.remove(), 300);
  });
}