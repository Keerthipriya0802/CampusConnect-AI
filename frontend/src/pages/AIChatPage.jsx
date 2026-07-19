import { useState } from 'react';
import api from '../services/api';
import { Bot, SendHorizonal } from 'lucide-react';

export default function AIChatPage() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! I can help with eligibility, applications, interviews, and next steps.' }]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    try {
      const res = await api.post('/ai/chat', { message: input });
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'The AI assistant is temporarily unavailable.' }]);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Bot className="text-blue-600" />
        <h1 className="text-2xl font-semibold">AI Placement Assistant</h1>
      </div>
      <p className="mt-2 text-sm text-slate-600">Ask anything about placements, eligibility, and your next steps.</p>
      <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
        {messages.map((message, index) => (
          <div key={index} className={`rounded-2xl p-3 ${message.role === 'assistant' ? 'bg-white text-slate-700' : 'bg-blue-600 text-white'}`}>
            {message.content}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input className="flex-1 rounded-xl border border-slate-300 px-3 py-2" placeholder="Ask the AI assistant..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
        <button onClick={sendMessage} className="rounded-xl bg-blue-600 p-2 text-white"><SendHorizonal size={18} /></button>
      </div>
    </div>
  );
}
