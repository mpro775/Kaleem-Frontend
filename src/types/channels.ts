// src/types/channels.ts
export interface ChannelDetails {
  enabled?: boolean;
  phone?: string;
  token?: string;
  chatId?: string;
  webhookUrl?: string;
webchatWidget?: Record<string, unknown>;
}

export interface Channels {
  whatsapp?: ChannelDetails;
  telegram?: ChannelDetails;
  webchat?: ChannelDetails;
}
