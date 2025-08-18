// src/features/knowledge/ui/LinksTab.tsx
import { useState } from "react";
import {
  Box, Button, TextField, List, ListItem, ListItemText,
  IconButton, LinearProgress, ListItemSecondaryAction,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useLinks } from "../hooks";

export default function LinksTab({ merchantId }: { merchantId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const { links, loading, add, remove } = useLinks(merchantId);
  const [newLink, setNewLink] = useState("");

  const handleAdd = async () => {
    if (!newLink.trim()) return;
    await add(newLink.trim());
    setNewLink("");
    enqueueSnackbar("تمت إضافة الرابط", { variant: "success" });
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    enqueueSnackbar("تم حذف الرابط", { variant: "info" });
  };

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField label="رابط الموقع" value={newLink} onChange={(e) => setNewLink(e.target.value)} fullWidth />
        <Button variant="contained" onClick={handleAdd}>إضافة</Button>
      </Box>

      <List>
        {links.length === 0 ? (
          <ListItem><ListItemText primary="لا توجد روابط بعد" /></ListItem>
        ) : (
          links.map((l) => (
            <ListItem key={l._id}>
              <ListItemText primary={l.url} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDelete(l._id)}>
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
