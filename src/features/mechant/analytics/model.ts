import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";

export function useOverview(period: api.Period) {
  return useQuery({
    queryKey: ["analytics", "overview", period],
    queryFn: () => api.getOverview(period),
    staleTime: 60_000, // دقيقة
  });
}

export function useProductsCount() {
  return useQuery({
    queryKey: ["analytics", "products-count"],
    queryFn: api.getProductsCount,
    staleTime: 60_000,
  });
}

export function useMessagesTimeline(period: api.Period, groupBy: api.GroupBy = "day") {
  return useQuery({
    queryKey: ["analytics", "messages-timeline", period, groupBy],
    queryFn: () => api.getMessagesTimeline(period, groupBy),
    staleTime: 30_000,
  });
}

export function useChecklist(merchantId?: string) {
  return useQuery({
    enabled: !!merchantId,
    queryKey: ["merchant", merchantId, "checklist"],
    queryFn: () => api.getChecklist(merchantId!),
  });
}

export function useSkipChecklist(merchantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemKey: string) => api.skipChecklistItem(merchantId!, itemKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchant", merchantId, "checklist"] });
    },
  });
}
