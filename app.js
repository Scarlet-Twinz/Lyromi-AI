const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatDisplay = document.getElementById('chat-display');
const welcomeScreen = document.getElementById('welcome-screen');

function addMessage(text, role) {
    // Hide welcome screen on first message
    welcomeScreen.style.display = 'none';
    chatDisplay.style.display = 'flex';

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role);

    const icon = role === 'assistant' ? `<img src="logo.png" class="avatar">` : '';
    
    msgDiv.innerHTML = `
        ${icon}
        <div class="bubble">${text}</div>
    `;

    chatDisplay.appendChild(msgDiv);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

sendBtn.addEventListener('click', () => {
    const text = userInput.value;
    if (text.trim() !== "") {
        addMessage(text, 'user');
        userInput.value = "";
        
        // Simulating the "Thinking" state
        setTimeout(() => {
            addMessage("I am processing your request. Please finish Step 2 so I can actually answer you!", 'assistant');
        }, 1000);
    }
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});