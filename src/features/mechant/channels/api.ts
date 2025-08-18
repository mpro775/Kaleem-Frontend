// src/features/channels/api.ts
import axios from "@/api/axios";
import type { ChannelsMap, ChannelKey, ChannelData } from "./constants";

export async function getMerchantChannels(merchantId: string): Promise<ChannelsMap> {
  const { data } = await axios.get(`/merchants/${merchantId}`);
  // نتوقع data.channels = { telegram: {...}, whatsappQr: {...}, ... }
  return (data?.channels ?? {}) as ChannelsMap;
}

export async function patchChannel(
  merchantId: string,
  key: ChannelKey,
  partial: Partial<ChannelData>
) {
  // غيّر المسار لو عندك endpoint أدقّ (مثلاً /merchants/:id/channels/:key)
  return axios.patch(`/merchants/${merchantId}`, {
    channels: { [key]: partial },
  });
}
