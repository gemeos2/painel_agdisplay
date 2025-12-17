import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
    // Initialize messages from LocalStorage or default
    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem('chat_history');
        return savedMessages ? JSON.parse(savedMessages) : [
            { id: 1, text: "Olá! Eu sou seu assistente virtual de nutrição. Como posso te ajudar hoje?", sender: 'ai' }
        ];
    });

    const [isTyping, setIsTyping] = useState(false);

    // Persist messages whenever they change
    useEffect(() => {
        localStorage.setItem('chat_history', JSON.stringify(messages));
    }, [messages]);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMessage = { id: Date.now(), text: text, sender: 'user' };
        const updatedHistory = [...messages, userMessage];

        setMessages(updatedHistory);
        setIsTyping(true);

        try {
            const response = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text, history: updatedHistory }),
            });

            if (!response.ok) throw new Error('Falha na comunicação com a IA');

            const contentType = response.headers.get("content-type");
            let aiText = "";

            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                console.log("n8n response:", data);

                aiText = data.output || data.text || data.message;

                if (!aiText) {
                    if (Array.isArray(data) && data.length > 0) {
                        aiText = data[0].output || data[0].text || data[0].message || JSON.stringify(data);
                    } else {
                        aiText = "⚠️ Retorno desconhecido (JSON): " + JSON.stringify(data);
                    }
                }
            } else {
                aiText = await response.text();
            }

            if (aiText === "Workflow was started") {
                aiText = "⚠️ Configuração necessária no n8n: Altere o nó Webhook para 'Respond to Webhook' (ou Response Mode: Last Node).";
            }

            const aiMessage = { id: Date.now() + 1, text: aiText, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Erro no chat:", error);
            const errorMessage = { id: Date.now() + 1, text: `Erro: ${error.message}`, sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const clearHistory = () => {
        const initialMessage = [{ id: 1, text: "Olá! Conversa reiniciada. Como posso ajudar?", sender: 'ai' }];
        setMessages(initialMessage);
        localStorage.setItem('chat_history', JSON.stringify(initialMessage));
    };

    return (
        <ChatContext.Provider value={{ messages, isTyping, sendMessage, clearHistory }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
}
