// src/components/CustomerInfoForm.tsx
import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Stack } from "@mui/material";
import axios from "../../api/axios";
import type { CustomerInfo, Lead } from "../../types/store";


export default function CustomerInfoForm({
  merchantId,
  onComplete,
}: {
  merchantId: string;
  onComplete: (info: CustomerInfo) => void;
}) {
  const [form, setForm] = useState<CustomerInfo>({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);

  // جلب البيانات إذا كانت محفوظة مسبقًا
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) return;
    axios
      .get(`/merchants/${merchantId}/leads`)
      .then((res) => {
        const lead = res.data.find((l: Lead) => l.sessionId === sessionId);
        if (lead) setForm(lead.data);
      })
      .catch(() => {});
  }, [merchantId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("sessionId", sessionId);
    }
    await axios.post(`/merchants/${merchantId}/leads`, {
      sessionId,
      data: form,
      source: "storefront",
    });
    setLoading(false);
    onComplete(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          name="name"
          label="الاسم"
          value={form.name}
          onChange={handleChange}
          required
        />
        <TextField
          name="phone"
          label="رقم الجوال"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <TextField
          name="address"
          label="العنوان"
          value={form.address}
          onChange={handleChange}
          required
        />
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? "جارٍ الحفظ..." : "متابعة"}
        </Button>
      </Stack>
    </Box>
  );
}
