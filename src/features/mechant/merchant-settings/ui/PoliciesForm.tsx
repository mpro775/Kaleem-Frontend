import { useState } from "react";
import { Box, TextField, Button, Stack } from "@mui/material";
import type { SectionComponentProps } from "@/features/mechant/merchant-settings/types";

export default function PoliciesForm({
  initialData,
  onSave,
  loading,
}: SectionComponentProps) {
  const [policies, setPolicies] = useState({
    returnPolicy: initialData.returnPolicy ?? "",
    exchangePolicy: initialData.exchangePolicy ?? "",
    shippingPolicy: initialData.shippingPolicy ?? "",
  });
  const handleChange = (k: string, v: string) =>
    setPolicies((p) => ({ ...p, [k]: v }));

  return (
    <Box dir="rtl">
      <Stack spacing={2}>
        <TextField
          label="سياسة الاسترجاع"
          value={policies.returnPolicy}
          onChange={(e) => handleChange("returnPolicy", e.target.value)}
          multiline
          rows={3}
          fullWidth
        />
        <TextField
          label="سياسة الاستبدال"
          value={policies.exchangePolicy}
          onChange={(e) => handleChange("exchangePolicy", e.target.value)}
          multiline
          rows={3}
          fullWidth
        />
        <TextField
          label="سياسة الشحن"
          value={policies.shippingPolicy}
          onChange={(e) => handleChange("shippingPolicy", e.target.value)}
          multiline
          rows={3}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={() => onSave(policies)}
          disabled={loading}
        >
          حفظ
        </Button>
      </Stack>
    </Box>
  );
}
