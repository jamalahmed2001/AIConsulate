// Utility functions
const $ = (id) => document.getElementById(id);

// Configuration
const DEFAULT_URLS = {
  production: 'https://ai-consulate.vercel.app',
  development: 'http://localhost:3000'
};

// State management
let currentState = {
  isLoggedIn: false,
  baseUrl: '',
  accessToken: '',
  email: '',
  userInfo: null
};

// URL detection and normalization
function normalizeBaseUrl(input) {
  if (!input) return "";
  let url = input.trim().replace(/\/$/, "");
  
  if (!/^https?:\/\//i.test(url)) {
    if (/^(localhost(:\d+)?|\d+\.\d+\.\d+\.\d+(:\d+)?)/i.test(url)) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }
  return url;
}

async function detectSiteUrl() {
  try {
    // Try to get the current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = tab?.url;
    
    if (currentUrl) {
      const url = new URL(currentUrl);
      const hostname = url.hostname;
      
      // If we're on a localhost or development site, use development URL
      if (hostname === 'localhost' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('127.')) {
        return DEFAULT_URLS.development;
      }
      
      // If we're on what looks like the production site, use that
      if (hostname.includes('ai-consulate') || hostname === 'ai-consulate.vercel.app') {
        return `${url.protocol}//${url.hostname}${url.port ? ':' + url.port : ''}`;
      }
    }
  } catch (error) {
    console.log('Could not detect current tab URL:', error);
  }
  
  // Default to production
  return DEFAULT_URLS.production;
}

// UI Management
function showError(message) {
  const errorEl = $('errorMsg');
  const successEl = $('successMsg');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  successEl.classList.add('hidden');
}

function showSuccess(message) {
  const errorEl = $('errorMsg');
  const successEl = $('successMsg');
  successEl.textContent = message;
  successEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
}

function hideMessages() {
  $('errorMsg').classList.add('hidden');
  $('successMsg').classList.add('hidden');
}

function updateUI() {
  const authSection = $('authSection');
  const dashboardSection = $('dashboardSection');
  const statusIndicator = $('statusIndicator');
  
  if (currentState.isLoggedIn) {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    statusIndicator.classList.add('connected');
    
    // Update user info
    if (currentState.email) {
      $('userEmail').textContent = currentState.email;
      $('userAvatar').textContent = currentState.email.charAt(0).toUpperCase();
    }
  } else {
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    statusIndicator.classList.remove('connected');
  }
}

function setBalanceLoading(loading) {
  const balanceAmount = $('balanceAmount');
  const loader = $('balanceLoader');
  
  if (loading) {
    loader.classList.remove('hidden');
    balanceAmount.innerHTML = '<span class="loading"></span>';
  } else {
    loader.classList.add('hidden');
  }
}

// Storage functions
async function loadStoredData() {
  const data = await chrome.storage.sync.get(['baseUrl', 'accessToken', 'email']);
  currentState.baseUrl = data.baseUrl || '';
  currentState.accessToken = data.accessToken || '';
  currentState.email = data.email || '';
  currentState.isLoggedIn = !!(data.accessToken && data.email);
  
  // Load email into form if we have it
  if (currentState.email && $('email')) {
    $('email').value = currentState.email;
  }
}

async function saveStoredData() {
  await chrome.storage.sync.set({
    baseUrl: currentState.baseUrl,
    accessToken: currentState.accessToken,
    email: currentState.email
  });
}

// API functions
async function loginUser() {
  const email = $('email').value.trim();
  const password = $('password').value.trim();
  
  if (!email || !password) {
    showError('Please enter both email and password');
    return;
  }
  
  const loginBtn = $('loginBtn');
  const originalText = loginBtn.textContent;
  
  try {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';
    hideMessages();
    
    const response = await fetch(`${currentState.baseUrl}/api/auth/extension-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    // Update state
    currentState.accessToken = data.accessToken;
    currentState.email = email;
    currentState.isLoggedIn = true;
    
    // Save to storage
    await saveStoredData();
    
    // Update UI
    updateUI();
    showSuccess('Successfully signed in!');
    
    // Refresh balance
    refreshBalance();
    
    // Clear password
    $('password').value = '';
    
  } catch (error) {
    showError(error.message || 'Login failed');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = originalText;
  }
}

async function refreshBalance() {
  if (!currentState.isLoggedIn || !currentState.accessToken) return;
  
  setBalanceLoading(true);
  
  try {
    const response = await fetch(`${currentState.baseUrl}/api/me/entitlements`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${currentState.accessToken}` }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const balance = data.creditBalance ?? 0;
    
    $('balanceAmount').innerHTML = `${balance}<span class="balance-unit">credits</span>`;
    
  } catch (error) {
    console.error('Failed to refresh balance:', error);
    $('balanceAmount').innerHTML = `—<span class="balance-unit">credits</span>`;
    
    // If unauthorized, logout user
    if (error.message.includes('401') || error.message.includes('403')) {
      logoutUser(false);
    }
  } finally {
    setBalanceLoading(false);
  }
}

