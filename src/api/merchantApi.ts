import type { MerchantInfo } from "../types/merchant";
import axios from "./axios"; // أو حسب مكان ملف axios الخاص بك

export const getMerchantInfo = async (merchantId: string): Promise<MerchantInfo> => {
  const { data } = await axios.get(`/merchants/${merchantId}`);
  return data;
};

export const updateMerchantInfo = async (
  merchantId: string,
  info: Partial<MerchantInfo> // نستعمل Partial ليكون تحديث جزئي أو كامل
): Promise<void> => {
  await axios.put(`/merchants/${merchantId}`, info);
};