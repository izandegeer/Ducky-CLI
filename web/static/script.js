document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const chatHistory = document.getElementById('chatHistory');
    const contextInput = document.getElementById('contextInput');
    const userMessageInput = document.getElementById('userMessage');
    const sendBtn = document.getElementById('sendBtn');
    const rageBtn = document.getElementById('rageBtn');
    
    // Modal Elements
    const modal = document.getElementById('keyModal');
    const apiKeyBtn = document.getElementById('apiKeyBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveKeyBtn = document.getElementById('saveKeyBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    let chatMessages = []; 

    // --- API KEY LOGIC ---
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
        apiKeyInput.value = savedKey;
        console.log("Key loaded from local storage");
    } else {
        modal.classList.remove('hidden');
    }

    apiKeyBtn.addEventListener('click', () => { modal.classList.remove('hidden'); apiKeyInput.focus(); });
    closeModalBtn.addEventListener('click', () => { modal.classList.add('hidden'); });
    saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('openai_api_key', key);
            modal.classList.add('hidden');
            alert("Key saved! 🦆");
        } else {
            alert("Please enter a valid API Key.");
        }
    });

    // --- STATE & MERMAID LOGIC ---

    function updateDuckState(text) {
        const body = document.body;
        // Reset states
        body.classList.remove('status-alert', 'status-success', 'status-thinking');

        if (text.includes('[STATUS: ALERT]')) {
            body.classList.add('status-alert');
            return text.replace('[STATUS: ALERT]', '').trim();
        }
        if (text.includes('[STATUS: SUCCESS]')) {
            body.classList.add('status-success');
            return text.replace('[STATUS: SUCCESS]', '').trim();
        }
        if (text.includes('[STATUS: THINKING]')) {
            body.classList.add('status-thinking');
            return text.replace('[STATUS: THINKING]', '').trim();
        }
        if (text.includes('[STATUS: LISTENING]')) {
             return text.replace('[STATUS: LISTENING]', '').trim();
        }
        return text;
    }

    function renderMermaid(container) {
        const mermaids = container.querySelectorAll('.mermaid-block');
        mermaids.forEach((block, index) => {
            const graphDefinition = block.textContent;
            const id = `mermaid-${Date.now()}-${index}`;
            const insertDiv = document.createElement('div');
            insertDiv.id = id;
            insertDiv.classList.add('mermaid');
            block.parentNode.replaceChild(insertDiv, block);
            
            mermaid.render(id, graphDefinition).then(({ svg }) => {
                insertDiv.innerHTML = svg;
            });
        });
    }

    function formatMessage(text) {
        let formatted = text.replace(/\n/g, '<br>');
        
        const mermaidRegex = /```mermaid([\s\S]*?)```/g;
        formatted = formatted.replace(mermaidRegex, (match, code) => {
            return `<div class="mermaid-block" style="display:none">${code}</div>`; 
        });

        return formatted;
    }

    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.classList.add('message', role);
        
        const cleanText = role === 'ducky' ? updateDuckState(text) : text;
        div.innerHTML = formatMessage(cleanText);
        
        chatHistory.appendChild(div);
        
        if (role === 'ducky') {
            setTimeout(() => renderMermaid(div), 100);
        }

        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // --- CHAT LOGIC ---

    async function sendMessage() {
        const text = userMessageInput.value.trim();
        const context = contextInput.value.trim();
        const apiKey = localStorage.getItem('openai_api_key');

        if (!text && !context) return;

        // --- SPECIAL COMMAND: HELP ---
        if (text.toLowerCase() === '/ducky:help' || text.toLowerCase() === 'ducky help') {
            appendMessage('ducky', `🦆 **DUCKY SURVIVAL GUIDE** 🦆<br><br>
            **Mission:** Help you think, not copy.<br><br>
            **Commands:**<br>
            - \
/Ducky:help\
: Show this guide.<br>
            - 
😡 Rage Mode
: (Button) Use it when you want to scream at the code.<br><br>
            **How to use me:**<br>
            1. Paste your code in the left panel.<br>
            2. Explain your problem in the chat.<br>
            3. I will ask Socratic questions to guide you.<br>
            4. Ask for flowcharts! ("Draw a diagram of this loop").<br><br>
            *Quack! Success is finding the bug yourself.*`);
            userMessageInput.value = '';
            return;
        }

        if (!apiKey) {
            modal.classList.remove('hidden');
            alert("Quack! I need the API Key to work.");
            return;
        }

        let finalContent = text;
        if (context) {
            finalContent += `

--- CONTEXT/CODE ---
${context}`;
        }

        appendMessage('user', text || "(Sending code...)");
        userMessageInput.value = '';
        chatMessages.push({ role: "user", content: finalContent });

        // Loading
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'ducky');
        loadingDiv.textContent = "Thinking... 🦆";
        loadingDiv.id = "loadingMsg";
        chatHistory.appendChild(loadingDiv);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: chatMessages,
                    apiKey: apiKey
                })
            });

            if (!response.ok) throw new Error("Server Error");

            const data = await response.json();
            document.getElementById('loadingMsg').remove();

            const botReply = data.response;
            appendMessage('ducky', botReply);
            chatMessages.push({ role: "assistant", content: botReply });

        } catch (error) {
            if(document.getElementById('loadingMsg')) document.getElementById('loadingMsg').remove();
            appendMessage('ducky', `⚠️ Error: ${error.message}`);
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    userMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    rageBtn.addEventListener('click', () => {
        document.body.classList.add('status-alert');
        userMessageInput.placeholder = "SCREAM HERE!";
        userMessageInput.focus();
        setTimeout(() => {
            document.body.classList.remove('status-alert');
            userMessageInput.placeholder = "Explain the problem to the duck...";
        }, 5000);
    });
});