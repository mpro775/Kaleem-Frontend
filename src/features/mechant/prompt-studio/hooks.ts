// src/features/prompt-studio/hooks.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UseFormReset, UseFormWatch } from "react-hook-form";
import { promptApi } from "./api";
import { DEFAULT_SECTION_ORDER, areEqualQuickConfigs, type QuickConfig } from "./types";

type Args = {
  token?: string | null;
  merchantId?: string | null;
  activeTab: "quick" | "advanced";
  reset: UseFormReset<QuickConfig>;
  watch: UseFormWatch<QuickConfig>;
};

export function usePromptStudio({ token, merchantId, activeTab, reset, watch }: Args) {
  const safeToken = token ?? "";
  const safeMerchant = merchantId ?? "";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [advancedTemplate, setAdvancedTemplate] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<string>("");

  // initial fetch
  useEffect(() => {
    if (!safeToken || !safeMerchant) return;

    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const [quickConfig, advTemplate, finalPrompt] = await Promise.all([
          promptApi.getQuickConfig(safeToken, safeMerchant),
          promptApi.getAdvancedTemplate(safeToken, safeMerchant),
          promptApi.getFinalPrompt(safeToken, safeMerchant),
        ]);

        if (!mounted) return;

        reset({
          dialect: quickConfig.dialect,
          tone: quickConfig.tone,
          customInstructions: quickConfig.customInstructions,
          sectionOrder: quickConfig.sectionOrder,
          includeStoreUrl: quickConfig.includeStoreUrl,
          includeAddress: quickConfig.includeAddress,
          includePolicies: quickConfig.includePolicies,
          includeWorkingHours: quickConfig.includeWorkingHours,
          includeClosingPhrase: quickConfig.includeClosingPhrase,
          closingText: quickConfig.closingText,
        });

        setAdvancedTemplate(advTemplate);
        setPreviewContent(finalPrompt);
        setLastUpdated(new Date());
      } catch (e) {
        // يمكنك إضافة toast هنا
        // console.error(e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [safeToken, safeMerchant, reset]);

  // live preview (quick)
  useEffect(() => {
    if (!safeToken || !safeMerchant) return;
    if (activeTab !== "quick") return;

    let lastValues: QuickConfig | null = null;
    const sub = watch((values) => {
      const filteredCustom = (values.customInstructions ?? []).filter(Boolean) as string[];
      const filteredOrder = (values.sectionOrder ?? DEFAULT_SECTION_ORDER.slice()).filter(Boolean) as string[];

      const safeValues: QuickConfig = {
        dialect: values.dialect ?? "خليجي",
        tone: values.tone ?? "ودّي",
        customInstructions: filteredCustom,
        sectionOrder: filteredOrder.length ? filteredOrder : [...DEFAULT_SECTION_ORDER],
        includeStoreUrl: values.includeStoreUrl ?? true,
        includeAddress: values.includeAddress ?? true,
        includePolicies: values.includePolicies ?? true,
        includeWorkingHours: values.includeWorkingHours ?? true,
        includeClosingPhrase: values.includeClosingPhrase ?? true,
        closingText: values.closingText ?? "هل أقدر أساعدك بشي ثاني؟ 😊",
      };

      if (lastValues && areEqualQuickConfigs(safeValues, lastValues)) return;
      lastValues = safeValues;

      const id = setTimeout(async () => {
        try {
          const preview = await promptApi.previewQuick(safeToken, safeMerchant, safeValues);
          setPreviewContent(preview);
          setLastUpdated(new Date());
        } catch {
          /* ignore */
        }
      }, 500);

      return () => clearTimeout(id);
    });

    return () => sub.unsubscribe();
  }, [safeToken, safeMerchant, activeTab, watch]);

  // manual preview for toolbar refresh (quick/advanced)
  const handleManualPreview = useCallback(async () => {
    if (!safeToken || !safeMerchant) {
      setPreviewContent("غير مصرح");
      return;
    }
    const current = watch();

    const quick: QuickConfig = {
      dialect: current.dialect || "خليجي",
      tone: current.tone || "ودّي",
      customInstructions: current.customInstructions || [],
      sectionOrder: current.sectionOrder || DEFAULT_SECTION_ORDER.slice(),
      includeStoreUrl: current.includeStoreUrl ?? true,
      includeAddress: current.includeAddress ?? true,
      includePolicies: current.includePolicies ?? true,
      includeWorkingHours: current.includeWorkingHours ?? true,
      includeClosingPhrase: current.includeClosingPhrase ?? true,
      closingText: current.closingText || "هل أقدر أساعدك بشي ثاني؟ 😊",
    };

    try {
      const preview =
        activeTab === "advanced"
          ? await promptApi.previewAdvanced(safeToken, safeMerchant, quick)
          : await promptApi.previewQuick(safeToken, safeMerchant, quick);

      setPreviewContent(preview);
      setLastUpdated(new Date());
    } catch {
      setPreviewContent("خطأ في جلب المعاينة من الخادم");
    }
  }, [safeToken, safeMerchant, activeTab, watch]);

  // save quick
  const handleSaveQuickConfig = useCallback(
    async (data: QuickConfig) => {
      if (!safeToken || !safeMerchant) return;
      setIsSaving(true);
      try {
        const updated = await promptApi.updateQuickConfig(safeToken, safeMerchant, data);
        // sync form with server response
        reset(updated);
        setLastUpdated(new Date());
      } finally {
        setIsSaving(false);
      }
    },
    [safeToken, safeMerchant, reset]
  );

  // save advanced
  const handleSaveAdvancedTemplate = useCallback(
    async () => {
      if (!safeToken || !safeMerchant) return;
      setIsSaving(true);
      try {
        await promptApi.saveAdvancedTemplate(safeToken, safeMerchant, advancedTemplate, "تعديل يدوي");
        setLastUpdated(new Date());
        await handleManualPreview();
      } finally {
        setIsSaving(false);
      }
    },
    [safeToken, safeMerchant, advancedTemplate, handleManualPreview]
  );

  return {
    isLoading,
    isSaving,
    lastUpdated,
    previewContent,
    advancedTemplate,
    setAdvancedTemplate,
    handleManualPreview,
    handleSaveQuickConfig,
    handleSaveAdvancedTemplate,
  };
}
