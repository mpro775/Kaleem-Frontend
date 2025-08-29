import {
    Box, Paper, Stack, Typography, Chip, IconButton, Divider, Button
  } from "@mui/material";
  import InfoIcon from "@mui/icons-material/Info";
  import type { Order } from "@/features/store/type";
  import { format } from "date-fns";
  
  type Props = {
    orders: Order[];
    onOpenDetails: (o: Order) => void;
    getStatusColor: (s: string) =>
      "default" | "primary" | "success" | "info" | "warning" | "error";
    STATUS_LABEL: Record<string, string>;
  };
  
  export function MobileOrdersView({ orders, onOpenDetails, getStatusColor, STATUS_LABEL }: Props) {
    if (!orders?.length) {
      return (
        <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
          <Typography color="text.secondary">لا توجد طلبات بعد</Typography>
          <Button sx={{ mt: 1.5 }} variant="contained">إضافة أول طلب يدوي</Button>
        </Paper>
      );
    }
  
    return (
      <Stack spacing={1.5}>
        {orders.map((order) => {
          const total = (order.products || []).reduce(
            (sum, i) => sum + i.price * i.quantity, 0
          );
          return (
            <Paper
              key={order._id}
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
              }}
              onClick={() => onOpenDetails(order)}
            >
              <Stack spacing={1}>
                {/* الصف الأعلى */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2" fontWeight={700}>
                    #{order._id.substring(0, 8).toUpperCase()}
                  </Typography>
                  <Chip
                    size="small"
                    label={STATUS_LABEL[order.status] || order.status}
                    color={getStatusColor(order.status)}
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
  
                {/* بيانات العميل */}
                <Stack spacing={0.25}>
                  <Typography variant="body2">
                    👤 {order.customer?.name || "-"}
                  </Typography>
                  <Typography variant="body2">
                    📞 {order.customer?.phone || "-"}
                  </Typography>
                  {order.customer?.address ? (
                    <Typography variant="body2" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      📍 {typeof order.customer.address === "string"
                        ? order.customer.address
                        : (order.customer.address as any).line1 || "-"}
                    </Typography>
                  ) : null}
                </Stack>
  
                <Divider />
  
                {/* الإجمالي + التاريخ + إجراء سريع */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack spacing={0}>
                    <Typography variant="body2" fontWeight={700}>
                      الإجمالي: {total.toFixed(2)} ر.س
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.createdAt ? format(new Date(order.createdAt), "yyyy/MM/dd HH:mm") : "-"}
                    </Typography>
                  </Stack>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetails(order);
                    }}
                  >
                    <InfoIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  }
  