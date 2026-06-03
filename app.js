const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatWindow = document.getElementById('chat-window');
const welcomeScreen = document.getElementById('welcome-screen');
const voiceBtn = document.getElementById('voice-btn');
const historyList = document.getElementById('history-list');

// --- VOICE: INSTANT STOP & FEMALE VOICE ---
function stopSpeaking() { window.speechSynthesis.cancel(); }

function speak(text) {
    stopSpeaking(); // Kill previous speech
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Prioritize female voices
    const female = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google uk english female') || v.name.toLowerCase().includes('zira'));
    if (female) u.voice = female;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
}

// --- MIC LOGIC ---
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
voiceBtn.onclick = () => { stopSpeaking(); recognition.start(); voiceBtn.classList.add('active'); };
recognition.onresult = (e) => { 
    userInput.value = e.results[0][0].transcript; 
    voiceBtn.classList.remove('active'); 
    sendBtn.click(); 
};

// --- CHAT LOGIC ---
function formatText(text) {
    // Basic Markdown: Convert **text** to bold
    return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
}

function createNewChat() { location.reload(); }

sendBtn.onclick = async () => {
    const text = userInput.value;
    if (!text.trim()) return;

    stopSpeaking(); // Stop voice immediately on new request
    welcomeScreen.style.display = 'none';
    chatWindow.style.display = 'flex';
    
    // Add User Message
    renderMsg(text, 'user');
    userInput.value = "";

    // Show Glowing Search State
    const think = document.createElement('div');
    think.className = 'searching';
    think.innerText = "Lyromi is searching and reasoning...";
    chatWindow.appendChild(think);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Add to Sidebar History
    const hItem = document.createElement('div');
    hItem.className = 'history-item';
    hItem.innerText = text;
    historyList.prepend(hItem);

    try {
        // IMAGE GEN INTERCEPTOR
        if (text.toLowerCase().match(/(image|picture|draw|photo)/)) {
            const prompt = text.replace(/(image|picture|draw|photo|show me|generate)/gi, "").trim();
            const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
            setTimeout(() => {
                think.remove();
                renderMsg(`Generated for Emmanuella:<br><img src="${imgUrl}">`, 'assistant');
                speak("I have generated your image.");
            }, 3000);
            return;
        }

        // BRAIN API CALL
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        think.remove();
        
        const finalReply = data.reply || "Brain connection issue.";
        renderMsg(formatText(finalReply), 'assistant');
        speak(finalReply);
    } catch (e) {
        think.innerText = "Connection lost.";
    }
};

function renderMsg(text, role) {
    const d = document.createElement('div');
    d.className = `message ${role}`;
    d.innerHTML = `<div class="bubble">${text}</div>`;
    chatWindow.appendChild(d);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Load voices properly
window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
