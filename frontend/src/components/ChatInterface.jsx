import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, Bot, Loader2, Mic, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessage, uploadPDF } from '../utils/api';
import { useUser } from '../context/UserContext';

const ChatInterface = ({ onQuerySuccess, initialQuery, onClearQuery }) => {
  const { aiSettings } = useUser();
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your Intelligent Academic Assistant. Ask me anything about Physics, Mathematics, or Computer Science.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(input);
  const loadingRef = useRef(loading);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = useCallback(async (e, forcedQuery = null) => {
    if (e) e.preventDefault();
    const queryToSubmit = forcedQuery || inputRef.current;

    if (!queryToSubmit.trim() || loadingRef.current) return;

    const userMsg = { id: Date.now(), text: queryToSubmit, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    if (!forcedQuery) setInput('');
    setLoading(true);

    try {
      const data = await sendMessage(queryToSubmit, aiSettings);
      const aiMsg = { 
        id: Date.now() + 1, 
        text: data.answer, 
        sender: 'ai', 
        confidence: data.confidence,
        topic: data.topic,
        deep_rag_used: data.deep_rag_used
      };
      setMessages(prev => [...prev, aiMsg]);
      if (onQuerySuccess) onQuerySuccess();
    } catch (error) {
      console.error('Chat send error:', error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: 'Error connecting to service. Please try again.', sender: 'ai', isError: true }]);
    } finally {
      setLoading(false);
    }
  }, [aiSettings, onQuerySuccess]);

  useEffect(() => {
    if (initialQuery) {
      handleSend(null, initialQuery);
      if (onClearQuery) onClearQuery();
    }
  }, [initialQuery, handleSend, onClearQuery]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadPDF(file);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: `Successfully uploaded ${file.name}. You can now ask questions about its content!`, 
        sender: 'ai' 
      }]);
    } catch (error) {
      console.error('PDF upload error:', error);
      alert("Error uploading PDF");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
            <Bot className="text-primary-400" size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100">EduQuery AI</h2>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online & Ready
            </p>
          </div>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="glass-button text-xs flex items-center gap-2"
        >
          {uploading ? <Loader2 className="animate-spin" size={14} /> : <Paperclip size={14} />}
          Upload PDF
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept=".pdf"
        />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-hide">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border 
                  ${msg.sender === 'user' ? 'bg-primary-600 border-primary-400' : 'bg-white/10 border-white/20'}`}>
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className="flex flex-col gap-1">
                  <div className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    {msg.text}
                  </div>
                  {msg.confidence !== undefined && (
                    <span className="text-[10px] text-slate-400 px-2">
                      Topic: {msg.topic} • Confidence: {(msg.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 items-center ml-11 chat-bubble-ai py-2 px-4 italic text-sm text-slate-400">
                <Loader2 className="animate-spin" size={14} />
                Thinking...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask an academic question..."
            className="w-full bg-white/10 border border-white/10 rounded-2xl py-3 pl-4 pr-24 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-slate-500"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button 
              type="button"
              className="p-2 text-slate-400 hover:text-primary-400 transition-colors"
            >
              <Mic size={18} />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-900/40"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        <p className="text-[10px] text-center text-slate-500 mt-2">
          Powered by EduQuery RAG Engine • BERT Embeddings • FAISS Vector Search
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
