import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import { MdOutlineBusiness } from "react-icons/md";
import bgShape from "../../assets/bg-shape.png";
import logo from "../../assets/logo.png";
import { useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import { LuStore } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { saveBasicInfo } from "../../api/onboardingApi";
import { getErrorMessage } from "../../utils/error";

const BUSINESS_TYPES = [
  { label: "متاجر", value: "store", available: true },
  { label: "مطاعم", value: "restaurant", available: false },
  { label: "فنادق", value: "hotel", available: false },
  { label: "صيدليات", value: "pharmacy", available: false },
  { label: "جامعات", value: "university", available: false },
  { label: "مدارس", value: "school", available: false },
];

const STORE_CATEGORIES = [
  { label: "ملابس", value: "clothing" },
  { label: "إلكترونيات وهواتف", value: "electronics" },
  { label: "اكسسوارات", value: "accessories" },
  { label: "عطور", value: "perfumes" },
  { label: "سوبرماركت", value: "supermarket" },
  { label: "هدايا", value: "gifts" },
  { label: "أخرى", value: "other" },
];

export default function OnboardingPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [businessType, setBusinessType] = useState("store");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("clothing");
  const [customCategory, setCustomCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPhoneValid = useMemo(() => !phone || matchIsValidTel(phone), [phone]);
  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!isPhoneValid) return false;
    if (category === "other" && !customCategory.trim()) return false;
    return true;
  }, [name, isPhoneValid, category, customCategory]);

  const handleContinue = async () => {
    try {
      setError(null);
      setSaving(true);
      if (!user?.merchantId || !token) throw new Error("جلسة غير صالحة");

      const payload = {
        name: name.trim(),
        phone: phone || undefined,
        businessType,
        businessDescription: desc || undefined,
        categories: category !== "other" ? [category] : undefined,
        customCategory:
          category === "other" ? customCategory.trim() : undefined,
        // logoUrl/addresses لو أضفتها لاحقًا
      };

      await saveBasicInfo(user.merchantId, token, payload);

      // ✅ نجاح: نذهب لصفحة اختيار المصدر
      navigate("/onboarding/source");
    } catch (e: unknown) {
      setError(getErrorMessage(e, "حدث خطأ أثناء الربط"));
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
              position: "relative",
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Box component="img" src={logo} alt="Kaleem Logo" />
            </Box>

            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: "#502E91",
                mb: 1,
                fontFamily: "inherit",
                "& span": { color: "#7E66AC" },
              }}
            >
              تهيئة نشاطك
            </Typography>
            <Typography variant="body1" sx={{ color: "#8589A0", mb: 3 }}>
              النجاح ينتظرك .. ابدأ بتهيئة متجرك مع كليم
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="اسم النشاط"
              placeholder="ادخل اسم المتجر"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{
                mb: 2,
                background: "#fff",
                "& .MuiOutlinedInput-root": {
                  background: "#fff",
                  borderRadius: 2,
                },
              }}
              dir="rtl"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LuStore size={20} style={{ color: "#A498CB" }} />
                  </InputAdornment>
                ),
              }}
            />

            <MuiTelInput
              value={phone}
              onChange={setPhone}
              defaultCountry="YE"
              onlyCountries={[
                "YE",
                "SA",
                "EG",
                "AE",
                "KW",
                "OM",
                "QA",
                "BH",
                "MA",
                "DZ",
                "TN",
                "IQ",
                "SD",
                "LY",
              ]}
              label="رقم الجوال"
              fullWidth
              dir="ltr"
              forceCallingCode
              langOfCountryName="ar"
              sx={{
                mb: 2,
                background: "#ffff",
                borderRadius: 2,
                fontSize: 18,
                direction: "ltr",
                "& .MuiInputBase-root": { direction: "ltr" },

                "& input": {
                  direction: "ltr",
                  textAlign: "left",
                  fontFamily: "inherit",
                },
              }}
              placeholder="0000000000 "
              error={!!phone && !isPhoneValid}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="business-type-label">نوع النشاط</InputLabel>
              <Select
                labelId="business-type-label"
                id="business-type-select"
                label="نوع النشاط"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                sx={{ textAlign: "left" }}
              >
                {BUSINESS_TYPES.map((b) => (
                  <MenuItem
                    key={b.value}
                    value={b.value}
                    disabled={!b.available}
                  >
                    {b.label}
                    {!b.available && (
                      <span
                        style={{
                          color: "#A498CB",
                          fontSize: 13,
                          marginRight: 8,
                          fontWeight: "bold",
                        }}
                      >
                        (قريبًا)
                      </span>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="store-category-label">تصنيف المتجر</InputLabel>
              <Select
                labelId="store-category-label"
                id="store-category-select"
                label="تصنيف المتجر"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                displayEmpty
                sx={{ textAlign: "left" }}
              >
                {STORE_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {category === "other" && (
              <TextField
                label="أدخل تصنيف متجرك الجديد"
                placeholder="مثال: متجر كتب، متجر أدوات رياضية..."
                fullWidth
                sx={{
                  mb: 2,
                  background: "#fff",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    background: "#fff",
                    borderRadius: 2,
                  },
                }}
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                dir="rtl"
              />
            )}

            <TextField
              label="وصف النشاط"
              placeholder="اكتب وصف النشاط التجاري"
              fullWidth
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              sx={{
                mb: 2,
                background: "#fff",
                "& .MuiOutlinedInput-root": { background: "#fff" },
              }}
              dir="rtl"
              multiline
              minRows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdOutlineBusiness size={22} style={{ color: "#A498CB" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleContinue}
              disabled={!canSubmit || saving}
              sx={{
                fontWeight: "bold",
                py: 1.7,
                fontSize: 20,
                borderRadius: 2,
                background: "linear-gradient(90deg, #A498CB, #502E91)",
                boxShadow: "0 3px 10px 0 rgba(80,46,145,0.13)",
                mt: 2,
              }}
            >
              {saving ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "متابعة"
              )}
            </Button>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
