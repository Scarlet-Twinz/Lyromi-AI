const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatWindow = document.getElementById('chat-window');
const welcomeScreen = document.getElementById('welcome-screen');
const voiceBtn = document.getElementById('voice-btn');
const stopVoiceBtn = document.getElementById('stop-voice-btn');

// --- NUCLEAR VOICE STOP ---
function stopEverything() {
    window.speechSynthesis.cancel(); // Stops current speech
    let voices = window.speechSynthesis;
    if (voices.speaking) voices.cancel(); // Double-check stop
}

if (stopVoiceBtn) stopVoiceBtn.onclick = stopEverything;

function speak(text) {
    stopEverything(); // Stop old speech before new speech
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const female = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google uk english female'));
    if (female) u.voice = female;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
}

// --- CLEAN FORMATTING (REMOVES STARS) ---
function cleanText(text) {
    return text
        .replace(/\*/g, "")     // Removes all stars
        .replace(/-/g, "•")    // Changes dashes to nice dots
        .replace(/\n/g, "<br>"); // Handles line breaks
}

// --- SEND LOGIC ---
sendBtn.onclick = async () => {
    const text = userInput.value;
    if (!text.trim()) return;

    stopEverything(); // STOP TALKING IMMEDIATELY
    welcomeScreen.style.display = 'none';
    chatWindow.style.display = 'flex';
    
    renderMsg(text, 'user');
    userInput.value = "";

    const think = document.createElement('div');
    think.className = 'searching';
    think.innerText = "Lyromi is searching...";
    chatWindow.appendChild(think);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        think.remove();
        
        const finalReply = data.reply || "Error.";
        renderMsg(cleanText(finalReply), 'assistant');
        speak(finalReply);
    } catch (e) { think.innerText = "Connection lost."; }
};

function renderMsg(text, role) {
    const d = document.createElement('div');
    d.className = `message ${role}`;
    d.innerHTML = `<div class="bubble">${text}</div>`;
    chatWindow.appendChild(d);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
