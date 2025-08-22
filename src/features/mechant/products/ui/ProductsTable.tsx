import { useEffect,  useState } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, CircularProgress, Box, IconButton, Stack, Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { getMerchantProducts, deleteProduct } from "../api";
import type { ProductResponse } from "../type";
import { formatMoney } from "@/shared/utils/money";
import { toDisplayString } from "@/shared/utils/render";

interface ProductsTableProps {
  merchantId: string;
  onEdit?: (p: ProductResponse) => void; // NEW
  onRefresh?: () => void;                // NEW
}

export default function ProductsTable({ merchantId, onEdit, onRefresh }: ProductsTableProps) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getMerchantProducts(merchantId)
      .then(setProducts)
      .catch(() => setError("حدث خطأ أثناء جلب المنتجات"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [merchantId]);

  const handleDelete = async (id: string) => {
    const sure = window.confirm("هل تريد حذف هذا المنتج؟ لا يمكن التراجع.");
    if (!sure) return;
    await deleteProduct(id).catch(() => {});
    onRefresh?.();
    load();
  };

  if (loading) return <Box py={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  if (!products.length)
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">لا توجد منتجات بعد.</Typography>
      </Paper>
    );

  return (
    <TableContainer component={Paper} sx={{ p: 0, overflowX: "auto" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>الصورة</TableCell>
            <TableCell>الاسم</TableCell>
            <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>الفئة</TableCell>
            <TableCell>السعر</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>المصدر</TableCell>
            <TableCell align="center">إجراءات</TableCell> {/* NEW */}
          </TableRow>
        </TableHead>

        <TableBody>
          {products.map((p) => {
            const money = formatMoney(p.hasActiveOffer ? p.priceEffective : p.price, p.currency || 'SAR');
            const oldMoney = p.hasActiveOffer && p.offer?.oldPrice != null
              ? formatMoney(p.offer?.oldPrice, p.currency || 'SAR')
              : null;

            const offerChip = p.hasActiveOffer ? (
              <Tooltip title="عرض نشط">
                <Chip icon={<LocalOfferIcon />} label="عرض" color="warning" size="small" sx={{ mr: 1 }} />
              </Tooltip>
            ) : null;

            return (
              <TableRow key={p._id} hover>
                <TableCell>
                  {p.images?.[0] ? (
                    <Avatar src={p.images[0]} variant="rounded" sx={{ width: 48, height: 48 }} />
                  ) : (
                    <Avatar variant="rounded" sx={{ width: 48, height: 48 }}>
                      {p.name?.[0]}
                    </Avatar>
                  )}
                </TableCell>

                <TableCell sx={{ maxWidth: 320 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography fontWeight={600} noWrap title={p.name}>{p.name}</Typography>
                    {offerChip}
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: { xs: "none", sm: "-webkit-box" }, WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    {p.description}
                  </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
  {toDisplayString(p.category)}
</TableCell>

                <TableCell>
                  {p.hasActiveOffer && oldMoney ? (
                    <Stack spacing={0}>
                      <Typography sx={{ textDecoration: "line-through" }} color="text.secondary">{oldMoney}</Typography>
                      <Typography fontWeight={700}>{money}</Typography>
                    </Stack>
                  ) : (
                    <Typography>{money}</Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Chip label={p.isAvailable ? "متوفر" : "غير متوفر"} color={p.isAvailable ? "success" : "error"} size="small" />
                </TableCell>

                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  <Chip label={p.source === "manual" ? "يدوي" : p.source === "api" ? "API" : "رابط"} size="small" />
                </TableCell>

                <TableCell align="center">
                  <IconButton onClick={() => onEdit?.(p)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(p._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
