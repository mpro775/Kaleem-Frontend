import type {  Merchant,  PreviewPromptDto,  PreviewResponse,  QuickConfig } from "../types/merchant";
import { API_BASE } from "../context/config";
import axios from "axios";
import type { ChannelDetails, Channels } from "../types/channels";

const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});
export async function previewPrompt(
  token: string,
  merchantId: string,
  dto: PreviewPromptDto
): Promise<string> {
  try {
    const res = await axios.post<PreviewResponse>(
      `${API_BASE}/merchants/${merchantId}/prompt/preview`,
      {
        quickConfig: {
          dialect: dto.quickConfig?.dialect || "خليجي",
          tone: dto.quickConfig?.tone || "ودّي",
          customInstructions: dto.quickConfig?.customInstructions || [],
          sectionOrder: dto.quickConfig?.sectionOrder || [],
          includeStoreUrl: dto.quickConfig?.includeStoreUrl ?? true,
          includeAddress: dto.quickConfig?.includeAddress ?? true,
          includePolicies: dto.quickConfig?.includePolicies ?? true,
          includeWorkingHours: dto.quickConfig?.includeWorkingHours ?? true,
          includeClosingPhrase: dto.quickConfig?.includeClosingPhrase ?? true,
          closingText: dto.quickConfig?.closingText || "هل أقدر أساعدك بشي ثاني؟ 😊",
        },
        useAdvanced: dto.useAdvanced,
        testVars: dto.testVars,
      },
      authHeader(token)
    );
    return res.data.preview;
  } catch (error) {
    console.error("Error in previewPrompt:", error);
    throw error;
  }
}

// src/api/merchantsApi.ts
export async function getFinalPrompt(
  token: string,
  merchantId: string,
): Promise<string> {
  const res = await axios.get<{ prompt: string }>(
    `${API_BASE}/merchants/${merchantId}/prompt/final-prompt`,
    authHeader(token),
  );
  return res.data.prompt;
}
/** جلب إعدادات القنوات كلها */
export async function getChannels(
  token: string,
  merchantId: string
): Promise<Channels> {
  const res = await axios.get<Channels>(
    `${API_BASE}/merchants/${merchantId}/channels`,
    authHeader(token)
  );
  return res.data;
}

/** تحديث قناة مفردة */
export async function updateChannel(
  token: string,
  merchantId: string,
  channelType: keyof Channels,
  details: ChannelDetails
): Promise<ChannelDetails> {
  const res = await axios.patch<ChannelDetails>(
    `${API_BASE}/merchants/${merchantId}/channels/${channelType}`,
    details,
    authHeader(token)
  );
  return res.data;
}
/**
 * جلب بيانات التاجر
 */
export async function getMerchantById(
  token: string,
  merchantId: string
): Promise<Merchant> {
  const res = await axios.get<Merchant>(
    `${API_BASE}/merchants/${merchantId}`,
    authHeader(token)
  );
  return res.data;
}

/**
 * تحديث إعدادات promptConfig فقط
 */


/**
 * تحديث بيانات التاجر العامة
 */
export async function updateMerchant(
  token: string,
  merchantId: string,
  updates: Partial<
    Omit<
      Merchant,
      | "_id"
      | "userId"
      | "finalPromptTemplate"
      | "workflowId"
      | "trialEndsAt"
      | "subscriptionExpiresAt"
    >
  >
): Promise<Merchant> {
  const res = await axios.put<Merchant>(
    `${API_BASE}/merchants/${merchantId}`,
    updates,
    authHeader(token)
  );
  return res.data;
}
// src/api/merchantsApi.ts

// جلب الـQuickConfig
export async function getQuickConfig(
  token: string,
  merchantId: string
): Promise<QuickConfig> {
  const res = await axios.get<QuickConfig>(
    `${API_BASE}/merchants/${merchantId}/prompt/quick-config`,
    authHeader(token)
  );
  return res.data;
}

// تحديث الـQuickConfig
export async function updateQuickConfig(
  token: string,
  merchantId: string,
  config: QuickConfig
): Promise<QuickConfig> {
  const res = await axios.patch<QuickConfig>(
    `${API_BASE}/merchants/${merchantId}/prompt/quick-config`,
    config,
    authHeader(token)
  );
  return res.data;
}

// جلب الـAdvancedTemplate
export async function getAdvancedTemplate(
  token: string,
  merchantId: string
): Promise<string> {
  const res = await axios.get<{ advancedTemplate: string }>(
    `${API_BASE}/merchants/${merchantId}/prompt/advanced-template`,
    authHeader(token)
  );
  return res.data.advancedTemplate;
}

// حفظ الـAdvancedTemplate
export async function saveAdvancedTemplate(
  token: string,
  merchantId: string,
  template: string,
  note?: string
): Promise<void> {
  await axios.post(
    `${API_BASE}/merchants/${merchantId}/prompt/advanced-template`,
    { advancedTemplate: template, note },
    authHeader(token)
  );
}
