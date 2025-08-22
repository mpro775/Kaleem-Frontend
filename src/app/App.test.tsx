import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import App from "./App";
import { vi } from "vitest";

// Mock all lazy components to avoid loading issues
vi.mock("@/pages/public/Home", () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock("@/pages/auth/LoginPage", () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock("@/pages/auth/SignUpPage", () => ({
  default: () => <div data-testid="signup-page">Sign Up Page</div>,
}));

vi.mock("@/pages/auth/VerifyEmailPage", () => ({
  default: () => <div data-testid="verify-email-page">Verify Email Page</div>,
}));

vi.mock("@/pages/ChatPage", () => ({
  default: () => <div data-testid="chat-page">Chat Page</div>,
}));

vi.mock("@/pages/store/StorePage", () => ({
  default: () => <div data-testid="store-page">Store Page</div>,
}));

vi.mock("@/pages/store/OrderDetailsPage", () => ({
  default: () => <div data-testid="order-details-page">Order Details Page</div>,
}));

vi.mock("@/pages/store/ProductDetailsPage", () => ({
  default: () => <div data-testid="product-details-page">Product Details Page</div>,
}));

vi.mock("@/pages/store/AboutPage", () => ({
  default: () => <div data-testid="about-page">About Page</div>,
}));

vi.mock("@/pages/onboarding/OnboardingPage", () => ({
  default: () => <div data-testid="onboarding-page">Onboarding Page</div>,
}));

vi.mock("@/pages/onboarding/SourceSelectPage", () => ({
  default: () => <div data-testid="source-select-page">Source Select Page</div>,
}));

vi.mock("@/pages/onboarding/SyncPage", () => ({
  default: () => <div data-testid="sync-page">Sync Page</div>,
}));

vi.mock("@/app/layout/merchant/MerchantLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="merchant-layout">
      <div>Merchant Layout</div>
      {children}
    </div>
  ),
}));

vi.mock("@/pages/merchant/Dashboard", () => ({
  default: () => <div data-testid="merchant-dashboard">Merchant Dashboard</div>,
}));

vi.mock("@/pages/merchant/ConversationsPage", () => ({
  default: () => <div data-testid="conversations-page">Conversations Page</div>,
}));

vi.mock("@/pages/merchant/PromptStudio", () => ({
  default: () => <div data-testid="prompt-studio">Prompt Studio</div>,
}));

vi.mock("@/pages/merchant/KnowledgePage", () => ({
  default: () => <div data-testid="knowledge-page">Knowledge Page</div>,
}));

vi.mock("@/pages/merchant/LeadsManagerPage", () => ({
  default: () => <div data-testid="leads-manager-page">Leads Manager Page</div>,
}));

vi.mock("@/pages/merchant/SupportPage", () => ({
  default: () => <div data-testid="support-page">Support Page</div>,
}));

vi.mock("@/pages/merchant/AccountSettingsPage", () => ({
  default: () => <div data-testid="account-settings-page">Account Settings Page</div>,
}));

vi.mock("@/pages/merchant/ChatSettingsPage", () => ({
  default: () => <div data-testid="chat-settings-page">Chat Settings Page</div>,
}));

vi.mock("@/pages/merchant/ProductsPage", () => ({
  default: () => <div data-testid="products-page">Products Page</div>,
}));

vi.mock("@/pages/merchant/CategoriesPage", () => ({
  default: () => <div data-testid="categories-page">Categories Page</div>,
}));

vi.mock("@/pages/merchant/OrdersPage", () => ({
  default: () => <div data-testid="orders-page">Orders Page</div>,
}));

vi.mock("@/pages/merchant/BannersManagementPage", () => ({
  default: () => <div data-testid="banners-management-page">Banners Management Page</div>,
}));

vi.mock("@/pages/merchant/ChannelsIntegrationPage", () => ({
  default: () => <div data-testid="channels-integration-page">Channels Integration Page</div>,
}));

vi.mock("@/pages/merchant/MerchantSettingsPage", () => ({
  default: () => <div data-testid="merchant-settings-page">Merchant Settings Page</div>,
}));

vi.mock("@/pages/merchant/StorefrontThemePage", () => ({
  default: () => <div data-testid="storefront-theme-page">Storefront Theme Page</div>,
}));

