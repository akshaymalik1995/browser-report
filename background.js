// background.js

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced function to save site data
const saveSiteDataDebounced = debounce((sites) => {
  chrome.storage.local.set({ sites: sites }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error saving site data:", chrome.runtime.lastError);
    } else {
      // Optional: Log success (can be noisy)
      // console.log('Site data saved successfully.');
    }
  });
}, 1000); // Wait 1 second after the last event before saving

// Initialize storage if it doesn't exist
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['sites'], (result) => {
    if (chrome.runtime.lastError) {
        console.error("Error getting site data on install:", chrome.runtime.lastError);
        return;
    }
    if (!result.sites) {
      chrome.storage.local.set({ sites: {} }, () => {
         if (chrome.runtime.lastError) {
            console.error("Error initializing site storage:", chrome.runtime.lastError);
         } else {
            console.log('Initialized site storage.');
         }
      });
    }
  });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab update is complete and the URL is valid
  if (changeInfo.status === 'complete' && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    const url = new URL(tab.url);
    const domain = url.hostname;
    const timestamp = new Date().toISOString();

    // Get current site data
    chrome.storage.local.get(['sites'], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting site data on update:", chrome.runtime.lastError);
        return; // Exit if we can't get the data
      }
      let sites = result.sites || {};

      // Initialize domain entry if it doesn't exist
      if (!sites[domain]) {
        sites[domain] = {
          visits: [],
          count: 0
        };
      }

      // Add the new visit timestamp and increment count
      sites[domain].visits.push(timestamp);
      sites[domain].count += 1;

      // Save updated site data using the debounced function
      saveSiteDataDebounced(sites);
    });
  }
});
