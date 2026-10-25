import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, LogOut, TrendingUp, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { NotificationBell } from "../components/NotificationBell";

export default function Analytics() {
  const { user, logout } = useAuth();

  // Realistic Demo Data for Charts (In production, fetch from DB)
  const performanceData = [
    { name: "Quiz 1", score: 60, xp: 120 },
    { name: "Quiz 2", score: 75, xp: 250 },
    { name: "Quiz 3", score: 80, xp: 400 },
    { name: "Quiz 4", score: 95, xp: 650 },
    { name: "Quiz 5", score: 100, xp: 900 },
  ];

  const subjectData = [
    { name: "Physics", mastery: 85 },
    { name: "Math", mastery: 92 },
    { name: "Biology", mastery: 68 },
  ];

  return (
    <div className="min-h-screen bg-[#03060a] text-white font-sans">
      <header className="bg-[#0B1724]/60 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2 font-bold text-lg"><GraduationCap className="text-[#00D68F] w-6 h-6" /> NexusAI · Analytics</div>
        <div className="flex gap-4 items-center">
            <Link to="/education/dashboard" className="text-sm text-[#A8B3C2] hover:text-white transition">Back to Dashboard</Link>
            <NotificationBell />
            <button onClick={logout} className="flex items-center gap-1 text-sm text-[#A8B3C2] hover:text-white transition"><LogOut className="w-4 h-4" /> Logout</button>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto p-8 space-y-8">
        <div className="flex gap-6">
            <div className="flex-1 bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl shadow-black/50">
                <h3 className="text-slate-400 font-semibold mb-2 flex items-center gap-2"><Trophy className="w-4 h-4 text-[#00D68F]"/> Total XP</h3>
                <p className="text-4xl font-extrabold text-white">2,450</p>
            </div>
            <div className="flex-1 bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl shadow-black/50">
                <h3 className="text-slate-400 font-semibold mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#48D9F5]"/> Accuracy</h3>
                <p className="text-4xl font-extrabold text-white">84%</p>
            </div>
        </div>

        <div className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl shadow-black/50">
          <h2 className="text-xl font-bold text-white mb-6">Game Score Progression</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#A8B3C2" tickLine={false} axisLine={false} />
                <YAxis stroke="#A8B3C2" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1724", borderColor: "#ffffff20", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="score" stroke="#00D68F" strokeWidth={4} dot={{ r: 6, fill: "#0B1724", strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl shadow-black/50">
          <h2 className="text-xl font-bold text-white mb-6">Subject Mastery</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#A8B3C2" tickLine={false} axisLine={false} />
                <YAxis stroke="#A8B3C2" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1724", borderColor: "#ffffff20", borderRadius: "8px" }} />
                <Bar dataKey="mastery" fill="#48D9F5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}