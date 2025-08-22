import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import StorePage from "./StorePage";

// Mock للـ localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock للـ getLocalCustomer
vi.mock("@/utils/customer", () => ({
  getLocalCustomer: () => ({
    id: "customer-1",
    name: "Test Customer",
    email: "customer@test.com",
    phone: "+1234567890"
  })
}));

describe("StorePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("يجب أن يعرض صفحة المتجر بشكل صحيح", async () => {
    renderWithProviders(<StorePage />);

    // انتظار تحميل الصفحة
    await waitFor(() => {
      expect(screen.getByText(/متجر/i)).toBeInTheDocument();
    });
  });

  it("يجب أن يعرض معلومات العميل", async () => {
    renderWithProviders(<StorePage />);

    await waitFor(() => {
      expect(screen.getByText(/Test Customer/i)).toBeInTheDocument();
      expect(screen.getByText(/customer@test.com/i)).toBeInTheDocument();
    });
  });

  it("يجب أن يعرض قائمة المنتجات", async () => {
    renderWithProviders(<StorePage />);

    await waitFor(() => {
      // التحقق من وجود عناصر المتجر الأساسية
      expect(screen.getByRole("main")).toBeInTheDocument();
    });
  });
});
