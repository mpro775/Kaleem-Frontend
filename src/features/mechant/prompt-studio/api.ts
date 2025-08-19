// src/features/prompt-studio/api.ts

import {
  getQuickConfig as getQuickConfigRaw,
  updateQuickConfig as updateQuickConfigRaw,
  getFinalPrompt,
  getAdvancedTemplate,
  saveAdvancedTemplate,
  previewPrompt as previewPromptRaw, // ملاحظة: سنلفّه بوظيفة محلية لإضافة audience
} from "@/api/merchantsApi";
import type { PreviewPromptDto, QuickConfig } from "./types";

const DEFAULT_TEST_VARS = {
  productName: "هاتف ذكي",
  customerName: "أحمد محمد",
};

// توحيد الشكل الداخل/الخارج
const mapToMerchantQuickConfig = (q: QuickConfig): QuickConfig => ({
  dialect: q.dialect,
  tone: q.tone,
  customInstructions: Array.isArray(q.customInstructions)
    ? q.customInstructions
    : [],
  includeClosingPhrase: q.includeClosingPhrase,
  closingText: q.closingText,
  customerServicePhone: q.customerServicePhone,
  customerServiceWhatsapp: q.customerServiceWhatsapp,
});

const mapFromMerchantQuickConfig = (q: QuickConfig): QuickConfig => ({
  dialect: q.dialect,
  tone: q.tone,
  customInstructions: Array.isArray(q.customInstructions)
    ? q.customInstructions
    : [],
  includeClosingPhrase: !!q.includeClosingPhrase,
  closingText: q.closingText,
  customerServicePhone: q.customerServicePhone,
  customerServiceWhatsapp: q.customerServiceWhatsapp,
});

// ====== غلاف (Wrapper) لدعوة المعاينة مع دعم audience محليًا ======
type PreviewBody = {
  quickConfig?: Partial<QuickConfig>;
  useAdvanced: boolean;
  testVars: Record<string, string>;
  audience?: "merchant" | "agent";
};

async function postPreview(
  token: string,
  merchantId: string,
  body: PreviewBody
): Promise<string> {
  // نمرّر body كـ any لتجاوز فروق التعريفات إن كانت النسخة القديمة لا تحتوي audience
  const res: unknown = await previewPromptRaw(
    token,
    merchantId,
    body as unknown as PreviewPromptDto
  );
  // بعض الـ APIs تعيد { preview }, وبعضها تعيد string مباشرة
  if (typeof res === "string") return res;
  if (
    typeof res === "object" &&
    res !== null &&
    "preview" in res &&
    typeof (res as { preview?: unknown }).preview === "string"
  ) {
    return (res as { preview: string }).preview;
  }
  return "";
}

// اقتراح قالب متقدم عند عدم وجوده في الخادم
async function getAdvancedTemplateSuggested(
  token: string,
  merchantId: string,
  quickConfig?: Partial<QuickConfig>
): Promise<{ template: string }> {
  const template = await postPreview(token, merchantId, {
    quickConfig,
    useAdvanced: true,
    testVars: DEFAULT_TEST_VARS,
    audience: "merchant", // Final بدون أقسام الحارس (مناسب للمحرر)
  });
  return { template };
}

export const promptApi = {
  // QuickConfig
  getQuickConfig: async (token: string, merchantId: string) => {
    const cfg = await getQuickConfigRaw(token, merchantId);
    return mapFromMerchantQuickConfig(cfg);
  },

  updateQuickConfig: async (
    token: string,
    merchantId: string,
    config: QuickConfig
  ) =>
    updateQuickConfigRaw(token, merchantId, mapToMerchantQuickConfig(config)),

  // Final prompt (نص النظام الكامل للاستخدام الداخلي فقط)
  getFinalPrompt,

  // Advanced template (قد يعيد نصًا فارغًا إن لم يُحفظ من قبل)
  getAdvancedTemplate,

  // حفظ القالب المتقدم
  saveAdvancedTemplate,

  // المعاينة (مغلّفة) — توحيد المخرجات كسلسلة نصية
  previewPrompt: postPreview,

  // معاينة سريعة (Quick) — Final للتاجر بدون أقسام الحارس
  previewQuick: (token: string, merchantId: string, quickConfig: QuickConfig) =>
    postPreview(token, merchantId, {
      quickConfig,
      useAdvanced: false,
      testVars: DEFAULT_TEST_VARS,
      audience: "merchant",
    }),

  // معاينة القالب المتقدم — Final للتاجر بدون أقسام الحارس
  previewAdvanced: (
    token: string,
    merchantId: string,
    quickConfig: QuickConfig
  ) =>
    postPreview(token, merchantId, {
      quickConfig,
      useAdvanced: true,
      testVars: DEFAULT_TEST_VARS,
      audience: "merchant",
    }),

  // اقتراح قالب متقدم عند عدم وجود واحد محفوظ
  getAdvancedTemplateSuggested,
};
