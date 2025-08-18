import type { Category } from "../types/Category";
import axios from "./axios";

// جلب جميع الفئات
export async function getCategories(): Promise<Category[]> {
  const { data } = await axios.get<{ data: Category[] }>("/categories");
  return data.data ?? data;
}

// إنشاء فئة
export async function createCategory(payload: { name: string; parent?: string; image?: string;merchantId:string; }): Promise<Category> {
  const { data } = await axios.post<Category>("/categories", payload);
  return data;
}

// تعديل فئة
export async function updateCategory(id: string, payload: { name?: string; parent?: string; image?: string;merchantId:string; }): Promise<Category> {
  const { data } = await axios.put<Category>(`/categories/${id}`, payload);
  return data;
}

// حذف فئة
export async function deleteCategory(id: string): Promise<void> {
  await axios.delete(`/categories/${id}`);
}
