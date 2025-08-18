import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  Button,
  MenuItem,
  Input,
} from "@mui/material";
import { useState } from "react";
import { updateCategory } from "../../api/CategoryApi";
import type { Category } from "../../types/Category";

interface Props {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  category: Category;
  categories: Category[];
}

export default function EditCategoryDialog({
  open,
  onClose,
  onEdit,
  category,
  categories,
}: Props) {
  const [name, setName] = useState(category.name);
  const [parent, setParent] = useState<string | "">(category.parent || "");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleEdit = async () => {
    setSaving(true);
    let imageUrl = category.image ?? "";
    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      imageUrl = await res.text();
    }
    await updateCategory(category._id, {
      name,
      parent: parent || undefined,
      image: imageUrl,
    });
    setSaving(false);
    onEdit();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>تعديل الفئة</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={2}>
          <TextField
            label="اسم الفئة"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            select
            label="فئة رئيسية (اختياري)"
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            fullWidth
          >
            <MenuItem value="">لا شيء (فئة رئيسية)</MenuItem>
            {categories
              .filter((c) => c._id !== category._id)
              .map((cat) => (
                <MenuItem value={cat._id} key={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
          </TextField>
          <Input
            type="file"
            inputProps={{ accept: "image/*" }}
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
              setImage(target.files?.[0] ?? null);
            }}
          />
          <Button
            variant="contained"
            onClick={handleEdit}
            disabled={saving || !name}
          >
            {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
