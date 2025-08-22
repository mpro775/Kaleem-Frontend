import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import PricingSection from "./PricingSection";
import { vi } from "vitest";

vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal<typeof import("react-router-dom")>();
  return { ...mod, useNavigate: () => vi.fn() };
});

describe("PricingSection", () => {
  test("يعرض عنوان القسم والوصف", () => {
    renderWithProviders(<PricingSection />);
    
    expect(screen.getByText("خطط الأسعار")).toBeInTheDocument();
    expect(screen.getByText(/اختر الخطة المناسبة لاحتياجاتك/)).toBeInTheDocument();
  });

  test("يعرض مفتاح التبديل بين الشهرية والسنوية", () => {
    renderWithProviders(<PricingSection />);
    
    expect(screen.getByText("شهرياً")).toBeInTheDocument();
    expect(screen.getByText("سنوياً")).toBeInTheDocument();
    expect(screen.getByText("وفّر 20%")).toBeInTheDocument();
  });

  test("يعرض الخطط الشهرية افتراضياً", () => {
    renderWithProviders(<PricingSection />);
    
    expect(screen.getByText("البداية")).toBeInTheDocument();
    expect(screen.getByText("الاحتراف")).toBeInTheDocument();
    expect(screen.getByText("المؤسسات")).toBeInTheDocument();
  });

  test("يتبدل إلى الخطط السنوية عند الضغط على المفتاح", () => {
    renderWithProviders(<PricingSection />);
    
    const yearlyToggle = screen.getByLabelText(/سنوياً/);
    fireEvent.click(yearlyToggle);
    
    // التحقق من تغيير الأسعار (الأسعار السنوية أقل)
    expect(screen.getByText("79")).toBeInTheDocument(); // سعر البداية السنوي
  });

  test("يعرض علامة 'الأشهر' على الخطة الشائعة", () => {
    renderWithProviders(<PricingSection />);
    
    expect(screen.getByText("الأشهر")).toBeInTheDocument();
  });

  test("يعرض ميزات كل خطة", () => {
    renderWithProviders(<PricingSection />);
    
    expect(screen.getByText("1000 رسالة شهرياً")).toBeInTheDocument();
    expect(screen.getByText("دعم فني أساسي")).toBeInTheDocument();
    expect(screen.getByText("تحليلات أساسية")).toBeInTheDocument();
  });

  test("يحتوي على أزرار 'ابدأ الآن' لكل خطة", () => {
    renderWithProviders(<PricingSection />);
    
    const startButtons = screen.getAllByText("ابدأ الآن");
    expect(startButtons).toHaveLength(3); // ثلاث خطط
  });

  test("يعرض عرض المؤسسات الخاص", () => {
    renderWithProviders(<PricingSection />);
    
    expect(screen.getByText("تواصل معنا")).toBeInTheDocument();
    expect(screen.getByText(/حلول مخصصة/)).toBeInTheDocument();
  });
});
