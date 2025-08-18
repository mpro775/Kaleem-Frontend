import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [value, setValue] = useState("");
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>يرجى توضيح سبب التقييم السلبي</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="سبب التقييم"
          type="text"
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          multiline
          minRows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Button
          onClick={() => {
            onSubmit(value.trim());
            setValue("");
          }}
          disabled={!value.trim()}
        >
          إرسال
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDialog;
