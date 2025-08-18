// src/pages/onboarding/OnboardingPage.tsx
import { useState, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import { LuStore } from "react-icons/lu";
import { MdOutlineBusiness } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { saveBasicInfo } from "@/api/onboardingApi";
import { getAxiosMessage } from "@/shared/lib/errors"; // أو من utils/error
import OnboardingLayout from "@/widgets/onboarding/OnboardingLayout";
import {
  BUSINESS_TYPES,
  STORE_CATEGORIES,
} from "@/features/onboarding/constants";

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
      };
      await saveBasicInfo(user.merchantId, token, payload);
      navigate("/onboarding/source");
    } catch (e) {
      setError(getAxiosMessage(e, "حدث خطأ أثناء الحفظ"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout
      step={1}
      total={3}
      title={
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#502E91" }}>
          تهيئة نشاطك
        </Typography>
      }
      subtitle={
        <Typography variant="body1" sx={{ color: "#8589A0" }}>
          النجاح ينتظرك .. ابدأ بتهيئة متجرك مع كليم
        </Typography>
      }
    >
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
        dir="rtl"
        sx={{ mb: 2 }}
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
        sx={{ mb: 2 }}
        placeholder="0000000000 "
        error={!!phone && !isPhoneValid}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="business-type-label">نوع النشاط</InputLabel>
        <Select
          labelId="business-type-label"
          label="نوع النشاط"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          sx={{ textAlign: "left" }}
        >
          {BUSINESS_TYPES.map((b) => (
            <MenuItem key={b.value} value={b.value} disabled={!b.available}>
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
          label="تصنيف المتجر"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ textAlign: "left" }}
        >
          {STORE_CATEGORIES.map((c) => (
            <MenuItem key={c.value} value={c.value}>
              {c.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {category === "other" && (
        <TextField
          label="أدخل تصنيف متجرك الجديد"
          placeholder="مثال: متجر كتب، متجر أدوات رياضية..."
          fullWidth
          sx={{ mb: 2 }}
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
        sx={{ mb: 2 }}
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
          fontSize: 18,
          borderRadius: 2,
          background: "linear-gradient(90deg, #A498CB, #502E91)",
          boxShadow: "0 3px 10px 0 rgba(80,46,145,0.13)",
          mt: 1,
        }}
      >
        {saving ? <CircularProgress size={22} color="inherit" /> : "متابعة"}
      </Button>
    </OnboardingLayout>
  );
}
