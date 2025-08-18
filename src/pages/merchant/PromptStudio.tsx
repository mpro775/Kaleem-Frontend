// src/components/PromptStudio.tsx
import { useForm, FormProvider } from "react-hook-form";
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { styled } from "@mui/system";

import type { QuickConfig } from "../../types/merchant";
import { PromptToolbar } from "../../components/prompet/PromptToolbar";
import { QuickSetupPane } from "../../components/prompet/QuickSetupPane";
import { LivePreviewPane } from "../../components/prompet/LivePreviewPane";
import { AdvancedTemplatePane } from "../../components/prompet/AdvancedTemplatePane";
import { ChatSimulator } from "../../components/prompet/ChatSimulator";
import { useAuth } from "../../context/AuthContext";

import {
  getQuickConfig,
  updateQuickConfig,
  getFinalPrompt,
  getAdvancedTemplate,
  saveAdvancedTemplate,
  previewPrompt,
} from "../../api/merchantsApi";

const StudioContainer = styled(Box)(({ theme }) => ({
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.default,
}));

const LoadingContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});

const DEFAULT_SECTION_ORDER = [
  "products",
  "instructions",
  "categories",
  "policies",
  "custom",
] as string[];

const ContentGrid = styled(Box, {
  shouldForwardProp: (prop) => prop !== "activeTab",
})<{ activeTab: "quick" | "advanced" }>(({ theme, activeTab }) => ({
  display: "grid",
  gridTemplateColumns: activeTab === "quick" ? "2fr 3fr" : "3fr 1fr",
  flexGrow: 1,
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  overflow: "hidden",
  [theme.breakpoints.down("lg")]: { gridTemplateColumns: "1fr" },
  [theme.breakpoints.down("md")]: { gridTemplateColumns: "1fr" },
}));

