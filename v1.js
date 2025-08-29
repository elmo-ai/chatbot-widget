// AI Chat Widget - Enhanced Version
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
            border: 1px solid rgba(0, 0, 0, 0.1);
            overflow: hidden;
            font-family: inherit;
            will-change: transform, opacity;
        }
        .n8n-chat-widget .chat-container.position-left {
            right: auto;
            left: 20px;
        }
        .n8n-chat-widget .chat-container.open {
            display: flex;
            flex-direction: column;
            animation: chatPopIn 250ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes chatPopIn {
            from { 
                opacity: 0; 
                transform: translateY(12px) scale(0.95); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
            }
        }
        .n8n-chat-widget .brand-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.1);
            position: relative;
        }
        
        .n8n-chat-widget .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #22c55e;
            margin-left: 8px;
            transition: background-color 0.3s ease;
        }
        .n8n-chat-widget .status-dot.offline {
            background: #ef4444;
        }
        
        .n8n-chat-widget .fullscreen-toggle {
            display: none;
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 4px;
            margin-right: 8px;
            font-size: 20px;
            opacity: 0.8;
            transition: opacity 0.2s;
            line-height: 1;
        }
        .n8n-chat-widget .fullscreen-toggle:hover {
            opacity: 1;
        }
        
        .n8n-chat-widget .close-button {
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s, opacity 0.2s;
            font-size: 22px;
            font-weight: bold;
            opacity: 0.8;
        }
        .n8n-chat-widget .close-button:hover {
            color: red;
            opacity: 1;
        }
        
        .n8n-chat-widget .header-controls {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .n8n-chat-widget .brand-header img {
            width: 32px;
            height: 32px;
        }
        .n8n-chat-widget .brand-header .brand-info {
            display: flex;
            align-items: center;
        }
        .n8n-chat-widget .brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }
        .n8n-chat-widget .new-conversation {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            text-align: center;
            width: 100%;
            max-width: 300px;
        }
        .n8n-chat-widget .welcome-text {
            font-size: 24px;
            font-weight: 600;
            color: var(--chat--color-font);
            margin-bottom: 24px;
            line-height: 1.3;
        }
        .n8n-chat-widget .new-chat-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.3s;
            font-weight: 500;
            font-family: inherit;
            margin-bottom: 12px;
        }
        .n8n-chat-widget .new-chat-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 6px 20px rgba(133, 79, 255, 0.3);
        }
        .n8n-chat-widget .message-icon {
            width: 20px;
            height: 20px;
        }
        .n8n-chat-widget .response-text {
            font-size: 14px;
            color: var(--chat--color-font);
            opacity: 0.7;
            margin: 0;
        }
        .n8n-chat-widget .chat-interface {
            display: none;
            flex-direction: column;
            height: 100%;
        }
        .n8n-chat-widget .chat-interface.active {
            display: flex;
        }
        .n8n-chat-widget .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: var(--chat--color-background);
            display: flex;
            flex-direction: column;
        }
        
        .n8n-chat-widget .chat-messages::-webkit-scrollbar {
            width: 3px;
        }
        .n8n-chat-widget .chat-messages::-webkit-scrollbar-track {
            background: transparent;
        }
        .n8n-chat-widget .chat-messages::-webkit-scrollbar-thumb {
            background: rgba(133, 79, 255, 0.3);
            border-radius: 3px;
        }
        .n8n-chat-widget .chat-messages::-webkit-scrollbar-thumb:hover {
            background: rgba(133, 79, 255, 0.5);
        }
        .n8n-chat-widget .chat-messages {
            scrollbar-width: thin;
            scrollbar-color: rgba(133, 79, 255, 0.3) transparent;
        }
        .n8n-chat-widget .chat-message {
            padding: 10px 14px;
            margin: 8px 0;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.25rem;
            animation: msgIn 200ms cubic-bezier(0.34, 1.26, 0.64, 1) both;
        }

        @keyframes msgIn {
            from { 
                opacity: 0; 
                transform: translateY(8px) scale(0.95); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
            }
        }
        .n8n-chat-widget .chat-message.user {
            background: var(--n8n-chat-user-color, linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%));
            color: white;
            align-self: flex-end;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2);
            border: none;
        }
        .n8n-chat-widget .chat-message.bot {
            background: var(--n8n-chat-bot-color, var(--chat--color-background));
            border: 1px solid rgba(0, 0, 0, 0.1);
            color: var(--chat--color-font);
            align-self: flex-start;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .n8n-chat-widget .chat-input {
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 2px solid rgba(255, 255, 255, 0.1);
            display: flex;
            gap: 8px;
        }
        .n8n-chat-widget .chat-input textarea {
            flex: 1;
            padding: 12px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            resize: none;
            font-family: inherit;
            font-size: 14px;
            max-height: 140px;
            overflow-y: hidden;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .n8n-chat-widget .chat-input textarea:focus {
            outline: none;
            border-color: rgba(133, 79, 255, 0.5);
            box-shadow: 0 0 0 2px rgba(133, 79, 255, 0.1);
        }
        .n8n-chat-widget .chat-input textarea::placeholder {
            color: var(--chat--color-font);
            opacity: 0.6;
        }
        .n8n-chat-widget .chat-input button {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0 20px;
            width: 44px;
            height: 44px;
            cursor: pointer;
            transition: transform 0.2s;
            font-family: inherit;
            font-weight: 500;
        }
        .n8n-chat-widget .chat-input button:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
        }
        .n8n-chat-widget .chat-input .send-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            width: 44px;
            height: 44px;
        }
        .n8n-chat-widget .chat-input .send-btn svg {
            width: 20px;
            height: 20px;
        }

        .n8n-chat-widget .chat-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
            z-index: 999;
            transition: transform 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .n8n-chat-widget .chat-toggle.position-left {
            right: auto;
            left: 20px;
        }
        .n8n-chat-widget .chat-toggle:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(133, 79, 255, 0.4);
        }
        .n8n-chat-widget .chat-toggle svg {
            width: 24px;
            height: 24px;
            fill: currentColor;
        }
        
        .n8n-chat-widget .unread-counter {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ef4444;
            color: white;
            border-radius: 12px;
            padding: 2px 6px;
            font-size: 12px;
            font-weight: bold;
            min-width: 18px;
            text-align: center;
            display: none;
            animation: bounce 0.3s ease-out;
        }
        
        @keyframes bounce {
            0% { transform: scale(0.8); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        /* FIXED: Better visibility for typing indicator */
        .n8n-chat-widget .typing-indicator {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 12px 16px;
            background: var(--n8n-chat-bot-color, #f0f0f0);
            border: 1px solid rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            align-self: flex-start;
            margin: 8px 0;
            animation: msgIn 160ms ease-out both;
        }
        .n8n-chat-widget .typing-dot {
            width: 6px;
            height: 6px;
            background-color: var(--chat--color-primary);
            border-radius: 50%;
            opacity: 0.6;
            animation: dotBlink 1.4s infinite;
        }
        .n8n-chat-widget .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .n8n-chat-widget .typing-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes dotBlink {
            0%, 80%, 100% { opacity: 0.6; }
            40% { opacity: 1; }
        }
        
        /* Mobile responsive - FIXED: Fullscreen button positioning */
        @media (max-width: 480px) {
            .n8n-chat-widget .chat-container {
                width: 90%;
                height: 80%;
                bottom: 5%;
                right: 5%;
                left: 5%;
                border-radius: 12px;
            }
            .n8n-chat-widget .chat-container.position-left {
                right: 5%;
                left: 5%;
            }
            .n8n-chat-widget .chat-container.mobile-fullscreen {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                left: 0;
                border-radius: 0;
            }
            .n8n-chat-widget .chat-toggle {
                bottom: 16px;
                right: 16px;
            }
            .n8n-chat-widget .chat-toggle.position-left {
                right: auto;
                left: 16px;
            }
            .n8n-chat-widget .fullscreen-toggle {
                display: block;
            }
            
            /* FIXED: Keep header controls properly positioned in fullscreen */
            .n8n-chat-widget .chat-container.mobile-fullscreen .header-controls {
                position: absolute;
                right: 16px;
                top: 50%;
                transform: translateY(-50%);
            }
        }
    `;

    // Load Google Icons and Geist font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    const iconLink = document.createElement('link');
    iconLink.rel = 'stylesheet';
    iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.head.appendChild(iconLink);

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    const defaultConfig = {
        webhook: {
            url: '',
            route: ''
        },
        branding: {
            logo: '',
            name: '',
            welcomeText: '',
            responseTimeText: ''
        },
        style: {
            primaryColor: '',
            secondaryColor: '',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        }
    };

    const config = window.ChatWidgetConfig ? 
        {
            webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
            branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
            style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
        } : defaultConfig;

    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';
    let firstMessageSent = false;
    let unreadCount = 0;

    const STORAGE_KEY = 'n8n_chat_messages';
    const SESSION_KEY = 'n8n_chat_session';
    
    function saveToStorage() {
        try {
            const messages = Array.from(document.querySelectorAll('.chat-message')).map(msg => ({
                type: msg.classList.contains('user') ? 'user' : 'bot',
                content: msg.textContent,
                timestamp: Date.now()
            }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
            if (currentSessionId) {
                localStorage.setItem(SESSION_KEY, currentSessionId);
            }
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }
    
    function loadFromStorage() {
        try {
            const savedMessages = localStorage.getItem(STORAGE_KEY);
            const savedSessionId = localStorage.getItem(SESSION_KEY);
            
            if (savedSessionId) {
                currentSessionId = savedSessionId;
            }
            
            return savedMessages ? JSON.parse(savedMessages) : [];
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
            return [];
        }
    }

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);

    if (config.style.botMessageColor) {
        widgetContainer.style.setProperty('--n8n-chat-bot-color', config.style.botMessageColor);
    }
    if (config.style.userMessageColor) {
        widgetContainer.style.setProperty('--n8n-chat-user-color', config.style.userMessageColor);
    }

    const chatContainer = document.createElement('div');
    chatContainer.className = `chat-container${config.style.position === 'left' ? ' position-left' : ''}`;
    
    const newConversationHTML = `
        <div class="brand-header">
            <img src="${config.branding.logo}" alt="${config.branding.name}">
            <div class="brand-info">
                <span>${config.branding.name}</span>
                <div class="status-dot" id="statusDot"></div>
            </div>
            <div class="header-controls">
                <button class="fullscreen-toggle" id="fullscreenToggle">
                    <span class="material-icons">fullscreen</span>
                </button>
                <button class="close-button">×</button>
            </div>
        </div>
        <div class="new-conversation">
            <h2 class="welcome-text">${config.branding.welcomeText}</h2>
            <button class="new-chat-btn">
                <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
                </svg>
                Kirim Pesan
            </button>
            <p class="response-text">${config.branding.responseTimeText}</p>
        </div>
    `;

    const chatInterfaceHTML = `
        <div class="chat-interface">
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <div class="brand-info">
                    <span>${config.branding.name}</span>
                    <div class="status-dot" id="statusDotChat"></div>
                </div>
                <div class="header-controls">
                    <button class="fullscreen-toggle" id="fullscreenToggleChat">
                        <span class="material-icons">fullscreen</span>
                    </button>
                    <button class="close-button">×</button>
                </div>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Ketik pesan Anda di sini..." rows="1"></textarea>
                <button type="submit" class="send-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
                        <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML;
    
    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>
        <div class="unread-counter" id="unreadCounter"></div>`;
    
    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    const newChatBtn = chatContainer.querySelector('.new-chat-btn');
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');
    const unreadCounter = document.getElementById('unreadCounter');

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

    function updateUnreadCounter(increment = true) {
        if (increment && !chatContainer.classList.contains('open')) {
            unreadCount++;
            unreadCounter.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
            unreadCounter.style.display = 'block';
        } else if (!increment) {
            unreadCount = 0;
            unreadCounter.style.display = 'none';
        }
    }

    function updateStatusDot(online = true) {
        const dots = [document.getElementById('statusDot'), document.getElementById('statusDotChat')];
        dots.forEach(dot => {
            if (dot) {
                dot.classList.toggle('offline', !online);
            }
        });
    }

    function loadSavedMessages() {
        const savedMessages = loadFromStorage();
        
        if (savedMessages.length > 0) {
            chatContainer.querySelectorAll('.brand-header')[0].style.display = 'none';
            chatContainer.querySelector('.new-conversation').style.display = 'none';
            chatInterface.classList.add('active');
            
            savedMessages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `chat-message ${msg.type}`;
                messageDiv.textContent = msg.content;
                messagesContainer.appendChild(messageDiv);
            });
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            firstMessageSent = true;
        }
    }

    // FIXED: Start conversation with proper welcome message flow
    async function startNewConversation() {
        if (!currentSessionId) {
            currentSessionId = generateUUID();
        }

        chatContainer.querySelectorAll('.brand-header')[0].style.display = 'none';
        chatContainer.querySelector('.new-conversation').style.display = 'none';
        chatInterface.classList.add('active');

        // Show the welcome message immediately when starting new conversation
        const welcomeMessage = config.branding.welcomeText;
        if (welcomeMessage) {
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chat-message bot';
            botMessageDiv.textContent = welcomeMessage;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            updateUnreadCounter();
            saveToStorage();
        }
    }

    // FIXED: Proper message handling with better error handling
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

        let messageData;
        if (!firstMessageSent) {
            messageData = {
                action: "loadPreviousSession",
                sessionId: currentSessionId,
                route: config.webhook.route,
                chatInput: trimmed,
                metadata: { userId: "" }
            };
            firstMessageSent = true;
        } else {
            messageData = {
                action: "sendMessage",
                sessionId: currentSessionId,
                route: config.webhook.route,
                chatInput: trimmed,
                metadata: { userId: "" }
            };
        }

        try {
            updateStatusDot(true);
            
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            typingIndicator.remove();
            
            // Debug logging
            console.log('Webhook response:', data);
            console.log('Response type:', typeof data);
            console.log('Is array:', Array.isArray(data));
            
            // IMPROVED: Enhanced response handling for n8n webhooks
            let botResponse = '';
            
            // Function to extract response from various possible structures
            function extractResponse(item) {
                if (typeof item === 'string' && item.trim()) {
                    return item.trim();
                }
                if (typeof item === 'object' && item !== null) {
                    return item.output || 
                           item.text || 
                           item.message || 
                           item.response || 
                           item.reply || 
                           item.content ||
                           item.body?.output ||
                           item.body?.text ||
                           item.body?.message ||
                           '';
                }
                return '';
            }
            
            if (Array.isArray(data)) {
                // Direct array response
                if (data.length > 0) {
                    botResponse = extractResponse(data[0]);
                }
            } else if (typeof data === 'object' && data !== null) {
                // Check if it's a wrapper object with data array
                if (data.data && Array.isArray(data.data)) {
                    if (data.data.length > 0) {
                        botResponse = extractResponse(data.data[0]);
                    }
                } else {
                    // Direct object response
                    botResponse = extractResponse(data);
                }
            } else if (typeof data === 'string') {
                botResponse = data.trim();
            }
            
            // Fallback if no response found
            if (!botResponse || botResponse.trim() === '') {
                console.warn('Empty or invalid response received:', data);
                // For the first message specifically, don't show an error if it's just an empty data array
                // This might be expected behavior for session initialization
                if (!firstMessageSent && data.data && Array.isArray(data.data) && data.data.length === 0) {
                    // Skip creating a bot message for empty initialization response
                    console.log('Skipping empty initialization response');
                    return;
                } else {
                    botResponse = 'Maaf, tidak ada respons dari server.';
                }
            }

            // Only create bot message if there's actual content
            if (botResponse && botResponse.trim()) {
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'chat-message bot';
                botMessageDiv.textContent = botResponse;
                messagesContainer.appendChild(botMessageDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                updateUnreadCounter();
                saveToStorage();
            }
            
        } catch (error) {
            typingIndicator.remove();
            updateStatusDot(false);
            
            // Enhanced error logging
            console.error('Webhook Error Details:', {
                error: error,
                message: error.message,
                stack: error.stack,
                webhookUrl: config.webhook.url,
                messageData: messageData
            });
            
            let errorMessage = 'Maaf, terjadi kesalahan. Silakan coba lagi.';
            
            // Provide more specific error messages based on error type
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'Maaf, tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
            } else if (error.message.includes('JSON')) {
                errorMessage = 'Maaf, respons server tidak valid.';
            } else if (error.message.includes('404')) {
                errorMessage = 'Maaf, layanan tidak ditemukan.';
            } else if (error.message.includes('500')) {
                errorMessage = 'Maaf, terjadi kesalahan di server.';
            }
            
            const errDiv = document.createElement('div');
            errDiv.className = 'chat-message bot';
            errDiv.textContent = errorMessage;
            messagesContainer.appendChild(errDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            saveToStorage();
        }
    }

    function toggleMobileFullscreen() {
        chatContainer.classList.toggle('mobile-fullscreen');
        const toggleBtns = [document.getElementById('fullscreenToggle'), document.getElementById('fullscreenToggleChat')];
        toggleBtns.forEach(btn => {
            if (btn) {
                const icon = btn.querySelector('.material-icons');
                if (icon) {
                    icon.textContent = chatContainer.classList.contains('mobile-fullscreen') ? 'fullscreen_exit' : 'fullscreen';
                }
            }
        });
    }

    function handleKeyboardShortcuts(e) {
        if (e.key === 'Escape' && chatContainer.classList.contains('open')) {
            e.preventDefault();
            chatContainer.classList.remove('open');
        }
    }

    // Event Listeners
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
    
    toggleButton.addEventListener('click', () => {
        chatContainer.classList.toggle('open');
        if (chatContainer.classList.contains('open')) {
            updateUnreadCounter(false);
        }
    });

    const closeButtons = chatContainer.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatContainer.classList.remove('open');
        });
    });

    const fullscreenToggles = [document.getElementById('fullscreenToggle'), document.getElementById('fullscreenToggleChat')];
    fullscreenToggles.forEach(button => {
        if (button) {
            button.addEventListener('click', toggleMobileFullscreen);
        }
    });

    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Initialize widget
    window.addEventListener('DOMContentLoaded', () => {
        loadSavedMessages();
        updateStatusDot(true);
    });

    if (document.readyState === 'loading') {
        // Wait for DOMContentLoaded
    } else {
        loadSavedMessages();
        updateStatusDot(true);
    }

    function checkOnlineStatus() {
        if (!config.webhook.url) return;
        
        fetch(config.webhook.url, {
            method: 'HEAD',
            mode: 'no-cors'
        })
        .then(() => updateStatusDot(true))
        .catch(() => updateStatusDot(false));
    }

    setInterval(checkOnlineStatus, 30000);

    function cleanupOldMessages() {
        try {
            const messages = loadFromStorage();
            if (messages.length > 100) {
                const recentMessages = messages.slice(-100);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(recentMessages));
            }
        } catch (e) {
            console.warn('Could not cleanup messages:', e);
        }
    }

    cleanupOldMessages();

    // Public API
    window.N8NChatWidget = {
        clearHistory: function() {
            try {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(SESSION_KEY);
                messagesContainer.innerHTML = '';
                currentSessionId = '';
                firstMessageSent = false;
                updateUnreadCounter(false);
                
                chatInterface.classList.remove('active');
                chatContainer.querySelectorAll('.brand-header')[0].style.display = 'flex';
                chatContainer.querySelector('.new-conversation').style.display = 'block';
                
                console.log('Chat history cleared');
            } catch (e) {
                console.error('Could not clear history:', e);
            }
        },
        
        toggleChat: function() {
            chatContainer.classList.toggle('open');
            if (chatContainer.classList.contains('open')) {
                updateUnreadCounter(false);
            }
        },
        
        setStatus: function(online) {
            updateStatusDot(online);
        },
        
        getUnreadCount: function() {
            return unreadCount;
        }
    };

})();
