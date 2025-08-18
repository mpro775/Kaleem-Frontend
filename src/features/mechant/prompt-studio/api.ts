// src/features/prompt-studio/api.ts
import {
    getQuickConfig,
    updateQuickConfig,
    getFinalPrompt,
    getAdvancedTemplate,
    saveAdvancedTemplate,
    previewPrompt,
  } from "@/api/merchantsApi";
  import type { QuickConfig } from "./types";
  
  export const promptApi = {
    getQuickConfig,
    updateQuickConfig,
    getFinalPrompt,
    getAdvancedTemplate,
    saveAdvancedTemplate,
    previewPrompt,
    // sugar helpers
    previewQuick: (
      token: string,
      merchantId: string,
      quickConfig: QuickConfig
    ) =>
      previewPrompt(token, merchantId, {
        quickConfig,
        useAdvanced: false,
        testVars: {},
      }),
    previewAdvanced: (
      token: string,
      merchantId: string,
      quickConfig: QuickConfig
    ) =>
      previewPrompt(token, merchantId, {
        quickConfig,
        useAdvanced: true,
        testVars: {},
      }),
  };
  