// src/context/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type Role = "ADMIN" | "MERCHANT" | "MEMBER";

// --- تعريف نوع المستخدم
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  merchantId: string | null;
  firstLogin: boolean;
  emailVerified: boolean;
  storeName?: string;
  storeLogoUrl?: string;
  storeAvatarUrl?: string;
}

// --- تعريف الـ Context Type
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  setAuth: (user: User, token: string, opts?: { silent?: boolean }) => void; // 👈 جديد
  updateUser: (patch: Partial<User>) => void; // 👈 جديد
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (...roles: Role[]) => boolean;
  isAdmin: boolean;
}

// --- إنشاء السياق
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  setAuth: () => {},
  updateUser: () => {},
  logout: () => {},
  isAuthenticated: false,
  hasRole: () => false,
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  // 1) نقرأ من localStorage قبل أول رندر
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(() => {
    const str = localStorage.getItem("user");
    return str ? JSON.parse(str) : null;
  });

  const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role);
  const isAdmin = hasRole("ADMIN");

  // 2) دالة موحّدة لضبط الحالة والتخزين، مع خيار silent لمنع التنقّل التلقائي
  const setAuth: AuthContextType["setAuth"] = (userData, tokenValue, opts) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));

    if (opts?.silent) return; // 👈 بدون أي تنقّلات

    // توجيه ذكي بعد تسجيل الدخول
    if (userData.role === "ADMIN") {
      navigate("/admin/kleem", { replace: true });
      return;
    }

    // لا نفترض أنه مفعّل إن لم يصل الحقل
    const isEmailVerified = !!userData.emailVerified;
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

  // 3) login يستخدم setAuth بدون silent (سلوك سابق)
  const login = (userData: User, tokenValue: string) => {
    setAuth(userData, tokenValue, { silent: false });
  };

  // 4) تحديث جزئي لملف المستخدم (ويبقى token كما هو)
  const updateUser: AuthContextType["updateUser"] = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  // 5) تسجيل الخروج
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
        setAuth, // 👈 نوفرها للاستهلاك
        updateUser, // 👈 كذلك
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
