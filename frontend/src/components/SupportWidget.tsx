import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { api } from "../lib/api";

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai", text: string }[]>([
    { role: "ai", text: "Hi! I am the NexusAI Global Help Bot. Ask me anything about the platform." }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    try {
      const { data } = await api.post("/api/support/chat", { message: userMsg });
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Connection error." }]);
    }
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="fixed bottom-8 left-8 p-4 bg-[#00D68F] text-[#03060a] rounded-full shadow-[0_0_20px_rgba(0,214,143,0.4)] hover:scale-105 transition-transform z-50">
      <MessageCircle className="w-6 h-6" />
    </button>
  );

  return (
    <div className="fixed bottom-8 left-8 w-80 h-96 bg-[#0B1724] rounded-2xl shadow-2xl border border-white/10 flex flex-col z-50">
      <div className="bg-[#00D68F] text-[#03060a] p-4 rounded-t-2xl flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Help Bot</h3>
        <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`p-3 rounded-xl max-w-[80%] text-sm ${m.role === "user" ? "bg-[#00D68F] text-[#03060a]" : "bg-white/10 text-white"}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-3 border-t border-white/10 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask for help..." className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:border-[#00D68F] text-sm" />
        <button className="p-2 bg-[#00D68F] text-[#03060a] rounded-lg"><Send className="w-5 h-5" /></button>
      </form>
    </div>
  );
}