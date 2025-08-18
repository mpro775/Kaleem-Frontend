import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import GeneralInfoForm from "../../components/marchent_Info/GeneralInfoForm";
import AddressForm from "../../components/marchent_Info/AddressForm";
import PoliciesForm from "../../components/marchent_Info/PoliciesForm";
import WorkingHoursForm from "../../components/marchent_Info/WorkingHoursForm";
import SocialLinksSection from "../../components/store/SocialLinksSection";
import type { MerchantInfo } from "../../types/merchant";
import { getMerchantInfo, updateMerchantInfo } from "../../api/merchantApi";


const SECTIONS = [
  { label: "المعلومات العامة", component: GeneralInfoForm },
  { label: "العنوان", component: AddressForm },
  { label: "ساعات العمل", component: WorkingHoursForm, AddressForm},
  { label: "السياسات", component: PoliciesForm },
  { label: "روابط التواصل الاجتماعي", component: SocialLinksSection }, // هنا التغيير!
];

export default function MerchantSettingsPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? null;

  const [data, setData] = useState<MerchantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [tab, setTab] = useState(0);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (!merchantId) return;
    setLoading(true);
    getMerchantInfo(merchantId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [merchantId]);
const filterUpdatableFields = (data: MerchantInfo): Partial<MerchantInfo> => {
  // فقط الحقول المسموح بها في الـ DTO
  const {
    name,
    logoUrl,
    slug,
    phone,
    storefrontUrl,
    businessDescription,
    addresses,
    workingHours,
    returnPolicy,
    exchangePolicy,
    shippingPolicy,
      socialLinks,
    customCategory,
    // ... أضف أي حقل مسموح
  } = data;
  return {
    name,
    logoUrl,
    phone,
    slug,
    storefrontUrl,
    businessDescription,
    addresses,
    workingHours,
    returnPolicy,
    exchangePolicy,
      socialLinks,
    shippingPolicy,
    customCategory,
  };
};
  const handleSectionSave = async (sectionData: Partial<MerchantInfo>) => {
    try {
      if (!merchantId) return;
      setSaveLoading(true);
      const newData: MerchantInfo = { ...data!, ...sectionData };
await updateMerchantInfo(merchantId, filterUpdatableFields(newData));
      setData(newData);
      setSnackbar({
        open: true,
        message: "تم الحفظ بنجاح",
        severity: "success",
      });
    } catch (e: unknown) {
      let msg = "حدث خطأ أثناء الحفظ";
      if (e instanceof Error) msg = e.message;
      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 0,
        borderRadius: 3,
        width: "100%", // العرض بالكامل
        maxWidth: "1400px", // أو أقل قليلاً إذا أحببت (مناسب للشاشات الكبيرة)
        minHeight: "80vh", // ليملأ معظم ارتفاع الشاشة
        mx: "auto",
        my: 6,
        overflow: "hidden",
      }}
    >
      <Box display="flex" minHeight={500} dir="rtl">
        {/* التابات الجانبية */}
        <Tabs
          orientation="vertical"
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderLeft: 1,
            borderColor: "divider",
            minWidth: 180,
            bgcolor: "#f9f9f9",
            py: 3,
            "& .MuiTab-root": {
              alignItems: "flex-end",
              fontWeight: "bold",
              fontSize: 16,
              color: "#757575",
              mb: 1,
              borderRadius: 2,
              transition: "all 0.2s",
              textAlign: "right",
            },
            "& .Mui-selected": {
              color: "primary.main",
              bgcolor: "#fff",
              boxShadow: 2,
            },
          }}
          variant="scrollable"
        >
          {SECTIONS.map((s, i) => (
            <Tab key={i} label={s.label} />
          ))}
        </Tabs>

        {/* محتوى كل تاب */}
        <Box flex={1} p={4} bgcolor="#fff">
          {SECTIONS.map(({ component: SectionComp }, i) =>
            tab === i ? (
              <SectionComp
                key={i}
                initialData={data}
                onSave={handleSectionSave}
                loading={saveLoading}
              />
            ) : null
          )}
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
}
