const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatDisplay = document.getElementById('chat-display');
const welcomeScreen = document.getElementById('welcome-screen');

// This function talks to your "Shield" (the api folder)
async function askLyromi(text) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.reply;
}

// This function adds bubbles to the screen
function addMessage(text, role, id = null) {
    // Hide welcome screen and show chat
    welcomeScreen.style.display = 'none';
    chatDisplay.style.display = 'flex';

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role);
    if (id) msgDiv.id = id;

    const icon = role === 'assistant' ? `<img src="logo.png" class="avatar">` : '';
    
    msgDiv.innerHTML = `
        ${icon}
        <div class="bubble">${text}</div>
    `;

    chatDisplay.appendChild(msgDiv);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// This happens when you click "Send"
sendBtn.addEventListener('click', async () => {
    const text = userInput.value;
    if (text.trim() !== "") {
        addMessage(text, 'user');
        userInput.value = "";
        
        // 1. Show that Lyromi is thinking
        const thinkingId = "think-" + Date.now();
        addMessage("...", 'assistant', thinkingId);

        try {
            // 2. Actually get the answer from the brain
            const reply = await askLyromi(text);
            
            // 3. Replace "..." with the real answer
            document.getElementById(thinkingId).querySelector('.bubble').innerText = reply;
        } catch (err) {
            document.getElementById(thinkingId).querySelector('.bubble').innerText = "I'm sorry Emmanuella, I'm having trouble connecting to my brain.";
        }
    }
});

// Allow "Enter" key
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});
