// Animaciones GSAP
gsap.fromTo("h1", {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 1.5, ease: "power2.out"});

const loginForm = document.getElementById("loginForm");
const chatContainer = document.getElementById("chatContainer");
const inputSection = document.getElementById("inputSection");
const logoutBtn = document.getElementById("logoutBtn");
const errorMsg = document.getElementById("errorMsg");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

const API_BASE = 'http://localhost:3000';

// Función para mostrar mensajes en el chat (procesa Markdown para bot)
function appendMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  if (sender === "bot") {
    msgDiv.innerHTML = marked.parse(text);
  } else {
    msgDiv.textContent = text;
  }
  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Limpia mensajes
function clearMessages() {
  chatContainer.innerHTML = "";
}

// Mostrar UI chat tras login
function showChatUI() {
  loginForm.style.display = "none";
  chatContainer.style.display = "flex";
  inputSection.style.display = "flex";
  logoutBtn.style.display = "inline-block";
  clearMessages();
  chatInput.focus();
}

// Ocultar UI chat (mostrar login)
function showLoginUI() {
  loginForm.style.display = "flex";
  chatContainer.style.display = "none";
  inputSection.style.display = "none";
  logoutBtn.style.display = "none";
  errorMsg.textContent = "";
  usernameInput.value = "";
  passwordInput.value = "";
  clearMessages();
}

// Login
async function login() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    errorMsg.textContent = "Completa ambos campos";
    return;
  }
  errorMsg.textContent = "";

  try {
    const res = await fetch(API_BASE + "/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (data.success) {
      showChatUI();
    } else {
      errorMsg.textContent = data.message || "Error en login";
    }
  } catch {
    errorMsg.textContent = "Error de conexión";
  }
}

loginBtn.addEventListener("click", login);

// Enviar mensaje (botón y Enter)
async function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;

  appendMessage(msg, "user");
  chatInput.value = "";

  try {
    const res = await fetch(API_BASE + "/api/chat", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json();

    if (res.ok && data.reply) {
      appendMessage(data.reply, "bot");
    } else {
      appendMessage("Error al obtener respuesta", "bot");
    }
  } catch {
    appendMessage("Error de conexión con el servidor", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  try {
    await fetch(API_BASE + "/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {}
  showLoginUI();
});

// Inicializar en UI login
showLoginUI();
