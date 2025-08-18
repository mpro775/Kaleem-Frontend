import axios from "./axios"; // هذا هو instance الجاهز
import type { QuickConfig, AdvancedConfig, Merchant } from "../types/merchant";

// يمكن وضع baseURL في .env

export const getMerchant = (id: string) =>
  axios.get<Merchant>(`/merchants/${id}`).then(res => res.data);

export const updateQuickConfig = (id: string, data: Partial<QuickConfig>) =>
  axios.patch(`/merchants/${id}/quick-config`, data);

export const updateAdvancedConfig = (id: string, data: Partial<AdvancedConfig>) =>
  axios.patch(`/merchants/${id}/advanced-config`, data);

export const getPromptPreview = (id: string, data: { quickConfig: QuickConfig; advancedConfig: AdvancedConfig }) =>
  axios.post(`/merchants/${id}/prompt-preview`, data);
