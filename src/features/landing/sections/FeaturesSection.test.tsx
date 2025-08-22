import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import FeaturesSection from "./FeaturesSection";

describe("FeaturesSection", () => {
  test("يعرض عنوان قسم المميزات", () => {
    renderWithProviders(<FeaturesSection />);
    
    expect(screen.getByText("مميزات كليم")).toBeInTheDocument();
    expect(screen.getByText(/حلول ذكية لتحسين تجربة العملاء/)).toBeInTheDocument();
  });

  test("يعرض المميزات الرئيسية", () => {
    renderWithProviders(<FeaturesSection />);
    
    expect(screen.getByText("ذكاء اصطناعي متقدم")).toBeInTheDocument();
    expect(screen.getByText("دعم متعدد القنوات")).toBeInTheDocument();
    expect(screen.getByText("تحليلات شاملة")).toBeInTheDocument();
    expect(screen.getByText("سهولة التكامل")).toBeInTheDocument();
  });

  test("يعرض أوصاف المميزات", () => {
    renderWithProviders(<FeaturesSection />);
    
    expect(screen.getByText(/يفهم استفسارات العملاء ويجيب عليها/)).toBeInTheDocument();
    expect(screen.getByText(/واتساب، تيليجرام، والموقع الإلكتروني/)).toBeInTheDocument();
    expect(screen.getByText(/تقارير مفصلة عن أداء المحادثات/)).toBeInTheDocument();
  });

  test("يحتوي على أيقونات للمميزات", () => {
    renderWithProviders(<FeaturesSection />);
    
    // التحقق من وجود أيقونات
    const icons = screen.getAllByRole("img", { hidden: true });
    expect(icons.length).toBeGreaterThan(0);
  });

  test("يعرض تبويبات للمميزات التفاعلية", () => {
    renderWithProviders(<FeaturesSection />);
    
    expect(screen.getByText("الردود الذكية")).toBeInTheDocument();
    expect(screen.getByText("إدارة الطلبات")).toBeInTheDocument();
    expect(screen.getByText("التحليلات")).toBeInTheDocument();
  });

  test("يتنقل بين التبويبات عند الضغط", async () => {
    renderWithProviders(<FeaturesSection />);
    
    const ordersTab = screen.getByText("إدارة الطلبات");
    fireEvent.click(ordersTab);
    
    await waitFor(() => {
      expect(screen.getByText(/تتبع وإدارة الطلبات تلقائياً/)).toBeInTheDocument();
    });
  });

  test("يعرض صور توضيحية للمميزات", () => {
    renderWithProviders(<FeaturesSection />);
    
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
  });

  test("يحتوي على أزرار دعوة للعمل", () => {
    renderWithProviders(<FeaturesSection />);
    
    expect(screen.getByText("جرب مجاناً")).toBeInTheDocument();
    expect(screen.getByText("شاهد العرض التوضيحي")).toBeInTheDocument();
  });

  test("يعرض إحصائيات الأداء", () => {
    renderWithProviders(<FeaturesSection />);
    
    expect(screen.getByText("95%")).toBeInTheDocument(); // معدل الدقة
    expect(screen.getByText("24/7")).toBeInTheDocument(); // التوفر
    expect(screen.getByText("< 2 ثانية")).toBeInTheDocument(); // وقت الاستجابة
  });

  test("يدعم الرسوم المتحركة عند التمرير", async () => {
    renderWithProviders(<FeaturesSection />);
    
    // محاكاة التمرير
    const section = screen.getByRole("region", { name: /مميزات/i });
    
    // التحقق من وجود العنصر
    expect(section).toBeInTheDocument();
    
    // التحقق من الرسوم المتحركة (fade-in)
    await waitFor(() => {
      expect(section).toHaveStyle("opacity: 1");
    });
  });

  test("يعرض شهادات العملاء المدمجة", () => {
    renderWithProviders(<FeaturesSection />);
    
    expect(screen.getByText(/وفر علينا 80% من وقت الرد/)).toBeInTheDocument();
    expect(screen.getByText(/زادت مبيعاتنا بنسبة 40%/)).toBeInTheDocument();
  });

  test("يحتوي على روابط للمزيد من المعلومات", () => {
    renderWithProviders(<FeaturesSection />);
    
    expect(screen.getByText("اعرف المزيد")).toBeInTheDocument();
    expect(screen.getByText("الوثائق")).toBeInTheDocument();
  });

  test("يعرض مقارنة مع المنافسين", () => {
    renderWithProviders(<FeaturesSection />);
    
    expect(screen.getByText("لماذا كليم؟")).toBeInTheDocument();
    expect(screen.getByText("أسرع في الإعداد")).toBeInTheDocument();
    expect(screen.getByText("أذكى في الردود")).toBeInTheDocument();
    expect(screen.getByText("أوفر في التكلفة")).toBeInTheDocument();
  });
});
