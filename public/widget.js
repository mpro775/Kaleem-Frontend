// src/public/widget.js
/**
 * widget.js - Musaibot Web Chat Widget
 * Loaded via <script src="https://chat.yoursaas.com/widget.js"></script>
 * Expects prior:
 * window.MusaidChat = { merchantId, apiBaseUrl, mode? }
 */
(async function () {
  const cfg = window.MusaidChat || {};
  const { merchantId, apiBaseUrl } = cfg;
  let mode = cfg.mode;

  if (!merchantId || !apiBaseUrl) {
    console.error("MusaidChat: missing merchantId or apiBaseUrl");
    return;
  }
  const headers = {};
  if (window.MusaidChat?.token) {
    headers["Authorization"] = "Bearer " + window.MusaidChat.token;
  }
  // Fetch embedMode if not provided
  if (!mode) {
    try {
      const res = await fetch(
        `${apiBaseUrl}/merchants/${merchantId}/embed-settings`,
        { headers }
      );
      const js = await res.json();
      mode = js.embedMode;
    } catch (err) {
      console.warn(
        "MusaidChat: failed to fetch embedMode, defaulting to bubble",
        err
      );
      mode = "bubble";
    }
  }

  // Fetch widget settings
  let settings;
  try {
    const res = await fetch(
      `${apiBaseUrl}/merchants/${merchantId}/widget-settings`,
      { headers }
    );
    settings = await res.json();
  } catch (err) {
    console.error("MusaidChat: failed to fetch settings", err);
    return;
  }

  const root = document.documentElement;
  const vars = {
    "brand-color": settings.brandColor,
    "font-family": settings.fontFamily,
    "header-bg": settings.headerBgColor,
    "body-bg": settings.bodyBgColor,
    "text-color": settings.theme === "default" ? "#000" : "#fff",
  };
  Object.entries(vars).forEach(([k, v]) =>
    root.style.setProperty(`--musaid-${k}`, v)
  );

  // Iframe mode
  if (mode === "iframe") {
    const iframe = document.createElement("iframe");
    iframe.src = `${apiBaseUrl.replace(/\/api$/, "")}/chat/${settings.slug}`;
    iframe.style.cssText =
      "position:fixed;bottom:0;right:0;width:350px;height:500px;border:none;z-index:9999;";
    document.body.appendChild(iframe);
    return;
  }

  // Build common CSS
  const style = document.createElement("style");
  style.innerHTML = `
    .musaid-btn{position:fixed;bottom:24px;right:24px;background:var(--musaid-brand-color);border:none;border-radius:50%;width:56px;height:56px;color:#fff;font-size:24px;cursor:pointer;z-index:9999;}
    .musaid-chat{position:fixed;bottom:90px;right:24px;width:320px;max-height:450px;background:var(--musaid-body-bg);border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;flex-direction:column;overflow:hidden;z-index:9999;font-family:var(--musaid-font-family);color:var(--musaid-text-color);}
    .musaid-header{background:var(--musaid-header-bg);color:var(--musaid-text-color);padding:12px;font-weight:bold;position:relative;}
    .musaid-messages{flex:1;padding:8px;overflow-y:auto;}
    .musaid-input{display:flex;border-top:1px solid #ddd;}
    .musaid-input input{flex:1;border:none;padding:8px;font-size:14px;}
    .musaid-input button{background:var(--musaid-brand-color);border:none;padding:0 16px;color:#fff;cursor:pointer;}
    .musaid-msg{margin-bottom:12px;font-size:14px;max-width:80%;word-wrap:break-word;}
    .musaid-msg.bot{align-self:flex-start;background:#f1f0f0;padding:8px;border-radius:8px;}
    .musaid-msg.user{align-self:flex-end;background:var(--musaid-brand-color);color:#fff;padding:8px;border-radius:8px;}
    .musaid-buttons{margin-top:4px;display:flex;flex-wrap:wrap;gap:4px;}
    .musaid-button{background:var(--musaid-brand-color);border:none;color:#fff;padding:6px 10px;border-radius:4px;cursor:pointer;font-size:13px;}
  `;
  document.head.appendChild(style);

  // Create DOM
  const btn = document.createElement("button");
  btn.className = "musaid-btn";
  btn.innerText = "💬";
  document.body.appendChild(btn);

  const chat = document.createElement("div");
  chat.className = "kaleem-chat";
  chat.style.display = "none";
  chat.innerHTML = `
    <div class="kaleem-header">${settings.welcomeMessage}</div>
    <div class="kaleem-messages"></div>
    <div class="kaleem-input">
      <input type="text" placeholder="اكتب رسالة..." />
      <button>إرسال</button>
    </div>
  `;
  document.body.appendChild(chat);

  // Handoff button
  if (settings.handoffEnabled) {
    const handoffBtn = document.createElement("button");
    handoffBtn.innerText = "🚀 انسان";
    handoffBtn.style.cssText =
      "position:absolute;top:12px;right:12px;background:var(--musaid-brand-color);color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;z-index:10000;";
    chat.querySelector(".musaid-header").appendChild(handoffBtn);
    handoffBtn.addEventListener("click", async () => {
      await fetch(
        `${apiBaseUrl}/merchants/${merchantId}/widget-settings/${merchantId}/handoff`,
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        }
      );
      alert("تم إرسال طلب تحويل إلى إنسان");
    });
  }

  const messagesEl = chat.querySelector(".kaleem-messages");
  const inputEl = chat.querySelector(".kaleem-input input");
  const sendBtn = chat.querySelector(".kaleem-input button");

  // sessionId
  let sessionId = localStorage.getItem(`kaleem_session_${merchantId}`);
  if (!sessionId) {
    sessionId = Date.now().toString();
    localStorage.setItem(`kaleem_session_${merchantId}`, sessionId);
  }

  function renderMessage({ text, metadata }, role) {
    const container = document.createElement("div");
    container.className = `kaleem-msg ${role}`;
    if (text) {
      const p = document.createElement("div");
      p.innerText = text;
      container.appendChild(p);
    }
    if (metadata?.imageUrl) {
      const img = document.createElement("img");
      img.src = metadata.imageUrl;
      container.appendChild(img);
    }
    if (Array.isArray(metadata?.buttons)) {
      const btns = document.createElement("div");
      btns.className = "kaleem-buttons";
      metadata.buttons.forEach((b) => {
        const bEl = document.createElement("button");
        bEl.className = "kaleem-button";
        bEl.innerText = b.title;
        bEl.addEventListener("click", () => sendMessage(b.payload));
        btns.appendChild(bEl);
      });
      container.appendChild(btns);
    }
    messagesEl.appendChild(container);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function loadHistory() {
    try {
      const res = await fetch(`${apiBaseUrl}/messages/session/${sessionId}`, {
        headers,
      });
      if (res.status === 204) {
        // لا يوجد محتوى، لا تحاول عمل json()
        messagesEl.innerHTML = "";
        return;
      }
      if (!res.ok) {
        // لو الرد ليس ok، تجاهل
        messagesEl.innerHTML = "";
        return;
      }
      // حتى لو الرد ok تأكد أن فيه body
      const text = await res.text();
      if (!text) {
        messagesEl.innerHTML = "";
        return;
      }
      const session = JSON.parse(text);
      messagesEl.innerHTML = "";
      if (session && Array.isArray(session.messages)) {
        session.messages.forEach((m) =>
          renderMessage(
            { text: m.text, metadata: m.metadata },
            m.role === "bot" ? "bot" : "user"
          )
        );
      }
    } catch (err) {
      console.error("Error loading history", err);
    }
  }

  async function sendMessage(text) {
    renderMessage({ text }, "user");
    try {
      await fetch(`${apiBaseUrl}/merchants/${merchantId}/widget/webhook`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, messageText: text }),
      });
    } catch (err) {
      console.error("Error sending message", err);
    }
  }

  btn.addEventListener("click", () => {
    const open = chat.style.display === "flex";
    chat.style.display = open ? "none" : "flex";
    if (!open) loadHistory();
  });
  sendBtn.addEventListener("click", () => {
    const t = inputEl.value.trim();
    if (t) {
      sendMessage(t);
      inputEl.value = "";
    }
  });
  inputEl.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });

  setInterval(() => {
    if (chat.style.display === "flex") loadHistory();
  }, 2000);
})();
