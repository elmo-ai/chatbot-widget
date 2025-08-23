// Chat Widget Script (Enhanced Features)
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
            border: 1px solid rgba(133, 79, 255, 0.2);
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
            gap: 8px;
            border-bottom: 3px solid rgba(133, 79, 255, 0.1);
            position: relative;
        }
        .n8n-chat-widget .brand-header img {
            width: 32px;
            height: 32px;
        }
        .n8n-chat-widget .brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
            flex-grow: 1;
        }
        .n8n-chat-widget .close-button,
        .n8n-chat-widget .fullscreen-button {
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: bold;
            opacity: 0.8;
            margin-left: 8px;
        }
        .n8n-chat-widget .close-button:hover { color: red; opacity: 1; }
        .n8n-chat-widget .fullscreen-button:hover { color: #854fff; opacity: 1; }
        .n8n-chat-widget .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: green;
            margin-right: 8px;
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
        .n8n-chat-widget .new-chat-btn:hover { transform: scale(1.02); }
        .n8n-chat-widget .chat-interface {
            display: none;
            flex-direction: column;
            height: 100%;
        }
        .n8n-chat-widget .chat-interface.active { display: flex; }
        .n8n-chat-widget .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: var(--chat--color-background);
            display: flex;
            flex-direction: column;
        }
        .n8n-chat-widget .chat-message {
            padding: 10px 14px;
            margin: 8px 0;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.25rem;
            animation: msgIn 180ms ease-out both;
        }
        @keyframes msgIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .n8n-chat-widget .chat-message.user {
            background: var(--n8n-chat-user-color, linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%));
            color: white;
            align-self: flex-end;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2);
            border: none;
        }
        .n8n-chat-widget .chat-message.bot {
            background: var(--n8n-chat-bot-color, var(--chat--color-background));
            border: 1px solid rgba(133, 79, 255, 0.2);
            color: var(--chat--color-font);
            align-self: flex-start;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .n8n-chat-widget .chat-input {
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 3px solid rgba(133, 79, 255, 0.1);
            display: flex;
            gap: 8px;
        }
        .n8n-chat-widget .chat-input textarea {
            flex: 1;
            padding: 12px;
            border: 1px solid rgba(133, 79, 255, 0.2);
            border-radius: 8px;
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            resize: none;
            font-family: inherit;
            font-size: 14px;
            max-height: 140px;
            overflow-y: hidden;
        }
        .n8n-chat-widget .chat-input textarea::placeholder { color: var(--chat--color-font); opacity: 0.6; }
        .n8n-chat-widget .chat-input button {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            width: 44px;
            height: 44px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
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
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }
        .n8n-chat-widget .chat-toggle.position-left { right: auto; left: 20px; }
        .n8n-chat-widget .chat-toggle .unread-counter {
            position: absolute;
            top: -4px;
            right: -4px;
            background: red;
            color: white;
            font-size: 12px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        /* Mobile full screen */
        @media (max-width: 480px) {
            .n8n-chat-widget .chat-container.fullscreen { width: 100%; height: 100%; bottom: 0; right: 0; border-radius: 0; }
            .n8n-chat-widget .chat-toggle { bottom: 16px; right: 16px; }
        }
    `;

    // Load font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Prevent multiple inits
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    // Config defaults
    const defaultConfig = {
        webhook: { url: '', route: '' },
        branding: { logo: '', name: '', welcomeText: '', responseTimeText: '' },
        style: { primaryColor: '', secondaryColor: '', position: 'right', backgroundColor: '#fff', fontColor: '#333' }
    };

    const config = window.ChatWidgetConfig ?
        { webhook: {...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook}, branding: {...defaultConfig.branding, ...window.ChatWidgetConfig.branding}, style: {...defaultConfig.style, ...window.ChatWidgetConfig.style} }
        : defaultConfig;

    let currentSessionId = '';
    let isTyping = false;

    // Widget container
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

    // New conversation + interface
    chatContainer.innerHTML = `
        <div class="brand-header">
            <span class="status-dot"></span>
            <span>${config.branding.name}</span>
            <button class="fullscreen-button">⛶</button>
            <button class="close-button">×</button>
        </div>
        <div class="new-conversation">
            <h2 class="welcome-text">${config.branding.welcomeText}</h2>
            <button class="new-chat-btn">Send us a message</button>
            <p class="response-text">${config.branding.responseTimeText}</p>
        </div>
        <div class="chat-interface">
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Type your message here..." rows="1"></textarea>
                <button type="submit">&#10148;</button>
            </div>
        </div>
    `;

    const toggleButton = document.createElement('button');
    toggleButton.className = `chat-toggle${config.style.position === 'left' ? ' position-left' : ''}`;
    toggleButton.innerHTML = `<span>💬</span><div class="unread-counter" style="display:none;">0</div>`;

    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    const newChatBtn = chatContainer.querySelector('.new-chat-btn');
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');
    const closeBtn = chatContainer.querySelector('.close-button');
    const fullscreenBtn = chatContainer.querySelector('.fullscreen-button');
    const statusDot = chatContainer.querySelector('.status-dot');
    const unreadCounterEl = toggleButton.querySelector('.unread-counter');

    // Utility
    function autoResizeTextarea(el){ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,140)+'px'; }
    function generateUUID(){ return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){ const r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8);return v.toString(16);}); }

    function saveMessages() {
        localStorage.setItem('chatMessages', JSON.stringify([...messagesContainer.children].map(c=>({type:c.classList.contains('user')?'user':'bot', text:c.textContent}))));
    }

    function loadMessages() {
        const saved = JSON.parse(localStorage.getItem('chatMessages')||'[]');
        saved.forEach(msg=>{
            const div=document.createElement('div');
            div.className='chat-message '+msg.type;
            div.textContent=msg.text;
            messagesContainer.appendChild(div);
        });
        messagesContainer.scrollTop=messagesContainer.scrollHeight;
    }

    function showTypingIndicator(){
        const indicator=document.createElement('div');
        indicator.className='chat-message bot';
        indicator.textContent='...';
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop=messagesContainer.scrollHeight;
        return indicator;
    }

    async function sendMessage(message){
        const trimmed=message.trim();
        if(!trimmed) return;
        const userDiv=document.createElement('div'); userDiv.className='chat-message user'; userDiv.textContent=trimmed;
        messagesContainer.appendChild(userDiv);
        messagesContainer.scrollTop=messagesContainer.scrollHeight;
        textarea.value=''; autoResizeTextarea(textarea);
        saveMessages();

        const typingIndicator=showTypingIndicator();

        const messageData={ action:'sendMessage', sessionId:currentSessionId||generateUUID(), route:config.webhook.route, chatInput:trimmed, metadata:{userId:''} };
        currentSessionId=messageData.sessionId;

        try {
            const res=await fetch(config.webhook.url,{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(messageData)});
            const data=await res.json();
            typingIndicator.remove();
            const botDiv=document.createElement('div'); botDiv.className='chat-message bot';
            botDiv.textContent=Array.isArray(data)?data[0]?.output:data?.output;
            messagesContainer.appendChild(botDiv);
            messagesContainer.scrollTop=messagesContainer.scrollHeight;
            saveMessages();

            if(!chatContainer.classList.contains('open')){
                const count=parseInt(unreadCounterEl.textContent)||0;
                unreadCounterEl.textContent=count+1; unreadCounterEl.style.display='flex';
            }

        } catch(e){ typingIndicator.remove(); const err=document.createElement('div'); err.className='chat-message bot'; err.textContent='Sorry, something went wrong.'; messagesContainer.appendChild(err); saveMessages(); console.error(e); }
    }

    // Event listeners
    newChatBtn.addEventListener('click', ()=>{
        chatContainer.querySelector('.new-conversation').style.display='none';
        chatInterface.classList.add('active');
        loadMessages();
    });

    sendButton.addEventListener('click', ()=>{ if(textarea.value) sendMessage(textarea.value); });
    textarea.addEventListener('input', ()=>autoResizeTextarea(textarea));
    textarea.addEventListener('keypress', e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); if(textarea.value) sendMessage(textarea.value); } });
    toggleButton.addEventListener('click', ()=>{ chatContainer.classList.toggle('open'); if(chatContainer.classList.contains('open')){ unreadCounterEl.style.display='none'; unreadCounterEl.textContent='0'; } });
    closeBtn.addEventListener('click', ()=>{ chatContainer.classList.remove('open'); });
    fullscreenBtn.addEventListener('click', ()=>{ chatContainer.classList.toggle('fullscreen'); });

    // Keyboard shortcuts
    document.addEventListener('keydown', e=>{
        if(e.key==='Escape'){ chatContainer.classList.remove('open'); }
        if(e.key==='Enter' && !e.shiftKey && document.activeElement===textarea){ e.preventDefault(); if(textarea.value) sendMessage(textarea.value); }
    });

    // Simulate online/offline
    function updateStatus(online){ statusDot.style.backgroundColor = online?'green':'red'; }
    updateStatus(true);

})();
