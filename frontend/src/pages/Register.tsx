import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { register, UserRole, login } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher / Instructor" },
  { value: "business_manager", label: "Business Manager" },
  { value: "inventory_operator", label: "Inventory Operator" },
];

export default function Register() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: (params.get("role") as UserRole) || "student" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const nav = useNavigate(); const { setToken } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { 
      await register(form); 
      const t = await login(form.email, form.password); 
      setToken(t, true); 
      nav("/portal"); 
    } catch (e: any) { 
      const detail = e.response?.data?.detail;
      if (Array.isArray(detail)) setErr(detail[0]?.msg || "Validation error");
      else if (typeof detail === "string") setErr(detail);
      else setErr("Registration failed. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#03060a] text-white overflow-hidden font-sans">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0B1724] relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#03060a] to-[#0B1724]"></div>
        <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onSubmit={onSubmit} className="relative z-10 w-full max-w-md p-8 bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 rounded-3xl space-y-4 shadow-2xl">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-slate-400 mt-2">Join the NexusAI platform today.</p>
          </div>
          
          {err && <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-400 text-sm rounded-lg">{err}</div>}
          
          <div>
            <label className="text-sm font-semibold text-slate-400">Full Name</label>
            <input required placeholder="John Doe" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full mt-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:border-[#00D68F] outline-none transition" />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-slate-400">Email Address</label>
            <input required type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:border-[#00D68F] outline-none transition" />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-slate-400">Password</label>
            <input required type="password" minLength={8} placeholder="Min 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full mt-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:border-[#00D68F] outline-none transition" />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-slate-400">I am a...</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="w-full mt-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:border-[#00D68F] outline-none transition">
              {ROLES.map((r) => <option key={r.value} value={r.value} className="text-black">{r.label}</option>)}
            </select>
          </div>
          
          <button disabled={busy} className="w-full py-3 mt-2 rounded-xl bg-[#00D68F] text-[#03060a] font-bold hover:bg-[#00C9B7] transition shadow-lg shadow-[#00D68F]/30 disabled:opacity-50 flex items-center justify-center gap-2">
            {busy ? "Creating..." : "Create Account"} <ArrowRight className="w-4 h-4" />
          </button>
          
          <p className="text-center text-sm text-slate-400 mt-4">
            Already have an account? <Link className="text-[#00D68F] font-bold hover:underline" to="/login">Sign in</Link>
          </p>
        </motion.form>
      </div>

      <div className="hidden lg:flex w-1/2 relative bg-[#03060a] items-center justify-center">
        <div className="absolute w-[30vw] h-[30vw] bg-[#00D68F]/20 blur-[120px] rounded-full animate-pulse" />
        <div className="relative z-10 text-center px-12">
          <Sparkles className="w-16 h-16 text-[#00D68F] mx-auto mb-6 animate-pulse" />
          <h1 className="text-5xl font-extrabold mb-4">Start Your Journey.</h1>
          <p className="text-slate-400 text-lg">Learn smarter. Operate better. Decide with evidence.</p>
        </div>
      </div>
    </div>
  );
}