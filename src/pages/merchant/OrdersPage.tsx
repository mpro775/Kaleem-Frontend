import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  CircularProgress,
  Tooltip,
  Stack,
  TextField,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import axiosInstance from "@/shared/api/axios";
import { format } from "date-fns";
import type { Order } from "@/features/store/type";
import { useLocation } from "react-router-dom";
function useQuery() { return new URLSearchParams(useLocation().search); }
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [editStatus, setEditStatus] = useState<string | undefined>();
  const query = useQuery();
  const phoneFromQuery = query.get('phone') || '';
  const [phoneFilter, setPhoneFilter] = useState(phoneFromQuery);
  const [statusFilter, setStatusFilter] = useState('');
  // جلب الطلبات
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/orders", { params: { phone: phoneFromQuery || undefined } })
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, [phoneFromQuery]);

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !editStatus) return;
    setStatusUpdating(true);
    try {
      await axiosInstance.patch(`/orders/${selectedOrder._id}/status`, {
        status: editStatus,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id
            ? { ...o, status: editStatus as "pending" | "paid" | "canceled" }
            : o
        )
      );
      setSelectedOrder({
        ...selectedOrder,
        status: editStatus as "pending" | "paid" | "canceled",
      });
    } catch {
      // يمكنك إضافة تنبيه هنا
    }
    setStatusUpdating(false);
  };

  const STATUS_LABEL: Record<string,string> = {
    pending: 'قيد الانتظار',
    paid: 'مدفوع',
    canceled: 'ملغي',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    refunded: 'مسترد',
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "warning";
      case "paid": return "success";
      case "shipped": return "info";
      case "delivered": return "success";
      case "refunded": return "default";
      case "canceled": return "error";
      default: return "default";
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        جميع الطلبات
      </Typography>

      <Paper sx={{ overflow: "auto" }}>
        <Table>
        <Stack direction="row" spacing={2} mb={2} alignItems="center">
  <TextField size="small" label="بحث بالجوال" value={phoneFilter} onChange={(e)=>setPhoneFilter(e.target.value)} />
  <Select size="small" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
    <MenuItem value="">الكل</MenuItem>
    {Object.keys(STATUS_LABEL).map(s => <MenuItem key={s} value={s}>{STATUS_LABEL[s]}</MenuItem>)}
  </Select>
  <Button variant="outlined" onClick={()=>{
    setLoading(true);
    axiosInstance.get('/orders', { params: { phone: phoneFilter||undefined, status: statusFilter||undefined /*, from, to*/ }})
      .then(r=>setOrders(r.data))
      .finally(()=>setLoading(false));
  }}>تطبيق</Button>
</Stack>
          <TableHead>
            <TableRow>
              <TableCell>رقم الطلب</TableCell>
              <TableCell>العميل</TableCell>
              <TableCell>الجوال</TableCell>
              <TableCell>الإجمالي</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>تاريخ الطلب</TableCell>
              <TableCell>إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  لا توجد طلبات.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    {order._id.substring(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>{order.customer?.name}</TableCell>
                  <TableCell>{order.customer?.phone}</TableCell>
                  <TableCell>
                    {order.products
                      .reduce((sum, i) => sum + i.price * i.quantity, 0)
                      .toFixed(2)}{" "}
                    ر.س
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        order.status === "pending"
                          ? "قيد الانتظار"
                          : order.status === "paid"
                          ? "مدفوع"
                          : "ملغي"
                      }
                      color={getStatusColor(order.status)}
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), "yyyy/MM/dd HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="تفاصيل الطلب">
                      <IconButton onClick={() => handleOpenDetails(order)}>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog تفاصيل الطلب وتعديل الحالة */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>تفاصيل الطلب</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                رقم الطلب: {selectedOrder._id.substring(0, 8).toUpperCase()}
              </Typography>
              <Typography mb={1}>
                <b>العميل:</b> {selectedOrder.customer?.name} -{" "}
                {selectedOrder.customer?.phone}
              </Typography>
              <Typography mb={1}>
                <b>العنوان:</b> {selectedOrder.customer?.address}
              </Typography>
              <Typography mb={2}>
                <b>الحالة:</b>{" "}
                <Select
                  size="small"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  sx={{ minWidth: 120, mx: 1 }}
                >
          <MenuItem value="pending">قيد الانتظار</MenuItem>
<MenuItem value="paid">مدفوع</MenuItem>
<MenuItem value="shipped">تم الشحن</MenuItem>
<MenuItem value="delivered">تم التسليم</MenuItem>
<MenuItem value="refunded">مسترد</MenuItem>
<MenuItem value="canceled">ملغي</MenuItem>
                </Select>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  sx={{ mx: 1 }}
                  disabled={
                    editStatus === selectedOrder.status || statusUpdating
                  }
                  onClick={handleUpdateStatus}
                >
                  حفظ التعديل
                </Button>
                {statusUpdating && <CircularProgress size={20} />}
              </Typography>

              <Box>
                <Typography variant="h6" mb={2}>
                  المنتجات:
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>المنتج</TableCell>
                      <TableCell>السعر</TableCell>
                      <TableCell>الكمية</TableCell>
                      <TableCell>الإجمالي</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.products.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {typeof p.product === "object" && p.product?.name
                            ? p.product.name
                            : p.name}
                        </TableCell>
                        <TableCell>{p.price} ر.س</TableCell>
                        <TableCell>{p.quantity}</TableCell>
                        <TableCell>
                          {(p.price * p.quantity).toFixed(2)} ر.س
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
