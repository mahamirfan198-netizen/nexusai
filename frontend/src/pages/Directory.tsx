import { useState } from "react";
import { Search, Mail, Phone, BookOpen, Briefcase } from "lucide-react";

export default function Directory() {
  const [search, setSearch] = useState("");

  // Mock Data for Instructors/Support
  const directory = [
    { name: "Dr. Sarah Ahmed", role: "Physics Instructor", email: "sarah@nexusai.com", phone: "+92 300 1234567", type: "Education" },
    { name: "Prof. Ali Khan", role: "Mathematics Instructor", email: "ali@nexusai.com", phone: "+92 300 7654321", type: "Education" },
    { name: "Mr. David Smith", role: "Business Operations Manager", email: "david@nexusai.com", phone: "+92 300 1112223", type: "Business" },
    { name: "Ms. Fatima Noor", role: "Business Support Specialist", email: "fatima@nexusai.com", phone: "+92 300 4445556", type: "Business" },
  ];

  const filtered = directory.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.role.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#03060a] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Support Directory</h1>
        <p className="text-[#A8B3C2] mb-8">Find instructors and managers to help you with your journey.</p>
        
        <div className="relative mb-8">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or role..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 rounded-xl focus:outline-none focus:border-[#00D68F] text-white"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((person, i) => (
            <div key={i} className="bg-[#0B1724]/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:border-[#00D68F]/50 transition">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    {person.type === "Education" ? <BookOpen className="w-6 h-6 text-[#00D68F]" /> : <Briefcase className="w-6 h-6 text-[#48D9F5]" />}
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${person.type === "Education" ? "bg-[#00D68F]/20 text-[#00D68F]" : "bg-[#48D9F5]/20 text-[#48D9F5]"}`}>
                    {person.type}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{person.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{person.role}</p>
              </div>
              <div className="space-y-2 border-t border-white/10 pt-4 text-sm text-slate-300">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500" /> {person.email}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-500" /> {person.phone}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}