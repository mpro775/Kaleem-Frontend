// src/pages/orders/OrdersPage.tsx
import { useEffect, useMemo, useState } from "react";
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
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import axiosInstance from "@/shared/api/axios";
import { format } from "date-fns";
import type { Order } from "@/features/store/type";
import { useLocation } from "react-router-dom";
import { useErrorHandler } from "@/shared/errors";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const STATUS_LABEL: Record<string, string> = {
  pending: "قيد الانتظار",
  paid: "مدفوع",
  canceled: "ملغي",
};

function getStatusColor(
  status: string
): "default" | "primary" | "success" | "info" | "warning" | "error" {
  switch (status) {
    case "pending":
      return "warning";
    case "paid":
      return "primary";
    case "shipped":
      return "info";
    case "delivered":
      return "success";
    case "refunded":
      return "default";
    case "canceled":
      return "error";
    default:
      return "default";
  }
}

export default function OrdersPage() {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const { handleError } = useErrorHandler();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [editStatus, setEditStatus] = useState<string | undefined>();

  const query = useQuery();
  const phoneFromQuery = query.get("phone") || "";

  // فلاتر أعلى الجدول
  const [phoneFilter, setPhoneFilter] = useState(phoneFromQuery);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // بارامترات الطلب
  const fetchParams = useMemo(
    () => ({
      phone: phoneFromQuery || undefined,
      status: undefined as string | undefined, // هذا للتحميل الأول من الـ query فقط
    }),
    [phoneFromQuery]
  );

  // الجلب الأولي (يحترم query ?phone=)
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/orders", { params: fetchParams })
      .then((res) => {
        const ordersData = Array.isArray(res.data) ? res.data : [];
        setOrders(ordersData);
      })
      .catch(handleError)
      .finally(() => setLoading(false));
  }, [fetchParams, handleError]);

  // تطبيق الفلاتر اليدوي (زر تطبيق)
  const applyFilters = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/orders", {
        params: {
          phone: phoneFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

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
      // حدّث القائمة
      setOrders((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id
            ? {
                ...o,
                status: editStatus as "pending" | "paid" | "canceled",
              }
            : o
        )
      );
      // حدّث العنصر المختار في الحوار
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: editStatus as "pending" | "paid" | "canceled",
            }
          : prev
      );
    } catch (error) {
      handleError(error);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <Box
      dir="rtl"
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={2}>
        جميع الطلبات
      </Typography>

      {/* الفلاتر أعلى الجدول */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "#fff",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            fullWidth
            size="small"
            label="بحث بالجوال"
            placeholder="05xxxxxxxx"
            value={phoneFilter}
            onChange={(e) => setPhoneFilter(e.target.value)}
          />
          <Select
            fullWidth
            size="small"
            value={statusFilter}
            displayEmpty
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">
              <em>الكل</em>
            </MenuItem>
            {Object.keys(STATUS_LABEL).map((s) => (
              <MenuItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </MenuItem>
            ))}
          </Select>
          <Button
            onClick={applyFilters}
            variant="contained"
            sx={{ minWidth: 120 }}
          >
            تطبيق
          </Button>
        </Stack>
      </Paper>

      {/* الجدول */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflowX: "auto",
          bgcolor: "#fff",
        }}
      >
        <Table size="small">
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
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : !Array.isArray(orders) || orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    لا توجد طلبات بعد
                  </Typography>
                  <Button sx={{ mt: 2 }} variant="contained">
                    إضافة أول طلب يدوي
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const total = (order.products || []).reduce(
                  (sum, i) => sum + i.price * i.quantity,
                  0
                );
                return (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      {order._id.substring(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>{order.customer?.name || "-"}</TableCell>
                    <TableCell>{order.customer?.phone || "-"}</TableCell>
                    <TableCell>{total.toFixed(2)} ر.س</TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABEL[order.status] || order.status}
                        color={getStatusColor(order.status)}
                        variant="outlined"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell>
                      {order.createdAt
                        ? format(new Date(order.createdAt), "yyyy/MM/dd HH:mm")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="تفاصيل الطلب">
                        <span>
                          <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOpenDetails(order);
                            }}
                            disableRipple
                          >
                            <InfoIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
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
        keepMounted
      >
        <DialogTitle sx={{ fontWeight: 800 }}>🧾 تفاصيل الطلب</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Stack spacing={2}>
              <Stack
                direction={isSm ? "column" : "row"}
                spacing={isSm ? 1 : 3}
                alignItems={isSm ? "flex-start" : "center"}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  رقم الطلب: {selectedOrder._id.substring(0, 8).toUpperCase()}
                </Typography>
                <Chip
                  label={
                    STATUS_LABEL[selectedOrder.status] || selectedOrder.status
                  }
                  color={getStatusColor(selectedOrder.status)}
                  size="small"
                />
              </Stack>

              <Divider />

              <Stack spacing={0.5}>
                <Typography>
                  <b>العميل:</b> {selectedOrder.customer?.name || "-"}
                </Typography>
                <Typography>
                  <b>الجوال:</b> {selectedOrder.customer?.phone || "-"}
                </Typography>
                {selectedOrder.customer?.address ? (
                  <Typography>
                    <b>العنوان:</b> {selectedOrder.customer.address}
                  </Typography>
                ) : null}
              </Stack>

              <Stack
                direction={isSm ? "column" : "row"}
                spacing={1}
                alignItems={isSm ? "flex-start" : "center"}
              >
                <Typography sx={{ fontWeight: 700 }}>تحديث الحالة:</Typography>
                <Select
                  size="small"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  {Object.keys(STATUS_LABEL).map((s) => (
                    <MenuItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </MenuItem>
                  ))}
                </Select>
                <LoadingButton
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  sx={{ mx: 0.5 }}
                  loading={statusUpdating}
                  disabled={!editStatus || editStatus === selectedOrder.status}
                  onClick={handleUpdateStatus}
                >
                  حفظ التعديل
                </LoadingButton>
              </Stack>

              <Divider />

              <Box>
                <Typography variant="h6" mb={1}>
                  المنتجات
                </Typography>
                <Paper variant="outlined" sx={{ overflowX: "auto" }}>
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
                      {selectedOrder.products.map((p, idx) => {
                        const name =
                          typeof p.product === "object" && p.product?.name
                            ? p.product.name
                            : p.name;
                        const line = p.price * p.quantity;
                        return (
                          <TableRow key={idx}>
                            <TableCell>{name}</TableCell>
                            <TableCell>{p.price} ر.س</TableCell>
                            <TableCell>{p.quantity}</TableCell>
                            <TableCell>{line.toFixed(2)} ر.س</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
