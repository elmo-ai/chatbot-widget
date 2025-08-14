(function () {
  const widgetConfig = window.ChatWidgetConfig || {};
  const chatContainer = document.createElement('div');
  chatContainer.className = 'chat-widget-container';
  document.body.appendChild(chatContainer);

  chatContainer.innerHTML = `
    <div class="chat-widget">
      <div class="chat-header">
        ${widgetConfig.title || 'Chat'}
        <button class="chat-close">&times;</button>
      </div>
      <div class="chat-messages"></div>
      <div class="chat-input">
        <input type="text" placeholder="Type a message..." />
        <button class="chat-send">Send</button>
      </div>
    </div>
    <button class="chat-toggle">💬</button>
  `;

  const toggleBtn = chatContainer.querySelector('.chat-toggle');
  const chatWidget = chatContainer.querySelector('.chat-widget');
  const closeBtn = chatContainer.querySelector('.chat-close');
  const messagesEl = chatContainer.querySelector('.chat-messages');
  const inputEl = chatContainer.querySelector('.chat-input input');
  const sendBtn = chatContainer.querySelector('.chat-send');

  let isOpen = false;

  toggleBtn.addEventListener('click', () => {
    chatWidget.style.display = isOpen ? 'none' : 'flex';
    isOpen = !isOpen;
  });

  closeBtn.addEventListener('click', () => {
    chatWidget.style.display = 'none';
    isOpen = false;
  });

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTypingIndicator() {
    const typingEl = document.createElement('div');
    typingEl.className = 'message bot typing';
    typingEl.textContent = 'Bot is typing...';
    typingEl.id = 'typing-indicator';
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTypingIndicator() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) typingEl.remove();
  }

  sendBtn.addEventListener('click', () => {
    const text = inputEl.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    inputEl.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Send to n8n webhook
    fetch(widgetConfig.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    })
      .then(res => res.json())
      .then(data => {
        removeTypingIndicator();
        addMessage(data.reply || '(no reply)', 'bot');
      })
      .catch(() => {
        removeTypingIndicator();
        addMessage('(Error getting reply)', 'bot');
      });
  });

  // Optional: press Enter to send
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendBtn.click();
  });

  // Basic styles (removed footer, added typing style)
  const style = document.createElement('style');
  style.textContent = `
    .chat-widget-container { position: fixed; bottom: 20px; right: 20px; font-family: sans-serif; }
    .chat-toggle { background: #007bff; color: #fff; border: none; border-radius: 50%; padding: 10px; cursor: pointer; font-size: 20px; }
    .chat-widget { display: none; flex-direction: column; width: 300px; height: 400px; border: 1px solid #ccc; border-radius: 8px; background: #fff; }
    .chat-header { background: #007bff; color: #fff; padding: 10px; display: flex; justify-content: space-between; align-items: center; }
    .chat-messages { flex: 1; padding: 10px; overflow-y: auto; }
    .message { padding: 5px 10px; margin: 5px 0; border-radius: 4px; max-width: 80%; }
    .message.user { background: #007bff; color: #fff; margin-left: auto; }
    .message.bot { background: #f1f1f1; }
    .message.typing { font-style: italic; opacity: 0.7; }
    .chat-input { display: flex; border-top: 1px solid #ccc; }
    .chat-input input { flex: 1; padding: 10px; border: none; outline: none; }
    .chat-input button { background: #007bff; color: #fff; border: none; padding: 10px; cursor: pointer; }
  `;
  document.head.appendChild(style);
})();
