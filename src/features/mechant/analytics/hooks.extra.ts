// src/features/mechant/analytics/hooks.extra.ts
import { useQuery } from "@tanstack/react-query";
import type { Period } from "./api";
import * as apiX from "./api.extra";

export function useTopProducts(period: Period, enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["analytics", "top-products", period],
    queryFn: () => apiX.getTopProducts(period, 8),
    staleTime: 60_000,
  });
}

export function useTopKeywords(period: Period, enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["analytics", "top-keywords", period],
    queryFn: () => apiX.getTopKeywords(period, 10),
    staleTime: 60_000,
  });
}

export function useMissingStats(period: Period, enabled = true) {
  const days = period === "week" ? 7 : period === "month" ? 30 : 90;
  return useQuery({
    enabled,
    queryKey: ["analytics", "missing-stats", days],
    queryFn: () => apiX.getMissingStats(days),
    staleTime: 30_000,
  });
}

export function useMissingList(period: Period, channel: apiX.Channel, enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["analytics", "missing-list", period, channel],
    queryFn: () => apiX.getMissingUnresolvedList({ page: 1, limit: 10, channel }),
    staleTime: 30_000,
  });
}

export function useFaqs(merchantId?: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!merchantId,
    queryKey: ["merchant", merchantId, "faqs"],
    queryFn: () => apiX.getFaqs(merchantId!),
    staleTime: 60_000,
  });
}
