import { Dialog, DialogTitle, DialogContent, Button, Stack, Typography } from "@mui/material";
import { deleteCategory } from "../../api/CategoryApi";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  categoryName: string;
  categoryId: string;
}

export default function DeleteCategoryDialog({ open, onClose, onDelete, categoryName, categoryId }: Props) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteCategory(categoryId);
    setDeleting(false);
    onDelete();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>حذف الفئة</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={2}>
          <Typography>هل أنت متأكد أنك تريد حذف الفئة: {categoryName}؟</Typography>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? "جاري الحذف..." : "حذف"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
