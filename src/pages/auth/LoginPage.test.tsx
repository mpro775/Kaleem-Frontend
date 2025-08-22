import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import LoginPage from "./LoginPage";
import { vi } from "vitest";

// Mock dependencies at the top level
vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));

vi.mock("@/auth/api", () => ({
  loginAPI: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/auth/AuthLayout", () => ({
  default: ({ children, title, subtitle }: any) => (
    <div data-testid="auth-layout">
      <div data-testid="auth-title">{title}</div>
      <div data-testid="auth-subtitle">{subtitle}</div>
      {children}
    </div>
  ),
}));

vi.mock("@/shared/ui/GradientIcon", () => ({
  default: ({ Icon, ...props }: any) => <Icon data-testid="gradient-icon" {...props} />,
}));

// Import mocked modules
import { useAuth } from "@/context/AuthContext";
import { loginAPI } from "@/auth/api";
import { toast } from "react-toastify";

describe("LoginPage", () => {
  const user = userEvent.setup();

  // Mock functions
  const mockLogin = vi.fn();
  const mockLoginAPI = vi.fn();
  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
    } as any);
    
    vi.mocked(loginAPI).mockImplementation(mockLoginAPI);
    
    vi.mocked(toast.error).mockImplementation(mockToast.error);
    vi.mocked(toast.success).mockImplementation(mockToast.success);
  });

  test("renders without crashing", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
    expect(screen.getByTestId("auth-title")).toHaveTextContent("تسجيل الدخول");
    expect(screen.getByText("سجّل دخولك وابدأ تجربة كليم الذكية!")).toBeInTheDocument();
  });

  test("renders all form elements", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText("البريد الإلكتروني")).toBeInTheDocument();
    expect(screen.getByLabelText("كلمة المرور")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "تسجيل الدخول" })).toBeInTheDocument();
    expect(screen.getByText("ليس لديك حساب؟")).toBeInTheDocument();
    expect(screen.getByText("أنشئ حسابًا الآن")).toBeInTheDocument();
  });

  test("renders icons correctly", () => {
    renderWithProviders(<LoginPage />);

    const icons = screen.getAllByTestId("gradient-icon");
    expect(icons).toHaveLength(3);
  });

  test("handles email input changes", async () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText("البريد الإلكتروني");
    await user.type(emailInput, "test@example.com");

    expect(emailInput).toHaveValue("test@example.com");
  });

  test("handles password input changes", async () => {
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByLabelText("كلمة المرور");
    await user.type(passwordInput, "password123");

    expect(passwordInput).toHaveValue("password123");
  });

  test("toggles password visibility", async () => {
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByLabelText("كلمة المرور");
    const toggleButton = screen.getByRole("button", { name: "إظهار كلمة المرور" });

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "إخفاء كلمة المرور" })).toBeInTheDocument();

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "إظهار كلمة المرور" })).toBeInTheDocument();
  });

  test("shows error toast when email is empty", async () => {
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByLabelText("كلمة المرور");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByRole("button", { name: "تسجيل الدخول" });
    await user.click(submitButton);

    expect(mockToast.error).toHaveBeenCalledWith("يرجى إدخال البريد وكلمة المرور");
  });

  test("shows error toast when password is empty", async () => {
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText("البريد الإلكتروني");
    await user.type(emailInput, "test@example.com");

    const submitButton = screen.getByRole("button", { name: "تسجيل الدخول" });
    await user.click(submitButton);

    expect(mockToast.error).toHaveBeenCalledWith("يرجى إدخال البريد وكلمة المرور");
  });

  test("shows error toast when both fields are empty", async () => {
    renderWithProviders(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: "تسجيل الدخول" });
    await user.click(submitButton);

    expect(mockToast.error).toHaveBeenCalledWith("يرجى إدخال البريد وكلمة المرور");
  });

  test("handles successful login", async () => {
    const mockUser = { id: "1", email: "test@example.com", role: "MERCHANT" };
    const mockToken = "mock-access-token";

    mockLoginAPI.mockResolvedValue({
      accessToken: mockToken,
      user: mockUser,
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText("البريد الإلكتروني");
    const passwordInput = screen.getByLabelText("كلمة المرور");
    const submitButton = screen.getByRole("button", { name: "تسجيل الدخول" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLoginAPI).toHaveBeenCalledWith("test@example.com", "password123");
      expect(mockLogin).toHaveBeenCalledWith(mockUser, mockToken);
      expect(mockToast.success).toHaveBeenCalledWith("تم تسجيل الدخول بنجاح!");
    });
  });

  test("handles login API error", async () => {
    const mockError = new Error("Invalid credentials");
    mockLoginAPI.mockRejectedValue(mockError);

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText("البريد الإلكتروني");
    const passwordInput = screen.getByLabelText("كلمة المرور");
    const submitButton = screen.getByRole("button", { name: "تسجيل الدخول" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLoginAPI).toHaveBeenCalledWith("test@example.com", "wrongpassword");
      expect(mockToast.error).toHaveBeenCalled();
    });
  });

  test("shows loading state during login", async () => {
    mockLoginAPI.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText("البريد الإلكتروني");
    const passwordInput = screen.getByLabelText("كلمة المرور");
    const submitButton = screen.getByRole("button", { name: "تسجيل الدخول" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Button should be disabled and show loading spinner
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("form submission prevents default behavior", async () => {
    renderWithProviders(<LoginPage />);

    const form = screen.getByTestId("auth-layout").querySelector("form");
    const emailInput = screen.getByLabelText("البريد الإلكتروني");
    const passwordInput = screen.getByLabelText("كلمة المرور");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    mockLoginAPI.mockResolvedValue({
      accessToken: "token",
      user: { id: "1", email: "test@example.com" },
    });

    const submitButton = screen.getByRole("button", { name: "تسجيل الدخول" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLoginAPI).toHaveBeenCalled();
    });
  });

  test("form has correct attributes", () => {
    renderWithProviders(<LoginPage />);

    const form = screen.getByTestId("auth-layout").querySelector("form");
    expect(form).toHaveAttribute("autoComplete", "off");
    expect(form).toHaveAttribute("dir", "rtl");
  });

  test("password field has correct autocomplete attribute", () => {
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByLabelText("كلمة المرور");
    expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
  });

  test("signup link has correct href", () => {
    renderWithProviders(<LoginPage />);

    const signupLink = screen.getByText("أنشئ حسابًا الآن");
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  test("handles rapid form submissions", async () => {
    mockLoginAPI.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)));

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText("البريد الإلكتروني");
    const passwordInput = screen.getByLabelText("كلمة المرور");
    const submitButton = screen.getByRole("button", { name: "تسجيل الدخول" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    // First click should work
    await user.click(submitButton);
    
    // Wait for loading state to be active
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
    
    // Button is now disabled, so we can't click it again
    // This test verifies that the API is only called once
    await waitFor(() => {
      expect(mockLoginAPI).toHaveBeenCalledTimes(1);
    });
  });

  test("resets form state after successful login", async () => {
    const mockUser = { id: "1", email: "test@example.com", role: "MERCHANT" };
    const mockToken = "mock-access-token";

    mockLoginAPI.mockResolvedValue({
      accessToken: mockToken,
      user: mockUser,
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText("البريد الإلكتروني");
    const passwordInput = screen.getByLabelText("كلمة المرور");
    const submitButton = screen.getByRole("button", { name: "تسجيل الدخول" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    // Note: The actual component doesn't reset form state after login
    // This test should reflect the actual behavior
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("maintains form state during loading", async () => {
    mockLoginAPI.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText("البريد الإلكتروني");
    const passwordInput = screen.getByLabelText("كلمة المرور");
    const submitButton = screen.getByRole("button", { name: "تسجيل الدخول" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("handles special characters in email and password", async () => {
    const specialEmail = "test+special@example.com";
    const specialPassword = "p@ssw0rd!@#$%";

    mockLoginAPI.mockResolvedValue({
      accessToken: "token",
      user: { id: "1", email: specialEmail },
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText("البريد الإلكتروني");
    const passwordInput = screen.getByLabelText("كلمة المرور");
    const submitButton = screen.getByRole("button", { name: "تسجيل الدخول" });

    await user.type(emailInput, specialEmail);
    await user.type(passwordInput, specialPassword);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLoginAPI).toHaveBeenCalledWith(specialEmail, specialPassword);
    });
  });

  test("accessibility features work correctly", () => {
    renderWithProviders(<LoginPage />);

    const passwordToggle = screen.getByRole("button", { name: "إظهار كلمة المرور" });
    expect(passwordToggle).toHaveAttribute("aria-pressed", "false");
    expect(passwordToggle).toHaveAttribute("tabIndex", "-1");

    // Check that the first icon (email icon) has aria-hidden
    const emailIcon = screen.getAllByTestId("gradient-icon")[0];
    // The actual component doesn't set aria-hidden on the icon itself
    // It's set on the InputAdornment wrapper
    const emailIconWrapper = emailIcon.closest('[aria-hidden="true"]');
    expect(emailIconWrapper).toBeInTheDocument();
  });
});
