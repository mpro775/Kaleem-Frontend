// src/features/knowledge/ui/FaqsTab.tsx
import { useState } from "react";
import {
  Box, Button, TextField, List, ListItem, ListItemText,
  IconButton, LinearProgress, ListItemSecondaryAction,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useFaqs } from "../hooks";

export default function FaqsTab({ merchantId }: { merchantId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const { faqs, loading, add, remove } = useFaqs(merchantId);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  const handleAdd = async () => {
    if (!newQ.trim() || !newA.trim()) return;
    await add(newQ.trim(), newA.trim());
    setNewQ(""); setNewA("");
    enqueueSnackbar("تمت إضافة السؤال", { variant: "success" });
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    enqueueSnackbar("تم حذف السؤال", { variant: "info" });
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField label="السؤال" value={newQ} onChange={(e) => setNewQ(e.target.value)} fullWidth />
        <TextField label="الإجابة" value={newA} onChange={(e) => setNewA(e.target.value)} fullWidth />
        <Button variant="contained" onClick={handleAdd}>إضافة</Button>
      </Box>

      <List>
        {faqs.length === 0 ? (
          <ListItem><ListItemText primary="لا توجد أسئلة بعد" /></ListItem>
        ) : (
          faqs.map((f) => (
            <ListItem key={f._id} alignItems="flex-start">
              <ListItemText primary={f.question} secondary={f.answer} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDelete(f._id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
}
