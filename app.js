const chatWindow = document.getElementById('chat-window');
const welcomeScreen = document.getElementById('welcome-screen');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const historyList = document.getElementById('history-list');

// --- PERMANENT MEMORY ---
let allChats = JSON.parse(localStorage.getItem('lyromi_all_chats')) || {};
let currentChatId = Date.now();

function stopEverything() { window.speechSynthesis.cancel(); }

function speak(text) {
    stopEverything();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const female = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google uk english female'));
    if (female) u.voice = female;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
}

// --- SIDEBAR LOGIC ---
function renderSidebar() {
    historyList.innerHTML = "";
    Object.keys(allChats).reverse().forEach(id => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerText = allChats[id][0]?.content.substring(0, 25) + "..." || "New Chat";
        item.onclick = () => loadChat(id);
        historyList.appendChild(item);
    });
}

function loadChat(id) {
    currentChatId = id;
    welcomeScreen.style.display = 'none';
    chatWindow.style.display = 'flex';
    chatWindow.innerHTML = "";
    allChats[id].forEach(msg => renderMsg(msg.content, msg.role));
}

function startNewChat() {
    currentChatId = Date.now();
    chatWindow.innerHTML = "";
    chatWindow.style.display = 'none';
    welcomeScreen.style.display = 'flex';
    stopEverything();
}

// --- INPUT & MEDIA ---
function toggleMediaMenu() {
    const menu = document.getElementById('media-menu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

function handleFileUpload(input) {
    if (input.files[0]) {
        renderMsg("Uploaded file: " + input.files[0].name, 'user');
        toggleMediaMenu();
    }
}

// --- MIC LOGIC ---
const voiceBtn = document.getElementById('voice-btn');
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
voiceBtn.onclick = () => { stopEverything(); recognition.start(); voiceBtn.classList.add('active'); };
recognition.onresult = (e) => { 
    userInput.value = e.results[0][0].transcript; 
    voiceBtn.classList.remove('active'); 
    sendBtn.click(); 
};

// --- FORMATTING (No More Stars) ---
function cleanFormatting(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Change ** to Bold
        .replace(/\*/g, "")                      // Remove loose stars
        .replace(/\n/g, "<br>");                 // Break lines
}

// --- MAIN SEND ---
sendBtn.onclick = async () => {
    const text = userInput.value;
    if (!text.trim()) return;

    stopEverything();
    welcomeScreen.style.display = 'none';
    chatWindow.style.display = 'flex';
    renderMsg(text, 'user');
    userInput.value = "";

    if (!allChats[currentChatId]) allChats[currentChatId] = [];
    allChats[currentChatId].push({ role: "user", content: text });

    const think = document.createElement('div');
    think.className = 'searching';
    think.innerText = "Lyromi is searching current data...";
    chatWindow.appendChild(think);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        // IMAGE CHECK
        if (text.toLowerCase().match(/(image|picture|draw|photo)/)) {
            const prompt = text.replace(/(image|picture|draw|photo|show me|generate)/gi, "").trim();
            const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
            setTimeout(() => {
                think.remove();
                const imgHTML = `<div class="bubble">Generated for Emmanuella:<br><img src="${imgUrl}"></div>`;
                const d = document.createElement('div');
                d.className = 'message assistant';
                d.innerHTML = imgHTML;
                chatWindow.appendChild(d);
                speak("I have generated the image for you.");
            }, 3000);
            return;
        }

        // BRAIN CALL
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: allChats[currentChatId] })
        });
        const data = await res.json();
        think.remove();
        
        const finalReply = cleanFormatting(data.reply);
        renderMsg(finalReply, 'assistant');
        
        allChats[currentChatId].push({ role: "assistant", content: data.reply });
        localStorage.setItem('lyromi_all_chats', JSON.stringify(allChats));
        renderSidebar();
        speak(data.reply);
    } catch (e) { think.innerText = "Error: Connection lost."; }
};

function renderMsg(text, role) {
    const d = document.createElement('div');
    d.className = `message ${role}`;
    d.innerHTML = `<div class="bubble">${text}</div>`;
    chatWindow.appendChild(d);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

renderSidebar();
