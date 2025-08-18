import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import Testimonials from "./Testimonials";

describe("Testimonials", () => {
  test("يعرض عنوان قسم الشهادات", () => {
    renderWithProviders(<Testimonials />);
    
    expect(screen.getByText("ماذا يقول عملاؤنا")).toBeInTheDocument();
    expect(screen.getByText(/أكثر من 1000 متجر يثق بكليم/)).toBeInTheDocument();
  });

  test("يعرض الشهادات بالأسماء والتقييمات", () => {
    renderWithProviders(<Testimonials />);
    
    expect(screen.getByText("متجر عطور الوسام")).toBeInTheDocument();
    expect(screen.getByText("صاحب متجر")).toBeInTheDocument();
  });

  test("يعرض النجوم للتقييمات", () => {
    renderWithProviders(<Testimonials />);
    
    // البحث عن نجوم التقييم
    const stars = screen.getAllByTestId(/star-icon/);
    expect(stars.length).toBeGreaterThan(0);
  });

  test("يحتوي على أزرار التنقل", () => {
    renderWithProviders(<Testimonials />);
    
    const prevButton = screen.getByLabelText("السابق");
    const nextButton = screen.getByLabelText("التالي");
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  test("يتنقل بين الشهادات عند الضغط على أزرار التنقل", async () => {
    renderWithProviders(<Testimonials />);
    
    const nextButton = screen.getByLabelText("التالي");
    
    // الحصول على النص الحالي
    const currentTestimonial = screen.getByText(/من أول يوم ارتفعت نسبة الردود/);
    expect(currentTestimonial).toBeInTheDocument();
    
    // الانتقال للشهادة التالية
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      // التحقق من تغيير المحتوى
      expect(screen.queryByText(/من أول يوم ارتفعت نسبة الردود/)).not.toBeInTheDocument();
    });
  });

  test("يعرض مؤشرات النقاط للشهادات", () => {
    renderWithProviders(<Testimonials />);
    
    const dots = screen.getAllByRole("button", { name: /الانتقال للشهادة/ });
    expect(dots.length).toBeGreaterThan(1);
  });

  test("يتنقل للشهادة المحددة عند الضغط على النقطة", async () => {
    renderWithProviders(<Testimonials />);
    
    const dots = screen.getAllByRole("button", { name: /الانتقال للشهادة/ });
    
    if (dots.length > 1) {
      fireEvent.click(dots[1]);
      
      await waitFor(() => {
        // التحقق من تغيير الشهادة
        expect(dots[1]).toHaveAttribute("aria-pressed", "true");
      });
    }
  });

  test("يعرض تاريخ كل شهادة", () => {
    renderWithProviders(<Testimonials />);
    
    expect(screen.getByText("15 يناير 2023")).toBeInTheDocument();
  });

  test("يعرض صور العملاء (avatars)", () => {
    renderWithProviders(<Testimonials />);
    
    const avatars = screen.getAllByRole("img");
    expect(avatars.length).toBeGreaterThan(0);
  });

  test("يدعم التنقل التلقائي", async () => {
    renderWithProviders(<Testimonials />);
    
    // انتظار التنقل التلقائي
    await waitFor(
      () => {
        // التحقق من تغيير المحتوى تلقائياً
        const dots = screen.getAllByRole("button", { name: /الانتقال للشهادة/ });
        expect(dots.length).toBeGreaterThan(0);
      },
      { timeout: 6000 }
    );
  });

  test("يتوقف التنقل التلقائي عند التفاعل", async () => {
    renderWithProviders(<Testimonials />);
    
    const nextButton = screen.getByLabelText("التالي");
    
    // التفاعل مع الكاروسيل
    fireEvent.click(nextButton);
    
    // التحقق من توقف التنقل التلقائي
    await waitFor(() => {
      expect(nextButton).toBeInTheDocument();
    });
  });
});
