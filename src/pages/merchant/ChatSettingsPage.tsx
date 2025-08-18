// src/pages/Dashboard/ChatWidgetConfigSinglePage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  IconButton,
  CardContent,
  Alert,
  Tooltip,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  ContentCopy,
  CheckCircle,
  Palette,
  Settings as SettingsIcon,
  Code,
  Visibility,
  Edit,
  Save,
  Cancel,
} from "@mui/icons-material";
import { useTheme } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

import SectionCard from "@/features/mechant/widget-config/ui/SectionCard";
import ColorPickerButton from "@/features/mechant/widget-config/ui/ColorPickerButton";
import PreviewPane from "@/features/mechant/widget-config/ui/PreviewPane";

import { API_BASE } from "../../context/config";
import type {
  EmbedMode,
  SettingsView,
  ChatWidgetSettings,
} from "@/features/mechant/widget-config/types";
import { useWidgetSettings } from "@/features/mechant/widget-config/model";
import {
  generateSlug,
  saveWidgetSettings,
} from "@/features/mechant/widget-config/api";
import {
  buildChatLink,
  buildEmbedScript,
} from "@/features/mechant/widget-config/utils";

export default function ChatWidgetConfigSinglePage() {
  const theme = useTheme();
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";

  const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";
  const WIDGET_HOST = ORIGIN;

  const {
    data: serverSettings,
    loading,
    error,
  } = useWidgetSettings(merchantId);
  const [settings, setSettings] = useState<SettingsView>({
    botName: "Musaid Bot",
    welcomeMessage: "",
    brandColor: "#FF8500",
    widgetSlug: "smart",
    fontFamily: "Tajawal",
    headerBgColor: "#FF8500",
    bodyBgColor: "#FFF5E6",
    embedMode: "bubble",
    shareUrl: `${ORIGIN}/chat/${merchantId}`,
  });
  const [draft, setDraft] = useState<SettingsView | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!serverSettings) return;
    setSettings((prev) => {
      const widgetSlug = serverSettings.widgetSlug ?? prev.widgetSlug;
      return {
        ...prev,
        ...serverSettings,
        shareUrl: widgetSlug ? `${ORIGIN}/chat/${widgetSlug}` : prev.shareUrl,
        widgetSlug,
      };
    });
  }, [serverSettings, ORIGIN]);

  const effective = draft ?? settings;

  const embedTag = useMemo(
    () =>
      buildEmbedScript({
        merchantId,
        apiBaseUrl: API_BASE,
        mode: effective.embedMode,
        brandColor: effective.brandColor,
        welcomeMessage: effective.welcomeMessage,
        fontFamily: effective.fontFamily,
        headerBgColor: effective.headerBgColor,
        bodyBgColor: effective.bodyBgColor,
        widgetSlug: settings.widgetSlug,
        widgetHost: WIDGET_HOST,
      }),
    [
      merchantId,
      effective.embedMode,
      effective.brandColor,
      effective.welcomeMessage,
      effective.fontFamily,
      effective.headerBgColor,
      effective.bodyBgColor,
      settings.widgetSlug,
      WIDGET_HOST,
    ]
  );

  const chatLink = useMemo(
    () => buildChatLink(ORIGIN, settings.widgetSlug),
    [ORIGIN, settings.widgetSlug]
  );

  const handleChange = <K extends keyof SettingsView>(
    key: K,
    value: SettingsView[K]
  ) => {
    if (draft) setDraft((d) => ({ ...d!, [key]: value }));
    else setSettings((s) => ({ ...s, [key]: value }));
  };

  const startEdit = () => setDraft({ ...settings });
  const cancelEdit = () => setDraft(null);

  const saveAll = async () => {
    if (!draft || !merchantId) return;
    setApiError(null);
    try {
      const dto: ChatWidgetSettings = {
        botName: draft.botName,
        brandColor: draft.brandColor,
        welcomeMessage: draft.welcomeMessage,
        fontFamily: draft.fontFamily,
        headerBgColor: draft.headerBgColor,
        bodyBgColor: draft.bodyBgColor,
        widgetSlug: draft.widgetSlug,
      };
      await saveWidgetSettings(merchantId, dto);
      setSettings(draft);
      setDraft(null);
      setShowSuccess(true);
    } catch {
      setApiError("فشل حفظ الإعدادات. حاول مجددًا.");
    }
  };

  const handleGenerateSlug = async () => {
    if (!merchantId) return;
    try {
      const slug = await generateSlug(merchantId);
      setSettings((prev) => ({
        ...prev,
        widgetSlug: slug,
        shareUrl: `${ORIGIN}/chat/${slug}`,
      }));
      if (draft)
        setDraft((prev) => ({
          ...prev!,
          widgetSlug: slug,
          shareUrl: `${ORIGIN}/chat/${slug}`,
        }));
    } catch {
      setApiError("تعذّر توليد رابط جديد");
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (!merchantId) {
    return (
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Alert severity="warning">لا يوجد تاجر مسجّل.</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>جاري التحميل…</Typography>
      </Box>
    );
  }

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
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          فشل جلب الإعدادات من الخادم.
        </Alert>
      )}

      {/* Header */}
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
        {!draft ? (
          <Button variant="contained" startIcon={<Edit />} onClick={startEdit}>
            تعديل الإعدادات
          </Button>
        ) : (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={cancelEdit}
            >
              إلغاء
            </Button>
            <Button variant="contained" startIcon={<Save />} onClick={saveAll}>
              حفظ التغييرات
            </Button>
          </Stack>
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        {/* Left column */}
        <Box sx={{ flex: 1 }}>
          <Stack spacing={3}>
            <SectionCard>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                  <SettingsIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    الإعدادات العامة
                  </Typography>
                </Stack>
                <Stack spacing={2}>
                  <TextField
                    label="اسم البوت"
                    fullWidth
                    value={effective.botName ?? ""}
                    onChange={(e) => handleChange("botName", e.target.value)}
                  />
                  <TextField
                    label="الرسالة الترحيبية"
                    fullWidth
                    multiline
                    rows={3}
                    value={effective.welcomeMessage ?? ""}
                    onChange={(e) =>
                      handleChange("welcomeMessage", e.target.value)
                    }
                  />
                </Stack>
              </CardContent>
            </SectionCard>

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
                      value={effective.fontFamily ?? "Tajawal"}
                      label="نوع الخط"
                      onChange={(e) =>
                        handleChange("fontFamily", e.target.value)
                      }
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
                          colorHex={effective.brandColor ?? "#FF8500"}
                          onChange={(v) => handleChange("brandColor", v)}
                        />
                        <Typography variant="caption">العلامة</Typography>
                      </Stack>
                    </Tooltip>

                    <Tooltip title="لون خلفية الرأس">
                      <Stack alignItems="center" spacing={1}>
                        <ColorPickerButton
                          colorHex={effective.headerBgColor ?? "#FF8500"}
                          onChange={(v) => handleChange("headerBgColor", v)}
                        />
                        <Typography variant="caption">الرأس</Typography>
                      </Stack>
                    </Tooltip>

                    <Tooltip title="لون خلفية الجسم">
                      <Stack alignItems="center" spacing={1}>
                        <ColorPickerButton
                          colorHex={effective.bodyBgColor ?? "#FFF5E6"}
                          onChange={(v) => handleChange("bodyBgColor", v)}
                        />
                        <Typography variant="caption">الخلفية</Typography>
                      </Stack>
                    </Tooltip>
                  </Box>
                </Stack>
              </CardContent>
            </SectionCard>

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
                    value={settings.shareUrl}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="رابط صفحة الدردشة (slug)"
                    fullWidth
                    value={settings.widgetSlug ?? ""}
                    InputProps={{ readOnly: true }}
                  />
                  <Button onClick={handleGenerateSlug}>توليد رابط جديد</Button>

                  {/* رابط الدردشة */}
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        رابط الدردشة
                      </Typography>
                      <Tooltip title={copied ? "تم النسخ!" : "نسخ الرابط"}>
                        <IconButton
                          size="small"
                          onClick={() => copy(chatLink)}
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
                  </Box>

                  {/* كود التضمين */}
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
                          onClick={() => copy(embedTag)}
                          color={copied ? "success" : "default"}
                        >
                          {copied ? <CheckCircle /> : <ContentCopy />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      value={embedTag}
                      InputProps={{ readOnly: true }}
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        bgcolor: theme.palette.grey[100],
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </SectionCard>
          </Stack>
        </Box>

        {/* Right column - Preview */}
        <Box sx={{ flex: 1 }}>
          <SectionCard>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Visibility color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  معاينة الدردشة
                </Typography>
              </Stack>
              <PreviewPane embedTag={embedTag} />
            </CardContent>
          </SectionCard>
        </Box>
      </Box>
    </Box>
  );
}
