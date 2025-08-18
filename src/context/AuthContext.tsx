// src/context/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
type Role = "ADMIN" | "MERCHANT" | "MEMBER";

// --- تعريف نوع المستخدم
interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  merchantId: string | null;
  firstLogin: boolean;
  emailVerified: boolean; // 👈 جديد
  storeName?: string;
  storeLogoUrl?: string;
  storeAvatarUrl?: string;
}

// --- تعريف الـ Context Type
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (...roles: Role[]) => boolean; // 👈 جديد
  isAdmin: boolean;
}

// --- إنشاء السياق
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  hasRole: () => false,
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  // 1. نقرأ من localStorage قبل أول رندر
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(() => {
    const str = localStorage.getItem("user");
    return str ? JSON.parse(str) : null;
  });
  const hasRole = (...roles: Role[]) =>
    !!user && roles.includes(user.role as Role);
  const isAdmin = hasRole("ADMIN");

  // 2. دالة تسجيل الدخول
  const login = (userData: User, tokenValue: string) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));

    // ✅ أعطِ الأدمن أولوية الدخول مباشرة
    if (userData.role === "ADMIN") {
      navigate("/admin/kleem", { replace: true });
      return;
    }

    // ✅ اعتبر البريد مؤكَّدًا إذا لم يأتِ الحقل من الباك
    const isEmailVerified = userData.emailVerified ?? true;
    if (!isEmailVerified) {
      navigate("/verify-email", { replace: true });
      return;
    }

    if (userData.firstLogin) {
      navigate("/onboarding", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  // 3. دالة تسجيل الخروج
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        hasRole,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// هوك الاستهلاك
export const useAuth = () => useContext(AuthContext);
