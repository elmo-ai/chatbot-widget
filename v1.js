(function() {
  const config = window.ChatWidgetConfig || {};
  const container = document.createElement("div");
  container.id = "chat-widget";
  container.style.cssText = `
    position:fixed;bottom:20px;right:20px;width:350px;height:500px;
    background:${config.style?.backgroundColor||"#292929"};color:${config.style?.fontColor||"#fff"};
    display:flex;flex-direction:column;border-radius:12px;overflow:hidden;border:1px solid ${config.style?.primaryColor||"#854fff"};z-index:9999;
  `;

  // Header
  const header = document.createElement("div");
  header.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:10px;background:"+ (config.style?.primaryColor||"#854fff") +";color:#fff;";
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;">
      <span id="status-dot" style="width:10px;height:10px;border-radius:50%;background:#4CAF50;"></span>
      <img src="${config.branding?.logo||''}" style="height:20px;">
      <strong>${config.branding?.name||'Support'}</strong>
    </div>
    <button id="close-widget">✕</button>
  `;
  container.appendChild(header);

  // Messages
  const messages = document.createElement("div");
  messages.style.cssText = "flex:1;overflow-y:auto;padding:10px;background:"+ (config.style?.botMessageColor||"#1F1F1F");
  container.appendChild(messages);

  // Input
  const inputWrapper = document.createElement("div");
  inputWrapper.style.cssText = "display:flex;border-top:1px solid "+(config.style?.primaryColor||"#854fff");
  const input = document.createElement("input");
  input.type = "text"; input.placeholder="Type a message..."; input.style.cssText="flex:1;padding:10px;border:none;outline:none;";
  const sendBtn = document.createElement("button"); sendBtn.textContent="➤"; sendBtn.style.cssText="padding:10px;border:none;background:"+ (config.style?.primaryColor||"#854fff")+";color:#fff;cursor:pointer;";
  inputWrapper.appendChild(input); inputWrapper.appendChild(sendBtn);
  container.appendChild(inputWrapper);

  document.body.appendChild(container);

  // Floating button
  const fab = document.createElement("button");
  fab.textContent = "💬"; fab.style.cssText = `
    position:fixed;bottom:20px;right:20px;background:${config.style?.primaryColor||"#854fff"};
    color:#fff;border:none;padding:15px;border-radius:50%;cursor:pointer;font-size:20px;z-index:9999;
  `;
  document.body.appendChild(fab);

  // Event listeners
  fab.addEventListener("click", ()=>{ container.style.display="flex"; fab.style.display="none"; });
  header.querySelector("#close-widget").addEventListener("click", ()=>{ container.style.display="none"; fab.style.display="block"; });
  sendBtn.addEventListener("click", ()=>{ sendMessage(); });
  input.addEventListener("keydown", e=>{ if(e.key==="Enter") sendMessage(); });

  // Message handler
  function sendMessage() {
    const text = input.value.trim(); if(!text) return;
    addMessage("user", text); input.value="";
    // Fake bot reply
    setTimeout(()=>{ addMessage("bot","Got your message: "+text); }, 800);
  }

  function addMessage(sender,text){
    const msg = document.createElement("div");
    msg.style.cssText = "margin:5px 0;padding:10px;border-radius:8px;max-width:80%;"+(sender==="user"?"background:#4CAF50;color:#fff;margin-left:auto;":"background:"+ (config.style?.botMessageColor||"#1F1F1F")+";color:"+ (config.style?.fontColor||"#fff")+";");
    msg.textContent=text; messages.appendChild(msg); messages.scrollTop=messages.scrollHeight;
  }
})();
