// src/features/mechant/analytics/api.ts
import axios from "@/shared/api/axios";

export type Period = "week" | "month" | "quarter";
export type GroupBy = "day" | "week";
export type Overview = import("@/features/mechant/dashboard/type").Overview;
export type ChecklistGroup = import("@/features/mechant/dashboard/type").ChecklistGroup;

const ensureArray = <T,>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : []);

export async function getOverview(period: Period) {
  const res = await axios.get<Overview>(`/analytics/overview`, { params: { period } });
  return res.data; // ✅ حمولة مباشرة
}

export async function getProductsCount() {
  const res = await axios.get<{ total: number } | number>(`/analytics/products-count`);
  const payload: any = res.data;
  return typeof payload === "number" ? payload : (payload?.total ?? 0); // ✅ رقم دائمًا
}

export async function getMessagesTimeline(period: Period, groupBy: GroupBy = "day") {
  const res = await axios.get<import("@/features/mechant/dashboard/type").TimelinePoint[]>(
    `/analytics/messages-timeline`,
    { params: { period, groupBy } }
  );
  return ensureArray(res.data); // ✅ مصفوفة دائمًا
}

export async function getChecklist(merchantId: string) {
  const res = await axios.get<ChecklistGroup[]>(`/merchants/${merchantId}/checklist`);
  return ensureArray<ChecklistGroup>(res.data); // ✅ مصفوفة مباشرة (لا {data: []})
}

export async function skipChecklistItem(merchantId: string, itemKey: string) {
  await axios.post(`/merchants/${merchantId}/checklist/${itemKey}/skip`);
}