export default function PromptStudio() {
  const { token, user } = useAuth();
  const merchantId = user?.merchantId;

  const [activeTab, setActiveTab] = useState<"quick" | "advanced">("quick");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [advancedTemplate, setAdvancedTemplate] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<string>("");

  // إعداد النموذج مع الحقول الجديدة مستقبلاً
  const quickFormMethods = useForm<QuickConfig>({
    defaultValues: {
      dialect: "خليجي",
      tone: "ودّي",
      customInstructions: [],
      sectionOrder: [...DEFAULT_SECTION_ORDER],
      includeStoreUrl: true,
      includeAddress: true,
      includePolicies: true,
      includeWorkingHours: true,
      includeClosingPhrase: true,
      closingText: "هل أقدر أساعدك بشي ثاني؟ 😊",
      // أضف هنا أي حقول جديدة مثل customerServicePhone إذا أردت مستقبلاً
    },
  });

  const areEqualQuickConfigs = (a: QuickConfig, b: QuickConfig) => {
    return (
      a.dialect === b.dialect &&
      a.tone === b.tone &&
      a.includeStoreUrl === b.includeStoreUrl &&
      a.includeAddress === b.includeAddress &&
      a.includePolicies === b.includePolicies &&
      a.includeWorkingHours === b.includeWorkingHours &&
      a.includeClosingPhrase === b.includeClosingPhrase &&
      a.closingText === b.closingText &&
      a.customInstructions.length === b.customInstructions.length &&
      a.customInstructions.every((val, i) => val === b.customInstructions[i]) &&
      a.sectionOrder.length === b.sectionOrder.length &&
      a.sectionOrder.every((val, i) => val === b.sectionOrder[i])
    );
  };

  const {  reset, watch } = quickFormMethods;

  // جلب البيانات الأولية
  useEffect(() => {
    if (!token || !merchantId) return;

    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [quickConfig, advancedTemplateResp, finalPrompt] =
          await Promise.all([
            getQuickConfig(token, merchantId),
            getAdvancedTemplate(token, merchantId),
            getFinalPrompt(token, merchantId),
          ]);

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

        setAdvancedTemplate(advancedTemplateResp);
        setPreviewContent(finalPrompt);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("فشل في جلب البيانات:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [token, merchantId, reset]);

  // معاينة حية في حالة الإعداد السريع (Quick)
  useEffect(() => {
    if (!token || !merchantId) return;
    if (activeTab !== "quick") return;

    let lastValues: QuickConfig | null = null;

    const subscription = watch((values) => {
      const filteredCustom = (values.customInstructions ?? []).filter(
        (x): x is string => Boolean(x)
      );
      const filteredOrder = (
        values.sectionOrder ?? DEFAULT_SECTION_ORDER
      ).filter((x): x is string => Boolean(x));

      const safeValues: QuickConfig = {
        dialect: values.dialect ?? "خليجي",
        tone: values.tone ?? "ودّي",
        customInstructions: filteredCustom,
        sectionOrder: filteredOrder.length
          ? filteredOrder
          : [...DEFAULT_SECTION_ORDER],
        includeStoreUrl: values.includeStoreUrl ?? true,
        includeAddress: values.includeAddress ?? true,
        includePolicies: values.includePolicies ?? true,
        includeWorkingHours: values.includeWorkingHours ?? true,
        includeClosingPhrase: values.includeClosingPhrase ?? true,
        closingText: values.closingText ?? "هل أقدر أساعدك بشي ثاني؟ 😊",
      };

      if (lastValues && areEqualQuickConfigs(safeValues, lastValues)) return;
      lastValues = safeValues;

      const timer = setTimeout(async () => {
        try {
          const preview = await previewPrompt(token, merchantId, {
            quickConfig: safeValues,
            useAdvanced: false,
            testVars: {},
          });
          setPreviewContent(preview);
          setLastUpdated(new Date());
        } catch (err) {
          console.error("خطأ في المعاينة الحية:", err);
        }
      }, 500);

      return () => clearTimeout(timer);
    });

    return () => subscription.unsubscribe();
  }, [token, merchantId, activeTab, watch]);

  const handleSaveQuickConfig = async (data: QuickConfig) => {
    if (!token || !merchantId) return;
    setIsSaving(true);
    try {
      const updated = await updateQuickConfig(token, merchantId, data);
      reset(updated);
      setLastUpdated(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAdvancedTemplate = async () => {
    if (!token || !merchantId) return;
    setIsSaving(true);
    try {
      await saveAdvancedTemplate(
        token,
        merchantId,
        advancedTemplate,
        "تعديل يدوي"
      );
      setLastUpdated(new Date());
      // يفضل إعادة تحميل المعاينة بعد التعديل
      handleManualPreview();
    } finally {
      setIsSaving(false);
    }
  };

  // معاينة يدوية
  const handleManualPreview = async () => {
    if (!token || !merchantId) {
      setPreviewContent("غير مصرح");
      return;
    }
    try {
      const currentValues = watch();
      const previewText = await previewPrompt(token, merchantId, {
        quickConfig: {
          dialect: currentValues.dialect || "خليجي",
          tone: currentValues.tone || "ودّي",
          customInstructions: currentValues.customInstructions || [],
          sectionOrder:
            currentValues.sectionOrder || DEFAULT_SECTION_ORDER.slice(),
          includeStoreUrl: currentValues.includeStoreUrl ?? true,
          includeAddress: currentValues.includeAddress ?? true,
          includePolicies: currentValues.includePolicies ?? true,
          includeWorkingHours: currentValues.includeWorkingHours ?? true,
          includeClosingPhrase: currentValues.includeClosingPhrase ?? true,
          closingText:
            currentValues.closingText || "هل أقدر أساعدك بشي ثاني؟ 😊",
        },
        useAdvanced: activeTab === "advanced",
        testVars: {},
      });
      setPreviewContent(previewText);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("خطأ في المعاينة:", error);
      setPreviewContent("خطأ في جلب المعاينة من الخادم");
    }
  };

  const handleGenerateAI = () => {
    setAdvancedTemplate("// تم توليد برومبت جديد بالذكاء الاصطناعي...");
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress size={60} />
      </LoadingContainer>
    );
  }

  return (
    <StudioContainer>
      <PromptToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={handleManualPreview}
        onSave={
          activeTab === "quick"
            ? quickFormMethods.handleSubmit(handleSaveQuickConfig)
            : handleSaveAdvancedTemplate
        }
        isSaving={isSaving}
        lastUpdated={lastUpdated}
      />

      <ContentGrid activeTab={activeTab}>
        {activeTab === "quick" && (
          <>
            <FormProvider {...quickFormMethods}>
              <QuickSetupPane />
            </FormProvider>
            <LivePreviewPane
              content={previewContent}
              isLivePreview
              isLoading={isLoading}
              onRefresh={handleManualPreview}
            />
          </>
        )}

        {activeTab === "advanced" && (
          <>
            <AdvancedTemplatePane
              template={advancedTemplate}
              onChange={setAdvancedTemplate}
              onGenerateAI={handleGenerateAI}
            />
            <ChatSimulator initialPrompt={previewContent} />
          </>
        )}
      </ContentGrid>
    </StudioContainer>
  );
}
