import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/shared/api/axios";
import { getSessionId } from "@/shared/utils/session";
import { getLocalCustomer } from "@/shared/utils/customer";
import { Box, Typography, Paper, Chip, Button, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import type { Order } from "@/features/store/type";

const STATUS_LABEL: Record<string,string> = {
  pending: "قيد الانتظار",
  paid: "مدفوع",
  canceled: "ملغي",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  refunded: "مسترد",
};

export default function MyOrdersPage() {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const nav = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [merchantId, setMerchantId] = useState<string>("");

  useEffect(() => {
    const sid = getSessionId();
    setLoading(true);
    // أولاً نحصل على merchantId من /storefront/:slug
    axiosInstance.get(`/storefront/${slugOrId}`)
      .then(res => {
        const mid = res.data.merchant._id;
        setMerchantId(mid);
        const phone = getLocalCustomer().phone;
        return axiosInstance.get(`/storefront/merchant/${mid}/my-orders`, { params: { sessionId: sid, phone } });
      })
      .then(res => setOrders(res.data.orders || []))
      .finally(() => setLoading(false));
  }, [slugOrId]);

  if (loading) return <Box sx={{ p:4, textAlign:"center" }}><CircularProgress/></Box>;

  return (
    <Box sx={{ maxWidth:"lg", mx:"auto", p:3 }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>طلباتي</Typography>
      {orders.length === 0 ? (
        <Paper sx={{ p:3, textAlign:"center" }}>
          <Typography>لا توجد طلبات مرتبطة بهذه الجلسة/الرقم.</Typography>
          <Button sx={{ mt:2 }} variant="contained" onClick={()=> nav(`/store/${slugOrId}`)}>تصفح المنتجات</Button>
        </Paper>
      ) : (
        <Paper sx={{ overflowX:"auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>رقم</TableCell>
                <TableCell>العميل</TableCell>
                <TableCell>الجوال</TableCell>
                <TableCell>الإجمالي</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell>تفاصيل</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(o => (
                <TableRow key={o._id}>
                  <TableCell>#{o._id.slice(0,8).toUpperCase()}</TableCell>
                  <TableCell>{o.customer?.name}</TableCell>
                  <TableCell>{o.customer?.phone}</TableCell>
                  <TableCell>
                    {o.products.reduce((s,p)=> s + p.price * p.quantity, 0).toFixed(2)} ر.س
                  </TableCell>
                  <TableCell><Chip label={STATUS_LABEL[o.status] || o.status} /></TableCell>
                  <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={()=> nav(`/store/${slugOrId}/order/${o._id}`)}>عرض</Button>
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
