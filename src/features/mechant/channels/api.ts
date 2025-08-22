// src/features/channels/api.ts
import axios from "@/shared/api/axios";
import type { ChannelsMap, ChannelKey, ChannelData } from "./constants";

export async function getMerchantChannels(
  merchantId: string
): Promise<ChannelsMap> {
  const { data } = await axios.get(`/merchants/${merchantId}`);
  return (data?.channels ?? {}) as ChannelsMap;
}

export async function patchChannel(
  merchantId: string,
  key: ChannelKey,
  partial: Partial<ChannelData>
) {
  // الـ Backend يدعم PATCH /merchants/:id/channels/:key
  return axios.patch(`/merchants/${merchantId}/channels/${key}`, partial);
}

export async function deleteChannel(
  merchantId: string,
  key: ChannelKey,
  mode: "disable" | "disconnect" | "wipe" = "disable"
) {
  return axios.delete(`/merchants/${merchantId}/channels/${key}`, {
    params: { mode },
  });
}