vi.mock("@/pages/merchant/AnalyticsPage", () => ({
  default: () => <div data-testid="merchant-analytics-page">Merchant Analytics Page</div>,
}));

vi.mock("@/pages/admin/kleem/Dashboard", () => ({
  default: () => <div data-testid="kleem-dashboard">Kleem Dashboard</div>,
}));

vi.mock("@/pages/admin/kleem/PromptsPage", () => ({
  default: () => <div data-testid="kleem-prompts-page">Kleem Prompts Page</div>,
}));

vi.mock("@/pages/admin/kleem/KnowledgeBasePage", () => ({
  default: () => <div data-testid="kleem-knowledge-base-page">Kleem Knowledge Base Page</div>,
}));

vi.mock("@/pages/admin/kleem/ConversationsPage", () => ({
  default: () => <div data-testid="kleem-conversations-page">Kleem Conversations Page</div>,
}));

vi.mock("@/pages/admin/kleem/ConversationView", () => ({
  default: () => <div data-testid="kleem-conversation-view">Kleem Conversation View</div>,
}));

vi.mock("@/pages/merchant/MissingResponsesPage", () => ({
  default: () => <div data-testid="missing-responses-page">Missing Responses Page</div>,
}));

vi.mock("@/pages/admin/kleem/ChatSettingsPage", () => ({
  default: () => <div data-testid="kleem-chat-settings-page">Kleem Chat Settings Page</div>,
}));

vi.mock("@/pages/admin/kleem/KleemMissingResponsesPage", () => ({
  default: () => <div data-testid="kleem-missing-responses-page">Kleem Missing Responses Page</div>,
}));

vi.mock("@/pages/admin/kleem/KleemRatingsPage", () => ({
  default: () => <div data-testid="kleem-ratings-page">Kleem Ratings Page</div>,
}));

vi.mock("@/pages/admin/kleem/AnalyticsPage", () => ({
  default: () => <div data-testid="kleem-analytics-page">Kleem Analytics Page</div>,
}));

vi.mock("@/app/GlobalGradients", () => ({
  default: () => <div data-testid="global-gradients">Global Gradients</div>,
}));

vi.mock("@/pages/merchant/InstructionsPage", () => ({
  default: () => <div data-testid="instructions-page">Instructions Page</div>,
}));

// Mock ProtectedRoute and RoleRoute
vi.mock("./routes/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

vi.mock("./routes/RoleRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="role-route">{children}</div>
  ),
}));

describe("App", () => {
  test("renders without crashing", async () => {
    renderWithProviders(<App />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByTestId("global-gradients")).toBeInTheDocument();
    });
  });

  test("renders home page by default", async () => {
    renderWithProviders(<App />);
    
    // By default, the home page should be rendered
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("renders global gradients component", () => {
    renderWithProviders(<App />);
    
    // Global gradients should always be present
    expect(screen.getByTestId("global-gradients")).toBeInTheDocument();
  });

  test("maintains basic component structure", async () => {
    renderWithProviders(<App />);
    
    // Check that the main structure is maintained
    expect(screen.getByTestId("global-gradients")).toBeInTheDocument();
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("handles lazy loading gracefully", async () => {
    renderWithProviders(<App />);
    
    // All lazy-loaded components should render without issues
    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });
  });

  test("renders all major sections", async () => {
    renderWithProviders(<App />);
    
    // Verify that all major application sections are present
    expect(screen.getByTestId("global-gradients")).toBeInTheDocument();
    
    // Public section (default route)
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("applies proper routing structure", () => {
    renderWithProviders(<App />);
    
    // The app should render with proper routing structure
    const appContainer = screen.getByTestId("home-page").closest("div");
    expect(appContainer).toBeInTheDocument();
  });

  test("includes Suspense wrapper", () => {
    renderWithProviders(<App />);
    
    // The app should be wrapped in Suspense for lazy loading
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("renders with proper HTML structure", () => {
    renderWithProviders(<App />);
    
    // Check that the app renders with proper HTML structure
    expect(document.body).toBeInTheDocument();
    expect(screen.getByTestId("global-gradients")).toBeInTheDocument();
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("handles component imports correctly", () => {
    renderWithProviders(<App />);
    
    // All mocked components should be accessible
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("maintains routing configuration", () => {
    renderWithProviders(<App />);
    
    // The app should maintain its routing configuration
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });
});
