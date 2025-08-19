import type { Address, SubscriptionPlan } from "@/types/shared";
import type { Channels } from "@/types/channels";
import type { WorkingHour } from "@/types/workingHour";
import type { QuickConfig } from "@/features/mechant/prompt-studio/types";

export type Storefront = {
  _id: string;
  merchant: string; // الـ merchantId
  slug: string; // لو عندك رابط ثابت للـ store
  domain?: string; // لو استخدمه التاجر بدومين خاص
  banners: Banner[]; // ما جبتها من الـ API
  primaryColor: string; // من themeOptions.primaryColor
  secondaryColor: string; // من themeOptions.secondaryColor
  buttonStyle: "rounded" | "square"; // من themeOptions.buttonStyle
  // أي حقول إضافية للعرض (مثلاً featuredProducts، شعار المتجر، إلخ)
};
export interface Banner {
  image?: string;
  text: string;
  url?: string;
  color?: string;
  active?: boolean;
  order?: number;
}



export interface AdvancedConfig {
  template: string;
  note?: string;
  updatedAt: string;
  // ISO date
}
export interface FinalPromptResponse {
  prompt: string;
}

export interface IncludeSections {
  products: boolean;
  instructions: boolean;
  categories: boolean;
  policies: boolean;
  custom: boolean;
}

export interface PromptConfig {
  dialect?: string;
  tone?: string;
  template?: string;
  include?: IncludeSections;
}

export interface Merchant {
  _id: string;
  name: string;
  userId: string;

  storefrontUrl?: string;
  logoUrl?: string;
  address?: Address;
  subscription: SubscriptionPlan;
  categories: string[];
  domain?: string;
  phone: string;
  businessType?: string;
  businessDescription?: string;
  workflowId?: string;
  quickConfig: QuickConfig;
  currentAdvancedConfig: AdvancedConfig;
  status: "active" | "inactive" | "suspended";
  lastActivity?: string; // ISO date string
  advancedConfigHistory: AdvancedConfig[];
  finalPromptTemplate: string;
  returnPolicy: string;
  exchangePolicy: string;
  shippingPolicy: string;
  channels: Channels;
  workingHours: WorkingHour[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
export interface PreviewPromptDto {
  quickConfig?: Partial<QuickConfig>;
  useAdvanced: boolean;
  testVars: Record<string, string>;
}

export interface PreviewResponse {
  preview: string;
}

