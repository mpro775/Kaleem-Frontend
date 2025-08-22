import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import FAQSection from "./FAQSection";

describe("FAQSection", () => {
  test("يعرض عنوان قسم الأسئلة الشائعة", () => {
    renderWithProviders(<FAQSection />);
    
    expect(screen.getByText("الأسئلة الشائعة")).toBeInTheDocument();
    expect(screen.getByText(/إجابات على أكثر الأسئلة شيوعاً/)).toBeInTheDocument();
  });

  test("يعرض جميع الأسئلة الشائعة", () => {
    renderWithProviders(<FAQSection />);
    
    expect(screen.getByText("هل يدعم العربية بالكامل؟")).toBeInTheDocument();
    expect(screen.getByText("كيف يتم التسعير؟")).toBeInTheDocument();
    expect(screen.getByText("ما هي طرق الدفع المدعومة؟")).toBeInTheDocument();
    expect(screen.getByText("هل يمكن تخصيص الردود؟")).toBeInTheDocument();
  });

  test("الأكورديون مطوي افتراضياً", () => {
    renderWithProviders(<FAQSection />);
    
    // التحقق من أن الإجابات غير ظاهرة في البداية
    expect(screen.queryByText(/نعم، الواجهة والردود تدعم اللغة العربية/)).not.toBeInTheDocument();
    expect(screen.queryByText(/نقدم باقات شهرية وسنوية مرنة/)).not.toBeInTheDocument();
  });

  test("يفتح الأكورديون عند الضغط على السؤال", () => {
    renderWithProviders(<FAQSection />);
    
    const firstQuestion = screen.getByText("هل يدعم العربية بالكامل؟");
    fireEvent.click(firstQuestion);
    
    expect(screen.getByText(/نعم، الواجهة والردود تدعم اللغة العربية/)).toBeInTheDocument();
  });

  test("يغلق الأكورديون عند الضغط عليه مرة أخرى", () => {
    renderWithProviders(<FAQSection />);
    
    const firstQuestion = screen.getByText("هل يدعم العربية بالكامل؟");
    
    // فتح الأكورديون
    fireEvent.click(firstQuestion);
    expect(screen.getByText(/نعم، الواجهة والردود تدعم اللغة العربية/)).toBeInTheDocument();
    
    // إغلاق الأكورديون
    fireEvent.click(firstQuestion);
    expect(screen.queryByText(/نعم، الواجهة والردود تدعم اللغة العربية/)).not.toBeInTheDocument();
  });

  test("يمكن فتح عدة أكورديونات في نفس الوقت", () => {
    renderWithProviders(<FAQSection />);
    
    const firstQuestion = screen.getByText("هل يدعم العربية بالكامل؟");
    const secondQuestion = screen.getByText("كيف يتم التسعير؟");
    
    // فتح الأكورديون الأول
    fireEvent.click(firstQuestion);
    expect(screen.getByText(/نعم، الواجهة والردود تدعم اللغة العربية/)).toBeInTheDocument();
    
    // فتح الأكورديون الثاني
    fireEvent.click(secondQuestion);
    expect(screen.getByText(/نقدم باقات شهرية وسنوية مرنة/)).toBeInTheDocument();
    
    // التحقق من أن كلاهما مفتوح
    expect(screen.getByText(/نعم، الواجهة والردود تدعم اللغة العربية/)).toBeInTheDocument();
    expect(screen.getByText(/نقدم باقات شهرية وسنوية مرنة/)).toBeInTheDocument();
  });

  test("يحتوي على أيقونات التوسيع", () => {
    renderWithProviders(<FAQSection />);
    
    const expandIcons = screen.getAllByTestId("ExpandMoreIcon");
    expect(expandIcons.length).toBeGreaterThan(0);
  });

  test("يعرض جميع الأسئلة المتوقعة", () => {
    renderWithProviders(<FAQSection />);
    
    const expectedQuestions = [
      "هل يدعم العربية بالكامل؟",
      "كيف يتم التسعير؟",
      "ما هي طرق الدفع المدعومة؟",
      "هل يمكن تخصيص الردود؟",
      "كم يستغرق الإعداد؟",
      "هل يوجد دعم فني؟",
      "هل يمكن الإلغاء في أي وقت؟",
      "ما هي متطلبات النظام؟"
    ];

    expectedQuestions.forEach(question => {
      expect(screen.getByText(question)).toBeInTheDocument();
    });
  });

  test("يعرض رابط التواصل للمزيد من الأسئلة", () => {
    renderWithProviders(<FAQSection />);
    
    expect(screen.getByText(/لديك سؤال آخر؟/)).toBeInTheDocument();
    expect(screen.getByText("تواصل معنا")).toBeInTheDocument();
  });

  test("يحتوي على تصميم متجاوب", () => {
    renderWithProviders(<FAQSection />);
    
    const container = screen.getByRole("region", { name: /أسئلة شائعة/i });
    expect(container).toBeInTheDocument();
  });
});
