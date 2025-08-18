import { useState } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Avatar } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditCategoryDialog from "./EditCategoryDialog";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import type { Category } from "../../types/Category";

interface CategoriesTableProps {
  categories: Category[];
  onRefresh: () => void;
}

export default function CategoriesTable({ categories, onRefresh }: CategoriesTableProps) {
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);

  // بناء جدول parent name سريع
  const idToName = Object.fromEntries(categories.map(c => [c._id, c.name]));

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الصورة</TableCell>
              <TableCell>اسم الفئة</TableCell>
              <TableCell>الفئة الرئيسية</TableCell>
              <TableCell>إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map(cat => (
              <TableRow key={cat._id}>
                <TableCell>
                  {cat.image ? <Avatar src={cat.image} /> : <Avatar>{cat.name[0]}</Avatar>}
                </TableCell>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.parent ? idToName[cat.parent] : "—"}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => setEditCat(cat)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => setDeleteCat(cat)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {editCat && (
        <EditCategoryDialog
          open={!!editCat}
          onClose={() => setEditCat(null)}
          onEdit={() => { setEditCat(null); onRefresh(); }}
          category={editCat}
          categories={categories}
        />
      )}

      {deleteCat && (
        <DeleteCategoryDialog
          open={!!deleteCat}
          onClose={() => setDeleteCat(null)}
          onDelete={() => { setDeleteCat(null); onRefresh(); }}
          categoryName={deleteCat.name}
          categoryId={deleteCat._id}
        />
      )}
    </>
  );
}
