import React from "react";
import { useForm, Controller, type Path } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  useTheme,
  CircularProgress,
} from "@mui/material";

import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";
import { signUpAPI } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import bgShape from "../../assets/bg-shape.png"; // عدل المسار حسب موقعك
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { RiEyeCloseLine } from "react-icons/ri";
import { TfiEye } from "react-icons/tfi";
import logo from "../../assets/logo.png"; // فعّل هذا مع مسار الشعار الصحيح
import GradientIcon from "../../components/GradientIcon";

// SCHEMA
const SignUpSchema = z
  .object({
    name: z.string().min(3, "الاسم يجب أن لا يقل عن 3 أحرف"),
    email: z.string().email("بريد إلكتروني غير صالح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });
type SignUpData = z.infer<typeof SignUpSchema>;

type FieldConfig = {
  name: Path<SignUpData>;
  label: string;
  Icon: React.ElementType;
  type?: string;
  isPassword?: boolean;
  showToggle?: boolean; // جديد: هل نعرض أيقونة العين؟
  autoComplete?: string; // جديد
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
  const { login } = useAuth(); // فعّل هذا مع سياق الـ Auth لديك

  const [visible, setVisible] = React.useState<
    Record<Path<SignUpData>, boolean>
  >({
    password: false,
    confirmPassword: false,
  } as Record<Path<SignUpData>, boolean>);
  const [loading, setLoading] = React.useState(false);
  const toggleVisible = (fieldName: Path<SignUpData>) =>
    setVisible((v) => ({ ...v, [fieldName]: !v[fieldName] }));
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpData>({
    resolver: zodResolver(SignUpSchema),
  });

  // الدالة التي تحوي منطقك السابق
  const onSubmit = async (data: SignUpData) => {
    const { name, email, password, confirmPassword } = data;
    try {
      setLoading(true);
      // نداء الـ API هنا
      const { accessToken, user } = await signUpAPI(
        name,
        email,
        password,
        confirmPassword
      );
      login(user, accessToken); // فعّل هذا مع سياق الـ Auth لديك
      toast.success("تم إنشاء الحساب بنجاح!");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error("حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,

        overflow: "hidden",
        py: 8,
      }}
    >
      <Box
        component="img"
        src={bgShape}
        alt="خلفية زخرفية"
        sx={{
          position: "absolute",
          top: { xs: -60, md: -80 },
          left: { xs: -60, md: -80 },
          width: { xs: 160, md: 300 },
          height: "auto",
          opacity: 0.18,
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* الشكل السفلي يمين (مع دوران لو أردت) */}
      <Box
        component="img"
        src={bgShape}
        alt="خلفية زخرفية"
        sx={{
          position: "absolute",
          bottom: { xs: -80, md: -100 },
          right: { xs: -60, md: -100 },
          width: { xs: 200, md: 400 },
          height: "auto",
          opacity: 0.12,
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          transform: "rotate(180deg)", // لجمالية إضافية
        }}
      />
      {/* أيقونات حوار */}
      <Box
        component="img"
        src={bgShape}
        alt="زخرفة مربع حوار"
        sx={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: 80, // حجم مماثل للأيقونة تقريباً
          height: "auto",
          opacity: 0.24, // شفافية للزخرفة
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          transform: "rotate(15deg)", // لو تريد نفس الميلان
        }}
      />

      {/* بدل ChatBubbleOutlineIcon الثاني */}
      <Box
        component="img"
        src={bgShape}
        alt="زخرفة مربع حوار"
        sx={{
          position: "absolute",
          bottom: "25%",
          right: "15%",
          width: 110,
          height: "auto",
          opacity: 0.16,
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          transform: "rotate(-10deg)",
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 2 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Paper elevation={8} sx={{ borderRadius: 4, overflow: "hidden" }}>
            <Box
              sx={{
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              }}
            />
            <Box sx={{ p: 4 }}>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Box component="img" src={logo} alt="Kaleem Logo" />
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color={theme.palette.primary.dark}
                >
                  إنشاء حساب جديد
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ابدأ رحلتك مع كليم وتمتع بتجربة ذكية وفريدة
                </Typography>
              </Box>
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
                        helperText={
                          errors[fld.name]?.message as string | undefined
                        }
                        dir="rtl"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <GradientIcon
                                Icon={fld.Icon}
                                size={24}
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
                                    onClick={() => toggleVisible(fld.name)}
                                    edge="end"
                                    tabIndex={-1}
                                  >
                                    {visible[fld.name] ? (
                                      <GradientIcon
                                        Icon={TfiEye}
                                        size={20}
                                        startColor={theme.palette.primary.dark}
                                        endColor={theme.palette.primary.main}
                                      />
                                    ) : (
                                      <GradientIcon
                                        Icon={RiEyeCloseLine}
                                        size={20}
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
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "إنشاء حساب"
                    )}
                  </Button>
                </Box>
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
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
