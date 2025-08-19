// api/storefrontApi.ts
import axios from "./axios";
import type { Storefront } from "../types/merchant";

export const getStorefrontInfo = async (merchantId: string) => {
  const { data } = await axios.get<Storefront>(`/storefront/merchant/${merchantId}`);
  return data;
};

export const updateStorefrontInfo = async (
  merchantId: string,
  payload: Partial<Storefront>
) => {
  // ✅ المسار الصحيح للتحديث بحسب معرف التاجر
  const { data } = await axios.patch<Storefront>(
    `/storefront/by-merchant/${merchantId}`,
    payload
  );
  return data;
};

// (اختياري) فحص توفر السلاج
export const checkSlug = async (slug: string) => {
  const { data } = await axios.get<{ available: boolean }>(`/storefront/slug/check`, {
    params: { slug },
  });
  return data;
};
