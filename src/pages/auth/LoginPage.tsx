// src/pages/auth/LoginPage.tsx
import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { RiEyeCloseLine } from "react-icons/ri";
import { TfiEye } from "react-icons/tfi";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { loginAPI } from "@/auth/api";
import AuthLayout from "@/auth/AuthLayout";
import GradientIcon from "@/shared/ui/GradientIcon";
import { getAxiosMessage } from "@/shared/lib/errors";

export default function LoginPage() {
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password)
      return toast.error("يرجى إدخال البريد وكلمة المرور");
    try {
      setLoading(true);
      const { accessToken, user } = await loginAPI(email, password);
      login(user, accessToken);
      toast.success("تم تسجيل الدخول بنجاح!");
    } catch (err) {
      toast.error(getAxiosMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        <Typography
          variant="h4"
          fontWeight="bold"
          color={theme.palette.primary.dark}
        >
          تسجيل الدخول
        </Typography>
      }
      subtitle={
        <Typography variant="body2" color="text.secondary">
          سجّل دخولك وابدأ تجربة كليم الذكية!
        </Typography>
      }
    >
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        autoComplete="off"
        dir="rtl"
      >
        <TextField
          label="البريد الإلكتروني"
          fullWidth
          sx={{ mb: 3 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" aria-hidden>
                <GradientIcon
                  Icon={FaEnvelope}
                  size={22}
                  startColor={theme.palette.primary.dark}
                  endColor={theme.palette.primary.main}
                />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="كلمة المرور"
          type={showPassword ? "text" : "password"}
          fullWidth
          sx={{ mb: 4 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" aria-hidden>
                <GradientIcon
                  Icon={FaLock}
                  size={22}
                  startColor={theme.palette.primary.dark}
                  endColor={theme.palette.primary.main}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((p) => !p)}
                  edge="end"
                  tabIndex={-1}
                  aria-label={
                    showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <GradientIcon
                      Icon={TfiEye}
                      size={18}
                      startColor={theme.palette.primary.dark}
                      endColor={theme.palette.primary.main}
                    />
                  ) : (
                    <GradientIcon
                      Icon={RiEyeCloseLine}
                      size={18}
                      startColor={theme.palette.primary.dark}
                      endColor={theme.palette.primary.main}
                    />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{
            py: 1.5,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            fontWeight: "bold",
          }}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            "تسجيل الدخول"
          )}
        </Button>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 3, color: "text.secondary" }}
        >
          ليس لديك حساب؟{" "}
          <Link href="/signup" underline="hover" color="primary">
            أنشئ حسابًا الآن
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
}
