const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatWindow = document.getElementById('chat-window');
const welcomeScreen = document.getElementById('welcome-screen');
const voiceBtn = document.getElementById('voice-btn');

// --- VOICE STOP & FEMALE LOGIC ---
function stopSpeaking() { window.speechSynthesis.cancel(); }

function speak(text) {
    stopSpeaking();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const female = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google uk english female'));
    if (female) u.voice = female;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
}

// --- MIC ---
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
voiceBtn.onclick = () => { stopSpeaking(); recognition.start(); voiceBtn.classList.add('active'); };
recognition.onresult = (e) => { 
    userInput.value = e.results[0][0].transcript; 
    voiceBtn.classList.remove('active'); 
    sendBtn.click(); 
};

// --- SEND LOGIC ---
sendBtn.onclick = async () => {
    const text = userInput.value;
    if (!text.trim()) return;

    stopSpeaking(); // Stop her talking when a new question is asked
    welcomeScreen.style.display = 'none';
    chatWindow.style.display = 'flex';
    renderMsg(text, 'user');
    userInput.value = "";

    const think = document.createElement('div');
    think.className = 'thinking';
    think.innerText = "Lyromi is searching...";
    chatWindow.appendChild(think);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        // IMAGE GEN
        if (text.toLowerCase().match(/(image|picture|draw|photo)/)) {
            const prompt = text.replace(/(image|picture|draw|photo|show me|generate)/gi, "").trim();
            const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
            setTimeout(() => {
                think.remove();
                renderMsg(`Here is your image, Emmanuella:<br><img src="${imgUrl}">`, 'assistant');
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
        
        renderMsg(data.reply, 'assistant');
        speak(data.reply);
    } catch (e) { think.innerText = "Connection lost."; }
};

function renderMsg(text, role) {
    const d = document.createElement('div');
    d.className = `message ${role}`;
    d.innerHTML = `<div class="bubble">${text}</div>`;
    chatWindow.appendChild(d);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
