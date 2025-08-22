import { screen } from "@testing-library/react";
import AccountSettingsPage from "./AccountSettingsPage";
import { renderWithProviders } from "@/test/test-utils";

test("renders heading", () => {
  renderWithProviders(<AccountSettingsPage />);
  expect(screen.getByText("إعدادات الحساب الشخصي")).toBeInTheDocument();
});
