import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import DocumentsTab from "../../components/documents/DocumentsTab";
import LinksTab from "../../components/documents/LinksTab";
import FaqsTab from "../../components/documents/FaqsTab";
import { useState } from "react";

export default function DocumentsPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId;
  const [tab, setTab] = useState(0);

  if (!merchantId) return <div>تأكد من تسجيل الدخول كتاجر.</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        إدارة مصادر المعرفة
      </Typography>
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab label="الملفات" />
          <Tab label="روابط المواقع" />
          <Tab label="الأسئلة الشائعة" />
        </Tabs>
      </Paper>
      {tab === 0 && <DocumentsTab merchantId={merchantId} />}
      {tab === 1 && <LinksTab merchantId={merchantId} />}
      {tab === 2 && <FaqsTab merchantId={merchantId} />}
    </Box>
  );
}
