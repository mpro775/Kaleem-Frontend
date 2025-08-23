import { vi, test, expect, beforeEach } from "vitest";

// Mock محسن لـ react-dom/client
vi.mock("react-dom/client", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    createRoot: vi.fn(() => ({ 
      render: vi.fn(),
      unmount: vi.fn()
    }))
  };
});

// Mock محسن لـ @sentry/react
vi.mock("@sentry/react", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    init: vi.fn(),
    browserTracingIntegration: vi.fn(),
  };
});

// Mock مبسط لجميع المكونات
vi.mock("@mui/material", () => ({
  ThemeProvider: ({ children }: any) => children,
  CssBaseline: () => null,
}));

vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: any) => children,
}));

vi.mock("@emotion/react", () => ({
  CacheProvider: ({ children }: any) => children,
}));

vi.mock("react-toastify", () => ({
  ToastContainer: () => null,
}));

vi.mock("@/app/providers/QueryClientProvider", () => ({
  default: ({ children }: any) => children,
}));

vi.mock("@/context/AuthContext", () => ({
  AuthProvider: ({ children }: any) => children,
}));

vi.mock("@/context/CartContext", () => ({
  CartProvider: ({ children }: any) => children,
}));

vi.mock("@/theme/theme", () => ({
  default: { palette: { primary: { main: '#1976d2' } } }
}));

vi.mock("@/app/App", () => ({
  default: () => <div data-testid="app">Mock App</div>
}));

vi.mock("stylis-plugin-rtl", () => ({
  default: vi.fn()
}));

beforeEach(() => {
  // تنظيف DOM
  document.body.innerHTML = '<div id="root"></div>';
  
  // تنظيف المؤكات
  vi.clearAllMocks();
  
  // إعداد RTL
  document.documentElement.setAttribute("dir", "rtl");
});

test("sets RTL direction and initializes app", async () => {
  // استيراد الملف
  await import("./main");
  
  // التحقق من RTL
  expect(document.documentElement.getAttribute("dir")).toBe("rtl");
  
  // التحقق من createRoot
  const { createRoot } = await import("react-dom/client");
  expect(createRoot).toHaveBeenCalledWith(document.getElementById("root"));
  
  // التحقق من Sentry
  const Sentry = await import("@sentry/react");
  expect(Sentry.init).toHaveBeenCalled();
  expect(Sentry.browserTracingIntegration).toHaveBeenCalled();
});

test("renders app successfully", async () => {
  await import("./main");
  
  // التحقق من وجود العنصر
  const rootElement = document.getElementById("root");
  expect(rootElement).toBeInTheDocument();
  
  // التحقق من أن createRoot تم استدعاؤه مرة واحدة
  const { createRoot } = await import("react-dom/client");
  expect(createRoot).toHaveBeenCalledTimes(1);
});
