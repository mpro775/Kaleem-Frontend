import {  useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Chip,
  Alert,
  Collapse,
  LinearProgress,
  IconButton,
  Snackbar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "@/shared/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useErrorHandler } from "@/shared/errors";

import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import EmailIcon from "@mui/icons-material/Email";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// إعداد التوقيت
dayjs.extend(utc);
dayjs.extend(timezone);
const MAX_FILES = 5;
const MAX_MB = 5;

// دالة مساعدة صغيرة:
function withinLimits(list: FileList) {
  const files = Array.from(list);
  if (files.length > MAX_FILES)
    return { ok: false, reason: `الحد ${MAX_FILES} ملفات` };
  const tooBig = files.find((f) => f.size > MAX_MB * 1024 * 1024);
  if (tooBig) return { ok: false, reason: `الحد ${MAX_MB}MB للملف الواحد` };
  return { ok: true };
}

// ====== Types & Schema ======
export const ContactTopic = {
  SALES: "sales",
  SUPPORT: "support",
  BILLING: "billing",
  PARTNERSHIP: "partnership",
} as const;
export type ContactTopic = (typeof ContactTopic)[keyof typeof ContactTopic];
export const adminContactSchema = z.object({
  name: z.string().min(2, "فضلاً اكتب الاسم الكامل"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  phone: z.string().optional(),
  merchantId: z.string().min(10, "معرّف التاجر مفقود"),
  topic: z.nativeEnum(ContactTopic, {
    errorMap: () => ({ message: "اختر نوع الطلب" }),
  }),
  urgency: z.enum(["low", "normal", "high"]),
  subject: z.string().min(5, "الموضوع قصير جداً").max(200),
  message: z.string().min(20, "نحتاج تفاصيل أكثر لمساعدتك").max(5000),
  website: z.string().optional(), // honeypot
});
export type AdminContactPayload = z.infer<typeof adminContactSchema>;
export type ContactResponse = {
  id: string;
  ticketNumber: string;
  status: "open" | "pending" | "resolved" | "closed";
  createdAt: string;
};

// ====== API helpers ======
function buildFormData(payload: AdminContactPayload, files?: FileList | null) {
  const fd = new FormData();
  // لا ترسل حقول غير مدعومة في الباك الحالي (الـ DTO لا يحوي merchantId/urgency)
  // سنرسلها ضمن الرسالة نفسها + subject لتكون مرئية لفريق الدعم
  const { merchantId, urgency, ...base } = payload;
  const enriched = {
    ...base,
    subject: `[${urgency.toUpperCase()}] ${
      base.subject
    } — (merchantId: ${merchantId})`,
    message: `MerchantId: ${merchantId}\nUrgency: ${urgency}\n\n${base.message}`,
  };
  fd.append("payload", JSON.stringify(enriched));
  if (files)
    Array.from(files)
      .slice(0, 5)
      .forEach((f) => fd.append("files", f));
  return fd;
}
async function submitAdminContact(
  payload: AdminContactPayload,
  files?: FileList | null
) {
  const data = buildFormData(payload, files);
  const res = await axios.post<ContactResponse>("/support/contact", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ====== Small UI pieces ======
function ContactMethodCard({
  icon,
  title,
  subtitle,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
}) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box aria-hidden>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography fontWeight={700}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
      <Button
        component="a"
        href={href}
        target="_blank"
        rel="noopener"
        variant="contained"
        endIcon={<OpenInNewIcon />}
        sx={{ borderRadius: 2 }}
      >
        تواصل
      </Button>
    </Paper>
  );
}

function QuickGuides() {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <InfoOutlinedIcon />
        <Typography fontWeight={700}>أدلة سريعة</Typography>
      </Stack>
      <details>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>
          تفعيل ويب شات كليم
        </summary>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          لوحة التاجر → القنوات → الويب شات → انسخ السكربت والصقه قبل{" "}
          <code>&lt;/body&gt;</code>.
        </Typography>
      </details>
      <details>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>
          ربط واتساب الرسمي
        </summary>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          انتقل إلى القنوات → WhatsApp Business API واتبع التعليمات خطوة بخطوة.
        </Typography>
      </details>
      <details>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>
          ربط تيليجرام
        </summary>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          أنشئ بوت عبر @BotFather ثم الصق الـ Token داخل إعدادات قناة تيليجرام.
        </Typography>
      </details>
    </Stack>
  );
}

// ====== Main Page ======
export default function MerchantSupportCenterPage() {
  const { handleError } = useErrorHandler();
  const theme = useTheme();
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";
  const defaultName = (user as any)?.name ?? "";
  const defaultEmail = (user as any)?.email ?? "";
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentRes, setSentRes] = useState<ContactResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminContactPayload>({
    resolver: zodResolver(adminContactSchema),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      phone: "",
      merchantId,
      topic: ContactTopic.SUPPORT,
      urgency: "normal",
      subject: "",
      message: "",
      website: "",
    } as any,
    mode: "onBlur",
  });

  useEffect(() => {
    // تحدّث القيم إذا تغيّر المستخدم
    reset((prev) => ({
      ...prev,
      name: defaultName,
      email: defaultEmail,
      merchantId,
    }));
  }, [defaultName, defaultEmail, merchantId, reset]);

  const onSubmit = async (values: AdminContactPayload) => {
    try {
      setError(null);
      setSubmitting(true);
      setSentRes(null);

      if (values.website && values.website.trim() !== "")
        throw new Error("Spam detected");

      const res = await submitAdminContact(values, files);
      setSentRes(res);

      // حفظ آخر التذاكر محليًا لعرض سجل مختصر
      const key = `kaleem:lastTickets:${merchantId}`;
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      arr.unshift({ ticketNumber: res.ticketNumber, createdAt: res.createdAt });
      localStorage.setItem(key, JSON.stringify(arr.slice(0, 5)));

      reset();
      setFiles(null);

      // ✅ بدلاً من navigate → فقط اعرض رسالة
      setSnack({ open: true, msg: "شكراً لطلبك، سيتم التواصل معك قريباً" });
    } catch (error) {
      handleError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const topics = [
    { value: ContactTopic.SALES, label: "مبيعات" },
    { value: ContactTopic.SUPPORT, label: "دعم فني" },
    { value: ContactTopic.BILLING, label: "فواتير" },
    { value: ContactTopic.PARTNERSHIP, label: "شركات/شراكات" },
  ];

  const urgencies = [
    { value: "low", label: "منخفض" },
    { value: "normal", label: "عادي" },
    { value: "high", label: "عالي" },
  ];


  return (
    <Box dir="rtl">
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={4}>
    
          {/* النموذج */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2 }}
              >
                <SupportAgentIcon />
                <Typography variant="h6" fontWeight={800}>
                  أنشئ تذكرة دعم
                </Typography>
              </Stack>

              <Collapse in={!!error}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              </Collapse>
              <Collapse in={!!sentRes}>
                <Alert
                  icon={<CheckCircleRoundedIcon fontSize="inherit" />}
                  severity="success"
                  sx={{ mb: 2 }}
                >
                  تم فتح التذكرة: <strong>{sentRes?.ticketNumber}</strong>
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        String(sentRes?.ticketNumber)
                      );
                    }}
                    title="نسخ الرقم"
                  >
                    <ContentCopyIcon fontSize="inherit" />
                  </IconButton>
                </Alert>
              </Collapse>

              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="الاسم"
                          fullWidth
                          error={!!errors.name}
                          helperText={errors.name?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="البريد الإلكتروني"
                          type="email"
                          fullWidth
                          error={!!errors.email}
                          helperText={errors.email?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="الجوال (اختياري)"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="merchantId"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="معرّف التاجر"
                          fullWidth
                          error={!!errors.merchantId}
                          helperText={
                            errors.merchantId?.message || "يُملأ تلقائيًا"
                          }
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="topic"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="نوع الطلب"
                          fullWidth
                          error={!!errors.topic}
                          helperText={errors.topic?.message}
                        >
                          {topics.map((t) => (
                            <MenuItem key={t.value} value={t.value}>
                              {t.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="urgency"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select label="الأولوية" fullWidth>
                          {urgencies.map((u) => (
                            <MenuItem key={u.value} value={u.value}>
                              {u.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name="subject"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="عنوان التذكرة"
                          fullWidth
                          error={!!errors.subject}
                          helperText={errors.subject?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name="message"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="وصف المشكلة/الطلب"
                          fullWidth
                          multiline
                          minRows={6}
                          error={!!errors.message}
                          helperText={errors.message?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* honeypot */}
                  <Grid size={{ xs: 12 }} sx={{ display: "none" }}>
                    <Controller
                      name="website"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="موقعك" fullWidth />
                      )}
                    />
                  </Grid>

                  {/* المرفقات */}
                  <Grid size={{ xs: 12 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Button
                component="label"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                إرفاق ملفات (اختياري)
                <input
                  hidden
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const list = e.target.files;
                    if (!list) return;
                    const chk = withinLimits(list);
                    if (!chk.ok) {
                      setSnack({
                        open: true,
                        msg: `تعذر الإرفاق: ${chk.reason}`,
                      });
                      return;
                    }
                    setFiles(list);
                  }}
                />
              </Button>

              {/* عرض مختصر للمرفقات + إزالة */}
              {files && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {Array.from(files).map((f, i) => (
                    <Chip
                      key={i}
                      size="small"
                      label={
                        f.name.length > 24 ? f.name.slice(0, 24) + "…" : f.name
                      }
                      onDelete={() => {
                        const arr = Array.from(files);
                        arr.splice(i, 1);
                        // إعادة بناء FileList ليس مباشر — فنجعلها null عندما نحذف آخر عنصر
                        setFiles(
                          arr.length
                            ? (Object.assign(new DataTransfer(), {
                                items: arr,
                              }) as any)
                            : null
                        );
                      }}
                      deleteIcon={<DeleteOutlineIcon />}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              الحد: حتى {MAX_FILES} ملفات × {MAX_MB}MB
            </Typography>
          </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        endIcon={<SendRoundedIcon />}
                        disabled={submitting}
                        sx={{ borderRadius: 2 }}
                      >
                        إرسال
                      </Button>
                      {submitting && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LinearProgress
                            sx={{ width: 160, borderRadius: 2 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            جاري الإرسال…
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
          {/* الشريط الجانبي */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                  قنوات سريعة
                </Typography>
                <Stack spacing={1.5}>
                  <ContactMethodCard
                    icon={<WhatsAppIcon color="success" />}
                    title="واتساب الرسمي"
                    subtitle="رد سريع خلال أوقات العمل"
                    href="https://wa.me/0000000000"
                  />
                  <ContactMethodCard
                    icon={<TelegramIcon color="primary" />}
                    title="تيليجرام"
                    subtitle="قناة بديلة"
                    href="https://t.me/kaleem_support"
                  />
                  <ContactMethodCard
                    icon={<EmailIcon />}
                    title="البريد"
                    subtitle="support@kaleem.app"
                    href="mailto:support@kaleem.app"
                  />
                  <ContactMethodCard
                    icon={<PhoneInTalkIcon />}
                    title="الهاتف"
                    subtitle="+967-7XXXXXXX"
                    href="tel:+9677XXXXXXX"
                  />
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <QuickGuides />
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                  آخر التذاكر
                </Typography>
                <RecentTickets merchantId={merchantId} />
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ open: false, msg: "" })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function RecentTickets({ merchantId }: { merchantId: string }) {
  const [items, setItems] = useState<
    { ticketNumber: string; createdAt: string }[]
  >([]);
  useEffect(() => {
    const key = `kaleem:lastTickets:${merchantId}`;
    try {
      setItems(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {}
  }, [merchantId]);
  if (!merchantId)
    return (
      <Typography variant="body2" color="text.secondary">
        سجّل الدخول لإظهار السجل.
      </Typography>
    );
  if (!items.length)
    return (
      <Typography variant="body2" color="text.secondary">
        لا توجد تذاكر حديثة.
      </Typography>
    );
  return (
    <Stack spacing={1}>
      {items.slice(0, 5).map((it) => (
        <Stack
          key={it.ticketNumber}
          direction="row"
          justifyContent="space-between"
          sx={{ py: 1, borderBottom: "1px dashed", borderColor: "divider" }}
        >
          <Typography fontFamily="monospace">{it.ticketNumber}</Typography>
          <Typography variant="body2" color="text.secondary">
            {dayjs(it.createdAt).format("YYYY/MM/DD HH:mm")}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
