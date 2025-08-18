// src/features/channels/ui/ChannelDetailsDialog.tsx
import { Dialog, DialogTitle, DialogContent, Box, Typography, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { maskToken } from "../constants";

export default function ChannelDetailsDialog({
  open, onClose, title, data,
}: { open: boolean; onClose: () => void; title: string; data?: Record<string, unknown> }) {
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>تفاصيل ربط قناة {title}</DialogTitle>
      <DialogContent>
        {data ? (
          <Box>
            {Object.entries(data).map(([k, v]) => {
              const val = typeof v === "string" && k.toLowerCase().includes("token") ? maskToken(v) : String(v);
              const canCopy = typeof v === "string" && v.length > 0;
              return (
                <Box key={k} sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">{k}:</Typography>
                    <Typography variant="body2" sx={{ wordBreak: "break-all" }}>{val}</Typography>
                  </Box>
                  {canCopy && (
                    <Tooltip title="نسخ">
                      <IconButton size="small" onClick={() => copy(String(v))}><ContentCopyIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  )}
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography>لا توجد بيانات لهذه القناة.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
