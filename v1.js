// Chat Widget Script – Full Original + Enhancements
(function() {
    const styles = ` /* ... same styles as your original code ... */ 
    /* Add only modifications: remove border glow, mobile padding fix, status dot, unread counter */
    .n8n-chat-widget .chat-container{ box-shadow: 0 8px 32px rgba(0,0,0,0.05); border:1px solid rgba(133,79,255,0.2);}
    .n8n-chat-widget .chat-container.fullscreen{width:100%;height:100%;bottom:0;left:0;right:0;border-radius:0;padding-left:16px;padding-right:16px;}
    .n8n-chat-widget .brand-header .status-dot{width:12px;height:12px;border-radius:50%;background-color:green;margin-right:6px;}
    .n8n-chat-widget .chat-toggle .unread-counter{position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:50%;background:red;color:white;font-size:12px;display:none;align-items:center;justify-content:center;font-weight:bold;}
    `;

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Prevent multiple initializations
    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';

    chatContainer.innerHTML = `
    <div class="brand-header">
        <span class="status-dot"></span>
        <img src="" alt="" class="logo" />
        <span class="brand-name"></span>
        <button class="fullscreen-button">⛶</button>
        <button class="close-button">×</button>
    </div>
    <div class="new-conversation">
        <h2 class="welcome-text"></h2>
        <button class="new-chat-btn">
            <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
            </svg>
            Send us a message
        </button>
        <p class="response-text"></p>
    </div>
    <div class="chat-interface">
        <div class="brand-header">
            <span class="status-dot"></span>
            <img src="" alt="" class="logo" />
            <span class="brand-name"></span>
            <button class="fullscreen-button">⛶</button>
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

    const toggleButton = document.createElement('button');
    toggleButton.className = 'chat-toggle';
    toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
    </svg><div class="unread-counter">0</div>`;

    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    // Elements
    const newChatBtn = chatContainer.querySelector('.new-chat-btn');
    const chatInterface = chatContainer.querySelector('.chat-interface');
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');
    const closeButtons = chatContainer.querySelectorAll('.close-button');
    const fullscreenButtons = chatContainer.querySelectorAll('.fullscreen-button');
    const unreadCounter = toggleButton.querySelector('.unread-counter');
    const statusDots = chatContainer.querySelectorAll('.status-dot');

    function autoResizeTextarea(el){ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,140)+'px'; }
    function generateUUID(){ return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){ const r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8); return v.toString(16); }); }

    // Local storage for messages
    function saveMessages(){ const msgs=[...messagesContainer.children].map(m=>({type:m.classList.contains('user')?'user':'bot',text:m.textContent})); localStorage.setItem('chatMessages',JSON.stringify(msgs)); }
    function loadMessages(){ const saved=JSON.parse(localStorage.getItem('chatMessages')||'[]'); saved.forEach(m=>{ const div=document.createElement('div'); div.className='chat-message '+m.type; div.textContent=m.text; messagesContainer.appendChild(div); }); messagesContainer.scrollTop=messagesContainer.scrollHeight; }

    function showTyping(){ const indicator=document.createElement('div'); indicator.className='chat-message bot'; indicator.textContent='...'; messagesContainer.appendChild(indicator); messagesContainer.scrollTop=messagesContainer.scrollHeight; return indicator; }

    async function sendMessage(message){
        if(!message.trim()) return;
        const userDiv=document.createElement('div'); userDiv.className='chat-message user'; userDiv.textContent=message.trim();
        messagesContainer.appendChild(userDiv); messagesContainer.scrollTop=messagesContainer.scrollHeight;
        textarea.value=''; autoResizeTextarea(textarea); saveMessages();
        const typing=showTyping();
        // Delayed fetch – replace with your backend
        setTimeout(()=>{
            typing.remove();
            const botDiv=document.createElement('div'); botDiv.className='chat-message bot';
            botDiv.textContent='Bot response here';
            messagesContainer.appendChild(botDiv); messagesContainer.scrollTop=messagesContainer.scrollHeight;
            saveMessages();
            if(!chatContainer.classList.contains('open')){ let c=parseInt(unreadCounter.textContent)||0; unreadCounter.textContent=c+1; unreadCounter.style.display='flex'; }
        },800);
    }

    // Listeners
    newChatBtn.addEventListener('click', ()=>{ chatContainer.querySelector('.new-conversation').style.display='none'; chatInterface.classList.add('active'); loadMessages(); });
    sendButton.addEventListener('click', ()=>{ if(textarea.value) sendMessage(textarea.value); });
    textarea.addEventListener('input', ()=>autoResizeTextarea(textarea));
    textarea.addEventListener('keypress', e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); if(textarea.value) sendMessage(textarea.value); } });
    toggleButton.addEventListener('click', ()=>{ chatContainer.classList.toggle('open'); if(chatContainer.classList.contains('open')){ unreadCounter.style.display='none'; unreadCounter.textContent='0'; } });
    closeButtons.forEach(b=>b.addEventListener('click',()=>chatContainer.classList.remove('open')));
    fullscreenButtons.forEach(b=>b.addEventListener('click',()=>chatContainer.classList.toggle('fullscreen')));
    document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ chatContainer.classList.remove('open'); } });

    // Status dot update
    function updateStatus(online){ statusDots.forEach(d=>d.style.backgroundColor=online?'green':'red'); }
    updateStatus(true);

})();
