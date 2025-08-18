// src/features/prompt-studio/PromptStudioPage.tsx
import { useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { styled } from "@mui/system";
import { FormProvider, useForm } from "react-hook-form";

import { useAuth } from "../../context/AuthContext";
import { usePromptStudio } from "@/features/mechant/prompt-studio/hooks";
import { DEFAULT_SECTION_ORDER, type QuickConfig } from "@/features/mechant/prompt-studio/types";
import { PromptToolbar, QuickSetupPane, LivePreviewPane, AdvancedTemplatePane, ChatSimulator } from "@/features/mechant/prompt-studio/ui";

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

export default function PromptStudioPage() {
  const { token, user } = useAuth();
  const merchantId = user?.merchantId;

  const [activeTab, setActiveTab] = useState<"quick" | "advanced">("quick");

  // form defaults
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
              onGenerateAI={() =>
                setAdvancedTemplate("// تم توليد برومبت جديد بالذكاء الاصطناعي...")
              }
            />
            <ChatSimulator initialPrompt={previewContent} />
          </>
        )}
      </ContentGrid>
    </StudioContainer>
  );
}
