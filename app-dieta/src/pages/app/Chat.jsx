import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useChat } from '../../contexts/ChatContext'

export default function Chat() {
    const { messages, isTyping, sendMessage, clearHistory } = useChat()
    const [input, setInput] = useState('')
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const messageToSend = input
        setInput('')
        await sendMessage(messageToSend)
    }

    return (
        <div className="flex flex-col min-h-full">
            <header className="bg-card shadow-sm p-4 border-b border-border sticky top-0 z-10 flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Bot className="text-primary" />
                    Chat Nutri IA
                </h1>
                <button
                    onClick={clearHistory}
                    className="text-muted-foreground hover:text-destructive transition-colors p-2"
                    title="Limpar conversa"
                >
                    <Trash2 size={20} />
                </button>
            </header>

            <div className="flex-1 p-4 space-y-4 pb-32">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-full",
                            msg.sender === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={cn(
                                "max-w-[80%] p-3 rounded-2xl shadow-sm text-sm",
                                msg.sender === 'user'
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-card text-card-foreground border border-border rounded-bl-none"
                            )}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-card text-card-foreground border border-border p-3 rounded-2xl rounded-bl-none shadow-sm text-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="absolute bottom-16 left-0 right-0 p-4 bg-card/80 backdrop-blur-sm border-t border-border z-20">
                <form
                    onSubmit={handleSubmit}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Digite sua dúvida..."
                        className="flex-1 bg-background border border-input rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    )
}
