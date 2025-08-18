// src/components/PromptToolbar.tsx
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  IconButton,
  Button,
  Typography,
  Box,
  Tooltip,
  Badge,
  LinearProgress,
  Fade,
  styled,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CodeIcon from "@mui/icons-material/Code";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[900]
      : theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minWidth: 120,
  fontWeight: 500,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

interface PromptToolbarProps {
  activeTab: "quick" | "advanced";
  onTabChange: (tab: "quick" | "advanced") => void;
  onRefresh: () => void;
  onSave: () => void;
  isSaving: boolean;
  lastUpdated?: Date | null;
}

export function PromptToolbar({
  activeTab,
  onTabChange,
  onRefresh,
  onSave,
  isSaving,
  lastUpdated,
}: PromptToolbarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return "لم يتم التحديث بعد";

    return format(lastUpdated, "HH:mm - dd MMM yyyy", { locale: ar });
  };

  return (
    <StyledAppBar position="static" elevation={0}>
      {/* شريط التقدم أثناء الحفظ */}
      <Fade in={isSaving} unmountOnExit>
        <LinearProgress
          color="primary"
          sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 2 }}
        />
      </Fade>

      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* العنوان والعلامة التجارية */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AutoFixHighIcon color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="h6" noWrap>
            استوديو البرومبت
          </Typography>
        </Box>

        {/* ألسنة التبويب */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => onTabChange(newValue)}
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <StyledTab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AutoFixHighIcon fontSize="small" sx={{ mr: 1 }} />
                <span>الإعداد السريع</span>
              </Box>
            }
            value="quick"
          />
          <StyledTab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CodeIcon fontSize="small" sx={{ mr: 1 }} />
                <span>القالب المتقدم</span>
              </Box>
            }
            value="advanced"
          />
        </Tabs>

        {/* مجموعة الأزرار */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* مؤشر آخر تحديث */}
          <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
            آخر تحديث: {formatLastUpdated()}
          </Typography>

          {/* زر التحديث */}
          <Tooltip title="تحديث المعاينة">
            <span>
              <IconButton
                onClick={handleRefresh}
                disabled={isRefreshing || isSaving}
                sx={{ mr: 1 }}
              >
                <Badge color="primary" variant="dot" invisible={!isRefreshing}>
                  <RefreshIcon />
                </Badge>
              </IconButton>
            </span>
          </Tooltip>

          {/* زر الحفظ */}
          <Button
            startIcon={<SaveIcon />}
            variant="contained"
            onClick={onSave}
            disabled={isSaving}
            sx={{
              minWidth: 120,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            {isSaving ? <span>جاري الحفظ...</span> : <span>حفظ التغييرات</span>}
          </Button>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
}
