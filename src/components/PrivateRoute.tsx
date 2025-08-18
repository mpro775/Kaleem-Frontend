// src/components/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import type { JSX } from "react";
import useAuth from "../context/useAuth";

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
