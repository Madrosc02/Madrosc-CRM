import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { chatWithAI } from '../../services/geminiService';
import Spinner from '../ui/Spinner';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { Sale } from '../../types';

const AIChatAssistant: React.FC = () => {
    const { customers, tasks, getAllSales } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
        { role: 'ai', content: "Hi! I'm your CRM Assistant. Ask me anything about your customers, sales, or tasks." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sales, setSales] = useState<Sale[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadSales = async () => {
            try {
                const data = await getAllSales();
                setSales(data);
            } catch (e) { console.error("Failed to load sales for chat context"); }
        };
        if (isOpen && sales.length === 0) {
            loadSales();
        }
    }, [isOpen, getAllSales, sales.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const aiResponse = await chatWithAI(userMessage, customers, sales, tasks);
            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error processing your request." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center z-50"
            >
                {isOpen ? <i className="fas fa-times text-xl"></i> : <i className="fas fa-robot text-xl"></i>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-[var(--color-surface-dark)] rounded-xl shadow-2xl border border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] flex flex-col z-50 overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
                        <h3 className="font-semibold flex items-center">
                            <i className="fas fa-sparkles mr-2"></i> AI Assistant
                        </h3>
                        <button onClick={() => setMessages([{ role: 'ai', content: "Hi! I'm your CRM Assistant. Ask me anything about your customers, sales, or tasks." }])} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded">
                            Clear
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-[var(--color-card-bg-dark)] border border-gray-200 dark:border-gray-700 text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)] rounded-bl-none shadow-sm'
                                    }`}>
                                    {msg.role === 'ai' ? <MarkdownRenderer content={msg.content} /> : msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-[var(--color-card-bg-dark)] border border-gray-200 dark:border-gray-700 rounded-lg rounded-bl-none p-3 shadow-sm">
                                    <Spinner size="sm" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white dark:bg-[var(--color-surface-dark)] border-t border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Ask a question..."
                                className="flex-1 input-base text-sm"
                                autoFocus
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="w-10 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                            >
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatAssistant;
