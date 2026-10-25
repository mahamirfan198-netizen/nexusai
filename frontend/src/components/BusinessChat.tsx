import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { api } from "../lib/api";

export function BusinessChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai", text: string }[]>([
    { role: "ai", text: "Hello! I am your AI Business Assistant. Ask me about your inventory, stock levels, or total value." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/business/assistant/chat", { message: userMsg });
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Sorry, I couldn't process that request." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-8 right-8 p-4 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 transition-transform hover:scale-105 z-50 flex items-center justify-center">
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden">
      <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h3 className="font-bold">AI Business Assistant</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:text-indigo-200"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`p-3 rounded-xl max-w-[80%] text-sm ${m.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-700 shadow-sm rounded-bl-none"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-slate-400 italic">AI is typing...</div>}
      </div>

      <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask about stock..." 
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 text-sm" 
        />
        <button disabled={loading} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}