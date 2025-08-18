// src/types/shared.ts

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface SubscriptionPlan {
  tier: string;
  startDate: string;    // ISO date
  endDate?: string;     // ISO date
}

export interface QuickConfig {
  dialect: string;
  tone: string;
  customInstructions: string[];
  sectionOrder: string[];
  includeStoreUrl?: boolean;
  includeAddress?: boolean;
  includePolicies?: boolean;
  includeWorkingHours?: boolean;
  includeClosingPhrase?: boolean;
  closingText?: string;
}

export interface AdvancedConfig {
  template: string;
  note?: string;
  updatedAt: string;   
   // ISO date
}
