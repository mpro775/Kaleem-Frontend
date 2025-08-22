import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import StorefrontSection from "./StorefrontSection";

describe("StorefrontSection", () => {
  test("يعرض عنوان قسم واجهة المتجر", () => {
    renderWithProviders(<StorefrontSection />);
    
    expect(screen.getByText("واجهة متجر احترافية")).toBeInTheDocument();
    expect(screen.getByText(/أنشئ متجرك الإلكتروني بدقائق/)).toBeInTheDocument();
  });

  test("يعرض معاينة لواجهة المتجر", () => {
    renderWithProviders(<StorefrontSection />);
    
    expect(screen.getByText("متجر العطور الفاخرة")).toBeInTheDocument();
    expect(screen.getByText("عطر الورد الجوري")).toBeInTheDocument();
  });

  test("يحتوي على أزرار التخصيص", () => {
    renderWithProviders(<StorefrontSection />);
    
    expect(screen.getByText("تخصيص الألوان")).toBeInTheDocument();
    expect(screen.getByText("تغيير الخطوط")).toBeInTheDocument();
    expect(screen.getByText("إضافة الشعار")).toBeInTheDocument();
  });

  test("يعرض مميزات واجهة المتجر", () => {
    renderWithProviders(<StorefrontSection />);
    
    expect(screen.getByText("تصميم متجاوب")).toBeInTheDocument();
    expect(screen.getByText("محرك بحث محسن")).toBeInTheDocument();
    expect(screen.getByText("دفع آمن")).toBeInTheDocument();
  });

  test("يحتوي على عارض القوالب", () => {
    renderWithProviders(<StorefrontSection />);
    
    expect(screen.getByText("قالب كلاسيكي")).toBeInTheDocument();
    expect(screen.getByText("قالب عصري")).toBeInTheDocument();
    expect(screen.getByText("قالب مينيمال")).toBeInTheDocument();
  });

  test("يتفاعل مع تغيير القوالب", () => {
    renderWithProviders(<StorefrontSection />);
    
    const modernTemplate = screen.getByText("قالب عصري");
    fireEvent.click(modernTemplate);
    
    // التحقق من تغيير المعاينة
    expect(screen.getByTestId("storefront-preview")).toBeInTheDocument();
  });

  test("يعرض إحصائيات الأداء", () => {
    renderWithProviders(<StorefrontSection />);
    
    expect(screen.getByText("سرعة التحميل < 2 ثانية")).toBeInTheDocument();
    expect(screen.getByText("معدل التحويل 15%")).toBeInTheDocument();
  });

  test("يحتوي على أدوات التخصيص التفاعلية", () => {
    renderWithProviders(<StorefrontSection />);
    
    const colorPicker = screen.getByLabelText("اختر اللون الأساسي");
    expect(colorPicker).toBeInTheDocument();
  });

  test("يعرض معاينة مباشرة للتغييرات", () => {
    renderWithProviders(<StorefrontSection />);
    
    const colorPicker = screen.getByLabelText("اختر اللون الأساسي");
    fireEvent.change(colorPicker, { target: { value: "#ff0000" } });
    
    // التحقق من تطبيق اللون على المعاينة
    const preview = screen.getByTestId("storefront-preview");
    expect(preview).toHaveStyle("--primary-color: #ff0000");
  });

  test("يحتوي على زر إنشاء المتجر", () => {
    renderWithProviders(<StorefrontSection />);
    
    expect(screen.getByText("أنشئ متجرك الآن")).toBeInTheDocument();
  });

  test("يعرض أمثلة على المتاجر الناجحة", () => {
    renderWithProviders(<StorefrontSection />);
    
    expect(screen.getByText("متاجر نجحت مع كليم")).toBeInTheDocument();
    expect(screen.getByText("متجر الأزياء العصرية")).toBeInTheDocument();
  });

  test("يدعم المعاينة على الأجهزة المختلفة", () => {
    renderWithProviders(<StorefrontSection />);
    
    const desktopView = screen.getByLabelText("معاينة سطح المكتب");
    const mobileView = screen.getByLabelText("معاينة الجوال");
    
    expect(desktopView).toBeInTheDocument();
    expect(mobileView).toBeInTheDocument();
  });
});
