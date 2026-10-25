import { useState } from "react";
import { Send, Bot } from "lucide-react";
import { api } from "../lib/api";

export function PortalAssistant() {
  const [messages, setMessages] = useState<{ role: "user" | "ai", text: string }[]>([
    { role: "ai", text: "Hello! I am your context-aware AI. Ask me about your studies or inventory." }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    try {
      const { data } = await api.post("/api/support/portal-chat", { message: userMsg });
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Error connecting to portal AI." }]);
    }
  };

  return (
    <div className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-[500px] flex flex-col shadow-xl">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white"><Bot className="w-5 h-5 text-[#00D68F]" /> Portal AI Assistant</h3>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`p-3 rounded-xl text-sm max-w-[85%] ${m.role === "user" ? "bg-[#48D9F5] text-[#03060a]" : "bg-white/5 text-slate-300 border border-white/5"}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your data..." className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:border-[#48D9F5] text-sm" />
        <button className="p-2 bg-[#48D9F5] text-[#03060a] rounded-lg hover:bg-[#00C9B7] transition"><Send className="w-5 h-5" /></button>
      </form>
    </div>
  );
}