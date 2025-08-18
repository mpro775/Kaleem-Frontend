/**
 * widget.js - Musaibot Web Chat Widget (Enhanced)
 * Loaded via <script src="https://cdn.yourdomain.com/widget.js"></script>
 * Requires window.MusaidBotSettings = { merchantId, webhooksUrl, websocketUrl, themeColor, greeting }
 */
(function() {
  const cfg = window.MusaidBotSettings || {};
  const { merchantId, webhooksUrl, websocketUrl, themeColor = '#D84315', greeting = 'مرحباً! كيف أستطيع مساعدتك اليوم؟' } = cfg;
  if (!merchantId || !webhooksUrl || !websocketUrl) {
    console.error('MusaidBotSettings missing required fields');
    return;
  }

  // Styles
  const style = document.createElement('style');
  style.innerHTML = `
    .musaid-btn { position: fixed; bottom: 24px; right: 24px; background: ${themeColor}; border: none; border-radius: 50%; width: 56px; height: 56px; color: #fff; font-size: 24px; cursor: pointer; z-index: 9999; }
    .musaid-chat { position: fixed; bottom: 90px; right: 24px; width: 320px; max-height: 450px; background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; z-index: 9999; }
    .musaid-header { background: ${themeColor}; color: #fff; padding: 12px; font-weight: bold; }
    .musaid-messages { flex: 1; padding: 8px; overflow-y: auto; }
    .musaid-input { display: flex; border-top: 1px solid #ddd; }
    .musaid-input input { flex: 1; border: none; padding: 8px; font-size: 14px; }
    .musaid-input button { background: ${themeColor}; border: none; padding: 0 16px; color: #fff; cursor: pointer; }
    .musaid-msg { margin-bottom: 12px; font-size: 14px; max-width: 80%; word-wrap: break-word; }
    .musaid-msg.bot { align-self: flex-start; background: #f1f0f0; padding: 8px; border-radius: 8px; }
    .musaid-msg.user { align-self: flex-end; background: ${themeColor}; color: #fff; padding: 8px; border-radius: 8px; }
    .musaid-msg img { max-width: 100%; border-radius: 4px; }
    .musaid-buttons { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px; }
    .musaid-button { background: ${themeColor}; border: none; color: #fff; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; }
  `;
  document.head.appendChild(style);

  // Elements
  const btn = document.createElement('button');
  btn.className = 'musaid-btn';
  btn.innerText = '💬';
  document.body.appendChild(btn);

  const chat = document.createElement('div');
  chat.className = 'musaid-chat';
  chat.style.display = 'none';
  chat.innerHTML = `
    <div class="musaid-header">${greeting}</div>
    <div class="musaid-messages"></div>
    <div class="musaid-input">
      <input type="text" placeholder="اكتب رسالة..." />
      <button>إرسال</button>
    </div>
  `;
  document.body.appendChild(chat);

  const messagesEl = chat.querySelector('.musaid-messages');
  const inputEl = chat.querySelector('.musaid-input input');
  const sendBtn = chat.querySelector('.musaid-input button');

  let sessionId = localStorage.getItem(`kaleem_session_${merchantId}`) || null;
  if (!sessionId) {
    sessionId = Date.now().toString();
    localStorage.setItem(`kaleem_session_${merchantId}`, sessionId);
  }

  // Toggle chat
  btn.addEventListener('click', () => {
    const visible = chat.style.display === 'flex';
    chat.style.display = visible ? 'none' : 'flex';
    if (!visible) loadHistory();
  });

  // WebSocket
  let socket;
  function connectSocket() {
    socket = new WebSocket(`${websocketUrl}?merchantId=${merchantId}&sessionId=${sessionId}`);
    socket.onmessage = e => {
      const data = JSON.parse(e.data);
      renderMessage(data, 'bot');
    };
    socket.onclose = () => setTimeout(connectSocket, 3000);
  }
  connectSocket();

  // Render message supporting multimedia & buttons
  function renderMessage({ text, metadata }, role) {
    const container = document.createElement('div');
    container.className = `musaid-msg ${role}`;

    // Text
    if (text) {
      const p = document.createElement('div');
      p.innerText = text;
      container.appendChild(p);
    }

    // Image
    if (metadata?.imageUrl) {
      const img = document.createElement('img');
      img.src = metadata.imageUrl;
      container.appendChild(img);
    }

    // Buttons
    if (Array.isArray(metadata?.buttons)) {
      const btns = document.createElement('div');
      btns.className = 'musaid-buttons';
      metadata.buttons.forEach(b => {
        const bEl = document.createElement('button');
        bEl.className = 'musaid-button';
        bEl.innerText = b.title;
        bEl.addEventListener('click', () => sendQuickReply(b.payload));
        btns.appendChild(bEl);
      });
      container.appendChild(btns);
    }

    messagesEl.appendChild(container);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Load history
  async function loadHistory() {
    const res = await fetch(`${webhooksUrl}/messages/session/${sessionId}`);
    if (res.ok) {
      const session = await res.json();
      messagesEl.innerHTML = '';
      session.messages.forEach(m => renderMessage({ text: m.text, metadata: m.metadata }, m.role === 'bot' ? 'bot' : 'user'));
    }
  }

  // Send message
  async function sendMessage(text) {
    renderMessage({ text }, 'user');
    await fetch(`${webhooksUrl}/incoming/${merchantId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: sessionId, messageText: text, metadata: {} })
    });
  }

  function sendQuickReply(payload) {
    sendMessage(payload);
  }

  // Handlers
  sendBtn.addEventListener('click', () => {
    const t = inputEl.value.trim();
    if (t) { sendMessage(t); inputEl.value = ''; }
  });
  inputEl.addEventListener('keypress', e => { if (e.key === 'Enter') { sendBtn.click(); } });
})();
