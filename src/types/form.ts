// src/types/form.ts
export interface FormAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface MerchantForm {
  name: string;
  logoUrl?: string;
  phone?: string;
  storefrontUrl?: string;
  businessType?: string;
  businessDescription?: string;
  categories: string[];
  returnPolicy?: string;
  exchangePolicy?: string;
  shippingPolicy?: string;
  address?: FormAddress;
  workingHours: {
    day: string;
    openTime: string;
    closeTime: string;
  }[];
}
