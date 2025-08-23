// Chat Widget Script - oricodeV1 (first improvements)
(function() {
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
            overflow: hidden;
            font-family: inherit;
            will-change: transform, opacity;
        }
        /* Removed border glow from previous oricode */
        .n8n-chat-widget .chat-container.position-left {
            right: auto;
            left: 20px;
        }
        .n8n-chat-widget .chat-container.open {
            display: flex;
            flex-direction: column;
            animation: chatPopIn 180ms ease-out both;
        }
        @keyframes chatPopIn {
            from { opacity: 0; transform: translateY(8px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        /* ... keep all previous styles, including typing indicator ... */

        /* Mobile fullscreen toggle button */
        @media (max-width: 480px) {
            .n8n-chat-widget .chat-container {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                border-radius: 0;
            }
            .n8n-chat-widget .chat-toggle {
                bottom: 16px;
                right: 16px;
            }
            .n8n-chat-widget .fullscreen-toggle {
                position: absolute;
                top: 16px;
                right: 56px; /* next to close button */
                background: transparent;
                border: none;
                color: var(--chat--color-font);
                font-size: 20px;
                cursor: pointer;
            }
        }
    `;

    // Load Geist font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    const defaultConfig = { /* same as oricode */ };
    const config = window.ChatWidgetConfig ? { /* same merge logic */ } : defaultConfig;

    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';
    let sessionStarted = false;

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);
    if(config.style.botMessageColor) widgetContainer.style.setProperty('--n8n-chat-bot-color', config.style.botMessageColor);
    if(config.style.userMessageColor) widgetContainer.style.setProperty('--n8n-chat-user-color', config.style.userMessageColor);

    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position==='left'?' position-left':''}`;

    /* Inner HTML for new conversation + chat interface (same as original oricode) */
    /* ... omitted for brevity, just copy original oricode innerHTML ... */

    widgetContainer.appendChild(chatContainer);

    // Toggle buttons
    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position==='left'?' position-left':''}`;
    toggleButton.innerHTML = 'Chat';
    widgetContainer.appendChild(toggleButton);

    // Mobile fullscreen button
    const fullscreenButton = document.createElement('button');
    fullscreenButton.className = 'fullscreen-toggle';
    fullscreenButton.innerHTML = '⛶';
    chatContainer.querySelector('.brand-header').appendChild(fullscreenButton);

    fullscreenButton.addEventListener('click', () => {
        if(chatContainer.classList.contains('fullscreen')) {
            chatContainer.classList.remove('fullscreen');
            chatContainer.style.width = '380px';
            chatContainer.style.height = '600px';
        } else {
            chatContainer.classList.add('fullscreen');
            chatContainer.style.width = '100%';
            chatContainer.style.height = '100%';
        }
    });

    toggleButton.addEventListener('click', () => { chatContainer.classList.toggle('open'); });

    // Keep typing indicator, chat input, send message, close button logic unchanged from original oricode
   // --- ORIGINAL ORICODE LOGIC STARTS HERE ---

const newConversationHTML = `
    <div class="brand-header">
        <img src="${config.branding.logo}" alt="${config.branding.name}">
        <span>${config.branding.name}</span>
        <button class="close-button">×</button>
    </div>
    <div class="new-conversation">
        <h2 class="welcome-text">${config.branding.welcomeText}</h2>
        <button class="new-chat-btn">
            <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
            </svg>
            Send us a message
        </button>
        <p class="response-text">${config.branding.responseTimeText}</p>
    </div>
`;

const chatInterfaceHTML = `
    <div class="chat-interface">
        <div class="brand-header">
            <img src="${config.branding.logo}" alt="${config.branding.name}">
            <span>${config.branding.name}</span>
            <button class="close-button">×</button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input">
            <textarea placeholder="Type your message here..." rows="1"></textarea>
            <button type="submit" class="send-btn">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
                    <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
                </svg>
            </button>
        </div>
    </div>
`;

chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;

const newChatBtn = chatContainer.querySelector('.new-chat-btn');
const chatInterface = chatContainer.querySelector('.chat-interface');
const messagesContainer = chatContainer.querySelector('.chat-messages');
const textarea = chatContainer.querySelector('textarea');
const sendButton = chatContainer.querySelector('button[type="submit"]');

function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
}

function generateUUID() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return indicator;
}

async function startNewConversation() {
    currentSessionId = generateUUID();

    chatContainer.querySelectorAll('.brand-header')[0].style.display = 'none';
    chatContainer.querySelector('.new-conversation').style.display = 'none';
    chatInterface.classList.add('active');

    if (config.branding.welcomeText) {
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'chat-message bot';
        botMessageDiv.textContent = config.branding.welcomeText;
        messagesContainer.appendChild(botMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    const typing = showTypingIndicator();

    const data = [{
        action: "loadPreviousSession",
        sessionId: currentSessionId,
        route: config.webhook.route,
        metadata: { userId: "" }
    }];

    try {
        const response = await fetch(config.webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        typing.remove();

        const initialText = Array.isArray(responseData) ? responseData[0]?.output : responseData?.output;
        if (initialText) {
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.textContent = initialText;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    } catch (error) {
        typing.remove();
        const errDiv = document.createElement('div');
        errDiv.className = 'chat-message bot';
        errDiv.textContent = 'Sorry, failed to load conversation.';
        messagesContainer.appendChild(errDiv);
        console.error('Error:', error);
    }
}

async function sendMessage(message) {
    const trimmed = message.trim();
    if (!trimmed) return;

    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'chat-message user';
    userMessageDiv.textContent = trimmed;
    messagesContainer.appendChild(userMessageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    textarea.value = '';
    autoResizeTextarea(textarea);

    const typingIndicator = showTypingIndicator();

    const messageData = {
        action: "sendMessage",
        sessionId: currentSessionId,
        route: config.webhook.route,
        chatInput: trimmed,
        metadata: { userId: "" }
    };

    try {
        const response = await fetch(config.webhook.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        });
        
        const data = await response.json();
        typingIndicator.remove();
        
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'chat-message bot';
        botMessageDiv.textContent = Array.isArray(data) ? data[0]?.output : data?.output;
        messagesContainer.appendChild(botMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        typingIndicator.remove();
        const errDiv = document.createElement('div');
        errDiv.className = 'chat-message bot';
        errDiv.textContent = 'Sorry, something went wrong.';
        messagesContainer.appendChild(errDiv);
        console.error('Error:', error);
    }
}

// Event listeners
newChatBtn.addEventListener('click', startNewConversation);

sendButton.addEventListener('click', () => {
    const message = textarea.value;
    if (message) sendMessage(message);
});

textarea.addEventListener('input', () => autoResizeTextarea(textarea));

textarea.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const message = textarea.value;
        if (message) sendMessage(message);
    }
});

const closeButtons = chatContainer.querySelectorAll('.close-button');
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        chatContainer.classList.remove('open');
    });
});


})();
