import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import DemoSection from "./DemoSection";
import { vi } from "vitest";

// Mock the chat components
vi.mock("@/widgets/chatKaleem", () => ({
  ChatHeader: ({ title }: { title: string }) => <div data-testid="chat-header">{title}</div>,
  ChatBubble: ({ message, isBot }: { message: string; isBot: boolean }) => (
    <div data-testid={isBot ? "bot-message" : "user-message"}>{message}</div>
  ),
  LiveChat: ({ onStart }: { onStart: () => void }) => (
    <div data-testid="live-chat">
      <button onClick={onStart}>Start Chat</button>
    </div>
  ),
  DEMO_MESSAGES: [
    { text: "مرحباً، كيف يمكنني مساعدتك؟", isBot: true },
    { text: "أريد معرفة المزيد عن المنتجات", isBot: false },
  ],
  KLEEM_COLORS: {
    primary: "#1976d2",
    secondary: "#dc004e",
  },
}));

describe("DemoSection", () => {
  test("يعرض عنوان القسم والوصف", () => {
    renderWithProviders(<DemoSection />);
    
    expect(screen.getByText("شاهد كليم في العمل")).toBeInTheDocument();
    expect(screen.getByText(/جرب المحادثة التفاعلية/)).toBeInTheDocument();
  });

  test("يعرض واجهة المحادثة التوضيحية", () => {
    renderWithProviders(<DemoSection />);
    
    expect(screen.getByTestId("chat-header")).toBeInTheDocument();
    expect(screen.getByText("كليم - مساعدك الذكي")).toBeInTheDocument();
  });

  test("يعرض رسائل المحادثة التوضيحية", () => {
    renderWithProviders(<DemoSection />);
    
    expect(screen.getByText("مرحباً، كيف يمكنني مساعدتك؟")).toBeInTheDocument();
    expect(screen.getByText("أريد معرفة المزيد عن المنتجات")).toBeInTheDocument();
  });

  test("يحتوي على زر بدء المحادثة التفاعلية", () => {
    renderWithProviders(<DemoSection />);
    
    expect(screen.getByText("جرب المحادثة التفاعلية")).toBeInTheDocument();
  });

  test("يفعل المحادثة التفاعلية عند الضغط على الزر", async () => {
    renderWithProviders(<DemoSection />);
    
    const interactiveButton = screen.getByText("جرب المحادثة التفاعلية");
    fireEvent.click(interactiveButton);
    
    await waitFor(() => {
      expect(screen.getByTestId("live-chat")).toBeInTheDocument();
    });
  });

  test("يعرض معلومات حول سرعة الاستجابة", () => {
    renderWithProviders(<DemoSection />);
    
    expect(screen.getByText(/استجابة فورية/)).toBeInTheDocument();
    expect(screen.getByText(/متاح 24\/7/)).toBeInTheDocument();
  });

  test("يعرض إحصائيات الأداء", () => {
    renderWithProviders(<DemoSection />);
    
    expect(screen.getByText(/95% معدل الرضا/)).toBeInTheDocument();
    expect(screen.getByText(/< 2 ثانية وقت الاستجابة/)).toBeInTheDocument();
  });

  test("يحتوي على رسوم متحركة للكتابة", () => {
    renderWithProviders(<DemoSection />);
    
    // التحقق من وجود مؤشر الكتابة
    expect(screen.getByTestId("typing-indicator")).toBeInTheDocument();
  });
});
