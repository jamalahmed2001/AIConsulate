const $ = (id) => document.getElementById(id);

function normalizeBaseUrl(input) {
  if (!input) return "";
  let url = input.trim();
  // Remove trailing slash for consistency
  url = url.replace(/\/$/, "");
  // If no scheme, assume http for localhost and https otherwise
  if (!/^https?:\/\//i.test(url)) {
    if (/^(localhost(:\d+)?|\d+\.\d+\.\d+\.\d+(:\d+)?)/i.test(url)) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }
  return url;
}

async function loadSettings() {
  const data = await chrome.storage.sync.get(["baseUrl", "accessToken", "email"]);
  $("baseUrl").value = data.baseUrl || "";
  $("accessToken").value = data.accessToken || "";
  if ($("email")) $("email").value = data.email || "";
}

async function saveSettings() {
  const baseUrl = normalizeBaseUrl($("baseUrl").value);
  const accessToken = $("accessToken").value.trim();
  const email = $("email") ? $("email").value.trim() : "";
  await chrome.storage.sync.set({ baseUrl, accessToken, email });
  setStatus("Saved settings.");
}

function setStatus(text) {
  $("status").textContent = text || "";
}

function setError(text) {
  $("error").textContent = text || "";
}

async function refreshBalance() {
  setStatus("Fetching balance...");
  setError("");
  const { baseUrl, accessToken } = await chrome.storage.sync.get(["baseUrl", "accessToken"]);
  if (!baseUrl) {
    setStatus("");
    setError("Please set Site URL.");
    return;
  }
  if (!accessToken) {
    setStatus("");
    setError("Please paste an access token.");
    return;
  }
  try {
    const res = await fetch(`${normalizeBaseUrl(baseUrl)}/api/me/entitlements`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    $("balance").textContent = `${data.creditBalance ?? 0} Credits`;
    setStatus("Updated just now.");
  } catch (err) {
    setStatus("");
    setError(String(err));
  }
}

async function loginAndGetToken() {
  setStatus("Logging in...");
  setError("");
  const baseUrl = normalizeBaseUrl($("baseUrl").value);
  const email = $("email").value.trim();
  const password = $("password").value;
  if (!baseUrl || !email || !password) {
    setStatus("");
    return setError("Enter URL, email and password.");
  }
  try {
    const res = await fetch(`${baseUrl}/api/auth/extension-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    $("accessToken").value = data.accessToken || "";
    await chrome.storage.sync.set({ accessToken: data.accessToken, email });
    setStatus("Token received.");
  } catch (err) {
    setStatus("");
    setError(String(err));
  }
}

function openCredits() {
  const baseUrl = $("baseUrl").value.trim().replace(/\/$/, "");
  if (!baseUrl) return setError("Please set Site URL first.");
  chrome.tabs.create({ url: `${baseUrl}/credits` });
}

function clearAll() {
  chrome.storage.sync.remove(["baseUrl", "accessToken"], () => {
    $("baseUrl").value = "";
    $("accessToken").value = "";
    $("balance").textContent = "—";
    setStatus("Cleared.");
    setError("");
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();
  $("save").addEventListener("click", saveSettings);
  $("refresh").addEventListener("click", refreshBalance);
  $("openCredits").addEventListener("click", openCredits);
  $("clear").addEventListener("click", clearAll);
  if ($("login")) $("login").addEventListener("click", loginAndGetToken);
});


