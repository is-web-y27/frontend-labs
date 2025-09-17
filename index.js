document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (!id || id === "#" || id.length === 1) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
});

const form = document.getElementById("subscribeForm");
const statusEl = document.getElementById("formStatus");

if (form && statusEl) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const name = (formData.get("name") || "").toString().trim();
        const email = (formData.get("email") || "").toString().trim();

        if (!name) {
            statusEl.classList.remove("visually-hidden");
            statusEl.textContent = "Пожалуйста, укажите имя.";
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            statusEl.classList.remove("visually-hidden");
            statusEl.textContent = "Похоже, email указан некорректно.";
            return;
        }
        statusEl.classList.remove("visually-hidden");
        statusEl.textContent = "Отправляем...";
        await new Promise((r) => setTimeout(r, 600));
        statusEl.textContent = `Готово! Спасибо, ${name}. Мы написали на ${email}.`;
        form.reset();
    });
}

const runBtn = document.getElementById("runDemo");
const out = document.getElementById("demoOut");
if (runBtn && out) {
    runBtn.addEventListener("click", () => {
        let steps = 0;
        while (Math.random() > 0.1) steps++;
        out.textContent = `Событие случилось на шаге: ${steps}`;
    });
}

const chatFab = document.getElementById("chatFab");
const chatBox = document.getElementById("chatBox");
const chatClose = document.getElementById("chatClose");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatBody = document.querySelector(".chat-body");

function openChat() {
    chatBox.hidden = false;
    chatFab.setAttribute("aria-expanded", "true");
    chatInput.focus();
}
function closeChat() {
    chatBox.hidden = true;
    chatFab.setAttribute("aria-expanded", "false");
}
if (chatFab && chatBox) {
    chatFab.addEventListener("click", () => (chatBox.hidden ? openChat() : closeChat()));
}
if (chatClose) chatClose.addEventListener("click", closeChat);
if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        const p = document.createElement("p");
        p.textContent = "Вы: " + text;
        chatBody.appendChild(p);
        chatInput.value = "";
        setTimeout(() => {
            const r = document.createElement("p");
            r.textContent = "Бот: Спасибо! Мы ответим позже.";
            chatBody.appendChild(r);
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 300);
    });
}