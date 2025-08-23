<!-- oricode2.js -->
<script>
/**
 * oricode2 — Chat Widget Script
 * Changes:
 * 1) No auto-fetch on open (fetch only after first user message)
 * 2) Removed purple glow; cleaner neutral look
 * 3) Mobile fullscreen toggle beside (X)
 * 4) LocalStorage persistence (JSON), last 50 messages, versioned key
 * 5) Persistent nickname (asked once), greet on return
 * 6) Timestamps under each message
 * 7) Feedback (👍/👎) under bot replies
 * 8) Desktop shortcuts (Enter=send, Shift+Enter=newline)
 * 9) Unread indicator (red dot) on widget button when minimized & new bot msg arrives
 * 10) Status dot beside name (🟢 online / 🔴 offline on fetch error)
 * 11) Keeps existing typing indicator
 */

(function () {
  const STORAGE_KEY = 'oricode2-v1';
  const NAME_KEY = 'oricode2-username';
  const FEEDBACK_KEY = 'oricode2-feedback-v1';
  const MAX_SAVED = 50;

  // ---------- Styles ----------
  const styles = `
    .n8n-chat-widget {
      --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
      --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
      --chat--color-background: var(--n8n-chat-background-color, #ffffff);
      --chat--color-font: var(--n8n-chat-font-color, #333333);
      font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    .n8n-chat-widget .chat-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: none;
      width: 380px;
      height: 600px;
      background: var(--chat--color-background);
      border-radius: 12px;
      /* Removed purple glow; neutral subtle shadow */
      box-shadow: 0 12px 28px rgba(0,0,0,0.12);
      border: 1px solid rgba(0,0,0,0.08);
      overflow: hidden;
      font-family: inherit;
      will-change: transform, opacity;
    }
    .n8n-chat-widget .chat-container.position-left { right: auto; left: 20px; }
    .n8n-chat-widget .chat-container.open {
      display: flex;
      flex-direction: column;
      animation: chatPopIn 180ms ease-out both;
    }
    @keyframes chatPopIn {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .n8n-chat-widget .brand-header {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 3px solid rgba(0,0,0,0.05);
      position: relative;
    }
    .n8n-chat-widget .brand-header img { width: 32px; height: 32px; }
    .n8n-chat-widget .brand-header .brand-name {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
      color: var(--chat--color-font);
    }
    /* Status dot beside name */
    .n8n-chat-widget .status-dot {
      width: 8px; height: 8px; border-radius: 50%;
    }
    .n8n-chat-widget .status-online { background: #10b981; }  /* green */
    .n8n-chat-widget .status-offline { background: #ef4444; } /* red */

    .n8n-chat-widget .close-button,
    .n8n-chat-widget .fullscreen-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--chat--color-font);
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s, opacity 0.2s;
      font-size: 18px;
      opacity: 0.8;
    }
    .n8n-chat-widget .close-button { right: 12px; }
    .n8n-chat-widget .fullscreen-button { right: 44px; display: none; }
    .n8n-chat-widget .close-button:hover,
    .n8n-chat-widget .fullscreen-button:hover { opacity: 1; }

    .n8n-chat-widget .new-conversation {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      padding: 20px; text-align: center;
      width: 100%; max-width: 300px;
    }
    .n8n-chat-widget .welcome-text {
      font-size: 24px; font-weight: 600; color: var(--chat--color-font);
      margin-bottom: 24px; line-height: 1.3;
    }
    .n8n-chat-widget .new-chat-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 14px 20px;
      background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
      color: white; border: none; border-radius: 8px; cursor: pointer;
      font-size: 16px; transition: transform 0.3s; font-weight: 500; font-family: inherit;
      margin-bottom: 12px;
    }
    .n8n-chat-widget .new-chat-btn:hover { transform: scale(1.02); }
    .n8n-chat-widget .response-text { font-size: 14px; color: var(--chat--color-font); opacity: 0.7; margin: 0; }

    .n8n-chat-widget .chat-interface { display: none; flex-direction: column; height: 100%; }
    .n8n-chat-widget .chat-interface.active { display: flex; }

    .n8n-chat-widget .chat-messages {
      flex: 1; overflow-y: auto; padding: 20px; background: var(--chat--color-background);
      display: flex; flex-direction: column;
    }
    .n8n-chat-widget .chat-message {
      padding: 10px 14px; margin: 8px 0; border-radius: 12px; max-width: 80%;
      word-wrap: break-word; font-size: 14px; line-height: 1.25rem;
      animation: msgIn 180ms ease-out both; position: relative;
    }
    @keyframes msgIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .n8n-chat-widget .chat-message.user {
      background: var(--n8n-chat-user-color, linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%));
      color: white; align-self: flex-end; border: none;
    }
    .n8n-chat-widget .chat-message.bot {
      background: var(--n8n-chat-bot-color, var(--chat--color-background));
      border: 1px solid rgba(0,0,0,0.08);
      color: var(--chat--color-font); align-self: flex-start;
    }
    /* Tiny timestamp under each message */
    .n8n-chat-widget .msg-time {
      display: block; font-size: 11px; opacity: 0.6; margin-top: 6px;
    }
    /* Feedback row under bot messages */
    .n8n-chat-widget .feedback-row {
      display: inline-flex; gap: 8px; margin-top: 8px; font-size: 13px; opacity: 0.85;
    }
    .n8n-chat-widget .feedback-btn {
      background: none; border: 1px solid rgba(0,0,0,0.12); border-radius: 999px; padding: 4px 8px; cursor: pointer;
    }
    .n8n-chat-widget .feedback-btn.selected { border-color: var(--chat--color-primary); }

    .n8n-chat-widget .chat-input {
      padding: 16px; background: var(--chat--color-background);
      border-top: 3px solid rgba(0,0,0,0.05); display: flex; gap: 8px;
    }
    .n8n-chat-widget .chat-input textarea {
      flex: 1; padding: 12px; border: 1px solid rgba(0,0,0,0.12); border-radius: 8px;
      background: var(--chat--color-background); color: var(--chat--color-font);
      resize: none; font-family: inherit; font-size: 14px; max-height: 140px; overflow-y: hidden;
    }
    .n8n-chat-widget .chat-input textarea::placeholder { color: var(--chat--color-font); opacity: 0.6; }
    .n8n-chat-widget .chat-input button {
      background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
      color: white; border: none; border-radius: 8px; padding: 0 20px; width: 44px; height: 44px; cursor: pointer; transition: transform 0.2s; font-family: inherit; font-weight: 500;
    }
    .n8n-chat-widget .chat-input button:hover { transform: scale(1.05); }
    .n8n-chat-widget .chat-input .send-btn { display: flex; align-items: center; justify-content: center; padding: 0; width: 44px; height: 44px; }
    .n8n-chat-widget .chat-input .send-btn svg { width: 20px; height: 20px; }

    .n8n-chat-widget .chat-toggle {
      position: fixed; bottom: 20px; right: 20px;
      width: 60px; height: 60px; border-radius: 30px;
      background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
      color: white; border: none; cursor: pointer;
      box-shadow: 0 4px 12px rgba(133,79,255,0.3);
      z-index: 999; transition: transform 0.3s;
      display: flex; align-items: center; justify-content: center;
    }
    .n8n-chat-widget .chat-toggle.position-left { right: auto; left: 20px; }
    .n8n-chat-widget .chat-toggle:hover { transform: scale(1.05); }
    .n8n-chat-widget .chat-toggle svg { width: 24px; height: 24px; fill: currentColor; }
    /* Unread red dot on toggle (when minimized & new bot message arrives) */
    .n8n-chat-widget .chat-toggle.has-unread::after {
      content: ''; position: absolute; top: 8px; right: 8px; width: 10px; height: 10px; border-radius: 50%; background: #ef4444;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.85);
    }

    /* Typing indicator (kept) */
    .n8n-chat-widget .typing-indicator {
      display: inline-flex; align-items: center; gap: 4px; padding: 12px 16px;
      background: var(--chat--color-background); border: 1px solid rgba(0,0,0,0.08);
      border-radius: 12px; align-self: flex-start; margin: 8px 0; animation: msgIn 160ms ease-out both;
    }
    .n8n-chat-widget .typing-dot { width: 6px; height: 6px; background-color: var(--chat--color-font); border-radius: 50%; opacity: 0.4; animation: dotBlink 1.4s infinite; }
    .n8n-chat-widget .typing-dot:nth-child(2) { animation-delay: 0.15s; }
    .n8n-chat-widget .typing-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes dotBlink { 0%,80%,100%{opacity:0.4;} 40%{opacity:1;} }

    /* Mobile view & fullscreen toggle visibility */
    @media (max-width: 480px) {
      .n8n-chat-widget .chat-container { width: 100%; height: 100%; bottom: 0; right: 0; border-radius: 0; }
      .n8n-chat-widget .chat-toggle { bottom: 16px; right: 16px; }
      .n8n-chat-widget .fullscreen-button { display: inline-flex; }
    }
    /* Fullscreen mode (toggled via button) */
    .n8n-chat-widget .chat-container.fullscreen {
      width: 100% !important; height: 100% !important; left: 0 !important; right: 0 !important; top: 0 !important; bottom: 0 !important; border-radius: 0 !important;
    }
  `;

  // Load Geist font
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
  document.head.appendChild(fontLink);

  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // ---------- Default config ----------
  const defaultConfig = {
    webhook: { url: '', route: '' },
    branding: { logo: '', name: '', welcomeText: '', responseTimeText: '' },
    style: {
      primaryColor: '', secondaryColor: '', position: 'right',
      backgroundColor: '#ffffff', fontColor: '#333333',
      botMessageColor: '', userMessageColor: ''
    }
  };

  const config = window.ChatWidgetConfig ?
    {
      webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
      branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
      style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
    } : defaultConfig;

  if (window.N8NChatWidgetInitialized_oricode2) return;
  window.N8NChatWidgetInitialized_oricode2 = true;

  // ---------- State ----------
  let currentSessionId = '';
  let messages = []; // {id, sender:'user'|'bot', text, ts}
  let username = '';
  let hasUnread = false;

  // ---------- DOM ----------
  const widgetContainer = document.createElement('div');
  widgetContainer.className = 'n8n-chat-widget';
  widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
  widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
  widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
  widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);
  if (config.style.botMessageColor) widgetContainer.style.setProperty('--n8n-chat-bot-color', config.style.botMessageColor);
  if (config.style.userMessageColor) widgetContainer.style.setProperty('--n8n-chat-user-color', config.style.userMessageColor);

  const chatContainer = document.createElement('div');
  chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;

  const newConversationHTML = `
    <div class="brand-header">
      <img src="${config.branding.logo}" alt="${config.branding.name}">
      <span class="brand-name">
        <span>${config.branding.name}</span>
        <span class="status-dot status-online" title="Online"></span>
      </span>
      <button class="fullscreen-button" title="Toggle fullscreen">⛶</button>
      <button class="close-button" title="Close">×</button>
    </div>
    <div class="new-conversation">
      <h2 class="welcome-text">${config.branding.welcomeText}</h2>
      <button class="new-chat-btn">
        <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>
        Send us a message
      </button>
      <p class="response-text">${config.branding.responseTimeText}</p>
    </div>
  `;

  const chatInterfaceHTML = `
    <div class="chat-interface">
      <div class="brand-header">
        <img src="${config.branding.logo}" alt="${config.branding.name}">
        <span class="brand-name">
          <span>${config.branding.name}</span>
          <span class="status-dot status-online" title="Online"></span>
        </span>
        <button class="fullscreen-button" title="Toggle fullscreen">⛶</button>
        <button class="close-button" title="Close">×</button>
      </div>
      <div class="chat-messages"></div>
      <div class="chat-input">
        <textarea placeholder="Type your message here..." rows="1"></textarea>
        <button type="submit" class="send-btn" title="Send">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>
        </button>
      </div>
    </div>
  `;

  chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;

  const toggleButton = document.createElement('button');
  toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
  toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>`;

  widgetContainer.appendChild(chatContainer);
  widgetContainer.appendChild(toggleButton);
  document.body.appendChild(widgetContainer);

  const newChatBtn = chatContainer.querySelector('.new-chat-btn');
  const chatInterface = chatContainer.querySelector('.chat-interface');
  const messagesContainer = chatContainer.querySelector('.chat-messages');
  const textarea = chatContainer.querySelector('textarea');
  const sendButton = chatContainer.querySelector('button[type="submit"]');

  const headerStatusDots = chatContainer.querySelectorAll('.status-dot');

  // ---------- Utils ----------
  function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }
  function generateUUID() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  function fmtTime(ts) {
    const d = new Date(ts);
    const hh = d.getHours().toString().padStart(2,'0');
    const mm = d.getMinutes().toString().padStart(2,'0');
    return `${hh}:${mm}`;
  }
  function setStatus(state) {
    headerStatusDots.forEach(dot => {
      dot.classList.remove('status-online','status-offline');
      if (state === 'online') dot.classList.add('status-online');
      else dot.classList.add('status-offline');
      dot.title = state === 'online' ? 'Online' : 'Offline';
    });
  }

  function saveMessages() {
    // limit to last MAX_SAVED
    const trimmed = messages.slice(-MAX_SAVED);
    messages = trimmed;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
  function loadMessages() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
  function saveFeedback(entry) {
    const arr = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
    arr.push(entry);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(arr));
  }
  function getUsername() {
    return localStorage.getItem(NAME_KEY) || '';
  }
  function setUsername(name) {
    localStorage.setItem(NAME_KEY, name);
  }

  // ---------- Rendering ----------
  function appendMessage({ id, sender, text, ts }, { withFeedback=false } = {}) {
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.dataset.id = id;

    // content
    const content = document.createElement('div');
    content.textContent = text;
    div.appendChild(content);

    // timestamp
    const time = document.createElement('span');
    time.className = 'msg-time';
    time.textContent = fmtTime(ts);
    div.appendChild(time);

    // feedback buttons under bot replies
    if (sender === 'bot' && withFeedback) {
      const row = document.createElement('div');
      row.className = 'feedback-row';
      const up = document.createElement('button');
      up.className = 'feedback-btn';
      up.textContent = '👍';
      const down = document.createElement('button');
      down.className = 'feedback-btn';
      down.textContent = '👎';
      function select(btn, val) {
        up.classList.toggle('selected', val === 'up');
        down.classList.toggle('selected', val === 'down');
        saveFeedback({ msgId: id, value: val, ts: Date.now() });
      }
      up.addEventListener('click', () => select(up, 'up'));
      down.addEventListener('click', () => select(down, 'down'));
      row.appendChild(up); row.appendChild(down);
      div.appendChild(row);
    }

    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // unread dot if minimized and it's a bot message
    if (!chatContainer.classList.contains('open') && sender === 'bot') {
      toggleButton.classList.add('has-unread');
      hasUnread = true;
    }
  }

  function renderAll() {
    messagesContainer.innerHTML = '';
    messages.forEach(m => appendMessage(m, { withFeedback: m.sender === 'bot' }));
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return indicator;
  }

  // ---------- Behavior ----------
  messages = loadMessages();
  username = getUsername();

  function startNewConversation() {
    // open UI (no fetch here)
    chatContainer.querySelectorAll('.brand-header')[0].style.display = 'none';
    chatContainer.querySelector('.new-conversation').style.display = 'none';
    chatInterface.classList.add('active');

    // ask for name once
    if (!username) {
      setTimeout(() => {
        const name = window.prompt('What should we call you? (optional)');
        if (name && name.trim()) {
          username = name.trim();
          setUsername(username);
        }
      }, 50);
    }

    // if there's saved messages, render them and stop
    if (messages.length) {
      renderAll();
      return;
    }

    // else show welcomeText as first bot message if provided, save it
    if (config.branding.welcomeText) {
      const m = { id: generateUUID(), sender: 'bot', text: config.branding.welcomeText, ts: Date.now() };
      messages.push(m);
      appendMessage(m, { withFeedback: true });
      saveMessages();
    }
  }

  async function sendMessage(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // user message
    const userMsg = { id: generateUUID(), sender: 'user', text: trimmed, ts: Date.now() };
    messages.push(userMsg);
    appendMessage(userMsg);
    saveMessages();

    textarea.value = '';
    autoResizeTextarea(textarea);

    // first-time session ID
    if (!currentSessionId) currentSessionId = generateUUID();

    // typing indicator
    const typing = showTypingIndicator();

    // Fetch only now (first user message or subsequent)
    const payload = {
      action: "sendMessage",
      sessionId: currentSessionId,
      route: config.webhook.route,
      chatInput: username ? `${trimmed}\n\n[name:${username}]` : trimmed,
      metadata: { userId: "" }
    };

    try {
      if (!config.webhook.url) throw new Error('No webhook URL configured');

      const resp = await fetch(config.webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await resp.json().catch(() => ({}));
      typing.remove();

      // derive text
      const outText = Array.isArray(data) ? (data[0]?.output ?? '') : (data?.output ?? '');
      const botText = outText || 'Got it.';

      const botMsg = { id: generateUUID(), sender: 'bot', text: botText, ts: Date.now() };
      messages.push(botMsg);
      appendMessage(botMsg, { withFeedback: true });
      saveMessages();

      setStatus('online');
    } catch (err) {
      typing.remove();
      const botMsg = {
        id: generateUUID(),
        sender: 'bot',
        text: 'Sorry, something went wrong. Please try again later.',
        ts: Date.now()
      };
      messages.push(botMsg);
      appendMessage(botMsg, { withFeedback: true });
      saveMessages();

      setStatus('offline');
      console.error('oricode2 fetch error:', err);
    }
  }

  // ---------- Listeners ----------
  const newChatBtn = chatContainer.querySelector('.new-chat-btn');
  newChatBtn.addEventListener('click', startNewConversation);

  const sendButton = chatContainer.querySelector('button[type="submit"]');
  sendButton.addEventListener('click', () => {
    const msg = textarea.value;
    if (msg.trim()) sendMessage(msg);
  });

  const allTextareas = chatContainer.querySelectorAll('textarea');
  const textareaEl = allTextareas[0];
  textareaEl.addEventListener('input', () => autoResizeTextarea(textareaEl));
  textareaEl.addEventListener('keydown', (e) => {
    // Desktop shortcuts: Enter=send, Shift+Enter=new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const msg = textareaEl.value;
      if (msg.trim()) sendMessage(msg);
    }
  });

  toggleButton.addEventListener('click', () => {
    chatContainer.classList.toggle('open');
    // clear unread indicator on open
    if (chatContainer.classList.contains('open') && hasUnread) {
      toggleButton.classList.remove('has-unread');
      hasUnread = false;
    }
  });

  // close buttons
  chatContainer.querySelectorAll('.close-button').forEach(btn => {
    btn.addEventListener('click', () => {
      chatContainer.classList.remove('open');
    });
  });

  // fullscreen toggle buttons (visible on mobile)
  chatContainer.querySelectorAll('.fullscreen-button').forEach(btn => {
    btn.addEventListener('click', () => {
      chatContainer.classList.toggle('fullscreen');
    });
  });
})();
</script>
