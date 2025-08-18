// src/api/settingsApi.ts
import axios from "axios";
import { API_BASE } from "../context/config";

export interface MerchantSettingsPayload {
  name: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  webhookUrl?: string;
  storeurl?: string;
  logoUrl?: string;
  address?: string;
  businessType?: string;
  businessDescription?: string;
  promptConfig?: {
    dialect?: string;
    tone?: string;
    template?: string;
  };
}

export const getMerchantSettings = async (
  token: string,
  merchantId: string
) => {
  const res = await axios.get(`${API_BASE}/merchants/${merchantId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateMerchantSettings = async (
  token: string,
  merchantId: string,
  settings: MerchantSettingsPayload
) => {
  const res = await axios.put(`${API_BASE}/merchants/${merchantId}`, settings, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
