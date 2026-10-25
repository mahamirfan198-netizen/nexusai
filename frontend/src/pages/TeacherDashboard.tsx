import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, Users, Trophy, BookOpen, AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { NotificationBell } from "../components/NotificationBell";
import { motion } from "framer-motion";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/education/teacher/leaderboard")
      .then(res => setLeaderboard(res.data))
      .catch(err => console.error(err));
  }, []);

  const totalXP = leaderboard.reduce((acc, curr) => acc + curr.score, 0);
  const uniqueStudents = new Set(leaderboard.map(l => l.user_name)).size;
  const averageScore = leaderboard.length > 0 ? (totalXP / leaderboard.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[#03060a] text-white font-sans">
      <header className="bg-[#0B1724]/60 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2 font-bold text-lg">
          <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user?.full_name}`} alt="avatar" className="w-8 h-8 rounded-full border border-[#00D68F]" />
          NexusAI Instructor Workspace
        </div>
        <div className="flex gap-4 items-center">
          <a href="/education/dashboard" className="text-sm font-semibold text-[#00D68F] hover:text-white transition border border-[#00D68F]/30 bg-[#00D68F]/10 px-3 py-1.5 rounded-lg">Switch to Student View</a>
          <NotificationBell />
          <button onClick={logout} className="flex items-center gap-1 text-sm text-[#A8B3C2] hover:text-white transition"><LogOut className="w-4 h-4" /> Logout</button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-3 bg-[#00D68F]/10 text-[#00D68F] rounded-lg"><Users className="w-6 h-6" /></div>
            <div><p className="text-sm text-slate-400 font-semibold">Active Students</p><p className="text-2xl font-bold">{uniqueStudents}</p></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-3 bg-[#48D9F5]/10 text-[#48D9F5] rounded-lg"><Trophy className="w-6 h-6" /></div>
            <div><p className="text-sm text-slate-400 font-semibold">Total XP Earned</p><p className="text-2xl font-bold">{totalXP}</p></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg"><AlertCircle className="w-6 h-6" /></div>
            <div><p className="text-sm text-slate-400 font-semibold">Avg Class Score</p><p className="text-2xl font-bold">{averageScore}</p></div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><BookOpen className="w-6 h-6 text-[#00D68F]" /> Recent Student Activity</h2>
          {leaderboard.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No student games played yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-sm">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Chapter</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${entry.user_name}`} alt="avatar" className="w-6 h-6 rounded-full" />
                        {entry.user_name}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{entry.chapter_title}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 bg-[#00D68F]/20 text-[#00D68F] px-3 py-1 rounded-full text-sm font-bold border border-[#00D68F]/30">
                          <Trophy className="w-3 h-3" /> {entry.score} / {entry.max_score}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-400">{entry.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}