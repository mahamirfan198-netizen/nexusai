import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { me, User } from "../lib/api";
interface AuthCtx { user: User | null; loading: boolean; setToken: (t: string, remember?: boolean) => void; logout: () => void; refresh: () => Promise<void>; }
const Ctx = createContext<AuthCtx>({} as AuthCtx);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    const t = localStorage.getItem("nexus_token") || sessionStorage.getItem("nexus_token");
    if (!t) { setUser(null); setLoading(false); return; }
    try { setUser(await me()); } catch { setUser(null); }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);
  const setToken = (t: string, remember: boolean = false) => {
    if (remember) { localStorage.setItem("nexus_token", t); } 
    else { sessionStorage.setItem("nexus_token", t); }
    refresh();
  };
  const logout = () => { localStorage.removeItem("nexus_token"); sessionStorage.removeItem("nexus_token"); setUser(null); };
  return <Ctx.Provider value={{ user, loading, setToken, logout, refresh }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);