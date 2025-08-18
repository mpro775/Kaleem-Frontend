// src/pages/Dashboard/LeadsManagerPage.tsx
import { useState } from "react";
import { Box, Paper, Typography, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useLeadsManager } from "@/features/mechant/leads/hooks";
import EnabledToggleCard from "@/features/mechant/leads/ui/EnabledToggleCard";
import FieldsEditor from "@/features/mechant/leads/ui/FieldsEditor";
import LeadsTable from "@/features/mechant/leads/ui/LeadsTable";

export default function LeadsManagerPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? null;

  const {
    loading,
    error,
    leads,
    fields,
    enabled,
    saving,
    setEnabled,
    addField,
    updateField,
    removeField,
    refreshAll,
    saveAll,
  } = useLeadsManager(merchantId || "");

  const [snack, setSnack] = useState<{ open: boolean; msg: string; type: "success" | "error" }>({
    open: false,
    msg: "",
    type: "success",
  });

  if (!merchantId) {
    return (
      <Box textAlign="center" mt={8}>
        <Alert severity="warning">لا يوجد تاجر مسجّل.</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, px: 2 }}>
      {error && (
        <Alert sx={{ mb: 2 }} severity="error">
          {error}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        إدارة إعدادات الـ Leads
      </Typography>

      <EnabledToggleCard
        enabled={enabled}
        onToggle={async (v) => {
          setEnabled(v);
          const ok = await saveAll(); // نحفظ حالة التفعيل مباشرة
          setSnack({ open: true, msg: ok ? "تم تحديث الحالة" : "تعذّر تحديث الحالة", type: ok ? "success" : "error" });
        }}
      />

      {enabled && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <FieldsEditor
            fields={fields}
            saving={saving}
            onAdd={addField}
            onRemove={removeField}
            onChange={updateField}
            onSave={async () => {
              const ok = await saveAll();
              setSnack({ open: true, msg: ok ? "تم حفظ التعديلات" : "فشل الحفظ", type: ok ? "success" : "error" });
              if (ok) refreshAll();
            }}
          />
        </Paper>
      )}

      <Typography variant="h5" gutterBottom>
        قائمة الـ Leads
      </Typography>
      <Paper>
        <LeadsTable leads={leads} fields={fields} />
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snack.type}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
