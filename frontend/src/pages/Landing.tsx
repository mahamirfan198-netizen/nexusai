import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BookOpen, Briefcase, Zap, ShieldCheck, Users, ChevronDown, Activity, CheckCircle2, Star, Quote, TrendingUp } from "lucide-react";
import { AnimatedHeroBackground } from "../components/AnimatedHeroBackground";
import { demoLogin } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { setToken } = useAuth();
  const nav = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);

  // Parallax effect for the hero section
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);

  const handleDemo = async (portal: string) => {
    try {
      const token = await demoLogin(portal);
      setToken(token, true);
      nav("/portal");
    } catch {
      alert("Demo login failed. Is the backend running?");
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#03060a] text-white font-sans overflow-x-hidden selection:bg-[#00D68F] selection:text-[#03060a] relative">
      <AnimatedHeroBackground />
      
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#03060a]/60 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xl font-bold"><Activity className="text-[#00D68F] w-6 h-6" /> NexusAI</div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A8B3C2]">
            <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
            <a href="#portals" className="hover:text-white transition">Portals</a>
            <Link to="/directory" className="hover:text-white transition">Help Directory</Link>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="relative">
              <button onClick={() => setDemoOpen(!demoOpen)} className="text-[#00D68F] font-bold hover:text-white transition flex items-center gap-1"><Zap className="w-4 h-4"/> Instant Demo <ChevronDown className="w-4 h-4" /></button>
              {demoOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0B1724] border border-white/10 rounded-xl shadow-2xl p-2 z-50">
                  <button onClick={() => handleDemo("education")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-[#00D68F] rounded-lg flex items-center gap-2"><BookOpen className="w-4 h-4" /> Student Portal</button>
                  <button onClick={() => handleDemo("business")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-[#48D9F5] rounded-lg flex items-center gap-2"><Briefcase className="w-4 h-4" /> Business Portal</button>
                  <button onClick={() => handleDemo("instructor")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-indigo-400 rounded-lg flex items-center gap-2"><Users className="w-4 h-4" /> Instructor Portal</button>
                </div>
              )}
            </div>
            <Link to="/login" className="text-[#A8B3C2] hover:text-white transition">Sign In</Link>
            <Link to="/register" className="px-5 py-2.5 rounded-xl bg-[#00D68F] text-[#03060a] font-bold hover:bg-[#00C9B7] transition">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen pt-40 pb-20 px-6 z-20 max-w-7xl mx-auto flex flex-col items-center text-center justify-center">
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="flex flex-col items-center w-full">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#00D68F] mb-8">
            <Zap className="w-3 h-3" /> POWERED BY EVIDENCE-BASED AI
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-8xl lg:text-[7.5rem] font-extrabold tracking-tight leading-[1.05]">
            TURN KNOWLEDGE<br />INTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D68F] via-[#48D9F5] to-[#00C9B7]">ACTION.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 text-lg md:text-xl text-[#A8B3C2] max-w-3xl mx-auto">
            Prepare smarter with evidence-driven learning. Run your business with clearer insights. Bring your decisions together with NexusAI.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link to="/register?role=student" className="px-8 py-4 rounded-xl bg-white text-[#03060a] font-bold text-lg hover:bg-slate-200 transition flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Start Learning
            </Link>
            <Link to="/register?role=business_manager" className="px-8 py-4 rounded-xl bg-white/5 border border-white/20 text-white font-bold text-lg hover:bg-white/10 transition flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Start Managing
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* HOW IT WORKS (Action Lab Timeline) */}
      <section id="how-it-works" className="py-32 relative z-20 border-t border-white/5 bg-[#0B1724]/20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">The Evidence Loop</h2>
            <p className="text-[#A8B3C2] text-lg max-w-2xl mx-auto">How NexusAI turns raw data into measurable actions.</p>
          </motion.div>

          <div className="relative border-l-2 border-[#00D68F]/30 ml-4 md:ml-0 md:border-l-0">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00D68F] via-[#48D9F5] to-transparent -translate-x-1/2"></div>
            
            {[
              { step: "01", title: "Detect", desc: "AI scans your past papers and inventory ledgers to detect anomalies and key topics.", icon: Activity },
              { step: "02", title: "Analyze", desc: "The engine cross-references evidence, student mastery, and stock levels.", icon: TrendingUp },
              { step: "03", title: "Recommend", desc: "Generates a precise recommendation: a quiz to take, or a stock reorder to approve.", icon: Zap },
              { step: "04", title: "Measure", desc: "You approve the action, and NexusAI tracks the resulting improvement in real-time.", icon: CheckCircle2 },
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className={`relative flex items-center mb-16 md:mb-24 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="absolute left-0 md:left-1/2 w-10 h-10 rounded-full bg-[#03060a] border-2 border-[#00D68F] flex items-center justify-center -translate-x-1/2 md:-translate-x-1/2 z-10 text-xs font-bold text-[#00D68F] shadow-[0_0_20px_rgba(0,214,143,0.5)]">
                  {item.step}
                </div>
                <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-20 md:text-right" : "md:pl-20 md:text-left"}`}>
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 justify-start md:justify-inherit"><item.icon className="w-6 h-6 text-[#00D68F]" /> {item.title}</h3>
                  <p className="text-[#A8B3C2]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTALS SHOWCASE */}
      <section id="portals" className="py-32 relative z-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Two Portals. One Platform.</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-[#0B1724]/60 backdrop-blur-xl border border-[#00D68F]/20 p-10 rounded-3xl hover:border-[#00D68F]/60 transition-all group">
              <div className="w-16 h-16 bg-[#00D68F]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#00D68F]/30 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-[#00D68F]" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Education Hub</h3>
              <p className="text-[#A8B3C2] mb-8 text-lg">Upload notes, play gamified quizzes, and access 40-minute study plans generated by AI.</p>
              <Link to="/register?role=student" className="inline-flex items-center gap-2 text-[#00D68F] font-bold text-lg hover:gap-4 transition-all">
                Enter Education <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-[#0B1724]/60 backdrop-blur-xl border border-[#48D9F5]/20 p-10 rounded-3xl hover:border-[#48D9F5]/60 transition-all group">
              <div className="w-16 h-16 bg-[#48D9F5]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#48D9F5]/30 group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8 text-[#48D9F5]" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Business Hub</h3>
              <p className="text-[#A8B3C2] mb-8 text-lg">Track stock with a real ledger, approve AI inventory recommendations in the Action Lab.</p>
              <Link to="/register?role=business_manager" className="inline-flex items-center gap-2 text-[#48D9F5] font-bold text-lg hover:gap-4 transition-all">
                Enter Business <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 border-y border-white/5 bg-[#0B1724]/40 relative z-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[{ label: "Active Students", val: "12,000+" },{ label: "Quizzes Generated", val: "45,000+" },{ label: "Businesses Managed", val: "850+" },{ label: "AI Recommendations", val: "120,000+" }].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <p className="text-4xl md:text-5xl font-extrabold text-white mb-2">{s.val}</p>
              <p className="text-[#A8B3C2] font-medium text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 relative z-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Trusted by the Best</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { text: "NexusAI turned my boring PDF notes into a game. I passed my board exams with an A+ thanks to the 40-minute plans.", name: "Zainab K.", role: "Student" },
              { text: "The Action Lab saved our inventory. It detected we were low on crucial supplies and reordered them with one click.", name: "Mark D.", role: "Business Manager" },
            ].map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="p-8 bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 rounded-3xl relative">
                <Quote className="w-10 h-10 text-[#00D68F]/20 absolute top-6 right-6" />
                <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-[#00D68F] text-[#00D68F]" />)}</div>
                <p className="text-[#A8B3C2] text-lg italic mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${t.name}`} alt="avatar" className="w-12 h-12 rounded-full bg-white/10" />
                  <div><p className="font-bold text-white">{t.name}</p><p className="text-sm text-[#A8B3C2]">{t.role}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 relative z-20 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-5xl mx-auto bg-gradient-to-r from-[#00D68F] to-[#48D9F5] rounded-[3rem] p-1">
          <div className="bg-[#03060a] rounded-[2.9rem] py-20 px-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[#00D68F]/10 blur-3xl"></div>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 relative z-10">Ready to transform your workflow?</h2>
            <p className="text-[#A8B3C2] text-lg mb-10 max-w-2xl mx-auto relative z-10">Join thousands of students and businesses using NexusAI today.</p>
            <Link to="/register" className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-white text-[#03060a] font-bold text-lg hover:bg-slate-200 transition relative z-10 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="py-12 border-t border-white/10 text-center relative z-20">
        <p className="text-[#A8B3C2] text-sm flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4" /> © {new Date().getFullYear()} NexusAI Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}