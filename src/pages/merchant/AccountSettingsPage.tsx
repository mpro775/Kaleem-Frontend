import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Avatar,
  Chip,
} from "@mui/material";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const MOCK_USER = {
  name: "محمد أحمد",
  email: "mohammed@example.com",
  phone: "+966501234567",
  avatar: "M",
  plan: "الباقة الذهبية",
  planExpire: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 يوم
  notifications: true,
};

const PLANS = [
  { value: "free", label: "مجانية" },
  { value: "silver", label: "الفضية" },
  { value: "gold", label: "الذهبية" },
  { value: "platinum", label: "البلاتينية" },
];

export default function AccountSettingsPage() {
  const [user, setUser] = useState(MOCK_USER);
  const [edit, setEdit] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [plan, setPlan] = useState(user.plan);
  const [notifications, setNotifications] = useState(user.notifications);

  const daysLeft = Math.max(
    0,
    Math.ceil((user.planExpire.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const handleSaveProfile = () => {
    setEdit(false);
  };

  const handleChangePassword = () => {
    setPasswords({ old: "", new: "", confirm: "" });
    // عرض رسالة نجاح وهمية
    alert("تم تغيير كلمة المرور بنجاح (وهمي)");
  };

  const handleUpgrade = () => {
    alert("تمت الترقية (وهمي)");
    setPlan("platinum");
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlan(e.target.value);
    alert("تم تغيير الباقة (وهمي)");
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, p: 2 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 56,
              height: 56,
              fontSize: 28,
            }}
          >
            {user.avatar}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              إعدادات الحساب الشخصي
            </Typography>
            <Typography color="text.secondary">
              معلوماتك واشتراكك وإعداداتك
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={4}>
          {/* البيانات الشخصية وتغيير كلمة المرور */}
          <Box flex={1}>
            <Typography fontWeight={700} mb={1}>
              البيانات الشخصية
            </Typography>
            <TextField
              label="الاسم"
              value={user.name}
              onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))}
              fullWidth
              disabled={!edit}
              sx={{ mb: 2 }}
            />
            <TextField
              label="البريد الإلكتروني"
              value={user.email}
              onChange={(e) =>
                setUser((u) => ({ ...u, email: e.target.value }))
              }
              fullWidth
              disabled={!edit}
              sx={{ mb: 2 }}
            />
            <TextField
              label="رقم الجوال"
              value={user.phone}
              onChange={(e) =>
                setUser((u) => ({ ...u, phone: e.target.value }))
              }
              fullWidth
              disabled={!edit}
              sx={{ mb: 2 }}
            />
            {edit ? (
              <Button
                variant="contained"
                onClick={handleSaveProfile}
                sx={{ mt: 1 }}
              >
                حفظ التعديلات
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={() => setEdit(true)}
                sx={{ mt: 1 }}
              >
                تعديل البيانات
              </Button>
            )}
          </Box>
          <Box flex={1}>
            <Typography fontWeight={700} mb={1}>
              تغيير كلمة المرور
            </Typography>
            <TextField
              label="كلمة المرور الحالية"
              type="password"
              value={passwords.old}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, old: e.target.value }))
              }
              fullWidth
              sx={{ mb: 1 }}
            />
            <TextField
              label="كلمة المرور الجديدة"
              type="password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, new: e.target.value }))
              }
              fullWidth
              sx={{ mb: 1 }}
            />
            <TextField
              label="تأكيد كلمة المرور"
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, confirm: e.target.value }))
              }
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleChangePassword}
            >
              تغيير كلمة المرور
            </Button>
          </Box>
        </Box>
        <Divider sx={{ my: 4 }} />
        <Box mb={3}>
          <Typography fontWeight={700} mb={1}>
            الاشتراك والباقات
          </Typography>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Chip
              label={PLANS.find((p) => p.value === plan)?.label || plan}
              color="primary"
            />
            <Typography color="text.secondary">
              {daysLeft > 0
                ? `المدة المتبقية: ${daysLeft} يوم`
                : "انتهى الاشتراك"}
            </Typography>
            <TextField
              select
              label="تغيير الباقة"
              value={plan}
              onChange={handlePlanChange}
              sx={{ minWidth: 150 }}
            >
              {PLANS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </TextField>
            <Button
              variant="contained"
              color="success"
              startIcon={<UpgradeIcon />}
              onClick={handleUpgrade}
              disabled={plan === "platinum"}
            >
              ترقية الباقة
            </Button>
          </Box>
        </Box>
        <Box mb={3}>
          <Typography fontWeight={700} mb={1}>
            إدارة الإشعارات
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={notifications}
                onChange={(_, v) => setNotifications(v)}
                color="primary"
              />
            }
            label={
              notifications ? (
                <span>
                  الإشعارات مفعلة <NotificationsActiveIcon fontSize="small" />
                </span>
              ) : (
                "الإشعارات غير مفعلة"
              )
            }
          />
        </Box>
      </Paper>
    </Box>
  );
}
