import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import ComparisonSection from "./ComparisonSection";

describe("ComparisonSection", () => {
  test("يعرض عنوان قسم المقارنة", () => {
    renderWithProviders(<ComparisonSection />);
    
    expect(screen.getByText("لماذا كليم هو الخيار الأفضل؟")).toBeInTheDocument();
    expect(screen.getByText(/مقارنة شاملة مع المنافسين/)).toBeInTheDocument();
  });

  test("يعرض جدول المقارنة", () => {
    renderWithProviders(<ComparisonSection />);
    
    expect(screen.getByText("كليم")).toBeInTheDocument();
    expect(screen.getByText("المنافس أ")).toBeInTheDocument();
    expect(screen.getByText("المنافس ب")).toBeInTheDocument();
  });

  test("يعرض المميزات المقارنة", () => {
    renderWithProviders(<ComparisonSection />);
    
    expect(screen.getByText("دعم اللغة العربية")).toBeInTheDocument();
    expect(screen.getByText("سهولة الإعداد")).toBeInTheDocument();
    expect(screen.getByText("التكامل مع المتاجر")).toBeInTheDocument();
    expect(screen.getByText("الدعم الفني")).toBeInTheDocument();
  });

  test("يعرض علامات الصح والخطأ للمقارنة", () => {
    renderWithProviders(<ComparisonSection />);
    
    const checkIcons = screen.getAllByTestId("CheckIcon");
    const closeIcons = screen.getAllByTestId("CloseIcon");
    
    expect(checkIcons.length).toBeGreaterThan(0);
    expect(closeIcons.length).toBeGreaterThan(0);
  });

  test("يبرز مميزات كليم بشكل واضح", () => {
    renderWithProviders(<ComparisonSection />);
    
    // التحقق من أن عمود كليم مميز
    const kleemColumn = screen.getByText("كليم").closest("div");
    expect(kleemColumn).toHaveClass("highlighted");
  });

  test("يعرض الأسعار للمقارنة", () => {
    renderWithProviders(<ComparisonSection />);
    
    expect(screen.getByText("99 ريال/شهر")).toBeInTheDocument();
    expect(screen.getByText("149 ريال/شهر")).toBeInTheDocument();
    expect(screen.getByText("199 ريال/شهر")).toBeInTheDocument();
  });

  test("يحتوي على زر اختيار كليم", () => {
    renderWithProviders(<ComparisonSection />);
    
    expect(screen.getByText("اختر كليم")).toBeInTheDocument();
  });

  test("يعرض تقييمات العملاء", () => {
    renderWithProviders(<ComparisonSection />);
    
    expect(screen.getByText("4.9/5")).toBeInTheDocument(); // تقييم كليم
    expect(screen.getByText("4.2/5")).toBeInTheDocument(); // تقييم المنافس
  });

  test("يعرض إحصائيات الاستخدام", () => {
    renderWithProviders(<ComparisonSection />);
    
    expect(screen.getByText("وقت الإعداد")).toBeInTheDocument();
    expect(screen.getByText("5 دقائق")).toBeInTheDocument();
    expect(screen.getByText("30 دقيقة")).toBeInTheDocument();
  });

  test("يحتوي على شهادات العملاء", () => {
    renderWithProviders(<ComparisonSection />);
    
    expect(screen.getByText(/كليم أسهل وأسرع من أي حل آخر/)).toBeInTheDocument();
  });

  test("يعرض المميزات الحصرية لكليم", () => {
    renderWithProviders(<ComparisonSection />);
    
    expect(screen.getByText("حصري")).toBeInTheDocument();
    expect(screen.getByText("ذكاء اصطناعي متقدم")).toBeInTheDocument();
  });

  test("يدعم التمرير الأفقي للجدول", () => {
    renderWithProviders(<ComparisonSection />);
    
    const table = screen.getByRole("table");
    expect(table).toHaveStyle("overflow-x: auto");
  });

  test("يحتوي على رابط للتجربة المجانية", () => {
    renderWithProviders(<ComparisonSection />);
    
    expect(screen.getByText("جرب مجاناً")).toBeInTheDocument();
  });
});
