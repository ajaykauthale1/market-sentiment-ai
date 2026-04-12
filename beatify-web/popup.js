/**
 * Popup Script: Region Management & Toggle control
 */

document.addEventListener('DOMContentLoaded', async () => {
  const mainScreen = document.getElementById('main-screen');
  const setupScreen = document.getElementById('setup-screen');
  const regionBtns = document.querySelectorAll('.region-btn');
  const saveRegionBtn = document.getElementById('save-region');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const currentRegionBadge = document.getElementById('current-region-btn');
  const refreshBtn = document.getElementById('refresh-news-btn');

  let selectedRegion = null;

  // 1. Initial State Check
  const data = await chrome.storage.local.get(["region", "sidebarEnabled"]);
  if (!data.region) {
    showSetup();
  } else {
    showMain(data.region, data.sidebarEnabled);
  }

  // 2. Region Selection Logic
  regionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      regionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRegion = btn.dataset.region;
      saveRegionBtn.disabled = false;
    });
  });

  saveRegionBtn.addEventListener('click', () => {
    if (selectedRegion) {
      chrome.runtime.sendMessage({ type: "UPDATE_REGION", region: selectedRegion }, () => {
        showMain(selectedRegion, sidebarToggle.checked);
      });
    }
  });

  currentRegionBadge.addEventListener('click', showSetup);

  // 3. Toggle Logic
  sidebarToggle.addEventListener('change', () => {
    const state = sidebarToggle.checked;
    chrome.storage.local.set({ sidebarEnabled: state });
    chrome.runtime.sendMessage({ type: "TOGGLE_SIDEBAR", state });
  });

  // 4. Refresh Logic
  refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = "Analyzing...";
    chrome.runtime.sendMessage({ type: "REFRESH_NEWS" }, (resp) => {
      refreshBtn.disabled = false;
      refreshBtn.textContent = "Refresh Feeds";
      if (resp?.success) {
        // Toggle sidebar off/on to force refresh if already open
        if (sidebarToggle.checked) {
          chrome.runtime.sendMessage({ type: "TOGGLE_SIDEBAR", state: true });
        }
      }
    });
  });

  function showSetup() {
    mainScreen.style.display = 'none';
    setupScreen.style.display = 'block';
  }

  function showMain(region, enabled) {
    setupScreen.style.display = 'none';
    mainScreen.style.display = 'block';
    currentRegionBadge.textContent = `${region === 'USA' ? '🇺🇸' : '🇮🇳'} ${region} (Edit)`;
    sidebarToggle.checked = !!enabled;
  }
});
