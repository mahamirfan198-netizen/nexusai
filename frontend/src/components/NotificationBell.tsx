import { useState } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  return (
    <div className="relative">
      <button onClick={() => { setIsOpen(!isOpen); setHasUnread(false); }} className="relative p-2 text-slate-400 hover:text-white transition">
        <Bell className="w-5 h-5" />
        {hasUnread && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-72 bg-[#0B1724] border border-white/10 rounded-xl shadow-2xl p-4 z-50">
            <h4 className="font-bold text-white mb-3 text-sm">Notifications</h4>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-sm text-[#00D68F] font-semibold">Welcome to NexusAI!</p>
                <p className="text-xs text-slate-400 mt-1">Your AI Assistant is ready.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}