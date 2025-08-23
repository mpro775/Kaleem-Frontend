import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import DocsTab from "@/features/mechant/knowledge/ui/DocsTab";
import LinksTab from "@/features/mechant/knowledge/ui/LinksTab";
import FaqsTab from "@/features/mechant/knowledge/ui/FaqsTab";
import { useState } from "react";

export default function KnowledgePage() {
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
          <Tab label="الأسئلة الشائعة" />
          <Tab label="روابط المواقع" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>الملفات</span>
                <Box 
                  sx={{ 
                    backgroundColor: '#ff9800', 
                    color: 'white', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1, 
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  قريباً
                </Box>
              </Box>
            }
            disabled
            sx={{
              opacity: 0.6,
              cursor: 'not-allowed',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          />
        </Tabs>
      </Paper>
      {tab === 0 && <FaqsTab merchantId={merchantId} />}
      {tab === 1 && <LinksTab merchantId={merchantId} />}
      {tab === 2 && (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8, 
            opacity: 0.6,
            backgroundColor: '#f5f5f5',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" color="text.secondary" gutterBottom>
            🚧 الملفات قريباً 🚧
          </Typography>
          <Typography variant="body1" color="text.secondary">
            هذه الميزة قيد التطوير وستكون متاحة قريباً
          </Typography>
        </Box>
      )}
    </Box>
  );
}
