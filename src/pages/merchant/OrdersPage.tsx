// src/pages/orders/OrdersPage.tsx
import  { useEffect, useMemo, useState } from "react";
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
  Card,
  CardContent,
  Pagination,
  FormControl,
  AppBar,
  Toolbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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

// Mobile Orders View Component
interface MobileOrdersViewProps {
  orders: Order[];
  onOpenDetails: (order: Order) => void;
  getStatusColor: (status: string) => "default" | "primary" | "success" | "info" | "warning" | "error";
  STATUS_LABEL: Record<string, string>;
}

function MobileOrdersView({ orders, onOpenDetails, getStatusColor, STATUS_LABEL }: MobileOrdersViewProps) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: "center", bgcolor: "#fff", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          لا توجد طلبات بعد
        </Typography>
        <Button variant="contained">
          إضافة أول طلب يدوي
        </Button>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {orders.map((order) => {
        const total = (order.products || []).reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );
        
        return (
          <Card key={order._id} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Stack spacing={2}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold">
                    #{order._id.substring(0, 8).toUpperCase()}
                  </Typography>
                  <Chip
                    label={STATUS_LABEL[order.status] || order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                {/* Customer Info */}
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>العميل:</strong> {order.customer?.name || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>الجوال:</strong> {order.customer?.phone || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>الإجمالي:</strong> {total.toFixed(2)} ر.س
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>التاريخ:</strong> {order.createdAt
                      ? format(new Date(order.createdAt), "yyyy/MM/dd HH:mm")
                      : "-"}
                  </Typography>
                </Stack>

                {/* Products Summary */}
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    المنتجات ({order.products?.length || 0}):
                  </Typography>
                  <Stack spacing={0.5}>
                    {order.products?.slice(0, 2).map((product, idx) => (
                      <Typography key={idx} variant="body2" color="text.secondary">
                        • {typeof product.product === "object" && product.product?.name ? product.product.name : product.name} 
                        ({product.quantity} × {product.price} ر.س)
                      </Typography>
                    ))}
                    {order.products && order.products.length > 2 && (
                      <Typography variant="body2" color="text.secondary">
                        + {order.products.length - 2} منتجات أخرى
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {/* Action Button */}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={() => onOpenDetails(order)}
                  fullWidth
                >
                  عرض التفاصيل
                </Button>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
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

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);

  // بارامترات الطلب
  const fetchParams = useMemo(
    () => ({
      phone: phoneFromQuery || undefined,
      status: undefined as string | undefined, // هذا للتحميل الأول من الـ query فقط
      page: 1,
      limit: pageSize,
    }),
    [phoneFromQuery, pageSize]
  );

  // الجلب الأولي (يحترم query ?phone=)
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/orders", { params: fetchParams })
      .then((res) => {
        // Handle both array and paginated response
        if (Array.isArray(res.data)) {
          setOrders(res.data);
          setTotalOrders(res.data.length);
        } else if (res.data.orders && Array.isArray(res.data.orders)) {
          setOrders(res.data.orders);
          setTotalOrders(res.data.total || res.data.orders.length);
        } else {
          setOrders([]);
          setTotalOrders(0);
        }
      })
      .catch(handleError)
      .finally(() => setLoading(false));
  }, [fetchParams, handleError]);

  // تطبيق الفلاتر اليدوي (زر تطبيق)
  const applyFilters = async () => {
    setLoading(true);
    setPage(1); // Reset to first page when applying filters
    try {
      const res = await axiosInstance.get("/orders", {
        params: {
          phone: phoneFilter || undefined,
          status: statusFilter || undefined,
          page: 1,
          limit: pageSize,
        },
      });
      // Handle both array and paginated response
      if (Array.isArray(res.data)) {
        setOrders(res.data);
        setTotalOrders(res.data.length);
      } else if (res.data.orders && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
        setTotalOrders(res.data.total || res.data.orders.length);
      } else {
        setOrders([]);
        setTotalOrders(0);
      }
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
  const getAddressText = (addr: unknown): string => {
    if (!addr) return "-";
    if (typeof addr === "string") return addr;
    if (typeof addr === "object") {
      const a = addr as {
        line1?: string; line2?: string; city?: string; state?: string;
        country?: string; postalCode?: string;
      };
      // اجمع المتوفر فقط وبفاصل عربي لطيف
      const parts = [a.line1, a.line2, a.city, a.state, a.postalCode, a.country]
        .filter(Boolean);
      return parts.length ? parts.join("، ") : "-";
    }
    return "-";
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

  // Handle page change
  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    setPage(newPage);
    try {
      const res = await axiosInstance.get("/orders", {
        params: {
          phone: phoneFilter || undefined,
          status: statusFilter || undefined,
          page: newPage,
          limit: pageSize,
        },
      });
      // Handle both array and paginated response
      if (Array.isArray(res.data)) {
        setOrders(res.data);
        setTotalOrders(res.data.length);
      } else if (res.data.orders && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
        setTotalOrders(res.data.total || res.data.orders.length);
      } else {
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalOrders / pageSize);

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

      {/* عرض الطلبات حسب حجم الشاشة */}
      {loading ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", bgcolor: "#fff", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <CircularProgress />
        </Paper>
      ) : isSm ? (
        <MobileOrdersView
          orders={orders}
          onOpenDetails={handleOpenDetails}
          getStatusColor={getStatusColor}
          STATUS_LABEL={STATUS_LABEL}
        />
      ) : (
        // الجدول كما هو عندك (لا تغيّره)
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
              {!Array.isArray(orders) || orders.length === 0 ? (
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
      )}

      {/* Pagination Controls */}
      {!loading && totalOrders > 0 && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "#fff",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Page Size Selector */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                عرض:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  displayEmpty
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">
                طلب في الصفحة
              </Typography>
            </Stack>

            {/* Pagination Info */}
            <Typography variant="body2" color="text.secondary">
              عرض {((page - 1) * pageSize) + 1} إلى {Math.min(page * pageSize, totalOrders)} من {totalOrders} طلب
            </Typography>

            {/* Pagination Component */}
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => handlePageChange(newPage)}
              color="primary"
              size={isSm ? "small" : "medium"}
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 1,
                },
              }}
            />
          </Stack>
        </Paper>
      )}

      {/* Dialog تفاصيل الطلب وتعديل الحالة */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isSm} 
        keepMounted
      >
        {isSm ? (
    // شريط علوي للموبايل
    <AppBar elevation={0} color="default" sx={{ position: "sticky", top: 0, borderBottom: "1px solid", borderColor: "divider" }}>
      <Toolbar>
        <IconButton edge="start" onClick={handleCloseDialog} aria-label="close">
          <CloseIcon />
        </IconButton>
        <Typography sx={{ ml: 1, flex: 1 }} variant="subtitle1" fontWeight={700}>
          تفاصيل الطلب
        </Typography>
        <LoadingButton
          size="small"
          variant="contained"
          loading={statusUpdating}
          disabled={!editStatus || !selectedOrder || editStatus === selectedOrder?.status}
          onClick={handleUpdateStatus}
        >
          حفظ
        </LoadingButton>
      </Toolbar>
    </AppBar>
  ) : (
        <DialogTitle sx={{ fontWeight: 800 }}>🧾 تفاصيل الطلب</DialogTitle>
      )}

<DialogContent dividers={!isSm} sx={{ p: isSm ? 2 : undefined }}>
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
    <b>العنوان:</b> {getAddressText(selectedOrder.customer.address)}
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
                <Typography variant="subtitle2" mb={1}>
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
        {!isSm && (
    <DialogActions>
      <Button onClick={handleCloseDialog}>إغلاق</Button>
    </DialogActions>
  )}
      </Dialog>
    </Box>
  );
}
