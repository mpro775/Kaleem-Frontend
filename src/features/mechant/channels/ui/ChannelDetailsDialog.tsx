import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Alert,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

function maskToken(v: string) {
  if (!v) return "";
  if (v.length <= 8) return "••••";
  return `${v.slice(0, 4)}••••••${v.slice(-4)}`;
}

export default function ChannelDetailsDialog({
  open,
  onClose,
  title,
  data,
  dangerNote,
  onDisable,
  onDisconnect,
  onWipe,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  data?: Record<string, unknown>;
  dangerNote?: string;
  onDisable?: () => void | Promise<void>;
  onDisconnect?: () => void | Promise<void>;
  onWipe?: () => void | Promise<void>;
}) {
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle dir="rtl">تفاصيل ربط قناة {title}</DialogTitle>
      <DialogContent
        dividers
        sx={{ maxHeight: 480, overflowY: "auto" }}
        dir="rtl"
      >
        {dangerNote && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="warning" variant="outlined">
              {dangerNote}
            </Alert>
          </Box>
        )}
        {data ? (
          <Box>
            {Object.entries(data).map(([k, v]) => {
              const isString = typeof v === "string";
              const display =
                isString && k.toLowerCase().includes("token")
                  ? maskToken(v as string)
                  : typeof v === "object"
                  ? JSON.stringify(v, null, 2)
                  : String(v);

              const copyValue =
                typeof v === "object" ? JSON.stringify(v) : String(v);
              const canCopy = !!copyValue && copyValue !== "undefined";

              return (
                <Box
                  key={k}
                  sx={{
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {k}:
                    </Typography>
                    <Typography
                      variant="body2"
                      component={typeof v === "object" ? "pre" : "div"}
                      sx={{
                        wordBreak: "break-all",
                        whiteSpace:
                          typeof v === "object" ? "pre-wrap" : "normal",
                        m: 0,
                      }}
                    >
                      {display}
                    </Typography>
                  </Box>
                  {canCopy && (
                    <Tooltip title="نسخ">
                      <IconButton size="small" onClick={() => copy(copyValue)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
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
      {(onDisable || onDisconnect || onWipe) && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          {onDisable && (
            <Button color="warning" onClick={onDisable} variant="outlined">
              تعطيل
            </Button>
          )}
          {onDisconnect && (
            <Button color="error" onClick={onDisconnect} variant="outlined">
              فصل
            </Button>
          )}
          {onWipe && (
            <Button color="error" onClick={onWipe} variant="contained">
              مسح كامل
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}
