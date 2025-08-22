// api/storefrontApi.ts
import axios from "@/shared/api/axios";
import type { Storefront } from "@/features/mechant/storefront-theme/type";

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
export const uploadBannerImages = async (merchantId: string, files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));

  const { data } = await axios.post<{
    urls: string[];
    accepted: number;
    remaining: number;
    max: number;
  }>(`/storefront/by-merchant/${merchantId}/banners/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};
// (اختياري) فحص توفر السلاج
export const checkSlug = async (slug: string) => {
  const { data } = await axios.get<{ available: boolean }>(`/storefront/slug/check`, {
    params: { slug },
  });
  return data;
};
