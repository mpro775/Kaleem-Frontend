import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import HowItWorks from "./HowItWorks";

describe("HowItWorks", () => {
  test("يعرض عنوان قسم كيف يعمل", () => {
    renderWithProviders(<HowItWorks />);
    
    expect(screen.getByText("كيف يعمل كليم؟")).toBeInTheDocument();
    expect(screen.getByText(/في 3 خطوات بسيطة/)).toBeInTheDocument();
  });

  test("يعرض الخطوات الثلاث", () => {
    renderWithProviders(<HowItWorks />);
    
    expect(screen.getByText("1. التسجيل والإعداد")).toBeInTheDocument();
    expect(screen.getByText("2. التخصيص والتدريب")).toBeInTheDocument();
    expect(screen.getByText("3. البدء والمراقبة")).toBeInTheDocument();
  });

  test("يعرض وصف كل خطوة", () => {
    renderWithProviders(<HowItWorks />);
    
    expect(screen.getByText(/أنشئ حسابك وربط متجرك/)).toBeInTheDocument();
    expect(screen.getByText(/خصص الردود ودرب البوت/)).toBeInTheDocument();
    expect(screen.getByText(/ابدأ استقبال العملاء/)).toBeInTheDocument();
  });

  test("يحتوي على رسوم توضيحية لكل خطوة", () => {
    renderWithProviders(<HowItWorks />);
    
    const illustrations = screen.getAllByRole("img", { name: /خطوة/ });
    expect(illustrations).toHaveLength(3);
  });

  test("يعرض الوقت المتوقع لكل خطوة", () => {
    renderWithProviders(<HowItWorks />);
    
    expect(screen.getByText("2 دقيقة")).toBeInTheDocument();
    expect(screen.getByText("10 دقائق")).toBeInTheDocument();
    expect(screen.getByText("فوري")).toBeInTheDocument();
  });

  test("يحتوي على تبويبات تفاعلية للخطوات", () => {
    renderWithProviders(<HowItWorks />);
    
    const step2Tab = screen.getByText("التخصيص والتدريب");
    fireEvent.click(step2Tab);
    
    expect(screen.getByText(/خصص الردود حسب احتياجاتك/)).toBeInTheDocument();
  });

  test("يعرض فيديو توضيحي", () => {
    renderWithProviders(<HowItWorks />);
    
    expect(screen.getByText("شاهد الفيديو التوضيحي")).toBeInTheDocument();
    const videoButton = screen.getByLabelText("تشغيل الفيديو");
    expect(videoButton).toBeInTheDocument();
  });

  test("يفتح مشغل الفيديو عند الضغط", async () => {
    renderWithProviders(<HowItWorks />);
    
    const videoButton = screen.getByLabelText("تشغيل الفيديو");
    fireEvent.click(videoButton);
    
    await waitFor(() => {
      expect(screen.getByTestId("video-player")).toBeInTheDocument();
    });
  });

  test("يعرض نصائح لكل خطوة", () => {
    renderWithProviders(<HowItWorks />);
    
    expect(screen.getByText("نصيحة:")).toBeInTheDocument();
    expect(screen.getByText(/استخدم البيانات الموجودة/)).toBeInTheDocument();
  });

  test("يحتوي على أزرار البدء", () => {
    renderWithProviders(<HowItWorks />);
    
    expect(screen.getByText("ابدأ الآن")).toBeInTheDocument();
    expect(screen.getByText("احجز عرض توضيحي")).toBeInTheDocument();
  });

  test("يعرض شريط التقدم", () => {
    renderWithProviders(<HowItWorks />);
    
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
  });

  test("يدعم التنقل بالأسهم", () => {
    renderWithProviders(<HowItWorks />);
    
    const nextButton = screen.getByLabelText("الخطوة التالية");
    const prevButton = screen.getByLabelText("الخطوة السابقة");
    
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();
  });

  test("يعرض إحصائيات سريعة", () => {
    renderWithProviders(<HowItWorks />);
    
    expect(screen.getByText("متوسط وقت الإعداد")).toBeInTheDocument();
    expect(screen.getByText("15 دقيقة")).toBeInTheDocument();
  });

  test("يحتوي على رسوم متحركة للانتقال", async () => {
    renderWithProviders(<HowItWorks />);
    
    const step2Tab = screen.getByText("التخصيص والتدريب");
    fireEvent.click(step2Tab);
    
    await waitFor(() => {
      const activeStep = screen.getByTestId("active-step");
      expect(activeStep).toHaveClass("fade-in");
    });
  });

  test("يعرض قائمة مرجعية للإعداد", () => {
    renderWithProviders(<HowItWorks />);
    
    expect(screen.getByText("قائمة الإعداد")).toBeInTheDocument();
    expect(screen.getByText("ربط المتجر")).toBeInTheDocument();
    expect(screen.getByText("تخصيص الرسائل")).toBeInTheDocument();
    expect(screen.getByText("اختبار البوت")).toBeInTheDocument();
  });
});
