// src/features/mechant/dashboard/ui/ChecklistPanel.tsx
import {
  Paper,
  Typography,
  Stack,
  Box,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
  useTheme,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { ChecklistGroup } from "@/features/mechant/dashboard/type";
import { useState } from "react";

export default function ChecklistPanel({
  checklist = [],
  onSkip,
  loading,
}: {
  checklist: ChecklistGroup[];
  onSkip?: (itemKey: string) => void;
  loading?: boolean;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const safeChecklist = Array.isArray(checklist) ? checklist : [];
  const allItems = safeChecklist.flatMap((g) => g.items || []);
  const completed = allItems.filter(
    (i) => i?.isComplete || i?.isSkipped
  ).length;
  const total = allItems.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const [selectedItem, setSelectedItem] = useState<any>(null);

  if (loading) return null;
  if (total === 0) {
    return (
      <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={800}>
          قائمة التحقق لإكمال تفعيل المتجر
        </Typography>
        <Typography variant="body2" color="text.secondary">
          لا توجد مهام متاحة حالياً.
        </Typography>
      </Paper>
    );
  }

  // 🎉 حالة النجاح
  if (percent === 100) {
    return (
      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          mb: 3,
          background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
          color: "white",
        }}
      >
        <Typography variant="h6" fontWeight={800}>
          🎉 تم إكمال جميع المهام!
        </Typography>
        <Typography variant="body2">
          متجرك جاهز بالكامل! تم إكمال جميع خطوات التفعيل.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
        {/* رأس اللوحة */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <CircularProgress
            variant="determinate"
            value={percent}
            size={48}
            thickness={5}
            sx={{ color: percent === 100 ? "success.main" : "primary.main" }}
          />
          <Typography variant="h6" fontWeight={800} flex={1}>
            قائمة التحقق
          </Typography>
          <Chip label={`${completed}/${total}`} color="primary" size="small" />
        </Box>

        {isMobile ? (
          // 📱 نسخة الهاتف — فقط قائمة صغيرة
          <Stack spacing={1}>
            {allItems.map((item) => {
              const isComplete = item?.isComplete || item?.isSkipped;
              return (
                <Paper
                  key={item?.key}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    opacity: isComplete ? 0.6 : 1,
                    cursor: isComplete ? "default" : "pointer",
                  }}
                  onClick={() => !isComplete && setSelectedItem(item)}
                >
                  <Typography
                    fontWeight={isComplete ? 400 : 700}
                    fontSize={14}
                    noWrap
                  >
                    {item?.title}
                  </Typography>
                  {isComplete ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </Paper>
              );
            })}
          </Stack>
        ) : (
          // 💻 نسخة الديسكتوب — Accordion كامل
          <Stack spacing={2}>
            {safeChecklist.map((group, idx) => (
              <Accordion key={group.key || idx} defaultExpanded={idx === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {group.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    {group.items?.map((item) => {
                      const isComplete = item?.isComplete || item?.isSkipped;
                      return (
                        <Box
                          key={item.key}
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          {isComplete ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <RadioButtonUncheckedIcon color="warning" />
                          )}
                          <Typography flex={1}>{item.title}</Typography>
                          {!isComplete && item?.skippable && (
                            <Button
                              onClick={() => onSkip?.(item.key)}
                              size="small"
                              color="info"
                              startIcon={<SkipNextIcon />}
                            >
                              تخطي
                            </Button>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Paper>

      {/* 📱 BottomSheet للموبايل */}
      {selectedItem && (
        <Dialog
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px 16px 0 0",
              bottom: 0,
              position: "absolute",
            },
          }}
        >
          <DialogTitle>{selectedItem.title}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              {selectedItem.message || "أكمل هذه الخطوة لتفعيل متجرك"}
            </Typography>
          </DialogContent>
          <DialogActions>
            {selectedItem.skippable && (
              <Button
                color="info"
                onClick={() => {
                  onSkip?.(selectedItem.key);
                  setSelectedItem(null);
                }}
              >
                تخطي
              </Button>
            )}
            {selectedItem.actionPath && (
              <Button
                color="primary"
                variant="contained"
                href={selectedItem.actionPath}
              >
                إكمال
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
