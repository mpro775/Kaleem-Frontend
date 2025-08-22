import type { MerchantInfo } from "./types";
import axios from "@/shared/api/axios"; // أو حسب مكان ملف axios الخاص بك

export const getMerchantInfo = async (
  merchantId: string
): Promise<MerchantInfo> => {
  const { data } = await axios.get(`/merchants/${merchantId}`);
  return data;
};

export const updateMerchantInfo = async (
  merchantId: string,
  info: Partial<MerchantInfo> // نستعمل Partial ليكون تحديث جزئي أو كامل
): Promise<void> => {
  await axios.put(`/merchants/${merchantId}`, info);
};
export async function uploadMerchantLogo(
  merchantId: string,
  file: File
): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  // اختر المسار الذي ستدعمه في الباك ايند:
  // مثال مقترح: POST /merchants/:id/logo  =>  { url: "https://..." }
  const { data } = await axios.post<{ url: string }>(
    `/merchants/${merchantId}/logo`,
    fd,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

// 2) التحقق من توفر الـ slug
export async function checkSlugAvailability(
  slug: string
): Promise<{ available: boolean }> {
  // مثال مقترح: GET /storefronts/slug/check?slug=xxx => { available: true/false }
  const { data } = await axios.get<{ available: boolean }>(
    `/storefronts/slug/check`,
    {
      params: { slug },
    }
  );
  return data;
}

// 3) تحديث slug للمتجر (حسب merchantId)
export async function updateStorefrontSlug(merchantId: string, slug: string) {
  // مثال مقترح: PATCH /storefronts/by-merchant/:id => { slug: "..." }
  const { data } = await axios.patch(`/storefronts/by-merchant/${merchantId}`, {
    slug,
  });
  return data;
}
