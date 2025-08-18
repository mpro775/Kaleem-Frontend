import {
  Paper, Typography, Stack, Box, Chip, Tooltip, IconButton,
  CircularProgress, useTheme, Button, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { ChecklistGroup } from "../../types/analytics";

export default function ChecklistPanel({
  checklist = [],
  onSkip,
}: {
  checklist: ChecklistGroup[];
  onSkip?: (itemKey: string) => void;
}) {
  const theme = useTheme();
  const allItems = checklist.flatMap(group => group.items);
  const completed = allItems.filter(i => i.isComplete || i.isSkipped).length;
  const total = allItems.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (percent === 100) return null;

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 4, position: "relative", overflow: "visible", boxShadow: theme.shadows[2], }}>
      {/* العنوان والتقدم */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
        <Box sx={{ position: "relative", display: "inline-flex", mr: 2 }}>
          <CircularProgress
            variant="determinate"
            value={percent}
            size={52}
            thickness={5}
            sx={{
              color: percent === 100 ? theme.palette.success.main : theme.palette.primary.main,
              background: "#f5f5f5",
              borderRadius: "50%",
            }}
          />
          <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="subtitle2" fontWeight="bold">{completed}/{total}</Typography>
          </Box>
        </Box>
        <Typography variant="h6" fontWeight={800}>قائمة التحقق لإكمال تفعيل المتجر</Typography>
        {percent === 100 && (
          <Chip label="جاهز للعمل" color="success" sx={{ ml: 2 }} icon={<CheckCircleIcon />} />
        )}
      </Box>
      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        أتمم الخطوات التالية ليصبح متجرك فعالاً بالكامل.
      </Typography>
      <Stack spacing={3}>
        {checklist.map((group, idx) => (
          <Accordion key={group.key} defaultExpanded={idx === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={700}>
                {group.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1} sx={{ pl: 1 }}>
                {group.items.map((item) => {
                  const isComplete = item.isComplete || item.isSkipped;
                  return (
                    <Box
                      key={item.key}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        opacity: isComplete ? 0.65 : 1,
                        border: isComplete
                          ? "1.5px solid " + theme.palette.grey[200]
                          : "2px solid " + theme.palette.primary.light,
                        borderRadius: 2,
                        background: isComplete ? "#f8f8f8" : theme.palette.action.hover,
                        px: 2,
                        py: 1,
                        transition: "background 0.2s, border 0.2s",
                        boxShadow: isComplete ? undefined : theme.shadows[1],
                      }}
                    >
                      {item.isComplete ? (
                        <CheckCircleIcon color="success" sx={{ fontSize: 24 }} />
                      ) : item.isSkipped ? (
                        <SkipNextIcon color="info" sx={{ fontSize: 24 }} />
                      ) : (
                        <RadioButtonUncheckedIcon color="warning" sx={{ fontSize: 24 }} />
                      )}
                      <Typography
                        variant="body1"
                        fontWeight={isComplete ? 500 : 700}
                        sx={{
                          flex: 1,
                          color: isComplete ? "text.secondary" : "text.primary",
                        }}
                      >
                        {item.title}
                      </Typography>
                      {/* زر إكمال */}
                      {!isComplete && item.actionPath && (
                        <Tooltip title={item.message || "انتقل لإكمال هذه الخطوة"}>
                          <Button variant="outlined" size="small" color="primary" sx={{ minWidth: 100 }} href={item.actionPath}>
                            إكمال
                          </Button>
                        </Tooltip>
                      )}
                      {/* زر تخطي */}
                      {!isComplete && item.skippable && !item.isSkipped && (
                        <Tooltip title="تخطي هذه الخطوة">
                          <Button
                            variant="text"
                            size="small"
                            color="info"
                            sx={{ minWidth: 64, mr: 1 }}
                            onClick={() => onSkip?.(item.key)}
                            startIcon={<SkipNextIcon />}
                          >
                            تخطي
                          </Button>
                        </Tooltip>
                      )}
                      {/* زر معلومات */}
                      {!isComplete && (
                        <Tooltip title={item.message || ""}>
                          {item.actionPath ? (
                            <IconButton color="primary" size="small" href={item.actionPath}>
                              <InfoIcon />
                            </IconButton>
                          ) : (
                            <IconButton color="primary" size="small" disabled>
                              <InfoIcon />
                            </IconButton>
                          )}
                        </Tooltip>
                      )}
                      {item.isComplete && (
                        <Chip label="مكتمل" color="success" size="small" sx={{ ml: 1 }} />
                      )}
                      {item.isSkipped && (
                        <Chip label="تم التخطي" color="info" size="small" sx={{ ml: 1 }} />
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
      {/* Progress Label في الأسفل للموبايل */}
      <Box sx={{ mt: 2, textAlign: "center", display: { xs: "block", md: "none" } }}>
        <Typography variant="caption" color="primary" fontWeight={700}>
          نسبة الإنجاز: {percent}%
        </Typography>
      </Box>
    </Paper>
  );
}
