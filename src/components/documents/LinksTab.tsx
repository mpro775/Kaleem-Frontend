import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
  ListItemSecondaryAction,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { fetchLinks, addLinks, deleteLink } from "../../api/linksApi";
export interface LinkItem {
  _id: string;
  url: string;
  status: string; // أضفها إذا كانت لديك في الباكيند
  errorMessage?: string; // أضفها إذا كانت لديك في الباكيند
  createdAt: string;
}

export default function LinksTab({ merchantId }: { merchantId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    fetchLinks(merchantId)
      .then(setLinks)
      .finally(() => setLoading(false));
  }, [merchantId]);

  const handleAdd = async () => {
    if (!newLink.trim()) return;
    await addLinks(merchantId, [newLink]);
    fetchLinks(merchantId).then(setLinks);
    setNewLink("");
    enqueueSnackbar("تمت إضافة الرابط", { variant: "success" });
  };
  const handleDelete = async (id: string) => {
    await deleteLink(merchantId, id);
    setLinks((prev) => prev.filter((l) => l._id !== id));
    enqueueSnackbar("تم حذف الرابط", { variant: "info" });
  };

  if (loading) return <LinearProgress />;
  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="رابط الموقع"
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleAdd}>
          إضافة
        </Button>
      </Box>
      <List>
        {links.length === 0 ? (
          <ListItem>
            <ListItemText primary="لا توجد روابط بعد" />
          </ListItem>
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
