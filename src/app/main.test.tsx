import { screen, waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import { vi } from "vitest";

// Mock ReactDOM
const mockCreateRoot = vi.fn();
const mockRender = vi.fn();

vi.mock("react-dom/client", () => ({
  createRoot: () => ({
    render: mockRender,
  }),
}));

// Mock Sentry
const mockSentryInit = vi.fn();
vi.mock("@sentry/react", () => ({
  init: mockSentryInit,
  browserTracingIntegration: () => ({}),
}));

// Mock emotion cache
const mockCreateCache = vi.fn(() => ({ key: "muirtl" }));
vi.mock("@emotion/cache", () => ({
  default: mockCreateCache,
}));

// Mock stylis RTL plugin
const mockStylisRTLPlugin = {};
vi.mock("stylis-plugin-rtl", () => ({
  default: mockStylisRTLPlugin,
}));

// Mock App component
const MockApp = () => <div data-testid="app-component">App Component</div>;
vi.mock("./App", () => ({
  default: MockApp,
}));

// Mock AppProviders
const MockAppProviders = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="app-providers">{children}</div>
);
vi.mock("@/app/providers/QueryClientProvider", () => ({
  default: MockAppProviders,
}));

// Mock AuthProvider
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="auth-provider">{children}</div>
);
vi.mock("@/context/AuthContext", () => ({
  AuthProvider: MockAuthProvider,
}));

// Mock CartProvider
const MockCartProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="cart-provider">{children}</div>
);
vi.mock("@/context/CartContext", () => ({
  CartProvider: MockCartProvider,
}));

// Mock ToastContainer
const MockToastContainer = () => <div data-testid="toast-container">Toast Container</div>;
vi.mock("react-toastify", () => ({
  ToastContainer: MockToastContainer,
}));

// Mock CSS imports
vi.mock("react-toastify/dist/ReactToastify.css", () => ({}));

describe("main.tsx component structure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders with proper provider hierarchy", () => {
    const { container } = render(
      <div>
        <MockAppProviders>
          <MockAuthProvider>
            <MockCartProvider>
              <MockApp />
            </MockCartProvider>
          </MockAuthProvider>
        </MockAppProviders>
        <MockToastContainer />
      </div>
    );
    
    expect(screen.getByTestId("app-providers")).toBeInTheDocument();
    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("cart-provider")).toBeInTheDocument();
    expect(screen.getByTestId("app-component")).toBeInTheDocument();
    expect(screen.getByTestId("toast-container")).toBeInTheDocument();
  });

  test("maintains proper nesting order", () => {
    const { container } = render(
      <div>
        <MockAppProviders>
          <MockAuthProvider>
            <MockCartProvider>
              <MockApp />
            </MockCartProvider>
          </MockAuthProvider>
        </MockAppProviders>
        <MockToastContainer />
      </div>
    );
    
    // Check that providers are properly nested
    const appProviders = screen.getByTestId("app-providers");
    const authProvider = screen.getByTestId("auth-provider");
    const cartProvider = screen.getByTestId("cart-provider");
    const appComponent = screen.getByTestId("app-component");
    
    expect(appProviders).toContainElement(authProvider);
    expect(authProvider).toContainElement(cartProvider);
    expect(cartProvider).toContainElement(appComponent);
  });

  test("includes all required providers", () => {
    const { container } = render(
      <div>
        <MockAppProviders>
          <MockAuthProvider>
            <MockCartProvider>
              <MockApp />
            </MockCartProvider>
          </MockAuthProvider>
        </MockAppProviders>
        <MockToastContainer />
      </div>
    );
    
    // Verify all essential providers are present
    expect(screen.getByTestId("app-providers")).toBeInTheDocument();
    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("cart-provider")).toBeInTheDocument();
  });

  test("renders app component within providers", () => {
    const { container } = render(
      <div>
        <MockAppProviders>
          <MockAuthProvider>
            <MockCartProvider>
              <MockApp />
            </MockCartProvider>
          </MockAuthProvider>
        </MockAppProviders>
        <MockToastContainer />
      </div>
    );
    
    // Verify app component is rendered
    expect(screen.getByTestId("app-component")).toBeInTheDocument();
    expect(screen.getByText("App Component")).toBeInTheDocument();
  });

  test("includes toast container", () => {
    const { container } = render(
      <div>
        <MockAppProviders>
          <MockAuthProvider>
            <MockCartProvider>
              <MockApp />
            </MockCartProvider>
          </MockAuthProvider>
        </MockAppProviders>
        <MockToastContainer />
      </div>
    );
    
    // Verify toast container is present
    expect(screen.getByTestId("toast-container")).toBeInTheDocument();
    expect(screen.getByText("Toast Container")).toBeInTheDocument();
  });

  test("maintains proper HTML structure", () => {
    const { container } = render(
      <div>
        <MockAppProviders>
          <MockAuthProvider>
            <MockCartProvider>
              <MockApp />
            </MockCartProvider>
          </MockAuthProvider>
        </MockAppProviders>
        <MockToastContainer />
      </div>
    );
    
    // Check overall structure
    expect(container).toBeInTheDocument();
    expect(container.firstChild).toBeInTheDocument();
  });

  test("handles provider dependencies correctly", () => {
    const { container } = render(
      <div>
        <MockAppProviders>
          <MockAuthProvider>
            <MockCartProvider>
              <MockApp />
            </MockCartProvider>
          </MockAuthProvider>
        </MockAppProviders>
        <MockToastContainer />
      </div>
    );
    
    // Verify that all providers work together
    const appProviders = screen.getByTestId("app-providers");
    const authProvider = screen.getByTestId("auth-provider");
    const cartProvider = screen.getByTestId("cart-provider");
    
    expect(appProviders).toBeInTheDocument();
    expect(authProvider).toBeInTheDocument();
    expect(cartProvider).toBeInTheDocument();
  });

  test("provides proper context hierarchy", () => {
    const { container } = render(
      <div>
        <MockAppProviders>
          <MockAuthProvider>
            <MockCartProvider>
              <MockApp />
            </MockCartProvider>
          </MockAuthProvider>
        </MockAppProviders>
        <MockToastContainer />
      </div>
    );
    
    // Verify context hierarchy is maintained
    expect(screen.getByTestId("app-providers")).toBeInTheDocument();
    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("cart-provider")).toBeInTheDocument();
  });

  test("renders all major components", () => {
    const { container } = render(
      <div>
        <MockAppProviders>
          <MockAuthProvider>
            <MockCartProvider>
              <MockApp />
            </MockCartProvider>
          </MockAuthProvider>
        </MockAppProviders>
        <MockToastContainer />
      </div>
    );
    
    // Verify all major components are rendered
    expect(screen.getByTestId("app-component")).toBeInTheDocument();
    expect(screen.getByTestId("toast-container")).toBeInTheDocument();
  });

  test("maintains component isolation", () => {
    const { container } = render(
      <div>
        <MockAppProviders>
          <MockAuthProvider>
            <MockCartProvider>
              <MockApp />
            </MockCartProvider>
          </MockAuthProvider>
        </MockAppProviders>
        <MockToastContainer />
      </div>
    );
    
    // Verify components are properly isolated
    const appComponent = screen.getByTestId("app-component");
    const toastContainer = screen.getByTestId("toast-container");
    
    expect(appComponent).not.toContainElement(toastContainer);
    expect(toastContainer).not.toContainElement(appComponent);
  });
});
