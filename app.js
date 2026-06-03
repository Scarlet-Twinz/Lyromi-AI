const chatWindow = document.getElementById('chat-window');
const welcomeScreen = document.getElementById('welcome-screen');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const historyList = document.getElementById('history-list');
const speakingIndicator = document.getElementById('speaking-indicator');

let allChats = JSON.parse(localStorage.getItem('lyromi_all_chats')) || {};
let currentChatId = Date.now();

// --- HUMAN VOICE FILTER ---
function stopEverything() { 
    window.speechSynthesis.cancel(); 
    speakingIndicator.style.display = 'none';
}

function speak(text) {
    stopEverything();
    // THE FILTER: Removes stars, hashtags, and weird symbols so she doesn't say them
    const filteredText = text.replace(/[#*`~]/g, '').replace(/(\r\n|\n|\r)/gm, " ");
    
    const u = new SpeechSynthesisUtterance(filteredText);
    const voices = window.speechSynthesis.getVoices();
    u.voice = voices.find(v => v.name.toLowerCase().includes('female')) || voices[0];
    u.pitch = 1.2;
    u.onstart = () => { speakingIndicator.style.display = 'block'; };
    u.onend = () => { speakingIndicator.style.display = 'none'; };
    window.speechSynthesis.speak(u);
}

// --- BUTTON LOGIC ---
function toggleMediaMenu() {
    const m = document.getElementById('media-menu');
    m.style.display = m.style.display === 'flex' ? 'none' : 'flex';
}

function openCamera() { navigator.mediaDevices.getUserMedia({ video: true }).then(stream => alert("Camera active!")); }
function openVideo() { alert("Video recording initialized."); }

function startNewChat() {
    stopEverything();
    currentChatId = Date.now();
    chatWindow.innerHTML = "";
    chatWindow.style.display = 'none';
    welcomeScreen.style.display = 'flex';
}

function loadChat(id) {
    currentChatId = id;
    welcomeScreen.style.display = 'none';
    chatWindow.style.display = 'flex';
    chatWindow.innerHTML = "";
    allChats[id].forEach(msg => renderMsg(msg.content, msg.role));
}

function renderSidebar() {
    historyList.innerHTML = "";
    Object.keys(allChats).reverse().slice(0, 10).forEach(id => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerText = allChats[id][0]?.content.substring(0, 25) + "...";
        item.onclick = () => loadChat(id);
        historyList.appendChild(item);
    });
}

// --- SEND ---
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
    think.innerText = "Lyromi is thinking...";
    chatWindow.appendChild(think);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: allChats[currentChatId] })
        });
        const data = await res.json();
        think.remove();
        
        const cleanHTML = data.reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
        renderMsg(cleanHTML, 'assistant');
        
        allChats[currentChatId].push({ role: "assistant", content: data.reply });
        localStorage.setItem('lyromi_all_chats', JSON.stringify(allChats));
        renderSidebar();
        speak(data.reply);
    } catch (e) { think.innerText = "Error."; }
};

function renderMsg(text, role) {
    const d = document.createElement('div');
    d.className = `message ${role}`;
    d.innerHTML = `<div class="bubble">${text}</div>`;
    chatWindow.appendChild(d);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

renderSidebar();
