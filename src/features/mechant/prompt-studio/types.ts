// src/features/prompt-studio/types.ts

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

  

  export interface PreviewPromptDto {
    quickConfig?: Partial<QuickConfig>;
    useAdvanced: boolean;
    testVars: Record<string, string>;
  }
  
  export interface PreviewResponse {
    preview: string;
  }
  
export const DEFAULT_SECTION_ORDER = [
  "products",
  "instructions",
  "categories",
  "policies",
  "custom",
] as const;

export type SectionKey = typeof DEFAULT_SECTION_ORDER[number];

export function areEqualQuickConfigs(a: any, b: any) {
  return (
    a?.dialect === b?.dialect &&
    a?.tone === b?.tone &&
    a?.includeStoreUrl === b?.includeStoreUrl &&
    a?.includeAddress === b?.includeAddress &&
    a?.includePolicies === b?.includePolicies &&
    a?.includeWorkingHours === b?.includeWorkingHours &&
    a?.includeClosingPhrase === b?.includeClosingPhrase &&
    a?.closingText === b?.closingText &&
    Array.isArray(a?.customInstructions) &&
    Array.isArray(b?.customInstructions) &&
    a.customInstructions.length === b.customInstructions.length &&
    a.customInstructions.every((v: string, i: number) => v === b.customInstructions[i]) &&
    Array.isArray(a?.sectionOrder) &&
    Array.isArray(b?.sectionOrder) &&
    a.sectionOrder.length === b.sectionOrder.length &&
    a.sectionOrder.every((v: string, i: number) => v === b.sectionOrder[i])
  );
}
