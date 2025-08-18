import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import FinalCtaSection from "./FinalCtaSection";
import { vi } from "vitest";

vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal<typeof import("react-router-dom")>();
  return { ...mod, useNavigate: () => vi.fn() };
});

describe("FinalCtaSection", () => {
  test("يعرض العنوان الرئيسي للدعوة النهائية", () => {
    renderWithProviders(<FinalCtaSection />);
    
    expect(screen.getByText("جاهز لتحويل تجربة عملائك؟")).toBeInTheDocument();
  });

  test("يعرض النص التشجيعي", () => {
    renderWithProviders(<FinalCtaSection />);
    
    expect(screen.getByText(/ابدأ رحلتك مع كليم اليوم/)).toBeInTheDocument();
    expect(screen.getByText(/تجربة مجانية لمدة 14 يوم/)).toBeInTheDocument();
  });

  test("يحتوي على زر البدء الرئيسي", () => {
    renderWithProviders(<FinalCtaSection />);
    
    const startButton = screen.getByText("ابدأ مجاناً الآن");
    expect(startButton).toBeInTheDocument();
    expect(startButton).toHaveAttribute("role", "button");
  });

  test("يحتوي على زر العرض التوضيحي", () => {
    renderWithProviders(<FinalCtaSection />);
    
    expect(screen.getByText("شاهد العرض التوضيحي")).toBeInTheDocument();
  });

  test("يعرض المميزات الأساسية", () => {
    renderWithProviders(<FinalCtaSection />);
    
    expect(screen.getByText("بدون بطاقة ائتمانية")).toBeInTheDocument();
    expect(screen.getByText("إعداد في 5 دقائق")).toBeInTheDocument();
    expect(screen.getByText("دعم مجاني")).toBeInTheDocument();
  });

  test("يعرض الضمانات", () => {
    renderWithProviders(<FinalCtaSection />);
    
    expect(screen.getByText("ضمان استرداد المال")).toBeInTheDocument();
    expect(screen.getByText("99.9% وقت تشغيل")).toBeInTheDocument();
  });

  test("يحتوي على شهادات الأمان", () => {
    renderWithProviders(<FinalCtaSection />);
    
    expect(screen.getByText("مشفر بـ SSL")).toBeInTheDocument();
    expect(screen.getByText("متوافق مع GDPR")).toBeInTheDocument();
  });

  test("يعرض إحصائيات سريعة", () => {
    renderWithProviders(<FinalCtaSection />);
    
    expect(screen.getByText("1000+")).toBeInTheDocument(); // العملاء
    expect(screen.getByText("متجر نشط")).toBeInTheDocument();
    expect(screen.getByText("50M+")).toBeInTheDocument(); // الرسائل
    expect(screen.getByText("رسالة معالجة")).toBeInTheDocument();
  });

  test("يحتوي على معلومات الاتصال للدعم", () => {
    renderWithProviders(<FinalCtaSection />);
    
    expect(screen.getByText("تحتاج مساعدة؟")).toBeInTheDocument();
    expect(screen.getByText("تواصل معنا")).toBeInTheDocument();
  });

  test("يعرض خلفية جذابة مع تدرجات", () => {
    renderWithProviders(<FinalCtaSection />);
    
    const section = screen.getByRole("region", { name: /دعوة نهائية/i });
    expect(section).toHaveStyle("background: linear-gradient");
  });

  test("يحتوي على رسوم متحركة للعناصر", () => {
    renderWithProviders(<FinalCtaSection />);
    
    const animatedElements = screen.getAllByTestId(/animated-/);
    expect(animatedElements.length).toBeGreaterThan(0);
  });

  test("يعرض شعارات الشركاء", () => {
    renderWithProviders(<FinalCtaSection />);
    
    expect(screen.getByText("شركاؤنا في النجاح")).toBeInTheDocument();
    expect(screen.getByAltText("Shopify")).toBeInTheDocument();
    expect(screen.getByAltText("WooCommerce")).toBeInTheDocument();
  });

  test("يحتوي على روابط وسائل التواصل الاجتماعي", () => {
    renderWithProviders(<FinalCtaSection />);
    
    expect(screen.getByLabelText("تويتر")).toBeInTheDocument();
    expect(screen.getByLabelText("لينكدإن")).toBeInTheDocument();
    expect(screen.getByLabelText("يوتيوب")).toBeInTheDocument();
  });
});
