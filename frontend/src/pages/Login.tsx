import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const nav = useNavigate(); const { setToken } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { const t = await login(email, password); setToken(t, remember); nav("/portal"); }
    catch (e: any) { setErr(e.response?.data?.detail || "Login failed"); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#03060a] text-white overflow-hidden font-sans">
      <div className="hidden lg:flex w-1/2 relative bg-[#0B1724] items-center justify-center border-r border-white/5">
        <div className="absolute w-[30vw] h-[30vw] bg-[#00D68F]/20 blur-[120px] rounded-full animate-pulse" />
        <div className="relative z-10 text-center px-12">
          <Sparkles className="w-16 h-16 text-[#00D68F] mx-auto mb-6 animate-pulse" />
          <h1 className="text-5xl font-extrabold mb-4">Welcome Back.</h1>
          <p className="text-slate-400 text-lg">Log in to access your Education or Business Intelligence Hub.</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={onSubmit} className="relative z-10 w-full max-w-md p-8 bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 rounded-3xl space-y-5 shadow-2xl">
          <div className="text-center mb-6"><h1 className="text-3xl font-bold">Sign In</h1></div>
          {err && <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-400 text-sm rounded-lg">{err}</div>}
          <div><label className="text-sm font-semibold text-slate-400">Email Address</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#00D68F] outline-none" />
          </div>
          <div><label className="text-sm font-semibold text-slate-400">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#00D68F] outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#00D68F] focus:ring-[#00D68F]" />
            <label htmlFor="remember" className="text-sm text-slate-400 select-none cursor-pointer">Remember my login</label>
          </div>
          <button disabled={busy} className="w-full py-3 rounded-xl bg-[#00D68F] text-[#03060a] font-bold hover:bg-[#00C9B7] transition shadow-lg flex items-center justify-center gap-2">
            {busy ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-sm text-slate-400 mt-4">Don't have an account? <Link className="text-[#00D68F] font-bold hover:underline" to="/register">Create one</Link></p>
        </motion.form>
      </div>
    </div>
  );
}