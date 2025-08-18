import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import IntegrationsSection from "./IntegrationsSection";

describe("IntegrationsSection", () => {
  test("يعرض عنوان قسم التكاملات", () => {
    renderWithProviders(<IntegrationsSection />);
    
    expect(screen.getByText("التكامل مع منصات التجارة الإلكترونية")).toBeInTheDocument();
    expect(screen.getByText(/اربط كليم مع متجرك بسهولة/)).toBeInTheDocument();
  });

  test("يعرض شعارات المنصات المدعومة", () => {
    renderWithProviders(<IntegrationsSection />);
    
    expect(screen.getByText("Shopify")).toBeInTheDocument();
    expect(screen.getByText("WooCommerce")).toBeInTheDocument();
    expect(screen.getByText("سلة")).toBeInTheDocument();
    expect(screen.getByText("زد")).toBeInTheDocument();
  });

  test("يعرض مميزات التكامل", () => {
    renderWithProviders(<IntegrationsSection />);
    
    expect(screen.getByText("ربط تلقائي للمنتجات")).toBeInTheDocument();
    expect(screen.getByText("تحديث المخزون فورياً")).toBeInTheDocument();
    expect(screen.getByText("معالجة الطلبات")).toBeInTheDocument();
  });

  test("يحتوي على زر البدء", () => {
    renderWithProviders(<IntegrationsSection />);
    
    expect(screen.getByText("ابدأ التكامل")).toBeInTheDocument();
  });

  test("يعرض خطوات التكامل", () => {
    renderWithProviders(<IntegrationsSection />);
    
    expect(screen.getByText("1. اختر منصتك")).toBeInTheDocument();
    expect(screen.getByText("2. ادخل بيانات المتجر")).toBeInTheDocument();
    expect(screen.getByText("3. فعّل الربط")).toBeInTheDocument();
  });

  test("يعرض إحصائيات التكامل", () => {
    renderWithProviders(<IntegrationsSection />);
    
    expect(screen.getByText("5 دقائق")).toBeInTheDocument(); // وقت الإعداد
    expect(screen.getByText("99.9%")).toBeInTheDocument(); // نسبة النجاح
  });

  test("يحتوي على روابط الوثائق", () => {
    renderWithProviders(<IntegrationsSection />);
    
    expect(screen.getByText("دليل التكامل")).toBeInTheDocument();
    expect(screen.getByText("API Documentation")).toBeInTheDocument();
  });

  test("يعرض شهادات حول سهولة التكامل", () => {
    renderWithProviders(<IntegrationsSection />);
    
    expect(screen.getByText(/كان التكامل سهل جداً/)).toBeInTheDocument();
  });
});
