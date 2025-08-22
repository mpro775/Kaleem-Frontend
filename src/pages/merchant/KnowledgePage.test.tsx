import { screen } from "@testing-library/react";
import KnowledgePage from "./KnowledgePage";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/features/mechant/dashboard/ui/MessagesTimelineChart", () => ({ default: () => <div /> }));
vi.mock("@/features/mechant/dashboard/ui/ProductsChart", () => ({ default: () => <div /> }));
vi.mock("@/features/mechant/dashboard/ui/KeywordsChart", () => ({ default: () => <div /> }));
vi.mock("@/features/mechant/dashboard/ui/ChannelsPieChart", () => ({ default: () => <div /> }));

test("renders heading", () => {
  renderWithProviders(<KnowledgePage />);
  expect(screen.getByText("إدارة مصادر المعرفة")).toBeInTheDocument();
});
