// components/ChannelCard.tsx
import { Box, Typography, Switch, Button, Stack } from "@mui/material";
import type { ReactNode } from "react";

type ChannelCardProps = {
  icon: ReactNode;
  title: string;
  enabled: boolean;
  onToggle: (checked: boolean) => void;
  onGuide: () => void;
  statusColor?: string;
  isLoading?: boolean;
    onCardClick?: () => void; // الجديد

};

export default function ChannelCard({
  icon,
  title,
  enabled,
  onToggle,
  onGuide,
  statusColor,
  isLoading,
    onCardClick,

}: ChannelCardProps) {
  return (
    <Box
      onClick={onCardClick}
      sx={{
        borderRadius: 5,
        background: "#fff",
        boxShadow: "0 2px 8px #00000014",
        p: 4,
        textAlign: "center",
        minWidth: 220,
        minHeight: 180,
        position: "relative",
        transition: "box-shadow .2s",
        "&:hover": { boxShadow: "0 4px 16px #00000022", cursor: "pointer" },
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <Box sx={{ fontSize: 44, color: statusColor || "primary.main" }}>{icon}</Box>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        <Switch
          checked={enabled}
          onChange={(e) => {
            e.stopPropagation(); // منع التفعيل من click الكارد
            onToggle(e.target.checked);
          }}
          disabled={isLoading}
        />
        <Button variant="text" size="small" onClick={e => {e.stopPropagation(); onGuide();}}>
          طريقة الربط
        </Button>
      </Stack>
    </Box>
  );
}