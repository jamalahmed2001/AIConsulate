// Background service worker for AI Consulate extension
// - Creates context menu entries
// - Coordinates messaging between popup and content scripts
// - Injects content script when needed (MV3 scripting)

const CONTEXT_MENU_IDS = {
  scrapePage: "aiconsulate_scrape_page",
  scrapeSelection: "aiconsulate_scrape_selection",
};

chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: CONTEXT_MENU_IDS.scrapePage,
        title: "AI Consulate: Parse this page",
        contexts: ["page"],
      });
      chrome.contextMenus.create({
        id: CONTEXT_MENU_IDS.scrapeSelection,
        title: "AI Consulate: Parse selection",
        contexts: ["selection"],
      });
    });
  } catch (err) {
    // no-op
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;
  if (info.menuItemId === CONTEXT_MENU_IDS.scrapePage) {
    chrome.tabs.sendMessage(tab.id, { type: "AIC_PARSE_PAGE" });
  }
  if (info.menuItemId === CONTEXT_MENU_IDS.scrapeSelection) {
    chrome.tabs.sendMessage(tab.id, { type: "AIC_PARSE_SELECTION" });
  }
});

// Ensure content script is present when popup opens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "AIC_INJECT_CONTENT") {
    const tabId = message.tabId;
    if (!tabId) return sendResponse({ ok: false });
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ["content.js"],
      },
      () => sendResponse({ ok: true })
    );
    return true; // async
  }
});


