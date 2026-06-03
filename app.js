const openSidebar = document.getElementById('open-sidebar');
const closeSidebar = document.getElementById('close-sidebar');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatDisplay = document.getElementById('chat-display');
const welcomeScreen = document.getElementById('welcome-screen');

// 1. SIDEBAR TOGGLE
openSidebar.onclick = () => { sidebar.classList.add('open'); overlay.style.display = 'block'; };
closeSidebar.onclick = () => { sidebar.classList.remove('open'); overlay.style.display = 'none'; };
overlay.onclick = () => { sidebar.classList.remove('open'); overlay.style.display = 'none'; };

// 2. MEMORY LOAD
let chatHistory = JSON.parse(localStorage.getItem('lyromi_history')) || [];
if (chatHistory.length > 0) {
    welcomeScreen.style.display = 'none';
    chatDisplay.style.display = 'flex';
    chatHistory.forEach(msg => renderMessage(msg.text, msg.role));
}

// 3. CHAT FUNCTION
function renderMessage(text, role) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role);
    msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
    chatDisplay.appendChild(msgDiv);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

sendBtn.onclick = async () => {
    const text = userInput.value;
    if (!text.trim()) return;

    welcomeScreen.style.display = 'none';
    chatDisplay.style.display = 'flex';
    renderMessage(text, 'user');
    userInput.value = "";

    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `<div class="bubble">...</div>`;
    chatDisplay.appendChild(loadingDiv);

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        loadingDiv.innerHTML = `<div class="bubble">${data.reply}</div>`;
        
        chatHistory.push({ text, role: 'user' }, { text: data.reply, role: 'assistant' });
        localStorage.setItem('lyromi_history', JSON.stringify(chatHistory));
    } catch (e) { loadingDiv.innerText = "Error!"; }
};
