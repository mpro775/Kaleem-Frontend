import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  SupportAgent as SupportIcon,
} from "@mui/icons-material";

const SUPPORT_CONTACT = {
  phone: "+966 55 123 4567",
  email: "support@company.com",
  address: "الرياض، شارع العليا، برج التقنية، الدور 5",
  workingHours: "الأحد - الخميس: 9 صباحًا - 6 مساءً",
};

const ISSUE_TYPES = [
  { value: "technical", label: "مشكلة تقنية" },
  { value: "billing", label: "استفسار فاتورة" },
  { value: "suggestion", label: "اقتراح" },
  { value: "other", label: "أخرى" },
];

export default function SupportPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    issueType: "technical",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <SupportIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700}>
            طلب الدعم الفني
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            label="الاسم"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="البريد الإلكتروني"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="رقم الجوال"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="نوع المشكلة"
            name="issueType"
            value={form.issueType}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            {ISSUE_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="وصف المشكلة"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            required
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={submitted}
          >
            {submitted ? "تم الإرسال" : "إرسال الطلب"}
          </Button>
        </form>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          بيانات التواصل مع الشركة
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          <ListItem>
            <ListItemIcon>
              <PhoneIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={SUPPORT_CONTACT.phone}
              secondary="هاتف الدعم"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <EmailIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={SUPPORT_CONTACT.email}
              secondary="البريد الإلكتروني"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LocationIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={SUPPORT_CONTACT.address}
              secondary="العنوان"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccessTimeIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={SUPPORT_CONTACT.workingHours}
              secondary="أوقات العمل"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
}
