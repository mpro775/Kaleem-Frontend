import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Link,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import logo from "../../assets/logo.png";
import bgShape from "../../assets/bg-shape.png";
import { useAuth } from "../../context/AuthContext";
import OtpInputBoxes from "../../components/OtpInputBoxes";
import { useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { resendVerificationAPI, verifyEmailAPI } from "../../api/authApi";

const VerifyEmailPage = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialCode = params.get("code") ?? "";
  const { user } = useAuth();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const verify = async (verificationCode: string) => {
    try {
      setLoading(true);
      const email = user?.email || ""; // أو اجلبه من نموذج/تخزين إذا حبيت
      await verifyEmailAPI(email, verificationCode);
      toast.success("✔️ تم تفعيل حسابك بنجاح");
      setSuccess(true);
      // عداد تحويل
      let counter = 5;
      setCountdown(counter);
      const timer = setInterval(() => {
        counter -= 1;
        setCountdown(counter);
        if (counter <= 0) {
          clearInterval(timer);
          // بعد التفعيل، المنطقي إنك ترجّع المستخدم لعملية Onboarding
          // أو ممكن تعيد جلب User من السيرفر لتتأكد من firstLogin=false
          navigate("/onboarding");
        }
      }, 1000);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "حدث خطأ غير متوقع";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode && initialCode.length === 6) {
      verify(initialCode);
    }
    // eslint-disable-next-line
  }, [initialCode]);

  const handleSubmit = () => {
    if (code.trim().length === 6) {
      verify(code.trim());
    } else {
      toast.warn("الرجاء إدخال رمز مكون من 6 أرقام");
    }
  };

  const handleResendCode = async () => {
    if (!user?.email) {
      toast.error("لا يوجد عنوان بريد مسجّل");
      return;
    }
    if (resendCooldown > 0) return;

    try {
      setLoading(true);
      await resendVerificationAPI(user.email);
      toast.success("📧 تم إعادة إرسال كود التفعيل إلى بريدك");
      setResendCooldown(60);
      const t = setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) {
            clearInterval(t);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "❌ فشل في إعادة إرسال الكود";
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
      {/* خلفيات زخرفية */}
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
      {/* وسط الصفحة */}
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 2 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={8}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              py: 5,
              px: { xs: 2, sm: 5 },
              mt: 4,
              textAlign: "center",
              position: "relative",
            }}
          >
            <Box component="img" src={logo} alt="Kaleem Logo" />
            <Typography
              variant="h4"
              fontWeight="bold"
              color={theme.palette.primary.dark}
              mb={1}
            >
              تفعيل الحساب
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={2}>
              أدخل رمز التفعيل المكون من 6 أرقام الذي تم إرساله إلى بريدك
              الإلكتروني
            </Typography>
            {/* مربعات رمز التفعيل */}
            {!success && (
              <OtpInputBoxes
                value={code}
                onChange={(v) => setCode(v.slice(0, 6))}
                disabled={loading}
                autoFocus
                onComplete={(v) => {
                  // لما يكتمل الإدخال تلقائي يفعّل
                  setCode(v);
                  verify(v);
                }}
              />
            )}

            {success ? (
              <Box sx={{ my: 3 }}>
                <CheckCircleOutlineIcon
                  color="success"
                  sx={{ fontSize: 60, mb: 2 }}
                />
                <Typography variant="h6" sx={{ color: "success.main", mb: 1 }}>
                  تم تفعيل حسابك بنجاح!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  سيتم تحويلك تلقائيًا خلال {countdown} ثانية
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => navigate("/onboarding")}
                  sx={{ mt: 3, fontWeight: "bold", py: 1.4, borderRadius: 2 }}
                >
                  الانتقال الآن
                </Button>
              </Box>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    fontWeight: "bold",
                    py: 1.4,
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    boxShadow: "0 3px 12px 0 rgba(80,46,145,0.13)",
                  }}
                  disabled={loading || code.trim().length !== 6}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "تفعيل الحساب"
                  )}
                </Button>

                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Link
                    component="button"
                    sx={{
                      color: theme.palette.primary.dark,
                      fontWeight: "bold",
                      mx: 1,
                      fontSize: 15,
                    }}
                    onClick={handleResendCode}
                    disabled={loading}
                  >
                    إعادة إرسال الكود
                  </Link>
                  <span style={{ color: "#A498CB" }}>|</span>
                  <Link
                    component="button"
                    sx={{
                      color: theme.palette.primary.dark,
                      fontWeight: "bold",
                      mx: 1,
                      fontSize: 15,
                    }}
                    onClick={() => navigate("/login")}
                  >
                    تسجيل الدخول
                  </Link>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ mt: 3, color: "#8589A0", fontSize: 13 }}
                >
                  لم تستلم الكود؟ تحقق من مجلد الرسائل غير المرغوب فيها (Spam)
                </Typography>
              </>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;