function logoutUser(showMessage = true) {
  currentState.isLoggedIn = false;
  currentState.accessToken = '';
  currentState.email = '';
  currentState.userInfo = null;
  
  // Clear storage
  chrome.storage.sync.remove(['accessToken', 'email']);
  
  // Clear form
  $('email').value = '';
  $('password').value = '';
  
  // Update UI
  updateUI();
  
  if (showMessage) {
    showSuccess('Successfully signed out');
  }
  
  hideMessages();
}

// Navigation functions
function openSignup() {
  chrome.tabs.create({ url: `${currentState.baseUrl}/auth/signup` });
}

function openCredits() {
  chrome.tabs.create({ url: `${currentState.baseUrl}/credits` });
}

function openDashboard() {
  chrome.tabs.create({ url: `${currentState.baseUrl}/dashboard` });
}

function openBuyCredits() {
  chrome.tabs.create({ url: `${currentState.baseUrl}/pricing` });
}

// Testing functions
async function testCreditDeduction() {
  if (!currentState.isLoggedIn || !currentState.accessToken) return;
  
  const testBtn = $('testDeductBtn');
  const originalText = testBtn.textContent;
  
  try {
    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';
    hideMessages();
    
    // Generate a random idempotency key
    const idempotencyKey = 'test-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const response = await fetch(`${currentState.baseUrl}/api/credits/spend`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${currentState.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 5,
        feature: 'extension-test',
        idempotencyKey
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    showSuccess(`✅ Deducted 5 credits! Balance: ${data.balance}`);
    
    // Refresh balance display
    refreshBalance();
    
  } catch (error) {
    showError(`Failed to deduct credits: ${error.message}`);
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = originalText;
  }
}

async function testWebhookAutoTopup() {
  if (!currentState.isLoggedIn || !currentState.accessToken) return;
  
  const testBtn = $('testWebhookBtn');
  const originalText = testBtn.textContent;
  
  try {
    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';
    hideMessages();
    
    const response = await fetch(`${currentState.baseUrl}/api/test/webhook-subscription`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${currentState.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    showSuccess(`✅ Auto top-up successful! +${data.creditsAdded} credits. Balance: ${data.balanceAfter}`);
    
    // Refresh balance display
    refreshBalance();
    
  } catch (error) {
    showError(`Failed to test auto top-up: ${error.message}`);
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = originalText;
  }
}

// Initialize the extension
async function init() {
  try {
    // Detect and set base URL
    currentState.baseUrl = await detectSiteUrl();
    
    // Load stored data
    await loadStoredData();
    
    // If we don't have a stored baseUrl, save the detected one
    if (!currentState.baseUrl) {
      currentState.baseUrl = await detectSiteUrl();
      await saveStoredData();
    }
    
    // Update URL display
    $('urlDisplay').textContent = `Connected to: ${currentState.baseUrl}`;
    
    // Update UI based on current state
    updateUI();
    
    // If logged in, refresh balance
    if (currentState.isLoggedIn) {
      refreshBalance();
    }
    
  } catch (error) {
    console.error('Failed to initialize extension:', error);
    showError('Failed to initialize extension');
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
  await init();
  
  // Auth section event listeners
  $('loginBtn').addEventListener('click', loginUser);
  $('signupBtn').addEventListener('click', openSignup);
  $('creditsBtn').addEventListener('click', openCredits);
  
  // Dashboard section event listeners
  $('dashboardBtn').addEventListener('click', openDashboard);
  $('refreshBtn').addEventListener('click', refreshBalance);
  $('buyCreditsBtn').addEventListener('click', openBuyCredits);
  $('logoutBtn').addEventListener('click', () => logoutUser(true));
  
  // Testing buttons event listeners
  $('testDeductBtn').addEventListener('click', testCreditDeduction);
  $('testWebhookBtn').addEventListener('click', testWebhookAutoTopup);
  
  // Enter key handling for login
  $('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loginUser();
    }
  });
  
  $('email').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && $('password').value) {
      loginUser();
    } else if (e.key === 'Enter') {
      $('password').focus();
    }
  });
});


