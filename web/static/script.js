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

    // --- LOGICA DE API KEY ---
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
        apiKeyInput.value = savedKey;
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
            alert("¡Key guardada! 🦆");
        }
    });

    // --- LOGICA DE ESTADOS Y MERMAID ---

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
        // Busca bloques de código mermaid y renderízalos
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
        // Procesar markdown simple y bloques mermaid
        let formatted = text.replace(/\n/g, '<br>');
        
        // Detectar bloques de código mermaid ```mermaid ... ```
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
        
        // Renderizar gráficos si los hay
        if (role === 'ducky') {
            setTimeout(() => renderMermaid(div), 100);
        }

        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // --- LOGICA DE CHAT ---

        async function sendMessage() {

            const text = userMessageInput.value.trim();

            const context = contextInput.value.trim();

            const apiKey = localStorage.getItem('openai_api_key');

    

            if (!text && !context) return;

    

            // --- COMANDO ESPECIAL: HELP ---

            if (text.toLowerCase() === '/ducky:help') {

                appendMessage('ducky', `🦆 **GUÍA DE SUPERVIVENCIA DUCKY** 🦆<br><br>

                **Misión:** Ayudarte a pensar, no a copiar.<br><br>

                **Comandos:**<br>

                - \`/Ducky:help\`: Muestra esta guía.<br>

                - \`😡 Rage Mode\`: (Botón) Úsalo cuando quieras gritarle al código.<br><br>

                **Cómo usarme:**<br>

                1. Pega tu código en el panel de la izquierda.<br>

                2. Explícame tu problema en el chat.<br>

                3. Yo te haré preguntas socráticas para guiarte.<br>

                4. ¡Pídeme diagramas de flujo! ("Hazme un diagrama de este bucle").<br><br>

                *Quack! El éxito es que tú mismo encuentres el error.*`);

                userMessageInput.value = '';

                return;

            }

    

            if (!apiKey) {
            modal.classList.remove('hidden');
            return;
        }

        let finalContent = text;
        if (context) {
            finalContent += `\n\n--- CONTEXTO/CÓDIGO ---\n${context}`;
        }

        appendMessage('user', text || "(Enviando código...)");
        userMessageInput.value = '';
        chatMessages.push({ role: "user", content: finalContent });

        // Loading
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'ducky');
        loadingDiv.textContent = "Pensando... 🦆";
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

            if (!response.ok) throw new Error("Error en servidor");

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
        userMessageInput.placeholder = "¡GRITA AQUÍ!";
        setTimeout(() => {
            document.body.classList.remove('status-alert');
            userMessageInput.placeholder = "Explícale el problema al pato...";
        }, 5000);
    });
});