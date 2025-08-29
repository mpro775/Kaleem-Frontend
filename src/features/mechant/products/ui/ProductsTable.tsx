import { useEffect,  useState } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, CircularProgress, Box, IconButton, Stack, Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { getMerchantProducts, deleteProduct } from "../api";
import type { ProductResponse } from "../type";
import { formatMoney } from "@/shared/utils/money";
import { toDisplayString } from "@/shared/utils/render";
import { useErrorHandler } from '@/shared/errors';
import MobileProductsView from "./MobileProductsView"; // عدّل المسار لو لزم

interface ProductsTableProps {
  merchantId: string;
  onEdit?: (p: ProductResponse) => void; // NEW
  onRefresh?: () => void;                // NEW
}

export default function ProductsTable({ merchantId, onEdit, onRefresh }: ProductsTableProps) {
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm")); 
  console.log('ProductsTable rendered with merchantId:', merchantId);

  const load = () => {
    if (!merchantId) {
      console.warn('No merchantId provided');
      setProducts([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    getMerchantProducts(merchantId)
      .then((data) => {
        console.log('Products loaded:', data);
        console.log('Products type:', typeof data);
        console.log('Products is array:', Array.isArray(data));
        setProducts(data || []);
      })
      .catch((error) => {
        console.error('Error loading products:', error);
        setError("حدث خطأ أثناء جلب المنتجات");
        handleError(error);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    console.log('ProductsTable useEffect triggered with merchantId:', merchantId);
    if (merchantId) {
      load(); 
    } else {
      setProducts([]);
    }
  }, [merchantId]);

  const handleDelete = async (id: string) => {
    const sure = window.confirm("هل تريد حذف هذا المنتج؟ لا يمكن التراجع.");
    if (!sure) return;
    try {
      await deleteProduct(id);
      onRefresh?.();
      load();
    } catch (error) {
      handleError(error);
    }
  };

  if (loading) return <Box py={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  if (!products || products.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">
          {merchantId ? "لا توجد منتجات بعد." : "يرجى تسجيل الدخول أولاً."}
        </Typography>
      </Paper>
    );
  }

  console.log('Rendering products table with', products?.length, 'products:', products);
  console.log('TableBody will render with products:', products);
  if (isSm) {
    return (
      <MobileProductsView
        products={products}
        onEdit={onEdit}
        onDelete={async (id) => {
          await handleDelete(id);
          onRefresh?.();
        }}
      />
    );
  }
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
          {Array.isArray(products) && products.map((p, index) => {
            console.log(`Rendering product ${index}:`, p);
            // Ensure we have valid data
            const price = typeof p.price === 'number' ? p.price : 0;
            const priceEffective = typeof p.priceEffective === 'number' ? p.priceEffective : price;
            const hasActiveOffer = Boolean(p.hasActiveOffer && p.offer?.enabled);
            
            const money = formatMoney(hasActiveOffer ? priceEffective : price, p.currency || 'SAR');
            const oldMoney = hasActiveOffer && p.offer?.oldPrice != null
              ? formatMoney(p.offer.oldPrice, p.currency || 'SAR')
              : null;

            const offerChip = hasActiveOffer ? (
              <Tooltip title="عرض نشط">
                <Chip icon={<LocalOfferIcon />} label="عرض" color="warning" size="small" sx={{ mr: 1 }} />
              </Tooltip>
            ) : null;

            return (
              <TableRow key={p._id} hover>
                <TableCell>
                  {p.images && p.images.length > 0 && p.images[0] ? (
                    <Avatar 
                      src={p.images[0]} 
                      variant="rounded" 
                      sx={{ width: 48, height: 48 }}
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.setAttribute('style', 'display: block');
                      }}
                    />
                  ) : null}
                  <Avatar 
                    variant="rounded" 
                    sx={{ 
                      width: 48, 
                      height: 48,
                      display: p.images && p.images.length > 0 && p.images[0] ? 'none' : 'flex'
                    }}
                  >
                    {(p.name && p.name.length > 0) ? p.name[0] : '?'}
                  </Avatar>
                </TableCell>

                <TableCell sx={{ maxWidth: 320 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography fontWeight={600} noWrap title={p.name || "منتج بدون اسم"}>
                      {p.name || "منتج بدون اسم"}
                    </Typography>
                    {offerChip}
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: { xs: "none", sm: "-webkit-box" }, WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    {p.description || "لا يوجد وصف"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {p.category ? toDisplayString(p.category) : "غير محدد"}
                </TableCell>

                <TableCell>
                  {hasActiveOffer && oldMoney ? (
                    <Stack spacing={0}>
                      <Typography sx={{ textDecoration: "line-through" }} color="text.secondary">{oldMoney}</Typography>
                      <Typography fontWeight={700}>{money}</Typography>
                    </Stack>
                  ) : (
                    <Typography>{money}</Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Chip 
                    label={p.isAvailable ? "متوفر" : "غير متوفر"} 
                    color={p.isAvailable ? "success" : "error"} 
                    size="small" 
                  />
                </TableCell>

                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  <Chip 
                    label={
                      p.source === "manual" ? "يدوي" : 
                      p.source === "api" ? "API" : 
                      p.source === "scraper" ? "رابط" :
                      p.source || "غير محدد"
                    } 
                    size="small" 
                  />
                </TableCell>

                <TableCell align="center">
                  <IconButton onClick={() => onEdit?.(p)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(p._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            );
          })}
          {(!Array.isArray(products) || products.length === 0) && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4, opacity: 0.7 }}>
                لا توجد منتجات لعرضها
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
