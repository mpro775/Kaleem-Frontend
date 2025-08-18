import { useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { RiEyeCloseLine } from "react-icons/ri";
import { TfiEye } from "react-icons/tfi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { loginAPI } from "../../api/authApi";
import bgShape from "../../assets/bg-shape.png";
import logo from "../../assets/logo.png";
import { useTheme } from "@mui/material";
import { motion } from "framer-motion";
import GradientIcon from "../../components/GradientIcon"; // نفس المكون المستخدم في التسجيل

const LoginPage = () => {
  const theme = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  interface AxiosErrorResponse {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("يرجى إدخال البريد وكلمة المرور");
      return;
    }
    try {
      setLoading(true);
      const { accessToken, user } = await loginAPI(email, password);
      login(user, accessToken);
      toast.success("تم تسجيل الدخول بنجاح!");
    } catch (err: unknown) {
      let message = "حدث خطأ غير متوقع";
      // تحقق من نوع الخطأ
      if (typeof err === "object" && err !== null) {
        const errorObj = err as AxiosErrorResponse;
        if (
          errorObj.response &&
          errorObj.response.data &&
          typeof errorObj.response.data.message === "string"
        ) {
          message = errorObj.response.data.message;
        } else if (typeof errorObj.message === "string") {
          message = errorObj.message;
        }
      }
      setError(message);

      toast.error(message);
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
      {/* زخارف الخلفية */}
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
          transform: "rotate(180deg)",
        }}
      />
      <Box
        component="img"
        src={bgShape}
        alt="زخرفة مربع حوار"
        sx={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: 80,
          height: "auto",
          opacity: 0.24,
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          transform: "rotate(15deg)",
        }}
      />
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

      {/* محتوى الصفحة */}
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
                  تسجيل الدخول
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  سجل دخولك وابدأ تجربة كليم الذكية!
                </Typography>
              </Box>
              <form
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
                  dir="rtl"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GradientIcon
                          Icon={FaEnvelope}
                          size={24}
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
                  dir="rtl"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GradientIcon
                          Icon={FaLock}
                          size={24}
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
                        >
                          {showPassword ? (
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
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "تسجيل الدخول"
                  )}
                </Button>
              </form>

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
          </Paper>
        </motion.div>
      </Container>
      {error && (
        <Box sx={{ mt: 2 }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={handleLogin} variant="outlined">
            إعادة المحاولة
          </Button>
          <Button href="/support" color="secondary">
            الدعم الفني
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LoginPage;
