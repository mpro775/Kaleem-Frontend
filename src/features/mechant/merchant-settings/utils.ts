// src/features/merchant-settings/utils.ts
import type { MerchantInfo } from "@/features/mechant/merchant-settings/types";



export const filterUpdatableFields = (
  data: MerchantInfo
): Partial<MerchantInfo> => {
  const {
    name,
    logoUrl,
    slug,
    phone,
    storefrontUrl,
    businessDescription,
    addresses,
    workingHours,
    returnPolicy,
    exchangePolicy,
    shippingPolicy,
    socialLinks,
    customCategory,
  } = data;

  return {
    name,
    logoUrl,
    slug,
    phone,
    storefrontUrl,
    businessDescription,
    addresses,
    workingHours,
    returnPolicy,
    exchangePolicy,
    shippingPolicy,
    socialLinks,
    customCategory,
  };
};
