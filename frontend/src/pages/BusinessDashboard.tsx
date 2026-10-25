import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Briefcase, LogOut, Plus, Box, AlertTriangle, ArrowRight, ShieldCheck, DollarSign } from "lucide-react";
import { Product, DashboardData, ActionCase, getProducts, createProduct, getDashboard, recordMovement, getActionLab, approveAction } from "../lib/business";
import { PortalAssistant } from "../components/PortalAssistant";
import { NotificationBell } from "../components/NotificationBell";
import toast from "react-hot-toast";
import { SkeletonCard, SkeletonTable } from "../components/Skeletons";

export default function BusinessDashboard() {
  const { user, logout, refresh } = useAuth();
  const nav = useNavigate();

  const switchToEducation = async () => {
    try {
      await api.post("/api/auth/switch-portal", { portal: "education" });
      await refresh(); // Update the user state in context
      nav("/education/dashboard");
    } catch {
      alert("Failed to switch portals");
    }
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [actionCases, setActionCases] = useState<ActionCase[]>([]);
  
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", category: "General", quantity: 0, reorder_level: 10, unit_cost: 0 });
  const [movement, setMovement] = useState({ product_id: "", quantity_change: 0, movement_type: "IN", reason: "" });

  const loadData = async () => {
    try {
      const [p, s, a] = await Promise.all([getProducts(), getDashboard(), getActionLab()]);
      setProducts(p); setStats(s); setActionCases(a);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProduct(form); toast.success("Product added successfully!");
    setShowAdd(false);
    setForm({ name: "", sku: "", category: "General", quantity: 0, reorder_level: 10, unit_cost: 0 });
    loadData();
  };

  const handleMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movement.product_id) return alert("Select a product");
    await recordMovement(movement); toast.success("Stock movement recorded!");
    setMovement({ product_id: "", quantity_change: 0, movement_type: "IN", reason: "" });
    loadData();
  };

  const handleApprove = async (id: string) => {
    await approveAction(id); toast.success("Reorder approved and stock updated!");
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#03060a] text-white font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#48D9F5] blur-[150px] opacity-10 pointer-events-none" />
      
      <header className="bg-[#0B1724]/60 backdrop-blur-xl border-b border-white/10 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2 font-bold text-lg"><Briefcase className="text-[#48D9F5] w-6 h-6" /> <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user?.full_name}`} alt="avatar" className="w-8 h-8 rounded-full border border-[#48D9F5]" /> NexusAI · Business</div>
        <button onClick={switchToEducation} className="text-sm font-semibold text-[#00D68F] hover:text-white transition border border-[#00D68F]/30 bg-[#00D68F]/10 px-3 py-1.5 rounded-lg">Switch to Education</button>
        <NotificationBell />
        <button onClick={logout} className="flex items-center gap-1 text-sm text-[#A8B3C2] hover:text-white transition"><LogOut className="w-4 h-4" /> Logout</button>
      </header>
      
      <main className="max-w-6xl mx-auto p-8 space-y-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-4 relative z-10 shadow-xl shadow-black/50">
            <div className="p-3 bg-[#00D68F]/10 text-[#00D68F] rounded-lg"><Box className="w-6 h-6" /></div>
            <div><p className="text-sm text-slate-400 font-semibold">Total Products</p><p className="text-2xl font-bold text-white">{stats?.total_products || 0}</p></div>
          </div>
          <div className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-4 relative z-10 shadow-xl shadow-black/50">
            <div className="p-3 bg-[#48D9F5]/10 text-[#48D9F5] rounded-lg"><DollarSign className="w-6 h-6" /></div>
            <div><p className="text-sm text-slate-400 font-semibold">Inventory Value</p><p className="text-2xl font-bold text-white">${stats?.total_value.toFixed(2) || "0.00"}</p></div>
          </div>
          <div className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center gap-4 relative z-10 shadow-xl shadow-black/50">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-lg"><AlertTriangle className="w-6 h-6" /></div>
            <div><p className="text-sm text-slate-400 font-semibold">Low Stock Alerts</p><p className="text-2xl font-bold text-white">{stats?.low_stock_count || 0}</p></div>
          </div>
        </div>

        {actionCases.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-900/80 to-indigo-950/80 backdrop-blur-xl text-white p-6 rounded-2xl shadow-2xl border border-indigo-500/30 border-t-4 border-t-indigo-400 relative overflow-hidden z-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-400" /> Action Lab: Pending Approvals</h2>
            <div className="space-y-3">
              {actionCases.map(c => (
                <div key={c.id} className="bg-white/5 p-4 rounded-lg flex items-center justify-between border border-white/10">
                  <div>
                    <p className="font-bold text-lg">{c.product}</p>
                    <p className="text-sm text-indigo-200">{c.issue}</p>
                    <p className="text-sm text-[#00D68F] mt-1"><ArrowRight className="inline w-4 h-4 mr-1" /> AI Recommends: {c.recommendation}</p>
                  </div>
                  <button onClick={() => handleApprove(c.id)} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg shadow-lg transition">
                    Approve Reorder
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl relative z-10 shadow-xl shadow-black/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Inventory</h2>
              <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 bg-[#00D68F] text-[#03060a] rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-[#00C9B7] transition">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
            
            {showAdd && (
              <form onSubmit={handleAddProduct} className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="px-3 py-2 bg-[#03060a] border border-white/10 text-white rounded-md focus:border-[#00D68F] outline-none" />
                  <input required placeholder="SKU" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="px-3 py-2 bg-[#03060a] border border-white/10 text-white rounded-md focus:border-[#00D68F] outline-none" />
                  <input required type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value) || 0})} className="px-3 py-2 bg-[#03060a] border border-white/10 text-white rounded-md focus:border-[#00D68F] outline-none" />
                  <input required type="number" placeholder="Unit Cost ($)" value={form.unit_cost} onChange={e => setForm({...form, unit_cost: parseFloat(e.target.value) || 0})} className="px-3 py-2 bg-[#03060a] border border-white/10 text-white rounded-md focus:border-[#00D68F] outline-none" />
                </div>
                <button className="w-full py-2 bg-white text-[#03060a] rounded-md font-bold hover:bg-slate-200 transition">Save Product</button>
              </form>
            )}

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-sm">
                  <th className="py-2">Product</th>
                  <th className="py-2">SKU</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? <tr><td colSpan={4}><SkeletonTable /></td></tr> : products.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3 font-medium text-white">{p.name}</td>
                    <td className="py-3 text-slate-400 text-sm">{p.sku}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${p.quantity <= p.reorder_level ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-[#00D68F]/20 text-[#00D68F] border border-[#00D68F]/30"}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">${(p.quantity * p.unit_cost).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl h-fit relative z-10 shadow-xl shadow-black/50 space-y-6">
            <PortalAssistant />
            <h2 className="text-xl font-bold text-white mb-4">Record Movement</h2>
            <form onSubmit={handleMovement} className="space-y-4">
              <select required value={movement.product_id} onChange={e => setMovement({...movement, product_id: e.target.value})} className="w-full px-3 py-2 bg-[#03060a] border border-white/10 text-white rounded-md focus:border-[#00D68F] outline-none">
                <option value="">Select Product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={movement.movement_type} onChange={e => setMovement({...movement, movement_type: e.target.value})} className="w-full px-3 py-2 bg-[#03060a] border border-white/10 text-white rounded-md focus:border-[#00D68F] outline-none">
                <option value="IN">Stock IN (Receive)</option>
                <option value="OUT">Stock OUT (Use/Sell)</option>
              </select>
              <input required type="number" placeholder="Quantity (e.g. 50)" value={movement.quantity_change || ""} onChange={e => setMovement({...movement, quantity_change: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-[#03060a] border border-white/10 text-white rounded-md focus:border-[#00D68F] outline-none" />
              <input placeholder="Reason (e.g. Restock)" value={movement.reason} onChange={e => setMovement({...movement, reason: e.target.value})} className="w-full px-3 py-2 bg-[#03060a] border border-white/10 text-white rounded-md focus:border-[#00D68F] outline-none" />
              <button className="w-full py-2 bg-[#48D9F5] text-[#03060a] rounded-md font-bold hover:bg-[#00C9B7] transition">Submit</button>
            </form>

            <h3 className="text-sm font-bold text-slate-400 mt-8 mb-3 uppercase tracking-wider">Recent Activity</h3>
            <div className="space-y-2">
              {stats?.recent_movements.map(m => (
                <div key={m.id} className="flex justify-between text-sm p-2 bg-white/5 rounded border border-white/5">
                  <span className="font-medium text-slate-300">{m.product}</span>
                  <span className={`font-bold ${m.change > 0 ? "text-[#00D68F]" : "text-red-400"}`}>{m.change > 0 ? `+${m.change}` : m.change}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
}