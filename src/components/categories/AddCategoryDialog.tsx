import { Dialog, DialogTitle, DialogContent, Stack, TextField, Button, MenuItem, Input } from "@mui/material";
import { useState } from "react";
import { createCategory } from "../../api/CategoryApi";
import type { Category } from "../../types/Category";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
  categories: Category[];
  merchantId: string;  // أضفه هنا
}


export default function AddCategoryDialog({ open, onClose, onAdd, categories,merchantId }: Props) {
  const [name, setName] = useState("");
  const [parent, setParent] = useState<string | "">("");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    // افترض أنك ترفع الصورة أولاً إلى API وترجع رابطها (يمكنك تعديل ذلك حسب الـ backend)
    let imageUrl = "";
    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      imageUrl = await res.text(); // أو res.json().url حسب الـ backend
    }
    await createCategory({ name, parent: parent || undefined, image: imageUrl,merchantId });
    setSaving(false);
    setName("");
    setParent("");
    setImage(null);
    onAdd();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>إضافة فئة جديدة</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={2}>
          <TextField label="اسم الفئة" value={name} onChange={e => setName(e.target.value)} fullWidth />
          <TextField
            select
            label="فئة رئيسية (اختياري)"
            value={parent}
            onChange={e => setParent(e.target.value)}
            fullWidth
          >
            <MenuItem value="">لا شيء (فئة رئيسية)</MenuItem>
            {categories.map(cat => (
              <MenuItem value={cat._id} key={cat._id}>{cat.name}</MenuItem>
            ))}
          </TextField>
      <Input
  type="file"
  inputProps={{ accept: "image/*" }}
  onChange={e => {
    const target = e.target as HTMLInputElement;
    setImage(target.files?.[0] ?? null);
  }}
/>
          <Button variant="contained" onClick={handleAdd} disabled={saving || !name}>
            {saving ? "جارٍ الحفظ..." : "إضافة"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
