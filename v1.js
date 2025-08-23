// Chat Widget Script (Fixed: glow removed, fetch delayed, typing retained)
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
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            font-family: inherit;
        }
        .n8n-chat-widget .chat-container.position-left { right: auto; left: 20px; }
        .n8n-chat-widget .chat-container.open { display: flex; flex-direction: column; }
        .n8n-chat-widget .brand-header { padding: 16px; display: flex; align-items: center; gap: 12px; border-bottom: 3px solid rgba(133, 79, 255, 0.1); position: relative; }
        .n8n-chat-widget .close-button { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--chat--color-font); cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; transition: color 0.2s, opacity 0.2s; font-size: 22px; font-weight: bold; opacity: 0.8; }
        .n8n-chat-widget .close-button:hover { color: red; opacity: 1; }
        .n8n-chat-widget .brand-header img { width: 32px; height: 32px; }
        .n8n-chat-widget .brand-header span { font-size: 18px; font-weight: 500; color: var(--chat--color-font); }
        .n8n-chat-widget .chat-interface { display: none; flex-direction: column; height: 100%; }
        .n8n-chat-widget .chat-interface.active { display: flex; }
        .n8n-chat-widget .chat-messages { flex: 1; overflow-y: auto; padding: 20px; background: var(--chat--color-background); display: flex; flex-direction: column; }
        .n8n-chat-widget .chat-message { padding: 10px 14px; margin: 8px 0; border-radius: 12px; max-width: 80%; word-wrap: break-word; font-size: 14px; line-height: 1.25rem; }
        .n8n-chat-widget .chat-message.user { background: var(--n8n-chat-user-color, linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%)); color: white; align-self: flex-end; box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2); border: none; }
        .n8n-chat-widget .chat-message.bot { background: var(--n8n-chat-bot-color, var(--chat--color-background)); border: 1px solid rgba(133, 79, 255, 0.2); color: var(--chat--color-font); align-self: flex-start; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .n8n-chat-widget .chat-input { padding: 16px; background: var(--chat--color-background); border-top: 3px solid rgba(133, 79, 255, 0.1); display: flex; gap: 8px; }
        .n8n-chat-widget .chat-input textarea { flex: 1; padding: 12px; border: 1px solid rgba(133, 79, 255, 0.2); border-radius: 8px; background: var(--chat--color-background); color: var(--chat--color-font); resize: none; font-family: inherit; font-size: 14px; max-height: 140px; overflow-y: hidden; }
        .n8n-chat-widget .chat-input button { background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%); color: white; border: none; border-radius: 8px; padding: 0 20px; width: 44px; height: 44px; cursor: pointer; transition: transform 0.2s; font-family: inherit; font-weight: 500; display: flex; align-items: center; justify-content: center; }
        .n8n-chat-widget .chat-toggle { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; border-radius: 30px; background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3); z-index: 999; display: flex; align-items: center; justify-content: center; transition: transform 0.3s; }
        .n8n-chat-widget .chat-toggle:hover { transform: scale(1.05); }
        .n8n-chat-widget .typing-indicator { display: inline-flex; align-items: center; gap: 4px; padding: 12px 16px; background: var(--chat--color-background); border: 1px solid rgba(133, 79, 255, 0.2); border-radius: 12px; align-self: flex-start; margin: 8px 0; }
        .n8n-chat-widget .typing-dot { width: 6px; height: 6px; background-color: var(--chat--color-font); border-radius: 50%; opacity: 0.4; animation: dotBlink 1.4s infinite; }
        .n8n-chat-widget .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .n8n-chat-widget .typing-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes dotBlink { 0%,80%,100% { opacity:0.4; } 40% { opacity:1; } }
    `;

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
    document.head.appendChild(fontLink);

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    const defaultConfig = { webhook:{url:'',route:''},branding:{logo:'',name:'',welcomeText:'',responseTimeText:''},style:{primaryColor:'',secondaryColor:'',position:'right',backgroundColor:'#ffffff',fontColor:'#333333'} };
    const config = window.ChatWidgetConfig ? { webhook:{...defaultConfig.webhook,...window.ChatWidgetConfig.webhook}, branding:{...defaultConfig.branding,...window.ChatWidgetConfig.branding}, style:{...defaultConfig.style,...window.ChatWidgetConfig.style} } : defaultConfig;

    if(window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    let currentSessionId = '';
    let sessionStarted = false;

    const widgetContainer = document.createElement('div'); widgetContainer.className='n8n-chat-widget';
    widgetContainer.style.setProperty('--n8n-chat-primary-color', config.style.primaryColor);
    widgetContainer.style.setProperty('--n8n-chat-secondary-color', config.style.secondaryColor);
    widgetContainer.style.setProperty('--n8n-chat-background-color', config.style.backgroundColor);
    widgetContainer.style.setProperty('--n8n-chat-font-color', config.style.fontColor);
    if(config.style.botMessageColor) widgetContainer.style.setProperty('--n8n-chat-bot-color', config.style.botMessageColor);
    if(config.style.userMessageColor) widgetContainer.style.setProperty('--n8n-chat-user-color', config.style.userMessageColor);

    const chatContainer = document.createElement('div');
    chatContainer.className=`chat-container${config.style.position==='left'?' position-left':''}`;

    const newConversationHTML=`
        <div class="brand-header">
            <img src="${config.branding.logo}" alt="${config.branding.name}">
            <span>${config.branding.name}</span>
            <button class="close-button">×</button>
        </div>
        <div class="new-conversation">
            <h2 class="welcome-text">${config.branding.welcomeText}</h2>
            <button class="new-chat-btn">Send us a message</button>
            <p class="response-text">${config.branding.responseTimeText}</p>
        </div>
    `;

    const chatInterfaceHTML=`
        <div class="chat-interface">
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <span>${config.branding.name}</span>
                <button class="close-button">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Type your message here..." rows="1"></textarea>
                <button type="submit" class="send-btn">Send</button>
            </div>
        </div>
    `;

    chatContainer.innerHTML=newConversationHTML+chatInterfaceHTML;

    const toggleButton=document.createElement('button');
    toggleButton.className=`chat-toggle${config.style.position==='left'?' position-left':''}`;
    toggleButton.innerHTML='Chat';
    
    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    const newChatBtn=chatContainer.querySelector('.new-chat-btn');
    const chatInterface=chatContainer.querySelector('.chat-interface');
    const messagesContainer=chatContainer.querySelector('.chat-messages');
    const textarea=chatContainer.querySelector('textarea');
    const sendButton=chatContainer.querySelector('button[type="submit"]');

    function autoResizeTextarea(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,140)+'px';}
    function generateUUID(){return crypto?.randomUUID?.() ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){const r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8);return v.toString(16);});}
    function showTypingIndicator(){const indicator=document.createElement('div');indicator.className='typing-indicator';indicator.innerHTML='<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';messagesContainer.appendChild(indicator);messagesContainer.scrollTop=messagesContainer.scrollHeight;return indicator;}

    async function startNewConversation() {
        currentSessionId = generateUUID();
        sessionStarted = true;
        chatContainer.querySelectorAll('.brand-header')[0].style.display='none';
        chatContainer.querySelector('.new-conversation').style.display='none';
        chatInterface.classList.add('active');

        if(config.branding.welcomeText){
            const botMessageDiv=document.createElement('div');
            botMessageDiv.className='chat-message bot';
            botMessageDiv.textContent=config.branding.welcomeText;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop=messagesContainer.scrollHeight;
        }
    }

    async function sendMessage(message){
        const trimmed=message.trim();
        if(!trimmed) return;
        const userMessageDiv=document.createElement('div');
        userMessageDiv.className='chat-message user';
        userMessageDiv.textContent=trimmed;
        messagesContainer.appendChild(userMessageDiv);
        messagesContainer.scrollTop=messagesContainer.scrollHeight;
        textarea.value=''; autoResizeTextarea(textarea);
        const typingIndicator=showTypingIndicator();

        if(!sessionStarted) { startNewConversation(); }

        const messageData={action:"sendMessage",sessionId:currentSessionId,route:config.webhook.route,chatInput:trimmed,metadata:{userId:""}};
        try{
            const response=await fetch(config.webhook.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(messageData)});
            const data=await response.json();
            typingIndicator.remove();
            const botMessageDiv=document.createElement('div');
            botMessageDiv.className='chat-message bot';
            botMessageDiv.textContent=Array.isArray(data)?data[0]?.output:data?.output;
            messagesContainer.appendChild(botMessageDiv);
            messagesContainer.scrollTop=messagesContainer.scrollHeight;
        }catch(error){
            typingIndicator.remove();
            const errDiv=document.createElement('div');
            errDiv.className='chat-message bot';
            errDiv.textContent='Sorry, something went wrong.';
            messagesContainer.appendChild(errDiv);
            console.error('Error:',error);
        }
    }

    newChatBtn.addEventListener('click',()=>{startNewConversation();textarea.focus();});
    sendButton.addEventListener('click',()=>{const message=textarea.value;if(message)sendMessage(message);});
    textarea.addEventListener('input',()=>autoResizeTextarea(textarea));
    textarea.addEventListener('keypress',(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();const message=textarea.value;if(message)sendMessage(message);}});

    toggleButton.addEventListener('click',()=>{chatContainer.classList.toggle('open');});
    const closeButtons=chatContainer.querySelectorAll('.close-button');
    closeButtons.forEach(button=>{button.addEventListener('click',()=>{chatContainer.classList.remove('open');});});
})();
