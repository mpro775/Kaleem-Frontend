import axios from "@/shared/api/axios";

// أنواع عامة (استخدم أنواعك إن كانت موجودة)
export type Period = "week" | "month" | "quarter";
export type GroupBy = "day" | "week";
export type Overview = import("@/features/mechant/dashboard/type").Overview;
export type ChecklistGroup = import("@/features/mechant/dashboard/type").ChecklistGroup;

export async function getOverview(period: Period) {
  const { data } = await axios.get<Overview>(`/analytics/overview`, {
    params: { period },
  });
  return data;
}

export async function getProductsCount() {
  const { data } = await axios.get<{ total: number }>(
    `/analytics/products-count`
  );
  return data.total ?? 0;
}

export async function getMessagesTimeline(
  period: Period,
  groupBy: GroupBy = "day"
) {
  const { data } = await axios.get<import("@/features/mechant/dashboard/type").TimelinePoint[]>(
    `/analytics/messages-timeline`,
    { params: { period, groupBy } }
  );
  return data;
}

export async function getChecklist(merchantId: string) {
  const { data } = await axios.get<ChecklistGroup[]>(
    `/merchants/${merchantId}/checklist`
  );
  return data;
}

export async function skipChecklistItem(merchantId: string, itemKey: string) {
  await axios.post(`/merchants/${merchantId}/checklist/${itemKey}/skip`);
}
