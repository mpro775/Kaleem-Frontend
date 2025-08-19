import axios from "axios";
import { API_BASE } from "../context/config";

export type Role = "ADMIN" | "MERCHANT" | "MEMBER";

export interface UserDTO {
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

export interface AuthResponse {
  accessToken: string;
  user: UserDTO;
}

export const loginAPI = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await axios.post<AuthResponse>(`${API_BASE}/auth/login`, {
    email,
    password,
  });
  return res.data;
};
export async function ensureMerchant(token: string) {
  const { data } = await axios.post(`${API_BASE}/auth/ensure-merchant`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data; // { accessToken, user }
}
export const signUpAPI = async (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<AuthResponse> => {
  const res = await axios.post<AuthResponse>(`${API_BASE}/auth/register`, {
    name,
    email,
    password,
    confirmPassword,
  });
  return res.data;
};

export const verifyEmailAPI = async (
  email: string,
  code: string
): Promise<void> => {
  await axios.post(`${API_BASE}/auth/verify-email`, { email, code });
};

export const resendVerificationAPI = async (email: string): Promise<void> => {
  await axios.post(`${API_BASE}/auth/resend-verification`, { email });
};
