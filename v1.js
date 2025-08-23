(function() {
  const styles = `
    .n8n-chat-widget {
        font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    .n8n-chat-widget .chat-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 380px;
        height: 600px;
        background: var(--chat--color-background, #292929);
        border-radius: 12px;
        display: none;
        flex-direction: column;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        border: 1px solid rgba(0,0,0,0.2);
        z-index: 1000;
        overflow: hidden;
    }
    .n8n-chat-widget .chat-container.open { display:flex; }
    .n8n-chat-widget .brand-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:16px;
        border-bottom: 3px solid rgba(255,255,255,0.1);
        background: var(--chat--color-primary, #854fff);
        color: var(--chat--color-font, #fff);
        position: relative;
    }
    .n8n-chat-widget .brand-header span { font-weight: 600; margin-left:8px; }
    .n8n-chat-widget .status-dot {
        width:10px; height:10px; border-radius:50%; background:#4CAF50;
        display:inline-block;
    }
    .n8n-chat-widget .chat-messages {
        flex:1;
        padding:16px;
        overflow-y:auto;
        background: var(--chat--color-bot, #1F1F1F);
        display:flex;
        flex-direction:column;
        gap:8px;
    }
    .n8n-chat-widget .chat-message.user {
        align-self:flex-end;
        background: var(--chat--color-user, #4CAF50);
        color:#fff;
        padding:10px 14px;
        border-radius:12px;
        max-width:80%;
        word-wrap:break-word;
    }
    .n8n-chat-widget .chat-message.bot {
        align-self:flex-start;
        background: var(--chat--color-bot, #1F1F1F);
        color: var(--chat--color-font, #fff);
        padding:10px 14px;
        border-radius:12px;
        max-width:80%;
        word-wrap:break-word;
    }
    .n8n-chat-widget .typing-indicator {
        display:inline-flex; gap:4px;
        padding:10px;
        background: var(--chat--color-bot, #1F1F1F);
        border-radius:12px;
        align-self:flex-start;
    }
    .n8n-chat-widget .typing-dot {
        width:6px; height:6px; background:#fff; border-radius:50%;
        animation: dotBlink 1.4s infinite;
    }
    .n8n-chat-widget .typing-dot:nth-child(2){animation-delay:0.15s;}
    .n8n-chat-widget .typing-dot:nth-child(3){animation-delay:0.3s;}
    @keyframes dotBlink {0%,80%,100%{opacity:0.4}40%{opacity:1}}
    .n8n-chat-widget .chat-input {
        display:flex;
        border-top:1px solid rgba(255,255,255,0.1);
        padding:8px;
        gap:8px;
    }
    .n8n-chat-widget .chat-input textarea {
        flex:1; padding:10px; border-radius:8px;
        border:none; resize:none; outline:none; font-family:inherit;
        max-height:140px;
        background: var(--chat--color-background, #292929);
        color: var(--chat--color-font, #fff);
    }
    .n8n-chat-widget .chat-input button {
        background: var(--chat--color-primary, #854fff);
        color:#fff; border:none; border-radius:8px; padding:0 16px; cursor:pointer;
    }
    .n8n-chat-widget .chat-toggle {
        position: fixed; bottom:20px; right:20px;
        width:60px; height:60px; border-radius:50%;
        background: var(--chat--color-primary, #854fff); color:#fff;
        border:none; cursor:pointer; font-size:24px; z-index:1000;
        display:flex; align-items:center; justify-content:center;
    }
    @media(max-width:480px){
        .n8n-chat-widget .chat-container { width:100%; height:100%; bottom:0; right:0; border-radius:0; }
    }
  `;

  const fontLink = document.createElement('link');
  fontLink.rel='stylesheet';
  fontLink.href='https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css';
  document.head.appendChild(fontLink);

  const styleEl = document.createElement('style'); styleEl.textContent=styles;
  document.head.appendChild(styleEl);

  const configData = window.ChatWidgetConfig || {};
  if(window.N8NChatWidgetInitialized) return;
  window.N8NChatWidgetInitialized=true;

  let sessionStarted=false;

  // Create container
  const widget=document.createElement('div'); widget.className='n8n-chat-widget';
  const container=document.createElement('div'); container.className='chat-container';
  widget.appendChild(container);

  // Header
  const header=document.createElement('div'); header.className='brand-header';
  header.innerHTML=`
    <div><span class="status-dot"></span><img src="${configData.branding?.logo||''}" style="height:24px;margin-left:8px;"><span>${configData.branding?.name||'Support'}</span></div>
    <button class="close-button">✕</button>
  `;
  container.appendChild(header);

  // Messages
  const messages=document.createElement('div'); messages.className='chat-messages';
  container.appendChild(messages);

  // Input
  const inputWrapper=document.createElement('div'); inputWrapper.className='chat-input';
  const textarea=document.createElement('textarea'); textarea.placeholder='Type your message...';
  const sendBtn=document.createElement('button'); sendBtn.textContent='➤';
  inputWrapper.appendChild(textarea); inputWrapper.appendChild(sendBtn);
  container.appendChild(inputWrapper);

  // Toggle button
  const fab=document.createElement('button'); fab.className='chat-toggle'; fab.textContent='💬';
  document.body.appendChild(widget); document.body.appendChild(fab);

  // Event listeners
  fab.addEventListener('click',()=>{ container.classList.add('open'); fab.style.display='none'; });
  header.querySelector('.close-button').addEventListener('click',()=>{ container.classList.remove('open'); fab.style.display='flex'; });
  sendBtn.addEventListener('click',()=>sendMessage());
  textarea.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMessage(); }});

  function autoResize(el){ el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,140)+'px';}
  textarea.addEventListener('input',()=>autoResize(textarea));

  function addMessage(sender,text){
    const div=document.createElement('div'); div.className='chat-message '+sender; div.textContent=text;
    messages.appendChild(div); messages.scrollTop=messages.scrollHeight;
  }

  function showTyping(){ const div=document.createElement('div'); div.className='typing-indicator'; div.innerHTML='<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>'; messages.appendChild(div); messages.scrollTop=messages.scrollHeight; return div; }

  async function sendMessage(){
    const text=textarea.value.trim(); if(!text) return;
    addMessage('user',text); textarea.value=''; autoResize(textarea);

    if(!sessionStarted){
      sessionStarted=true;
    }

    const typing=showTyping();
    try{
      const response=await fetch(configData.webhook?.url,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'sendMessage',chatInput:text}) });
      const data=await response.json(); typing.remove();
      addMessage('bot',Array.isArray(data)?data[0]?.output:data?.output||'No reply');
    }catch(e){ typing.remove(); addMessage('bot','Sorry, something went wrong.'); console.error(e);}
  }

})();
