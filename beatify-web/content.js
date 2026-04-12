/**
 * Content Script: Sticky Side Panel for Market Sentiment AI
 */

let sidePanel = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "TOGGLE_SIDEBAR") {
    if (request.state) {
      showSidePanel();
    } else {
      hideSidePanel();
    }
  }
});

/**
 * Initialize and show the side panel
 */
async function showSidePanel() {
  if (!sidePanel) {
    sidePanel = document.createElement('div');
    sidePanel.id = 'market-ai-panel';
    sidePanel.innerHTML = `
      <div class="mai-header">
        <span>Market Sentiment AI</span>
        <button id="mai-close">&times;</button>
      </div>
      <div class="mai-body">
        <div id="mai-fresh-section" class="mai-section">
          <h3>Fresh Market Changes</h3>
          <div id="mai-fresh-content" class="mai-news-list">Loading...</div>
        </div>
        <div id="mai-history-section" class="mai-section">
          <h3>Scrollable History</h3>
          <div id="mai-history-content" class="mai-news-list"></div>
        </div>
      </div>
    `;
    document.body.appendChild(sidePanel);
    document.getElementById('mai-close').onclick = hideSidePanel;
  }

  sidePanel.style.display = 'flex';
  renderNews();
}

function hideSidePanel() {
  if (sidePanel) sidePanel.style.display = 'none';
  chrome.storage.local.set({ sidebarEnabled: false });
}

/**
 * Fetch and render news items
 */
async function renderNews() {
  const freshList = document.getElementById('mai-fresh-content');
  const historyList = document.getElementById('mai-history-content');
  
  chrome.runtime.sendMessage({ type: "GET_LATEST_NEWS" }, (data) => {
    if (!data) return;

    if (data.fresh && data.fresh.length > 0) {
      freshList.innerHTML = data.fresh.map(item => createNewsCard(item)).join('');
    } else {
      freshList.innerHTML = '<p class="mai-empty">No fresh updates yet.</p>';
    }

    if (data.history && data.history.length > 0) {
      historyList.innerHTML = data.history.map(item => createNewsCard(item)).join('');
    }
  });
}

function createNewsCard(item) {
  // item.analysis format: "[TICKER] | [SENTIMENT] | [REASON]"
  const parts = (item.analysis || "Error | Neutral | Error").split(' | ');
  const ticker = parts[0] || "Unknown";
  const sentiment = (parts[1] || "Neutral").trim();
  const reason = parts[2] || "Could not analyze.";

  const sentimentClass = sentiment.toLowerCase().includes('bullish') ? 'bullish' : 
                         sentiment.toLowerCase().includes('bearish') ? 'bearish' : 'neutral';

  return `
    <div class="mai-card">
      <div class="mai-card-header">
        <a href="${item.link}" target="_blank" class="mai-title">${item.title}</a>
        <span class="mai-badge ${sentimentClass}">${ticker}: ${sentiment}</span>
      </div>
      <p class="mai-reason">${reason}</p>
    </div>
  `;
}

// Check initial state
chrome.storage.local.get("sidebarEnabled", (data) => {
  if (data.sidebarEnabled) showSidePanel();
});
