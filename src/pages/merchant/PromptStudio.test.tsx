import { screen } from "@testing-library/react";
import PromptStudioPage from "./PromptStudio";
import { renderWithProviders } from "@/test/test-utils";
import { vi } from "vitest";

vi.mock("@/context/AuthContext", async () => {
  const actual: any = await vi.importActual("@/context/AuthContext");
  return { ...actual, useAuth: () => ({ token: "t", user: { merchantId: "m1" } }) };
});

vi.mock("@/features/mechant/prompt-studio/hooks", () => ({
  usePromptStudio: () => ({
    isLoading: false,
    isSaving: false,
    lastUpdated: null,
    previewContent: "",
    advancedTemplate: "",
    setAdvancedTemplate: vi.fn(),
    handleManualPreview: vi.fn(),
    handleSaveQuickConfig: vi.fn(),
    handleSaveAdvancedTemplate: vi.fn(),
  }),
}));

vi.mock("@/features/mechant/prompt-studio/ui/PromptToolbar", () => ({
  PromptToolbar: ({ onRefresh, onSave }: any) => (
    <div>
      <button onClick={onRefresh}>refresh</button>
      <button onClick={onSave}>save</button>
      استوديو البرومبت
    </div>
  ),
}));
vi.mock("@/features/mechant/prompt-studio/ui/LivePreviewPane", () => ({ default: () => <div /> }));
vi.mock("@/features/mechant/prompt-studio/ui/AdvancedTemplatePane", () => ({ default: () => <div /> }));
vi.mock("@/features/mechant/prompt-studio/ui/ChatSimulator", () => ({ default: () => <div /> }));
vi.mock("@/features/mechant/prompt-studio/ui/QuickSetupPane", () => ({ default: () => <div /> }));

vi.mock("@/shared/ui/TagsInput", () => ({ default: () => <div /> }));


test("renders toolbar", () => {
  renderWithProviders(<PromptStudioPage />);
  expect(screen.getByText("استوديو البرومبت")).toBeInTheDocument();
});
