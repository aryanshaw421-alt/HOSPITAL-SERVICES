import { useState, useRef, useEffect } from 'react';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMessageSquare, FiCpu, FiUser, FiZap, FiClock } from 'react-icons/fi';

const QUICK_PROMPTS = [
  "What are the hospital timings?",
  "Which departments are available?",
  "I have a headache, which doctor should I see?",
  "How do I book an appointment?",
  "What payment methods do you accept?",
  "Show me available doctors",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm the AI assistant for **Ateek Aryan Hospital**. I can help you with:\n\n• Hospital information & timings\n• Doctor availability\n• Appointment guidance\n• Department recommendations\n• Billing inquiries\n\nHow can I assist you today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const message = text || input.trim();
    if (!message || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: message, timestamp: new Date() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply, aiPowered: res.data.aiPowered, timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
      .replace(/•/g, '<span class="text-primary-500">•</span>');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
          <FiMessageSquare className="w-6 h-6 text-primary-500" /> AI Assistant
        </h1>
        <p className="text-surface-500 text-sm mt-1">Chat with our AI-powered hospital assistant</p>
      </div>

      <div className="flex-1 card overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'gradient-hero' : 'bg-secondary-100 dark:bg-secondary-900/30'}`}>
                  {msg.role === 'user' ? <FiUser className="w-4 h-4 text-white" /> : <FiCpu className="w-4 h-4 text-secondary-600" />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'gradient-hero text-white rounded-tr-none' : 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-tl-none'}`}>
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} className="text-sm leading-relaxed" />
                  <div className={`flex items-center gap-2 mt-2 text-[10px] ${msg.role === 'user' ? 'text-white/60' : 'text-surface-400'}`}>
                    <FiClock className="w-3 h-3" />
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    {msg.aiPowered !== undefined && (
                      <span className="flex items-center gap-0.5">
                        <FiZap className="w-3 h-3" /> {msg.aiPowered ? 'AI Powered' : 'Quick Response'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
                <FiCpu className="w-4 h-4 text-secondary-600" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-surface-100 dark:bg-surface-800">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 md:px-6 pb-3">
            <p className="text-xs font-semibold text-surface-400 mb-2 uppercase tracking-wider">Quick Questions</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button key={i} onClick={() => sendMessage(prompt)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-all">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 md:p-6 border-t border-surface-200 dark:border-surface-700">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about Ateek Aryan Hospital..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              className="btn-primary px-5 py-3 flex items-center gap-2">
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
