// src/features/channels/model.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChannelKey, ChannelData } from "./constants";
import * as api from "./api";

export function useChannels(merchantId?: string) {
  return useQuery({
    enabled: !!merchantId,
    queryKey: ["channels", merchantId],
    queryFn: () => api.getMerchantChannels(merchantId!),
    staleTime: 60_000,
  });
}

export function useUpdateChannel(merchantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { key: ChannelKey; partial: Partial<ChannelData> }) =>
      api.patchChannel(merchantId!, vars.key, vars.partial),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["channels", merchantId] });
    },
  });
}
