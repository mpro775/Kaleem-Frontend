// src/features/mechant/Conversations/ui/Header.tsx
import {
  Box,
  FormControlLabel,
  Switch,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

export default function Header({
  selectedSession,
  handover,
  onToggleHandover,
  onBack,
}: {
  selectedSession?: string;
  handover?: boolean;
  onToggleHandover: (v: boolean) => void;
  onBack?: () => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p={2}
      borderBottom="1px solid #eee"
      minHeight={56}
    >
      <Box display="flex" alignItems="center" gap={1.25}>
        {isMobile && onBack && (
          <Tooltip title="رجوع">
            <IconButton onClick={onBack} aria-label="رجوع">
              <ArrowBackIosNewRoundedIcon />
            </IconButton>
          </Tooltip>
        )}
        <Typography fontWeight={700} fontSize={18} noWrap>
          {selectedSession ? `المحادثة: ${selectedSession}` : "اختر محادثة"}
        </Typography>
      </Box>
      {!!selectedSession && (
        <FormControlLabel
          control={
            <Switch
              checked={!!handover}
              onChange={(_, v) => onToggleHandover(v)}
              color="primary"
            />
          }
          label={handover ? "تم تسليمها للموظف (إيقاف البوت)" : "البوت يعمل"}
          labelPlacement="start"
        />
      )}
    </Box>
  );
}
