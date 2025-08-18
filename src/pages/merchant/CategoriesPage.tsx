import { useState, useEffect } from "react";
import { Box, Typography, Button,  CircularProgress } from "@mui/material";

import { getCategories } from "../../api/CategoryApi";
import type { Category } from "../../types/Category";
import CategoriesTable from "../../components/categories/CategoriesTable";
import AddCategoryDialog from "../../components/categories/AddCategoryDialog";
import { useAuth } from "../../context/AuthContext";

export default function CategoriesPage() {
    const { user } = useAuth();
    const merchantId = user?.merchantId ?? "";
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    getCategories().then(setCategories).finally(() => setLoading(false));
  }, [refresh]);

  return (
    <Box p={4} bgcolor="#f5f5f5">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">إدارة الفئات</Typography>
        <Button variant="contained" onClick={() => setOpenAdd(true)}>إضافة فئة جديدة</Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>
      ) : (
        <CategoriesTable categories={categories} onRefresh={() => setRefresh(r => r + 1)} />
      )}
  <AddCategoryDialog
  open={openAdd}
  onClose={() => setOpenAdd(false)}
  onAdd={() => {
    setOpenAdd(false);
    setRefresh(r => r + 1);
  }}
  categories={categories}
  merchantId={merchantId}   
/>

    </Box>
  );
}
