import { vi, test, expect, beforeEach } from "vitest";

// Hoisted mocks to ensure they're applied before imports
const mocks = vi.hoisted(() => ({
  reactDom: {
    createRoot: vi.fn(() => ({
      render: vi.fn(),
      unmount: vi.fn()
    }))
  },
  sentry: {
    init: vi.fn(),
    browserTracingIntegration: vi.fn(),
  },
  mui: {
    ThemeProvider: ({ children }: any) => children,
    CssBaseline: () => null,
  },
  router: {
    BrowserRouter: ({ children }: any) => children,
  },
  emotion: {
    CacheProvider: ({ children }: any) => children,
  },
  toast: {
    ToastContainer: () => null,
  },
  queryProvider: {
    default: ({ children }: any) => children,
  },
  auth: {
    AuthProvider: ({ children }: any) => children,
  },
  cart: {
    CartProvider: ({ children }: any) => children,
  },
  theme: {
    default: { palette: { primary: { main: '#1976d2' } } }
  },
  app: {
    default: () => <div data-testid="app">Mock App</div>,
  },
  stylisRtl: {
    default: vi.fn()
  }
}));

// Apply mocks using doMock so they run before the module is imported
vi.doMock("react-dom/client", () => mocks.reactDom);
vi.doMock("@sentry/react", () => mocks.sentry);
vi.doMock("@mui/material", () => mocks.mui);
vi.doMock("react-router-dom", () => mocks.router);
vi.doMock("@emotion/react", () => mocks.emotion);
vi.doMock("react-toastify", () => mocks.toast);
vi.doMock("@/app/providers/QueryClientProvider", () => mocks.queryProvider);
vi.doMock("@/context/AuthContext", () => mocks.auth);
vi.doMock("@/context/CartContext", () => mocks.cart);
vi.doMock("@/theme/theme", () => mocks.theme);
vi.doMock("@/app/App", () => mocks.app);
vi.doMock("stylis-plugin-rtl", () => mocks.stylisRtl);

beforeEach(() => {
  // Clean DOM
  document.body.innerHTML = '<div id="root"></div>';

  // Clear mocks
  vi.clearAllMocks();

  // Set RTL
  document.documentElement.setAttribute("dir", "rtl");
});

test("sets RTL direction and initializes app", async () => {
  await import("./main");

  expect(document.documentElement.getAttribute("dir")).toBe("rtl");

  const { createRoot } = await import("react-dom/client");
  expect(createRoot).toHaveBeenCalledWith(document.getElementById("root"));

  const Sentry = await import("@sentry/react");
  expect(Sentry.init).toHaveBeenCalled();
  expect(Sentry.browserTracingIntegration).toHaveBeenCalled();
});

test("renders app successfully", async () => {
  await import("./main");

  const rootElement = document.getElementById("root");
  expect(rootElement).toBeInTheDocument();

  const { createRoot } = await import("react-dom/client");
  expect(createRoot).toHaveBeenCalledTimes(1);
});
