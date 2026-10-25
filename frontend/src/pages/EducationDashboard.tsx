import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { GraduationCap, LogOut, Plus, BookOpen, Upload, Clock, Trophy, Zap } from "lucide-react";
import { Subject, Chapter, Question, getSubjects, createSubject, getChapters, createChapter, uploadDocument, getChapterQuiz, saveAttempt } from "../lib/education";
import { motion, AnimatePresence } from "framer-motion";
import { PortalAssistant } from "../components/PortalAssistant";
import { NotificationBell } from "../components/NotificationBell";
import toast from "react-hot-toast";
import { SkeletonCard } from "../components/Skeletons";

export default function EducationDashboard() {
  const { user, logout, refresh } = useAuth();
  const nav = useNavigate();

  const downloadCertificate = async () => {
    try {
      const response = await api.get("/api/certificate/generate", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `NexusAI_Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Failed to generate certificate. Please ensure you have played a quiz.");
    }
  };

  const switchToInstructor = async () => {
    try {
      await api.post("/api/auth/switch-portal", { portal: "education" });
      // Grant teacher role for the demo session
      const meRes = await api.get("/api/auth/me");
      if (!meRes.data.roles.includes("teacher")) {
        meRes.data.roles += ",teacher";
      }
      await refresh();
      nav("/teacher/dashboard");
    } catch {
      alert("Failed to switch to instructor view");
    }
  };

  const switchToBusiness = async () => {
    try {
      await api.post("/api/auth/switch-portal", { portal: "business" });
      await refresh(); // Update the user state in context
      nav("/business/dashboard");
    } catch {
      alert("Failed to switch portals");
    }
  };
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newChapter, setNewChapter] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [activePlan, setActivePlan] = useState<any>(null);
  
  const [gameMode, setGameMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameAnswers, setGameAnswers] = useState<any[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  useEffect(() => {
    getSubjects().then(setSubjects).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      getChapters(selectedSubject.id).then(setChapters).catch(console.error);
      setActivePlan(null);
    }
  }, [selectedSubject]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject) return;
    const s = await createSubject(newSubject);
    setSubjects([...subjects, s]);
    setNewSubject("");
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapter || !selectedSubject) return;
    const c = await createChapter(newChapter, selectedSubject.id);
    setChapters([...chapters, c]);
    setNewChapter("");
  };

  const handleUpload = async (e: React.FormEvent, chapterId: string) => {
    e.preventDefault();
    if (!file) return alert("Select a file first");
    setUploading(true);
    try {
      const response = await uploadDocument(file, chapterId);
      setActivePlan(response.plan);
      setFile(null);
      toast.success("Document processed! Plan generated.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const startGame = async (chapterId: string) => {
    try {
      const q = await getChapterQuiz(chapterId);
      if (q.length === 0) return toast.error("No quiz generated. Upload notes first!");
      setQuizQuestions(q);
      setCurrentQIndex(0);
      setScore(0);
      setStreak(0);
      setGameOver(false);
      setGameAnswers([]);
      setActiveChapterId(chapterId);
      setGameMode(true);
      setActivePlan(null);
    } catch {
      alert("Could not load quiz.");
    }
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    const correct = answer.toLowerCase().trim() === quizQuestions[currentQIndex].correct_answer.toLowerCase().trim();
    setIsCorrect(correct);
    
    setGameAnswers(prev => [...prev, { question_id: quizQuestions[currentQIndex].id, selected_answer: answer, is_correct: correct }]);

    if (correct) {
      setScore(prev => prev + 10 + (streak * 2));
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQIndex < quizQuestions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setGameOver(true);
        if (activeChapterId) {
            const finalScore = score + (correct ? 10 + (streak * 2) : 0);
            saveAttempt(activeChapterId, finalScore, quizQuestions.length * 10, gameAnswers);
        }
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#03060a] text-white font-sans relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#00D68F] blur-[150px] opacity-10 pointer-events-none" />
      
      <header className="bg-[#0B1724]/60 backdrop-blur-xl border-b border-white/10 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2 font-bold text-lg"><GraduationCap className="text-[#00D68F] w-6 h-6" /> <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user?.full_name}`} alt="avatar" className="w-8 h-8 rounded-full border border-[#00D68F]" /> NexusAI · Education</div>
        <div className="flex gap-4 items-center">
          <button onClick={switchToInstructor} className="text-sm font-semibold text-indigo-400 hover:text-white transition border border-indigo-400/30 bg-indigo-400/10 px-3 py-1.5 rounded-lg">Switch to Instructor</button>
          <button onClick={switchToBusiness} className="text-sm font-semibold text-[#48D9F5] hover:text-white transition border border-[#48D9F5]/30 bg-[#48D9F5]/10 px-3 py-1.5 rounded-lg">Switch to Business</button>
          <NotificationBell />
          <button onClick={downloadCertificate} className="text-sm font-semibold text-[#00D68F] hover:underline">Get Certificate 📜</button>
          <a href="/education/analytics" className="text-sm font-semibold text-[#A8B3C2] hover:text-[#00D68F] transition">View Analytics</a>
          <button onClick={logout} className="flex items-center gap-1 text-sm text-[#A8B3C2] hover:text-white transition"><LogOut className="w-4 h-4" /> Logout</button>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto p-8 flex gap-8 relative z-10">
        <div className="w-1/3 bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl h-fit shadow-xl shadow-black/50">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#00D68F]" /> My Subjects</h2>
          <form onSubmit={handleAddSubject} className="flex gap-2 mb-6">
            <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="New Subject..." className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:border-[#00D68F]" />
            <button className="p-2 bg-[#00D68F] text-[#03060a] rounded-lg hover:bg-[#00C9B7] transition"><Plus className="w-5 h-5" /></button>
          </form>
          <ul className="space-y-2">
            {subjects.map((s) => (
              <li key={s.id}>
                <button onClick={() => setSelectedSubject(s)} className={`w-full text-left px-3 py-2 rounded-lg transition-all ${selectedSubject?.id === s.id ? "bg-[#00D68F]/20 text-[#00D68F] font-bold border border-[#00D68F]/30" : "hover:bg-white/5 text-slate-300"}`}>
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-2/3 space-y-6">
          <PortalAssistant />
          {selectedSubject ? (
            <div className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl relative z-10 shadow-xl shadow-black/50">
              <h2 className="text-xl font-bold text-white mb-4">{selectedSubject.name} · Chapters</h2>
              <form onSubmit={handleAddChapter} className="flex gap-2 mb-6">
                <input value={newChapter} onChange={(e) => setNewChapter(e.target.value)} placeholder="New Chapter..." className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:border-[#00D68F]" />
                <button className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition">Add</button>
              </form>
              
              <div className="space-y-4">
                {chapters.map((c) => (
                  <div key={c.id} className="p-4 border border-white/10 rounded-lg bg-white/5 flex items-center justify-between">
                    <span className="font-medium text-slate-200">{c.title}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => startGame(c.id)} className="px-3 py-1.5 bg-indigo-600/80 text-white border border-indigo-400/30 rounded-md text-sm font-semibold hover:bg-indigo-600 flex items-center gap-1 transition">
                        <Zap className="w-4 h-4" /> Play
                      </button>
                      <div className="border-l border-white/10 pl-3 ml-1 flex items-center gap-2">
                        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm max-w-[120px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-white/10 file:text-white hover:file:bg-white/20" />
                        <button onClick={(e) => handleUpload(e, c.id)} disabled={uploading} className="flex items-center gap-2 px-3 py-1.5 bg-[#00D68F] text-[#03060a] rounded-md text-sm font-bold disabled:opacity-50 hover:bg-[#00C9B7] transition">
                          <Upload className="w-4 h-4" /> Upload
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-12 rounded-2xl text-center text-slate-400 shadow-xl shadow-black/50">
              Select or create a subject on the left to view chapters.
            </div>
          )}

          {activePlan && !gameMode && (
            <div className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 border-t-4 border-t-[#00D68F] p-6 rounded-2xl relative z-10 shadow-xl shadow-black/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-[#00D68F]" /> 40-Minute Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div className="p-3 bg-white/5 rounded border border-white/5"><strong className="text-[#00D68F] block mb-1">Minutes 0–5</strong>{activePlan.minutes_0_5}</div>
                <div className="p-3 bg-white/5 rounded border border-white/5"><strong className="text-[#00D68F] block mb-1">Minutes 5–15</strong>{activePlan.minutes_5_15}</div>
                <div className="p-3 bg-white/5 rounded border border-white/5"><strong className="text-[#00D68F] block mb-1">Minutes 15–25</strong>{activePlan.minutes_15_25}</div>
                <div className="p-3 bg-white/5 rounded border border-white/5"><strong className="text-[#00D68F] block mb-1">Minutes 25–35</strong>{activePlan.minutes_25_35}</div>
                <div className="p-3 bg-white/5 rounded border border-white/5 md:col-span-2"><strong className="text-[#00D68F] block mb-1">Minutes 35–40</strong>{activePlan.minutes_35_40}</div>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {gameMode && quizQuestions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 bg-[#03060a]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-white shadow-2xl overflow-y-auto"
            >
              {!gameOver ? (
                <div className="w-full max-w-2xl">
                  <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <div className="text-xl font-bold text-slate-300">Question {currentQIndex + 1} / {quizQuestions.length}</div>
                    <div className="flex gap-4 items-center">
          <button onClick={switchToInstructor} className="text-sm font-semibold text-indigo-400 hover:text-white transition border border-indigo-400/30 bg-indigo-400/10 px-3 py-1.5 rounded-lg">Switch to Instructor</button>
          <button onClick={switchToBusiness} className="text-sm font-semibold text-[#48D9F5] hover:text-white transition border border-[#48D9F5]/30 bg-[#48D9F5]/10 px-3 py-1.5 rounded-lg">Switch to Business</button>
          <NotificationBell />
          <button onClick={downloadCertificate} className="text-sm font-semibold text-[#00D68F] hover:underline">Get Certificate 📜</button>
                      <span className="flex items-center gap-1 text-[#00D68F] font-bold"><Trophy className="w-5 h-5" /> {score}</span>
                      {streak > 0 && <span className="flex items-center gap-1 text-orange-400 font-bold animate-pulse"><Zap className="w-5 h-5" /> {streak}x Streak!</span>}
                    </div>
                  </div>

                  <h3 className="text-2xl mb-8 font-medium leading-relaxed">{quizQuestions[currentQIndex].text}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizQuestions[currentQIndex].options.map((opt, i) => {
                      const isSelected = selectedAnswer === opt;
                      const isRight = opt === quizQuestions[currentQIndex].correct_answer;
                      let btnClass = "bg-white/5 hover:bg-white/10 border-white/10 text-white";
                      if (selectedAnswer !== null) {
                        if (isRight) btnClass = "bg-[#00D68F]/20 border-[#00D68F] text-[#00D68F]";
                        else if (isSelected && !isCorrect) btnClass = "bg-red-500/20 border-red-500 text-red-400";
                        else btnClass = "bg-white/5 border-white/5 text-white/30 opacity-50";
                      }
                      return (
                        <button key={i} onClick={() => handleAnswer(opt)} disabled={selectedAnswer !== null}
                          className={`p-4 rounded-xl border-2 text-left font-semibold transition-all ${btnClass}`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {selectedAnswer !== null && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="font-bold text-lg mb-2">{isCorrect ? "🎉 Correct!" : "❌ Incorrect"}</p>
                      <p className="text-slate-400 text-sm">{quizQuestions[currentQIndex].explanation}</p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
                  <Trophy className="w-24 h-24 text-[#00D68F] mx-auto mb-6 drop-shadow-[0_0_15px_rgba(0,214,143,0.5)]" />
                  <h2 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00D68F] to-[#48D9F5]">Round Complete!</h2>
                  <p className="text-2xl mb-8">Final Score: <strong className="text-[#00D68F]">{score}</strong> XP</p>
                  <button onClick={() => setGameMode(false)} className="px-8 py-3 bg-white text-[#03060a] font-bold rounded-xl hover:bg-slate-200 transition">
                    Return to Dashboard
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}