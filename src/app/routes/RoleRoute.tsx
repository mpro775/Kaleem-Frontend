// src/routes/RoleRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { JSX } from "react";

export default function RoleRoute({
  allow,
  children,
}: {
  allow: Array<"ADMIN" | "MERCHANT" | "MEMBER">;
  children: JSX.Element;
}) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !allow.includes(user.role as "ADMIN" | "MERCHANT" | "MEMBER"))
    return <Navigate to="/" replace />;
  return children;
}
