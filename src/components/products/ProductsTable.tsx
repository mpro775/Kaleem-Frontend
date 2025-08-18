import { useEffect, useState } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, CircularProgress, Box
} from "@mui/material";
import { getMerchantProducts } from "../../api/productsApi";
import type { Product } from "../../types/Product";
;

interface ProductsTableProps {
  merchantId: string;
}

export default function ProductsTable({ merchantId }: ProductsTableProps) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  setLoading(true);
  getMerchantProducts( merchantId)
    .then(setProducts)
    .catch(() => setError("حدث خطأ أثناء جلب المنتجات"))
    .finally(() => setLoading(false));
}, [merchantId]);

  if (loading) return (
    <Box py={4} display="flex" justifyContent="center">
      <CircularProgress />
    </Box>
  );
  if (error) return <Typography color="error">{error}</Typography>;
  if (!products.length) return (
    <Paper sx={{ p: 3 }}>
      <Typography color="text.secondary">لا توجد منتجات بعد.</Typography>
    </Paper>
  );

  return (
    <TableContainer component={Paper} sx={{ p: 0 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>الصورة</TableCell>
            <TableCell>الاسم</TableCell>
            <TableCell>الفئة</TableCell>
            <TableCell>السعر</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell>المصدر</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p._id}>
              <TableCell>
                {p.images?.[0] ? (
                  <Avatar src={p.images[0]} variant="rounded" sx={{ width: 56, height: 56 }} />
                ) : (
                  <Avatar variant="rounded" sx={{ width: 56, height: 56 }}>
                    {p.name?.[0]}
                  </Avatar>
                )}
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>{p.name}</Typography>
                <Typography variant="body2" color="text.secondary">{p.description}</Typography>
              </TableCell>
              <TableCell>{p.category}</TableCell>
              <TableCell>{p.price?.toLocaleString()} ر.س</TableCell>
              <TableCell>
                <Chip
                  label={p.isAvailable ? "متوفر" : "غير متوفر"}
                  color={p.isAvailable ? "success" : "error"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={p.source === "manual" ? "يدوي" : p.source === "api" ? "API" : "رابط"}
                  color={
                    p.source === "manual"
                      ? "default"
                      : p.source === "api"
                        ? "primary"
                        : "info"
                  }
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
