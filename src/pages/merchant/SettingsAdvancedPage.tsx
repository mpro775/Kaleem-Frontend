import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  MenuItem,
  RadioGroup,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // ✅ Grid v2 لخاصية size={{}}
import { useAuth } from "@/context/AuthContext";
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  requestPasswordReset,
  getMyNotifications,
  updateMyNotifications,
  setProductSource,
  deleteMyAccount,
} from "@/features/mechant/settings-advanced/api";
import type {
  NotificationsPrefs,
  ProductSource,
} from "@/features/mechant/settings-advanced/types";
import { useErrorHandler } from "@/shared/errors";

const DEFAULT_PREFS: NotificationsPrefs = {
  channels: { inApp: true, email: true, telegram: false, whatsapp: false },
  topics: {
    syncFailed: true,
    syncCompleted: true,
    webhookFailed: true,
    embeddingsCompleted: true,
    missingResponsesDigest: "daily",
  },
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
    timezone: "Asia/Aden",
  },
};

export default function SettingsAdvancedPage() {
  const { handleError } = useErrorHandler();
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const merchantId = user?.merchantId ?? "";

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    type: "success" | "error";
  }>({
    open: false,
    msg: "",
    type: "success",
  });

  // معلوماتي
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // الأمان
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // إشعاراتي
  const [prefs, setPrefs] = useState<NotificationsPrefs>(DEFAULT_PREFS);

  // مصدر المنتجات
  const [productSource, setSource] = useState<ProductSource>("internal");
  const [confirmPwdModal, setConfirmPwdModal] = useState<{
    open: boolean;
    for: "source" | "delete" | null;
  }>({ open: false, for: null });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmWorking, setConfirmWorking] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        setLoading(true);
        const p = await getMyProfile(userId);
        setName(p?.name ?? "");
        setPhone(p?.phone ?? "");
        setEmail(p?.email ?? "");
        const n = await getMyNotifications(userId).catch(() => DEFAULT_PREFS);
        setPrefs({ ...DEFAULT_PREFS, ...(n ?? {}) });
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, handleError]);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await updateMyProfile(userId, { name: name.trim(), phone: phone.trim() });
      setSnack({ open: true, msg: "تم حفظ بياناتي", type: "success" });
    } catch (error) {
      handleError(error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (
      !currentPassword ||
      !newPassword ||
      newPassword !== confirmNewPassword
    ) {
      setSnack({
        open: true,
        msg: "تحقق من الحقول وكلمة المرور الجديدة",
        type: "error",
      });
      return;
    }
    try {
      setChangingPassword(true);
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword: confirmNewPassword,
      });
      setSnack({ open: true, msg: "تم تغيير كلمة المرور", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      handleError(error);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await requestPasswordReset(email);
      setSnack({
        open: true,
        msg: "تم إرسال رابط إعادة التعيين (إن وُجد البريد)",
        type: "success",
      });
    } catch {
      setSnack({ open: true, msg: "لم يتم الإرسال", type: "error" });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);
      await updateMyNotifications(userId, prefs);
      setSnack({
        open: true,
        msg: "تم حفظ تفضيلات الإشعارات",
        type: "success",
      });
    } catch {
      setSnack({ open: true, msg: "فشل حفظ تفضيلات الإشعارات", type: "error" });
    } finally {
      setSavingNotifications(false);
    }
  };

  const openConfirmForSource = () =>
    setConfirmPwdModal({ open: true, for: "source" });
  const openConfirmForDelete = () =>
    setConfirmPwdModal({ open: true, for: "delete" });
  const closeConfirmModal = () => {
    setConfirmPwdModal({ open: false, for: null });
    setConfirmPassword("");
    setConfirmWorking(false);
  };

  const submitConfirmModal = async () => {
    try {
      if (!confirmPassword) {
        setSnack({
          open: true,
          msg: "أدخل كلمة المرور للتأكيد",
          type: "error",
        });
        return;
      }
      setConfirmWorking(true);
      if (confirmPwdModal.for === "source") {
        if (!merchantId) {
          setSnack({ open: true, msg: "لا يوجد معرف تاجر", type: "error" });
          setConfirmWorking(false);
          return;
        }
        await setProductSource(merchantId, productSource, confirmPassword);
        setSnack({
          open: true,
          msg: "تم تغيير مصدر المنتجات",
          type: "success",
        });
      } else if (confirmPwdModal.for === "delete") {
        await deleteMyAccount(userId, { confirmPassword });
        setSnack({ open: true, msg: "تم حذف الحساب", type: "success" });
      }
      closeConfirmModal();
    } catch (error) {
      handleError(error);
      setConfirmWorking(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      {loading && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography sx={{ mb: 1 }}>جارِ التحميل…</Typography>
          <LinearProgress />
        </Paper>
      )}

      {!loading && (
        <Box sx={{ display: "grid", gap: 2 }}>
          {/* معلوماتي */}
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              معلوماتي
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="الاسم الكامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="رقم الهاتف"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  fullWidth
                  placeholder="+9665xxxxxxxx"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="البريد الإلكتروني"
                  value={email}
                  fullWidth
                  disabled
                  helperText="لا يمكن تغيير البريد حاليًا"
                />
              </Grid>
              <Grid
                size={{ xs: 12 }}
                display="flex"
                justifyContent="flex-end"
                gap={1}
              >
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? "جارٍ الحفظ…" : "حفظ"}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* الأمان */}
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              الأمان
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  type="password"
                  label="كلمة المرور الحالية"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  type="password"
                  label="كلمة المرور الجديدة"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  type="password"
                  label="تأكيد كلمة المرور الجديدة"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid
                size={{ xs: 12 }}
                display="flex"
                gap={1}
                justifyContent="flex-end"
              >
                <Button
                  variant="outlined"
                  onClick={handleForgotPassword}
                  disabled={!email}
                >
                  نسيت كلمة المرور؟
                </Button>
                <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? "جارٍ التغيير…" : "تغيير كلمة المرور"}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* إشعاراتي */}
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              إشعاراتي
            </Typography>

            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              القنوات
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!prefs.channels.inApp}
                      onChange={(_, v) =>
                        setPrefs((p) => ({
                          ...p,
                          channels: { ...p.channels, inApp: v },
                        }))
                      }
                    />
                  }
                  label="داخل التطبيق"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!prefs.channels.email}
                      onChange={(_, v) =>
                        setPrefs((p) => ({
                          ...p,
                          channels: { ...p.channels, email: v },
                        }))
                      }
                    />
                  }
                  label="البريد"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!prefs.channels.telegram}
                      onChange={(_, v) =>
                        setPrefs((p) => ({
                          ...p,
                          channels: { ...p.channels, telegram: v },
                        }))
                      }
                    />
                  }
                  label="تيليجرام"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!prefs.channels.whatsapp}
                      onChange={(_, v) =>
                        setPrefs((p) => ({
                          ...p,
                          channels: { ...p.channels, whatsapp: v },
                        }))
                      }
                    />
                  }
                  label="واتساب"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2">الموضوعات</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={prefs.topics.syncFailed}
                      onChange={(_, v) =>
                        setPrefs((p) => ({
                          ...p,
                          topics: { ...p.topics, syncFailed: v },
                        }))
                      }
                    />
                  }
                  label="فشل المزامنة"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={prefs.topics.syncCompleted}
                      onChange={(_, v) =>
                        setPrefs((p) => ({
                          ...p,
                          topics: { ...p.topics, syncCompleted: v },
                        }))
                      }
                    />
                  }
                  label="اكتمال المزامنة"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={prefs.topics.webhookFailed}
                      onChange={(_, v) =>
                        setPrefs((p) => ({
                          ...p,
                          topics: { ...p.topics, webhookFailed: v },
                        }))
                      }
                    />
                  }
                  label="فشل Webhook"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={prefs.topics.embeddingsCompleted}
                      onChange={(_, v) =>
                        setPrefs((p) => ({
                          ...p,
                          topics: { ...p.topics, embeddingsCompleted: v },
                        }))
                      }
                    />
                  }
                  label="اكتمال الـ Embeddings"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="ملخّص الردود المفقودة"
                  select
                  fullWidth
                  value={prefs.topics.missingResponsesDigest}
                  onChange={(e) =>
                    setPrefs((p) => ({
                      ...p,
                      topics: {
                        ...p.topics,
                        missingResponsesDigest: e.target.value as any,
                      },
                    }))
                  }
                >
                  <MenuItem value="off">إيقاف</MenuItem>
                  <MenuItem value="daily">يومي</MenuItem>
                  <MenuItem value="weekly">أسبوعي</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2">ساعات هادئة</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={prefs.quietHours.enabled}
                      onChange={(_, v) =>
                        setPrefs((p) => ({
                          ...p,
                          quietHours: { ...p.quietHours, enabled: v },
                        }))
                      }
                    />
                  }
                  label="تفعيل"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="من"
                  type="time" // ✅ وقت حقيقي
                  value={prefs.quietHours.start}
                  onChange={(e) =>
                    setPrefs((p) => ({
                      ...p,
                      quietHours: { ...p.quietHours, start: e.target.value },
                    }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="إلى"
                  type="time" // ✅ وقت حقيقي
                  value={prefs.quietHours.end}
                  onChange={(e) =>
                    setPrefs((p) => ({
                      ...p,
                      quietHours: { ...p.quietHours, end: e.target.value },
                    }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="المنطقة الزمنية"
                  value={prefs.quietHours.timezone}
                  onChange={(e) =>
                    setPrefs((p) => ({
                      ...p,
                      quietHours: { ...p.quietHours, timezone: e.target.value },
                    }))
                  }
                  fullWidth
                  placeholder="Asia/Aden"
                />
              </Grid>
              <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleSaveNotifications}
                  disabled={savingNotifications}
                >
                  {savingNotifications
                    ? "جارٍ الحفظ…"
                    : "حفظ تفضيلات الإشعارات"}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* مصدر المنتجات */}
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              مصدر المنتجات
            </Typography>
            <RadioGroup
              row
              value={productSource}
              onChange={(e) => setSource(e.target.value as ProductSource)}
            >
              <FormControlLabel
                value="internal"
                control={<Radio />}
                label="داخلي"
              />
              <FormControlLabel value="salla" control={<Radio />} label="سلة" />
              <FormControlLabel value="zid" control={<Radio />} label="زد" />
            </RadioGroup>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              ملاحظة: سيتم تعطيل المصادر الأخرى وتفعيل المصدر المختار.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                color="warning"
                onClick={openConfirmForSource}
              >
                تعيين المصدر
              </Button>
            </Box>
          </Paper>

          {/* منطقة خطرة */}
          <Paper
            sx={{
              p: { xs: 2, md: 3 },
              borderColor: "error.main",
              borderWidth: 1,
              borderStyle: "solid",
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, color: "error.main" }}>
              منطقة خطرة
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              حذف حسابك سيُفقدك الوصول. قد تُحفظ بعض السجلات امتثاليًا. هذا
              الإجراء لا يمكن التراجع عنه.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                color="error"
                onClick={openConfirmForDelete}
              >
                حذف حسابي
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Modal تأكيد كلمة المرور */}
      <Dialog open={confirmPwdModal.open} onClose={closeConfirmModal}>
        <DialogTitle>
          {confirmPwdModal.for === "delete"
            ? "تأكيد حذف الحساب"
            : "تأكيد بكلمة المرور"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1.5, color: "text.secondary" }}>
            {confirmPwdModal.for === "delete"
              ? "سيتم حذف حسابك نهائيًا. اكتب كلمة المرور للتأكيد."
              : "لأسباب أمنية، أدخل كلمة المرور لتأكيد الإجراء."}
          </Typography>
          <TextField
            label="كلمة المرور"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmModal}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={submitConfirmModal}
            disabled={confirmWorking}
          >
            {confirmWorking ? "جارٍ التنفيذ…" : "تأكيد"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        autoHideDuration={3000}
      >
        <Alert severity={snack.type} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
