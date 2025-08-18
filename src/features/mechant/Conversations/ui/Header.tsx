// src/features/chat/ui/Header.tsx
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";

export default function Header({
  selectedSession, handover, onToggleHandover,
}: { selectedSession?: string; handover?: boolean; onToggleHandover: (v: boolean) => void; }) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" p={2} borderBottom="1px solid #eee" minHeight={56}>
      <Typography fontWeight={700} fontSize={18}>
        {selectedSession ? `المحادثة: ${selectedSession}` : "اختر محادثة"}
      </Typography>
      {!!selectedSession && (
        <FormControlLabel
          control={<Switch checked={!!handover} onChange={(_, v) => onToggleHandover(v)} color="primary" />}
          label={handover ? "تم تسليمها للموظف (إيقاف البوت)" : "البوت يعمل"}
          labelPlacement="start"
        />
      )}
    </Box>
  );
}
