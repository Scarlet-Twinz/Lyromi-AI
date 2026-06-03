const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatWindow = document.getElementById('chat-window');
const welcomeScreen = document.getElementById('welcome-screen');
const voiceBtn = document.getElementById('voice-btn');

// --- VOICE LOGIC ---
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

    const thinking = document.createElement('div');
    thinking.className = 'thinking';
    thinking.innerText = "Lyromi is searching and thinking...";
    chatWindow.appendChild(thinking);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        // --- IMAGE GENERATION ---
        if (text.toLowerCase().match(/(image|picture|draw|photo)/)) {
            const prompt = text.replace(/(image|picture|draw|photo|show me|generate)/gi, "").trim();
            const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
            setTimeout(() => {
                thinking.remove();
                renderMsg(`Generated for Emmanuella:<br><img src="${imgUrl}">`, 'assistant');
                speak("I have generated that image for you.");
            }, 3000);
            return;
        }

        // --- BRAIN CHAT ---
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        thinking.remove();
        
        const finalReply = data.reply || data.error || "Brain Error";
        renderMsg(finalReply, 'assistant');
        speak(finalReply);

    } catch (e) { thinking.innerText = "Connection lost."; }
};

function renderMsg(text, role) {
    const d = document.createElement('div');
    d.className = `message ${role}`;
    d.innerHTML = `<div class="bubble">${text}</div>`;
    chatWindow.appendChild(d);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
