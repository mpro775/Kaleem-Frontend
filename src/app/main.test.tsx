import { vi } from "vitest";

vi.mock("react-dom/client", () => {
  const createRoot = vi.fn(() => ({ render: vi.fn() }));
  return { createRoot, default: { createRoot } };
});
vi.mock("@sentry/react", () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(),
}));


test("sets RTL direction and renders app", async () => {
  document.body.innerHTML = '<div id="root"></div>';
  await import("./main");
  const { createRoot } = await import("react-dom/client");
  expect(document.documentElement.getAttribute("dir")).toBe("rtl");
  expect(createRoot).toHaveBeenCalled();
});
