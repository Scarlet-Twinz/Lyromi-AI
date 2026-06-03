const voiceBtn = document.getElementById('voice-btn');
const openSidebar = document.getElementById('open-sidebar');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatDisplay = document.getElementById('chat-display');
const welcomeScreen = document.getElementById('welcome-screen');

// 1. MEMORY
let chatHistory = JSON.parse(localStorage.getItem('lyromi_mem')) || [];
if (chatHistory.length > 0) {
    welcomeScreen.style.display = 'none';
    chatDisplay.style.display = 'flex';
    chatHistory.forEach(m => renderMessage(m.text, m.role));
}

// 2. VOICE (STT & TTS)
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
voiceBtn.onclick = () => { recognition.start(); voiceBtn.classList.add('recording-glow'); };
recognition.onresult = (e) => {
    userInput.value = e.results[0][0].transcript;
    voiceBtn.classList.remove('recording-glow');
    sendBtn.click();
};
function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = 1.1;
    window.speechSynthesis.speak(utter);
}

// 3. MAIN LOGIC
sendBtn.onclick = async () => {
    const text = userInput.value;
    if (!text.trim()) return;

    welcomeScreen.style.display = 'none';
    chatDisplay.style.display = 'flex';
    renderMessage(text, 'user');
    userInput.value = "";

    // GLOWING SEARCHING STATE
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message assistant thinking-text';
    thinkingDiv.innerText = "Lyromi is searching...";
    chatDisplay.appendChild(thinkingDiv);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;

    try {
        // IMAGE GENERATION CHECK
        if (text.toLowerCase().includes("generate image") || text.toLowerCase().includes("show me a picture of")) {
            const prompt = text.replace(/generate image|show me a picture of/gi, "").trim();
            const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
            
            setTimeout(() => {
                thinkingDiv.classList.remove('thinking-text');
                thinkingDiv.innerHTML = `<div class="bubble">Here is the image of ${prompt} you asked for:<br><img src="${imgUrl}"></div>`;
                speak(`Here is the image you asked for.`);
            }, 2000);
            return;
        }

        // NORMAL CHAT
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        
        thinkingDiv.classList.remove('thinking-text');
        thinkingDiv.innerHTML = `<div class="bubble">${data.reply}</div>`;
        speak(data.reply);

        chatHistory.push({text, role:'user'}, {text:data.reply, role:'assistant'});
        localStorage.setItem('lyromi_mem', JSON.stringify(chatHistory));
    } catch (e) { thinkingDiv.innerText = "Error connecting."; }
};

function renderMessage(text, role) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

openSidebar.onclick = () => { sidebar.classList.add('open'); overlay.style.display = 'block'; };
document.getElementById('close-sidebar').onclick = () => { sidebar.classList.remove('open'); overlay.style.display = 'none'; };
