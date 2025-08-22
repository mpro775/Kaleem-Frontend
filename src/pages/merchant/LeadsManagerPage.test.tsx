import { screen } from "@testing-library/react";
import LeadsManagerPage from "./LeadsManagerPage";
import { renderWithProviders } from "@/test/test-utils";
import { vi } from "vitest";

vi.mock("@/features/mechant/leads/ui/EnabledToggleCard", () => ({ default: () => <div /> }));
vi.mock("@/features/mechant/leads/ui/FieldsEditor", () => ({ default: () => <div /> }));
vi.mock("@/features/mechant/leads/ui/LeadsTable", () => ({ default: () => <div /> }));

vi.mock("@/features/mechant/leads/hooks", () => ({
  useLeadsSettings: () => ({ loading: false, error: null, enabled: true, fields: [], leads: [], saveAll: vi.fn(), refreshAll: vi.fn(), addField: vi.fn(), removeField: vi.fn(), updateField: vi.fn(), saving: false }),
}));

test("renders heading", () => {
  renderWithProviders(<LeadsManagerPage />);
  expect(screen.getByText("إدارة إعدادات الـ Leads")).toBeInTheDocument();
});
