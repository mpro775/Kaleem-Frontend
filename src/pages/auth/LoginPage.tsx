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
import { useAuth } from "@/context/AuthContext";
import { loginAPI } from "@/auth/api";
import AuthLayout from "@/auth/AuthLayout";
import GradientIcon from "@/shared/ui/GradientIcon";
import { useErrorHandler, applyServerFieldErrors } from "@/shared/errors";
import { useForm } from "react-hook-form";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const theme = useTheme();
  const { login } = useAuth();
  const { handleError } = useErrorHandler();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormData>();

  const handleLogin = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const { accessToken, user } = await loginAPI(data.email, data.password);
      login(user, accessToken);
    } catch (err: any) {
      // إذا كان الخطأ يحتوي على أخطاء حقول، قم بتطبيقها
      if (err.fields) {
        applyServerFieldErrors(err.fields, setError);
      } else {
        // عرض رسالة خطأ عامة
        handleError(err);
      }
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
        onSubmit={handleSubmit(handleLogin)}
        autoComplete="off"
        dir="rtl"
      >
        <TextField
          {...register('email', { 
            required: 'البريد الإلكتروني مطلوب',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'بريد إلكتروني غير صحيح'
            }
          })}
          label="البريد الإلكتروني"
          fullWidth
          sx={{ mb: 3 }}
          error={!!errors.email}
          helperText={errors.email?.message || ''}
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
          {...register('password', { 
            required: 'كلمة المرور مطلوبة',
            minLength: {
              value: 6,
              message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
            }
          })}
          label="كلمة المرور"
          type={showPassword ? "text" : "password"}
          fullWidth
          sx={{ mb: 4 }}
          error={!!errors.password}
          helperText={errors.password?.message || ''}
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
