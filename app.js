const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatWindow = document.getElementById('chat-window');
const welcomeScreen = document.getElementById('welcome-screen');
const voiceBtn = document.getElementById('voice-btn');

// --- FEMALE VOICE LOGIC ---
function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Logic to pick a female voice from your computer/browser
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Woman') || v.name.includes('Google UK English Female') || v.name.includes('Zira'));
    if (femaleVoice) u.voice = femaleVoice;
    u.pitch = 1.2; // Higher pitch for feminine tone
    u.rate = 1.0;
    window.speechSynthesis.speak(u);
}

// --- VOICE INPUT ---
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
voiceBtn.onclick = () => { recognition.start(); voiceBtn.classList.add('active'); };
recognition.onresult = (e) => { 
    userInput.value = e.results[0][0].transcript; 
    voiceBtn.classList.remove('active'); 
    sendBtn.click(); 
};

// --- MAIN AI LOGIC (FIXED ERROR) ---
sendBtn.onclick = async () => {
    const text = userInput.value;
    if (!text.trim()) return;

    if (welcomeScreen) welcomeScreen.style.display = 'none';
    if (chatWindow) chatWindow.style.display = 'flex';
    
    renderMsg(text, 'user');
    userInput.value = "";

    const think = document.createElement('div');
    think.className = 'thinking';
    think.innerText = "Lyromi is searching...";
    chatWindow.appendChild(think);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        if (text.toLowerCase().match(/(image|picture|draw|photo)/)) {
            const prompt = text.replace(/(image|picture|draw|photo|show me|generate)/gi, "").trim();
            const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
            setTimeout(() => {
                think.remove();
                renderMsg(`Generated for Emmanuella:<br><img src="${imgUrl}" style="width:100%; border-radius:15px; margin-top:10px;">`, 'assistant');
                speak("I have generated that image for you.");
            }, 3000);
            return;
        }

        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        
        const data = await res.json();
        think.remove();
        
        // Error fix: Use data.reply which our api/chat.js now sends
        const finalReply = data.reply || "I'm sorry, I'm having trouble thinking. Try again!";
        renderMsg(finalReply, 'assistant');
        speak(finalReply);

    } catch (e) {
        if (think) think.innerText = "Connection lost.";
    }
};

function renderMsg(text, role) {
    const d = document.createElement('div');
    d.className = `message ${role}`;
    d.innerHTML = `<div class="bubble">${text}</div>`;
    chatWindow.appendChild(d);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
