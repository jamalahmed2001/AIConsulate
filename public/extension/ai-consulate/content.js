// Content script responsible for extracting page content and responding to requests

function extractVisibleText(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue?.trim();
      if (!text) return NodeFilter.FILTER_REJECT;
      if (!node.parentElement) return NodeFilter.FILTER_REJECT;
      const style = window.getComputedStyle(node.parentElement);
      if (style && (style.visibility === "hidden" || style.display === "none")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const chunks = [];
  let current;
  while ((current = walker.nextNode())) {
    chunks.push(current.nodeValue.trim());
  }
  return chunks.join("\n");
}

function extractMainContent() {
  // Capture the entire page's visible text rather than attempting to scope to a specific container
  return extractVisibleText();
}

function extractSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return "";
  const container = document.createElement("div");
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    container.appendChild(range.cloneContents());
  }
  return extractVisibleText(container);
}

function collectMetadata() {
  return {
    url: location.href,
    title: document.title,
    lang: document.documentElement.lang || navigator.language,
    meta: Array.from(document.querySelectorAll("meta")).map((m) => ({
      name: m.getAttribute("name") || m.getAttribute("property") || null,
      content: m.getAttribute("content") || null,
    })),
  };
}

async function handleRequest(kind) {
  const payload = {
    kind,
    metadata: collectMetadata(),
    content: kind === "selection" ? extractSelection() : extractMainContent(),
    html: document.documentElement.outerHTML,
  };
  return payload;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "AIC_COLLECT") {
    handleRequest(message.kind || "page").then((data) => sendResponse({ ok: true, data }));
    return true;
  }
  if (message?.type === "AIC_PARSE_PAGE") {
    handleRequest("page").then((data) => sendResponse({ ok: true, data }));
    return true;
  }
  if (message?.type === "AIC_PARSE_SELECTION") {
    handleRequest("selection").then((data) => sendResponse({ ok: true, data }));
    return true;
  }
});


