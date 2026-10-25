import axios from "axios";
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000" });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("nexus_token") || sessionStorage.getItem("nexus_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use((r) => r, (e) => {
  if (e.response?.status === 401) { localStorage.removeItem("nexus_token"); sessionStorage.removeItem("nexus_token"); window.location.href = "/login"; }
  return Promise.reject(e);
});
export type UserRole = "student" | "teacher" | "education_admin" | "inventory_operator" | "business_manager" | "business_admin" | "platform_admin";
export interface User { id: string; email: string; full_name: string; roles: string; active_portal: "education" | "business"; }
export async function login(email: string, password: string): Promise<string> {
  const { data } = await api.post("/api/auth/login", { email, password }); return data.access_token;
}
export async function demoLogin(portal: string): Promise<string> {
  const { data } = await api.post("/api/auth/demo-login", { portal }); return data.access_token;
}
export async function register(payload: any): Promise<User> {
  const { data } = await api.post("/api/auth/register", payload); return data;
}
export async function me(): Promise<User> {
  const { data } = await api.get("/api/auth/me"); return data;
}