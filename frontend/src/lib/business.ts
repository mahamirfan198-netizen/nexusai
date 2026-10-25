import { api } from "./api";

export interface Product { id: string; name: string; sku: string; category: string; quantity: number; reorder_level: number; unit_cost: number; }
export interface DashboardData { total_products: number; total_value: number; low_stock_count: number; recent_movements: any[]; }
export interface ActionCase { id: string; product: string; issue: string; recommendation: string; }

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get("/api/business/products"); return data;
}
export async function createProduct(p: any): Promise<Product> {
  const { data } = await api.post("/api/business/products", p); return data;
}
export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get("/api/business/dashboard"); return data;
}
export async function recordMovement(payload: any) {
  const { data } = await api.post("/api/business/movements", payload); return data;
}
export async function getActionLab(): Promise<ActionCase[]> {
  const { data } = await api.get("/api/business/action-lab"); return data;
}
export async function approveAction(id: string) {
  const { data } = await api.post("/api/business/action-lab/" + id + "/approve"); return data;
}