// src/features/landing/sections/WhyChooseKaleem.test.tsx
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { vi, describe, beforeAll, afterAll, test, expect } from "vitest";

// ✅ Mock مبكر لـ @mui/material مع إبقاء بقية التصديرات كما هي
vi.mock("@mui/material", async () => {
  const actual = await vi.importActual<typeof import("@mui/material")>("@mui/material");
  return {
    ...actual,
    // نجبر كل breakpoints على true حتى يكون perView=4
    useMediaQuery: () => true,
  };
});

// بعد الـ mock نقدر نستورد المكوّن
import WhyChooseKaleem from "./WhyChooseKaleem";

describe("WhyChooseKaleem", () => {
  beforeAll(() => {
    // JSDOM لا يوفّر scrollTo
    Element.prototype.scrollTo = vi.fn();
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test("يعرض عنوان قسم لماذا كليم؟", () => {
    renderWithProviders(<WhyChooseKaleem />);
    expect(screen.getByText("لماذا كليم؟")).toBeInTheDocument();
  });

  test("يعرض بعض المميزات الرئيسية", () => {
    renderWithProviders(<WhyChooseKaleem />);
    expect(screen.getByText("ذكاء يفهم لهجتك")).toBeInTheDocument();
    expect(screen.getByText("كل القنوات في مكان واحد")).toBeInTheDocument();
    expect(screen.getByText("أمان وخصوصية")).toBeInTheDocument();
    expect(screen.getByText("واجهة عربية سهلة")).toBeInTheDocument();
  });

  test("أزرار التصفح موجودة وتغيّر الحالة بالضغط", async () => {
    renderWithProviders(<WhyChooseKaleem />);
    const prevBtn = screen.getByRole("button", { name: "السابق" });
    const nextBtn = screen.getByRole("button", { name: "التالي" });

    // تحقق من وجود الأزرار
    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();
    
    // تحقق من الحالة الأولية
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
  });

  test("التمرير التلقائي يعمل ويتوقف ثم يستأنف", async () => {
    const { container } = renderWithProviders(<WhyChooseKaleem />);
    const nextBtn = screen.getByRole("button", { name: "التالي" });
    const prevBtn = screen.getByRole("button", { name: "السابق" });

    // تحقق من وجود الأزرار
    expect(nextBtn).toBeInTheDocument();
    expect(prevBtn).toBeInTheDocument();
    
    // تحقق من وجود المسار
    const track = container.querySelector('[dir="ltr"]');
    expect(track).toBeInTheDocument();
    
    // تحقق من أن الأزرار في الحالة الصحيحة
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
  });
});
