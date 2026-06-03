const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatWindow = document.getElementById('chat-window');
const welcomeScreen = document.getElementById('welcome-screen');
const voiceBtn = document.getElementById('voice-btn');

// --- SIDEBAR ---
document.getElementById('open-sidebar').onclick = () => document.getElementById('sidebar').classList.add('open');
document.getElementById('close-sidebar').onclick = () => document.getElementById('sidebar').classList.remove('open');

// --- VOICE (STT & TTS) ---
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
voiceBtn.onclick = () => { recognition.start(); voiceBtn.classList.add('active'); };
recognition.onresult = (e) => {
    userInput.value = e.results[0][0].transcript;
    voiceBtn.classList.remove('active');
    sendBtn.click();
};
function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.1; 
    window.speechSynthesis.speak(u);
}

// --- SEND LOGIC ---
sendBtn.onclick = async () => {
    const text = userInput.value;
    if (!text.trim()) return;

    welcomeScreen.style.display = 'none';
    chatWindow.style.display = 'flex';
    renderMsg(text, 'user');
    userInput.value = "";

    const searching = document.createElement('div');
    searching.className = 'searching';
    searching.innerText = "Lyromi is searching and thinking...";
    chatWindow.appendChild(searching);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        // --- IMAGE LOGIC ---
        if (text.toLowerCase().includes("image") || text.toLowerCase().includes("picture") || text.toLowerCase().includes("draw")) {
            const prompt = text.replace(/image|picture|draw|show me/gi, "").trim();
            const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
            setTimeout(() => {
                searching.remove();
                renderMsg(`Generated for scarlet:<br><img src="${imgUrl}">`, 'assistant');
                speak("I have generated your image.");
            }, 3000);
            return;
        }

        // --- BRAIN LOGIC ---
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        searching.remove();
        renderMsg(data.reply, 'assistant');
        speak(data.reply);
    } catch (e) { searching.innerText = "Connection error."; }
};

function renderMsg(text, role) {
    const d = document.createElement('div');
    d.className = `message ${role}`;
    d.innerHTML = `<div class="bubble">${text}</div>`;
    chatWindow.appendChild(d);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
