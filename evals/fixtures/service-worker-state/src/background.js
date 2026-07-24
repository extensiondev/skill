// ███████╗██╗  ██╗██╗██╗     ██╗
// ██╔════╝██║ ██╔╝██║██║     ██║
// ███████╗█████╔╝ ██║██║     ██║
// ╚════██║██╔═██╗ ██║██║     ██║
// ███████║██║  ██╗██║███████╗███████╗
// ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
// Apache License 2.0 (c) 2026 Cezar Augusto and the extension.dev collaborators

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
