import { useEffect, useState, useRef } from "react";
import axios from "../../api/axios";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  IconButton,
  Card,
  CardContent,
  styled,
  useTheme,
  Alert,
  Tooltip,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  ContentCopy,
  CheckCircle,
  Palette,
  Settings,
  Code,
  Visibility,
  Edit,
  Save,
  Cancel,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../context/config";

// إعدادات واجهة الدردشة حسب الـ DTO
type EmbedMode = "bubble" | "iframe" | "bar" | "conversational";

interface ChatWidgetSettings {
  botName?: string;
  brandColor?: string;
  welcomeMessage?: string;
  fontFamily?: string;
  headerBgColor?: string;
  widgetSlug?: string;
  bodyBgColor?: string;
  // يمكن إضافة المزيد من الحقول مستقبلاً
}

interface Settings extends ChatWidgetSettings {
  embedMode: EmbedMode;
  botName: string;
  shareUrl: string;
}

const ColorPickerButton = styled(Button)(() => ({
  minWidth: 40,
  height: 40,
  borderRadius: "50%",
  padding: 0,
  position: "relative",
  overflow: "hidden",
  "& input[type='color']": {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
}));

const SectionCard = styled(Card)(() => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.1)",
  },
}));

export default function ChatWidgetConfigSinglePage() {
  const theme = useTheme();
  const { user } = useAuth();

  const merchantId = user?.merchantId ?? "";
  const handleGenerateSlug = async () => {
    const { data } = await axios.post(
      `/merchants/${merchantId}/widget-settings/slug`
    );
    setSettings((prev) => ({
      ...prev,
      widgetSlug: data.widgetSlug,
    }));
    if (draftSettings) {
      setDraftSettings((prev) =>
        prev ? { ...prev, widgetSlug: data.widgetSlug } : null
      );
    }
  };
  const [settings, setSettings] = useState<Settings>({
    botName: "Musaid Bot",
    welcomeMessage: "",
    brandColor: "#FF8500",
    widgetSlug: "smart",
    fontFamily: "Tajawal",
    headerBgColor: "#FF8500",
    bodyBgColor: "#FFF5E6",
    embedMode: "bubble",
    shareUrl: `${API_BASE.replace(/\/api$/, "")}/chat/${merchantId}`,
  });
  const chatLink = settings?.widgetSlug
    ? `http://localhost:5173/chat/${settings.widgetSlug}`
    : "—";
  const [draftSettings, setDraftSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  console.log(previewLoaded);
  // تحميل الإعدادات الفعلية من الـ API
  useEffect(() => {
    setLoading(true);
    axios
      .get<ChatWidgetSettings>(
        `${API_BASE}/merchants/${merchantId}/widget-settings`
      )
      .then((res) => {
        setSettings((prev) => ({
          ...prev,
          ...res.data,
          botName: prev.botName, // لتثبيت الاسم في حالة لم يتغير
          widgetSlug: res.data.widgetSlug, // <-- تأكد أن هذا هو اسم الحقل من الباك
          // اعد بناء shareUrl حسب السلاج الجديد
          shareUrl: res.data.widgetSlug
            ? `http://localhost:5173/chat/${res.data.widgetSlug}`
            : prev.shareUrl,
        }));
        setLoading(false);
      })
      .catch(() => {
        setApiError("فشل تحميل الإعدادات. حاول مجددًا.");
        setLoading(false);
      });
  }, [merchantId, API_BASE]);

  const token = localStorage.getItem("token") || "";
  // تحديد الإعدادات المعتمدة (مسودة أو أصلية)
  const effective = draftSettings ?? settings;

  // إعادة تحميل معاينة الـ widget عند تغيير الإعدادات
  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;
    container.innerHTML = "";
    setPreviewLoaded(false);

    // Inject إعدادات الدردشة
    const s1 = document.createElement("script");
    s1.innerHTML = `
      window.MusaidChat = {
        merchantId: '${merchantId}',
        apiBaseUrl: '${API_BASE}',
         token: '${token}', 
        themeColor: '${effective.brandColor}',
        greeting: '${effective.welcomeMessage}',
        fontFamily: '${effective.fontFamily}',
        headerBgColor: '${effective.headerBgColor}',
        bodyBgColor: '${effective.bodyBgColor}',
        mode: '${effective.embedMode}'
      };
    `;
    const s2 = document.createElement("script");
    s2.src = `/widget.js?mode=${effective.embedMode}`;
    s2.async = true;

    container.appendChild(s1);
    container.appendChild(s2);
    setPreviewLoaded(true);
    // eslint-disable-next-line
  }, [effective, merchantId, API_BASE]);

  // التعامل مع تغييرات الحقول
  const handleChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    if (draftSettings) {
      setDraftSettings((ds) => ({ ...ds!, [key]: value }));
    } else {
      setSettings((s) => ({ ...s, [key]: value }));
    }
    if (key === "embedMode") {
      setPreviewLoaded(false);
    }
  };

  // تفعيل وضع التحرير (نسخة مؤقتة)
  const cloneSettings = () => {
    setDraftSettings({ ...settings });
    setPreviewLoaded(false);
  };

  // إلغاء التعديلات
  const discardDraft = () => {
    setDraftSettings(null);
    setPreviewLoaded(false);
  };

  // حفظ التغييرات إلى الـ API
  const saveAll = async () => {
    if (!draftSettings) return;
    setLoading(true);
    setApiError(null);
    try {
      const dataToSend: ChatWidgetSettings = {
        botName: draftSettings.botName, // << أضف هذا السطر!
        brandColor: draftSettings.brandColor,
        welcomeMessage: draftSettings.welcomeMessage,
        fontFamily: draftSettings.fontFamily,
        headerBgColor: draftSettings.headerBgColor,
        bodyBgColor: draftSettings.bodyBgColor,
        widgetSlug: draftSettings.widgetSlug,
      };
      await axios.put(`/merchants/${merchantId}/widget-settings`, dataToSend);
      setSettings({ ...settings, ...draftSettings });
      setDraftSettings(null);
      setShowSuccess(true);
      console.log("dataToSend", dataToSend);
    } catch {
      setApiError("فشل حفظ الإعدادات. حاول مجددًا.");
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return (
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>جاري التحميل…</Typography>
      </Box>
    );

  // كود التضمين للموقع الخارجي
  const embedScript =
    `<script>window.MusaidChat={merchantId:'${merchantId}',API_BASE:'${API_BASE}'` +
    `,themeColor:'${effective.brandColor}',greeting:'${effective.welcomeMessage}'` +
    `,fontFamily:'${effective.fontFamily}',headerBgColor:'${effective.headerBgColor}'` +
    `,bodyBgColor:'${effective.bodyBgColor}',mode:'${effective.embedMode}'};</script>\n` +
    `<script>window.MusaidChat={merchantId:'${merchantId}',apiBaseUrl:'${API_BASE}'...};</script>\n` +
    `<script src="/widget.js?mode=${effective.embedMode}"></script>`;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        message="تم حفظ التغييرات بنجاح"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          إعدادات الدردشة
        </Typography>
        {!draftSettings ? (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={cloneSettings}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            تعديل الإعدادات
          </Button>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={discardDraft}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={saveAll}
              sx={{
                bgcolor: "success.main",
                "&:hover": { bgcolor: "success.dark" },
              }}
              disabled={loading}
            >
              حفظ التغييرات
            </Button>
          </Stack>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        {/* العمود الأيسر - الإعدادات */}
        <Box sx={{ flex: 1, mb: { xs: 3, md: 0 } }}>
          <Stack spacing={3}>
            {/* الإعدادات العامة */}
            <SectionCard>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                  <Settings color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    الإعدادات العامة
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  <TextField
                    label="اسم البوت"
                    fullWidth
                    value={effective.botName}
                    onChange={(e) => handleChange("botName", e.target.value)}
                    variant="outlined"
                  />

                  <TextField
                    label="الرسالة الترحيبية"
                    fullWidth
                    multiline
                    rows={3}
                    value={effective.welcomeMessage}
                    onChange={(e) =>
                      handleChange("welcomeMessage", e.target.value)
                    }
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </SectionCard>

            {/* إعدادات المظهر */}
            <SectionCard>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                  <Palette color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    المظهر والتنسيق
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>نوع الخط</InputLabel>
                    <Select
                      value={effective.fontFamily}
                      label="نوع الخط"
                      onChange={(e) =>
                        handleChange("fontFamily", e.target.value)
                      }
                      variant="outlined"
                    >
                      <MenuItem value="Tajawal">Tajawal</MenuItem>
                      <MenuItem value="Inter">Inter</MenuItem>
                      <MenuItem value="Roboto">Roboto</MenuItem>
                      <MenuItem value="Arial">Arial</MenuItem>
                      <MenuItem value="Custom">مخصص</MenuItem>
                    </Select>
                  </FormControl>

                  <Typography variant="body2" fontWeight={500}>
                    تخصيص الألوان:
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Tooltip title="لون العلامة التجارية">
                      <Stack alignItems="center" spacing={1}>
                        <ColorPickerButton
                          sx={{ bgcolor: effective.brandColor }}
                        >
                          <input
                            type="color"
                            value={effective.brandColor}
                            onChange={(e) =>
                              handleChange("brandColor", e.target.value)
                            }
                          />
                        </ColorPickerButton>
                        <Typography variant="caption">العلامة</Typography>
                      </Stack>
                    </Tooltip>
                    <Tooltip title="لون خلفية الرأس">
                      <Stack alignItems="center" spacing={1}>
                        <ColorPickerButton
                          sx={{ bgcolor: effective.headerBgColor }}
                        >
                          <input
                            type="color"
                            value={effective.headerBgColor}
                            onChange={(e) =>
                              handleChange("headerBgColor", e.target.value)
                            }
                          />
                        </ColorPickerButton>
                        <Typography variant="caption">الرأس</Typography>
                      </Stack>
                    </Tooltip>
                    <Tooltip title="لون خلفية الجسم">
                      <Stack alignItems="center" spacing={1}>
                        <ColorPickerButton
                          sx={{ bgcolor: effective.bodyBgColor }}
                        >
                          <input
                            type="color"
                            value={effective.bodyBgColor}
                            onChange={(e) =>
                              handleChange("bodyBgColor", e.target.value)
                            }
                          />
                        </ColorPickerButton>
                        <Typography variant="caption">الخلفية</Typography>
                      </Stack>
                    </Tooltip>
                  </Box>
                </Stack>
              </CardContent>
            </SectionCard>

            {/* خيارات التضمين */}
            <SectionCard>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                  <Code color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    خيارات التضمين
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>وضع التضمين</InputLabel>
                    <Select
                      value={effective.embedMode}
                      label="وضع التضمين"
                      onChange={(e) =>
                        handleChange("embedMode", e.target.value as EmbedMode)
                      }
                      variant="outlined"
                    >
                      <MenuItem value="bubble">فقاعة عائمة</MenuItem>
                      <MenuItem value="iframe">إطار مدمج</MenuItem>
                      <MenuItem value="bar">شريط سفلي</MenuItem>
                      <MenuItem value="conversational">محادثة كاملة</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="رابط المشاركة"
                    fullWidth
                    value={effective.shareUrl}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                  <TextField
                    label="رابط صفحة الدردشة (slug)"
                    fullWidth
                    value={effective.widgetSlug || ""}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                  <Button onClick={handleGenerateSlug}>توليد رابط جديد</Button>
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        كود التضمين
                      </Typography>
                      <Tooltip title={copied ? "تم النسخ!" : "نسخ الكود"}>
                        <IconButton
                          size="small"
                          onClick={copyToClipboard}
                          color={copied ? "success" : "default"}
                        >
                          {copied ? <CheckCircle /> : <ContentCopy />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <TextField
                      value={chatLink}
                      InputProps={{ readOnly: true }}
                    />

                    <Button
                      onClick={() => navigator.clipboard.writeText(chatLink)}
                    >
                      نسخ رابط الدردشة
                    </Button>

                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      value={embedScript}
                      InputProps={{ readOnly: true }}
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        bgcolor: theme.palette.grey[100],
                        borderRadius: 1,
                      }}
                      variant="outlined"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </SectionCard>
          </Stack>
        </Box>

        {/* العمود الأيمن - المعاينة */}
        <Box sx={{ flex: 1 }}>
          <SectionCard>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Visibility color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  معاينة الدردشة
                </Typography>
              </Stack>

              <Paper
                ref={previewRef}
                sx={{
                  height: 500,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "background.paper",
                }}
              />
            </CardContent>
          </SectionCard>
        </Box>
      </Box>
    </Box>
  );
}
