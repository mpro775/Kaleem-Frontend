import type { Address, SubscriptionPlan } from "./shared";
import type { Channels } from "./channels";
import type { WorkingHour } from "./workingHour";
export interface MerchantSectionProps {
  initialData: MerchantInfo;
  onSave: (sectionData: Partial<MerchantInfo>) => Promise<void>;
  loading?: boolean;
}
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
export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  [key: string]: string | undefined;
}

export interface IncludeSections {
  products: boolean;
  instructions: boolean;
  categories: boolean;
  policies: boolean;
  custom: boolean;
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
export interface QuickConfig {
  dialect: string;
  tone: string;
  customInstructions: string[]; // مؤكد أنها لن تكون undefined
  sectionOrder: readonly string[]; // استخدام readonly للثوابت
  includeStoreUrl: boolean;
  includeAddress: boolean;
  includePolicies: boolean;
  includeWorkingHours: boolean;
  closingMessage?: string; // أو closingText إذا كنت تفضل
  customerServicePhone?: string;
  customerServiceWhatsapp?: string;
  includeClosingPhrase: boolean;
  closingText: string;
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
export interface MerchantInfo {
  _id: string;
  name: string;
  logoUrl?: string;
  phone?: string;
  slug?: string;
  banners?: Banner[];

  storefrontUrl?: string;
  businessDescription?: string;
  addresses: Address[];
  workingHours: WorkingHour[];
  returnPolicy?: string;
  email?: string;
  exchangePolicy?: string;
  shippingPolicy?: string;
  categories: string[];
  customCategory?: string;
  socialLinks?: SocialLinks;
  // يمكنك إضافة أي حقل آخر تريده من السكيمة حسب الحاجة
}
