const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatDisplay = document.getElementById('chat-display');
const welcomeScreen = document.getElementById('welcome-screen');

// 1. MEMORY: Load previous chats
let chatHistory = JSON.parse(localStorage.getItem('lyromi_memory')) || [];

if (chatHistory.length > 0) {
    welcomeScreen.style.display = 'none';
    chatDisplay.style.display = 'flex';
    chatHistory.forEach(msg => renderMessage(msg.text, msg.role));
}

async function fetchBrainResponse(message) {
    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.reply;
}

function renderMessage(text, role) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role);
    msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
    chatDisplay.appendChild(msgDiv);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

sendBtn.addEventListener('click', async () => {
    const text = userInput.value;
    if (!text.trim()) return;

    // Show Chat UI
    welcomeScreen.style.display = 'none';
    chatDisplay.style.display = 'flex';

    // User Message
    renderMessage(text, 'user');
    userInput.value = "";
    
    // Save to Memory
    chatHistory.push({ text, role: 'user' });

    // Assistant Thinking
    const thinkingDiv = document.createElement('div');
    thinkingDiv.classList.add('message', 'assistant');
    thinkingDiv.innerHTML = `<div class="bubble">...</div>`;
    chatDisplay.appendChild(thinkingDiv);

    try {
        const reply = await fetchBrainResponse(text);
        thinkingDiv.querySelector('.bubble').innerText = reply;
        
        // Save to Memory
        chatHistory.push({ text: reply, role: 'assistant' });
        localStorage.setItem('lyromi_memory', JSON.stringify(chatHistory));
    } catch (err) {
        thinkingDiv.querySelector('.bubble').innerText = "Connection lost. Try again!";
    }
});

userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });
