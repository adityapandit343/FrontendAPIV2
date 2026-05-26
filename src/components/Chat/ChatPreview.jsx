import { useState, useRef, useEffect } from 'react';
import { qnaApi } from '../../services/api';
import { Send, Bot, User } from 'lucide-react';

export default function ChatPreview() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: 'Hi! I\'m your chatbot assistant. Ask me anything.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;

    setInput('');
    const userMsg = { id: Date.now(), role: 'user', text: q };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    try {
      const { data } = await qnaApi.preview(q);
      setMessages(m => [...m, {
        id: Date.now() + 1,
        role: 'bot',
        text: data.answer,
        matched: data.matched
      }]);
    } catch {
      setMessages(m => [...m, {
        id: Date.now() + 1,
        role: 'bot',
        text: 'Error connecting to the server. Please try again.',
        error: true
      }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-96">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-brand-500 text-zinc-950">
        <div className="w-7 h-7 rounded-full bg-zinc-950/20 flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Live Preview</p>
          <p className="text-xs opacity-70 leading-tight">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5
              ${msg.role === 'bot' ? 'bg-brand-500/20 border border-brand-500/30' : 'bg-zinc-700'}`}>
              {msg.role === 'bot'
                ? <Bot className="w-3 h-3 text-brand-400" />
                : <User className="w-3 h-3 text-zinc-300" />}
            </div>
            <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm
              ${msg.role === 'user'
                ? 'bg-brand-500 text-zinc-950 rounded-tr-sm'
                : msg.error
                  ? 'bg-red-950/50 border border-red-800 text-red-300 rounded-tl-sm'
                  : 'bg-zinc-800 text-zinc-100 rounded-tl-sm'}`}>
              {msg.text}
              {msg.role === 'bot' && !msg.error && (
                <span className={`block text-xs mt-1 ${msg.matched ? 'text-brand-400/70' : 'text-zinc-500'}`}>
                  {msg.matched ? '✓ Matched' : '↩ Fallback'}
                </span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3 h-3 text-brand-400" />
            </div>
            <div className="bg-zinc-800 px-3 py-2 rounded-xl rounded-tl-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-zinc-800">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          className="input flex-1 text-sm py-2"
          placeholder="Type a question…"
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()}
          className="w-9 h-9 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-40
                     flex items-center justify-center transition-colors flex-shrink-0">
          <Send className="w-4 h-4 text-zinc-950" />
        </button>
      </div>
    </div>
  );
}
