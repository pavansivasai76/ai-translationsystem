/* AI Chatbot Widget — Floating chat assistant */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatbotAPI } from '../services/api';
import { Bot, X, Send, Loader } from 'lucide-react';

export default function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: "👋 Hi! I'm your TranslateAI assistant. I can help you:\n\n🔄 **translate:** [text]\n📝 **summarize:** [text]\n💭 **sentiment:** [text]\n🔑 **keywords:** [text]\n\nTry typing 'translate: नमस्ते'" },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(m => [...m, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await chatbotAPI.send(userMsg);
            setMessages(m => [...m, { role: 'bot', text: res.data.reply }]);
        } catch {
            setMessages(m => [...m, { role: 'bot', text: '❌ Sorry, something went wrong. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating button */}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setOpen(!open)} style={{
                position: 'fixed', bottom: 24, right: 24, zIndex: 100,
                width: 56, height: 56, borderRadius: 16, border: 'none', cursor: 'pointer',
                background: 'var(--gradient-primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
            }}>
                {open ? <X size={24} /> : <Bot size={24} />}
            </motion.button>

            {/* Chat window */}
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} style={{
                        position: 'fixed', bottom: 90, right: 24, zIndex: 100,
                        width: 400, maxHeight: 520, borderRadius: 20,
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px', borderBottom: '1px solid var(--border)',
                            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={20} color="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>TranslateAI Assistant</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>AI-powered • Always ready</div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 360 }}>
                            {messages.map((msg, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%', padding: '12px 16px', borderRadius: 14,
                                    background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--bg-glass)',
                                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                    border: msg.role === 'bot' ? '1px solid var(--border)' : 'none',
                                    fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                                }}>
                                    {msg.text}
                                </motion.div>
                            ))}
                            {loading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: 14, background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                </motion.div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} className="input-field" placeholder="Ask me anything..." style={{ flex: 1, padding: '10px 14px' }} />
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={sendMessage} disabled={loading} style={{
                                width: 42, height: 42, borderRadius: 12, border: 'none', cursor: 'pointer',
                                background: 'var(--gradient-primary)', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Send size={18} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
