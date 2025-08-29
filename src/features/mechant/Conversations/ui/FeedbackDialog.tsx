// src/features/mechant/Conversations/ui/FeedbackDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => Promise<void> | void;
  loading?: boolean;
}

const MAX = 300;

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [value, setValue] = useState("");

  const handleSend = async () => {
    const text = value.trim();
    if (!text || loading) return;
    await onSubmit(text);
    setValue("");
  };

  const disabled = loading || value.trim().length < 5;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>يرجى توضيح سبب التقييم السلبي</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="سبب التقييم"
          type="text"
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX))}
          multiline
          minRows={3}
          disabled={loading}
          helperText={`${value.trim().length} / ${MAX}`}
        />
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            رجاءً اكتب تفاصيل قصيرة (5 أحرف على الأقل).
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          إلغاء
        </Button>
        <Button onClick={handleSend} disabled={disabled}>
          {loading ? "جارٍ الإرسال..." : "إرسال"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDialog;
