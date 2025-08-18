// src/pages/auth/SignUpPage.tsx
import React from "react";
import { useForm, Controller, type Path } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "react-toastify";
import { TfiEye } from "react-icons/tfi";
import { RiEyeCloseLine } from "react-icons/ri";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import AuthLayout from "@/widgets/auth/AuthLayout";
import GradientIcon from "@/shared/ui/GradientIcon";
import { signUpAPI } from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";
import { getAxiosMessage } from "@/shared/lib/errors";

const SignUpSchema = z
  .object({
    name: z.string().min(3, "الاسم يجب أن لا يقل عن 3 أحرف"),
    email: z.string().email("بريد إلكتروني غير صالح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "كلمتا المرور غير متطابقتين",
  });
type SignUpData = z.infer<typeof SignUpSchema>;

type FieldConfig = {
  name: Path<SignUpData>;
  label: string;
  Icon: React.ElementType;
  type?: string;
  isPassword?: boolean;
  showToggle?: boolean;
  autoComplete?: string;
};

const fields: FieldConfig[] = [
  { name: "name", label: "الاسم الكامل", Icon: FaUser, autoComplete: "name" },
  {
    name: "email",
    label: "البريد الإلكتروني",
    Icon: FaEnvelope,
    type: "email",
    autoComplete: "email",
  },
  {
    name: "password",
    label: "كلمة المرور",
    Icon: FaLock,
    isPassword: true,
    showToggle: true,
    autoComplete: "new-password",
  },
  {
    name: "confirmPassword",
    label: "تأكيد كلمة المرور",
    Icon: FaLock,
    isPassword: true,
    showToggle: true,
    autoComplete: "new-password",
  },
];

export default function SignUpPage() {
  const theme = useTheme();
  const { login } = useAuth();
  const [visible, setVisible] = React.useState<
    Record<Path<SignUpData>, boolean>
  >({
    password: false,
    confirmPassword: false,
  } as any);
  const [loading, setLoading] = React.useState(false);
  const toggleVisible = (f: Path<SignUpData>) =>
    setVisible((v) => ({ ...v, [f]: !v[f] }));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpData>({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = async ({
    name,
    email,
    password,
    confirmPassword,
  }: SignUpData) => {
    try {
      setLoading(true);
      const { accessToken, user } = await signUpAPI(
        name,
        email,
        password,
        confirmPassword
      );
      login(user, accessToken);
      toast.success("تم إنشاء الحساب بنجاح!");
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
          إنشاء حساب جديد
        </Typography>
      }
      subtitle={
        <Typography variant="body2" color="text.secondary">
          ابدأ رحلتك مع كليم وتمتع بتجربة ذكية وفريدة
        </Typography>
      }
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} dir="rtl">
        {fields.map((fld) => (
          <Controller
            key={fld.name}
            name={fld.name}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label={fld.label}
                type={
                  fld.isPassword
                    ? visible[fld.name]
                      ? "text"
                      : "password"
                    : fld.type || "text"
                }
                autoComplete={fld.autoComplete}
                fullWidth
                margin="normal"
                error={!!errors[fld.name]}
                helperText={errors[fld.name]?.message as string | undefined}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" aria-hidden>
                      <GradientIcon
                        Icon={fld.Icon}
                        size={22}
                        startColor={theme.palette.primary.dark}
                        endColor={theme.palette.primary.main}
                      />
                    </InputAdornment>
                  ),
                  ...(fld.isPassword &&
                    fld.showToggle !== false && {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              visible[fld.name]
                                ? "إخفاء كلمة المرور"
                                : "إظهار كلمة المرور"
                            }
                            aria-pressed={visible[fld.name] ? true : false}
                            onClick={() => toggleVisible(fld.name)}
                            edge="end"
                            tabIndex={-1}
                          >
                            {visible[fld.name] ? (
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
                    }),
                }}
              />
            )}
          />
        ))}

        <Box sx={{ mt: 3, position: "relative" }}>
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
              "إنشاء حساب"
            )}
          </Button>
        </Box>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2, color: "text.secondary" }}
        >
          لديك حساب بالفعل؟{" "}
          <Link href="/login" underline="hover" color="primary">
            تسجيل الدخول
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
}
