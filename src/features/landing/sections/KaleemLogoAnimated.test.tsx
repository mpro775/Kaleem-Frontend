import { renderWithProviders } from "@/test/test-utils";
import { screen } from "@testing-library/react";
import { vi } from "vitest";
vi.mock("react-svg", () => ({ ReactSVG: () => <div data-testid="svg" /> }));
import KaleemLogoAnimated from "./KaleemLogoAnimated";

test("يعرض شعار كليم المتحرك", () => {
  renderWithProviders(<KaleemLogoAnimated float={false} />);
  expect(screen.getByTestId("svg")).toBeInTheDocument();
});
