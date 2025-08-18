import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../context/config";
import bgShape from "../../assets/bg-shape.png";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";

type Source = "internal" | "salla" | "zid";

type ProviderState = {
  active?: boolean;
  connected?: boolean;
  lastSync?: string | null;
};

type InternalStatus = { productSource: "internal"; skipped: true };
type ExternalStatus = {
  productSource: "salla" | "zid";
  salla?: ProviderState;
  zid?: ProviderState;
};

type IntegrationsStatus = InternalStatus | ExternalStatus;

const isExternal = (s: IntegrationsStatus): s is ExternalStatus =>
  s.productSource === "salla" || s.productSource === "zid";

export default function SourceSelectPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [source, setSource] = useState<Source>("internal");
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState<null | "salla" | "zid">(null);
  const [status, setStatus] = useState<IntegrationsStatus>({
    productSource: "internal",
    skipped: true,
  });
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<number | null>(null);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const stopPolling = () => {
    if (pollTimer.current) {
      window.clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  useEffect(() => () => stopPolling(), []);

  const setProductSource = async (src: Source) => {
    if (!user?.merchantId) return;
    await axios.patch(
      `${API_BASE}/merchants/${user.merchantId}/product-source`,
      { source: src },
      { headers }
    );
  };

  const fetchStatus = async (src: Source): Promise<IntegrationsStatus> => {
    if (src === "internal") return { productSource: "internal", skipped: true };
    try {
      const { data } = await axios.get<IntegrationsStatus>(
        `${API_BASE}/integrations/status`,
        { headers }
      );
      setStatus(data);
      return data;
    } catch {
      return { productSource: "internal", skipped: true };
    }
  };

  const handleContinue = async () => {
    setError(null);
    try {
      setSaving(true);
      await setProductSource(source);

      if (source === "internal") {
        navigate("/dashboard");
        return; // ✅ لا polling ولا نداء حالة
      }

      // خارجي: افتح نافذة الربط وابدأ polling
      setConnecting(source);
      const url = `${API_BASE}/integrations/${source}/connect`;
      window.open(url, "_blank", "noopener,noreferrer");

      await fetchStatus(source); // قراءة أولية

      pollTimer.current = window.setInterval(async () => {
        const st = await fetchStatus(source);

        let ok = false;
        if (isExternal(st)) {
          ok = source === "salla" ? !!st.salla?.connected : !!st.zid?.connected;
        }

        if (ok) {
          stopPolling();
          setConnecting(null);
          navigate("/dashboard");
        }
      }, 2000);
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setSaving(false);
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
        alt=""
        sx={{
          position: "absolute",
          top: { xs: -60, md: -80 },
          left: { xs: -60, md: -80 },
          width: { xs: 160, md: 300 },
          opacity: 0.18,
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
      <Box
        component="img"
        src={bgShape}
        alt=""
        sx={{
          position: "absolute",
          bottom: { xs: -80, md: -100 },
          right: { xs: -60, md: -100 },
          width: { xs: 200, md: 400 },
          opacity: 0.12,
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          transform: "rotate(180deg)",
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 2 }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <Paper
            elevation={8}
            sx={{
              borderRadius: 5,
              overflow: "hidden",
              py: 5,
              px: { xs: 2, sm: 5 },
              mt: 4,
              textAlign: "center",
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Box component="img" src={logo} alt="Kaleem Logo" />
            </Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ color: "#502E91", mb: 1 }}
            >
              اختر مصدر بيانات المنتجات
            </Typography>
            <Typography variant="body1" sx={{ color: "#8589A0", mb: 3 }}>
              بإمكانك الربط مع مزود خارجي أو استخدام كليم كمنصة داخلية للمنتجات
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <RadioGroup
              value={source}
              onChange={(e) => setSource(e.target.value as Source)}
              sx={{ textAlign: "left", mx: "auto", width: "fit-content" }}
            >
              <FormControlLabel
                value="internal"
                control={<Radio />}
                label="كليم (داخلي)"
              />
              <FormControlLabel value="salla" control={<Radio />} label="سلة" />
              <FormControlLabel value="zid" control={<Radio />} label="زد" />
            </RadioGroup>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleContinue}
                disabled={saving || !!connecting}
                sx={{
                  fontWeight: "bold",
                  py: 1.7,
                  fontSize: 18,
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #A498CB, #502E91)",
                }}
              >
                {saving ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "متابعة"
                )}
              </Button>
            </Box>

            {connecting && (
              <Box sx={{ mt: 3 }}>
                <Typography sx={{ color: "#8589A0", mb: 1 }}>
                  جارٍ إتمام الربط مع {connecting === "salla" ? "سلة" : "زد"}...
                </Typography>
                <CircularProgress />
                <Typography variant="body2" sx={{ color: "#A498CB", mt: 1 }}>
                  أبقِ هذه الصفحة مفتوحة. سيتم نقلك تلقائيًا بعد اكتمال الربط
                </Typography>
              </Box>
            )}

            {/* عرض حالة تقريبية لو عندك /integrations/status */}
            {isExternal(status) && (status.salla || status.zid) && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ color: "#8589A0" }}>
                  الحالة: سلة {status.salla?.connected ? "متصلة" : "غير متصلة"}{" "}
                  — زد {status.zid?.connected ? "متصلة" : "غير متصلة"}
                </Typography>
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
