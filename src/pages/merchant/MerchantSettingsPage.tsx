import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import type { MerchantInfo } from "@/features/mechant/merchant-settings/types";
import {
  updateMerchantInfo,
  getMerchantInfo,
} from "@/features/mechant/merchant-settings/api";

import { SECTIONS } from "@/features/mechant/merchant-settings/sections";
import { filterUpdatableFields } from "@/features/mechant/merchant-settings/utils";

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

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  // جلب بيانات التاجر
  useEffect(() => {
    if (!merchantId) return;
    setLoading(true);
    getMerchantInfo(merchantId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [merchantId]);

  const handleSectionSave = async (sectionData: Partial<MerchantInfo>) => {
    try {
      if (!merchantId || !data) return;
      setSaveLoading(true);

      const newData: MerchantInfo = { ...data, ...sectionData };
      await updateMerchantInfo(merchantId, filterUpdatableFields(newData));
      setData(newData);

      setSnackbar({
        open: true,
        message: "تم الحفظ بنجاح",
        severity: "success",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "حدث خطأ أثناء الحفظ";
      setSnackbar({ open: true, message: msg, severity: "error" });
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
        width: "100%",
        maxWidth: "1400px",
        minHeight: "80vh",
        mx: "auto",
        my: 6,
        overflow: "hidden",
      }}
    >
      <Box
        dir="rtl"
        sx={{
          display: "flex",
          flexDirection: isMdUp ? "row" : "column",
          minHeight: 500,
        }}
      >
        {/* Tabs */}
        <Box
          sx={{
            ...(isMdUp
              ? {
                  width: 240,
                  flexShrink: 0,
                  borderLeft: 1,
                  borderColor: "divider",
                }
              : {
                  width: "100%",
                  borderBottom: 1,
                  borderColor: "divider",
                }),
            bgcolor: "#f9f9f9",
          }}
        >
          <Tabs
            orientation={isMdUp ? "vertical" : "horizontal"}
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons={isMdUp ? false : "auto"}
            allowScrollButtonsMobile
            sx={{
              py: 2,
              "& .MuiTab-root": {
                alignItems: "flex-end",
                fontWeight: "bold",
                fontSize: 15,
                color: "#757575",
                mx: isMdUp ? 1 : 0.5,
                my: isMdUp ? 0.5 : 0,
                borderRadius: 2,
                textAlign: "right",
                minHeight: 40,
              },
              "& .Mui-selected": {
                color: "primary.main",
                bgcolor: "#fff",
                boxShadow: isMdUp ? 2 : 0,
              },
              ...(isMdUp
                ? {}
                : {
                    "& .MuiTabs-indicator": {
                      height: 3,
                    },
                  }),
            }}
          >
            {SECTIONS.map((s, i) => (
              <Tab key={i} label={s.label} />
            ))}
          </Tabs>
        </Box>

        {/* محتوى التاب */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, md: 4 },
            bgcolor: "#fff",
            minWidth: 0, // مهم لمنع انفجار المحتوى
          }}
        >
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
