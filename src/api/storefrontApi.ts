// api/storefrontApi.ts
import axios from "./axios"; // هذا هو instance الجاهز
import type { Storefront } from "../types/merchant";

export const getStorefrontInfo = async (merchantId: string) => {
  const { data } = await axios.get<Storefront>(`/store/merchant/${merchantId}`);
  return data;
};

export const updateStorefrontInfo = async (
  merchantId: string,
  payload: Partial<Storefront>
) => {
  const { data } = await axios.patch<Storefront>(
    `/store/merchant/${merchantId}`,
    payload
  );
  return data;
};
