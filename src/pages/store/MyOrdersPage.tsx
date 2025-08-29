import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/shared/api/axios";
import { getSessionId } from "@/shared/utils/session";
import { getLocalCustomer } from "@/shared/utils/customer";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import type { Order } from "@/features/store/type";

// ⬅️ نحتاج لون المتجر الداكن
import { getStorefrontInfo } from "@/features/mechant/storefront-theme/api";
import { setBrandVars } from "@/features/shared/brandCss";

const STATUS_LABEL: Record<string, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوع",
  canceled: "ملغي",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  refunded: "مسترد",
};

export default function MyOrdersPage() {
  const { slug } = useParams<{ slug: string }>();
  const nav = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [merchantId, setMerchantId] = useState<string>("");
console.log('slug', merchantId)
  useEffect(() => {
    const sid = getSessionId();
    setLoading(true);
    axiosInstance
      .get(`/storefront/${slug}`)
      .then(async (res) => {
        const mid = res.data.merchant._id;
        setMerchantId(mid);

        // ⬅️ طبّق لون المتجر الداكن
        try {
          const sf = await getStorefrontInfo(mid);
          setBrandVars(sf.brandDark || "#111827");
        } catch {
          setBrandVars("#111827");
        }

        const phone = getLocalCustomer().phone;
        return axiosInstance.get(`/storefront/merchant/${mid}/my-orders`, {
          params: { sessionId: sid, phone },
        });
      })
      .then((res) => {
        // يدعم: { success: true, data: [...] } أو { orders: [...] } أو حتى [...] مباشرة
        const payload = res?.data;
        const list =
          Array.isArray(payload?.data) ? payload.data :
          Array.isArray(payload?.orders) ? payload.orders :
          (Array.isArray(payload) ? payload : []);
        setOrders(list);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return (
      <Box sx={{ p: 4, textAlign: "center", bgcolor: "#fff" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ maxWidth: "lg", mx: "auto", p: 3, bgcolor: "#fff" }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        طلباتي
      </Typography>

      {orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography>لا توجد طلبات مرتبطة بهذه الجلسة/الرقم.</Typography>
          <Button
            sx={{
              mt: 2,
              background: "var(--brand)",
              color: "var(--on-brand)",
              "&:hover": { background: "var(--brand-hover)" },
            }}
            variant="contained"
            onClick={() => nav(`/store/${slug}`)}
          >
            تصفح المنتجات
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: "var(--brand)" }}>
                {[
                  "رقم",
                  "العميل",
                  "الجوال",
                  "الإجمالي",
                  "الحالة",
                  "التاريخ",
                  "تفاصيل",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ color: "var(--on-brand)", fontWeight: "bold" }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o._id}>
                  <TableCell>#{o._id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>{o.customer?.name}</TableCell>
                  <TableCell>{o.customer?.phone}</TableCell>
                  <TableCell>
                    {o.products
                      .reduce((s, p) => s + p.price * p.quantity, 0)
                      .toFixed(2)}{" "}
                    ر.س
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABEL[o.status] || o.status}
                      sx={{
                        bgcolor: "var(--brand)",
                        color: "var(--on-brand)",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(o.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      sx={{
                        background: "var(--brand)",
                        color: "var(--on-brand)",
                        "&:hover": { background: "var(--brand-hover)" },
                      }}
                      variant="contained"
                      onClick={() => nav(`/store/${slug}/order/${o._id}`)}
                    >
                      عرض
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
