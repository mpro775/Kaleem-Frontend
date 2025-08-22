import { useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { styled } from "@mui/system";
import { FormProvider, useForm } from "react-hook-form";

import { useAuth } from "@/context/AuthContext";
import { usePromptStudio } from "@/features/mechant/prompt-studio/hooks";
import type { QuickConfig } from "@/features/mechant/prompt-studio/types";

// ✅ استخدم مكوناتنا من مساراتها الفعلية
import { PromptToolbar } from "@/features/mechant/prompt-studio/ui/PromptToolbar";
import { LivePreviewPane } from "@/features/mechant/prompt-studio/ui/LivePreviewPane";
import { AdvancedTemplatePane } from "@/features/mechant/prompt-studio/ui/AdvancedTemplatePane";
import { ChatSimulator } from "@/features/mechant/prompt-studio/ui/ChatSimulator";
import { QuickSetupPane } from "@/features/mechant/prompt-studio/ui/QuickSetupPane";

const StudioContainer = styled(Box)(({ theme }) => ({
  height: "100dvh",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.default,
}));

const LoadingContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100dvh",
  minHeight: "100vh",
});

const ContentGrid = styled(Box, {
  shouldForwardProp: (prop) => prop !== "activeTab",
})<{ activeTab: "quick" | "advanced" }>(({ theme, activeTab }) => ({
  display: "grid",
  // ✅ منع الانفجار باستخدام minmax
  gridTemplateColumns:
    activeTab === "quick"
      ? "minmax(0,1fr) minmax(0,1.4fr)"
      : "minmax(0,1.3fr) minmax(0,1fr)",
  gridAutoRows: "1fr",
  flexGrow: 1,
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  overflow: "hidden",
  [theme.breakpoints.down("lg")]: {
    gridTemplateColumns: "minmax(0,1fr)",
    gridAutoRows: "auto",
  },
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },
}));

export default function PromptStudioPage() {
  const { token, user } = useAuth();
  const merchantId = user?.merchantId;

  const [activeTab, setActiveTab] = useState<"quick" | "advanced">("quick");

  // defaults
  const quickFormMethods = useForm<QuickConfig>({
    defaultValues: {
      dialect: "خليجي",
      tone: "ودّي",
      customInstructions: [],
      includeClosingPhrase: true,
      closingText: "هل أقدر أساعدك بشي ثاني؟ 😊",
      customerServicePhone: "",
      customerServiceWhatsapp: "",
    },
  });

  const {
    isLoading,
    isSaving,
    lastUpdated,
    previewContent,
    advancedTemplate,
    setAdvancedTemplate,
    handleManualPreview,
    handleSaveQuickConfig,
    handleSaveAdvancedTemplate,
  } = usePromptStudio({
    token,
    merchantId,
    activeTab,
    reset: quickFormMethods.reset,
    watch: quickFormMethods.watch,
  });

  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress size={60} />
      </LoadingContainer>
    );
  }

  return (
    <StudioContainer dir="rtl">
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
              <Box sx={{ minWidth: 0, height: "100%", overflow: "auto" }}>
                <QuickSetupPane />
              </Box>
            </FormProvider>

            <Box sx={{ minWidth: 0, height: "100%" }}>
              <LivePreviewPane
                content={previewContent}
                isLivePreview
                isLoading={isLoading}
                onRefresh={handleManualPreview}
              />
            </Box>
          </>
        )}

        {activeTab === "advanced" && (
          <>
            <Box sx={{ minWidth: 0, height: "100%" }}>
              <AdvancedTemplatePane
                template={advancedTemplate}
                onChange={setAdvancedTemplate}
                onGenerateAI={() =>
                  setAdvancedTemplate("// تم توليد برومبت جديد بالذكاء الاصطناعي...")
                }
              />
            </Box>

            <Box sx={{ minWidth: 0, height: "100%" }}>
              <ChatSimulator  />
            </Box>
          </>
        )}
      </ContentGrid>
    </StudioContainer>
  );
}
