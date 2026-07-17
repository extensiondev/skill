let visitCount = 0;
let lastUrl = null;

chrome.runtime.onInstalled.addListener(() => {
  setTimeout(() => {
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      visitCount++;
      lastUrl = tab.url;
    });
  }, 1000);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "get-stats") {
    sendResponse({ visitCount, lastUrl });
  }
  return true;
});
