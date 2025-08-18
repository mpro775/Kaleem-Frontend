// src/pages/OrderDetailsPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  useTheme,
  Avatar,
  Skeleton,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  LocalShipping,
  Assignment,
  Payment,
  Storefront,
  Person,
  Phone,
  LocationOn,
  Receipt,
} from "@mui/icons-material";
import type { Order, OrderProduct } from "../../types/store";
import type { MerchantInfo } from "../../types/merchant";

export default function OrderDetailsPage() {
  const theme = useTheme();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/orders/${orderId}`)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);
  useEffect(() => {
    if (order?.merchantId) {
      axiosInstance
        .get(`/merchants/${order.merchantId}`)
        .then((res) => setMerchant(res.data));
    }
  }, [order?.merchantId]);
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "shipped":
        return "info";
      case "cancelled":
        return "error";
      default:
        return "primary";
    }
  };

  const translateStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "مكتمل";
      case "pending":
        return "قيد الانتظار";
      case "shipped":
        return "تم الشحن";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  if (loading) return <OrderDetailsSkeleton />;

  if (!order)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
          textAlign: "center",
        }}
      >
        <Typography variant="h5" color="error">
          تعذر تحميل تفاصيل الطلب
        </Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          العودة
        </Button>
      </Box>
    );

  const totalAmount = order.products.reduce(
    (sum: number, i: OrderProduct) => sum + i.price * i.quantity,
    0
  );

  return (
    <Box
      sx={{
        maxWidth: "md",
        mx: "auto",
        py: 4,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          <ArrowBack sx={{ mr: 1 }} />
          العودة
        </IconButton>
      </Box>

      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          mb: 4,
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            p: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            الطلب #{order._id.substring(0, 8).toUpperCase()}
          </Typography>

          <Chip
            label={translateStatus(order.status)}
            color={getStatusColor(order.status)}
            sx={{
              color: "white",
              fontWeight: "bold",
              fontSize: 16,
              px: 2,
              py: 1,
              mt: { xs: 2, sm: 0 },
            }}
          />
        </Box>

        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              mb: 4,
            }}
          >
            {/* معلومات العميل */}
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Person sx={{ mr: 1, color: theme.palette.primary.main }} />
                معلومات العميل
              </Typography>

              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="الاسم"
                    secondary={order.customer.name}
                    secondaryTypographyProps={{ sx: { fontWeight: "bold" } }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Phone color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="رقم الجوال"
                    secondary={order.customer.phone}
                    secondaryTypographyProps={{ sx: { fontWeight: "bold" } }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LocationOn color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="العنوان"
                    secondary={order.customer.address}
                    secondaryTypographyProps={{ sx: { fontWeight: "bold" } }}
                  />
                </ListItem>
              </List>
            </Box>

            {/* معلومات الطلب */}
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Assignment sx={{ mr: 1, color: theme.palette.primary.main }} />
                معلومات الطلب
              </Typography>

              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Receipt color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="رقم الطلب"
                    secondary={`#${order._id.substring(0, 8).toUpperCase()}`}
                    secondaryTypographyProps={{ sx: { fontWeight: "bold" } }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Storefront color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="المتجر"
                    secondary={merchant?.name || "متجرنا"}
                    onClick={() =>
                      navigate(
                        `/store/${
                          merchant?.slug || merchant?._id || order.merchantId
                        }`
                      )
                    }
                    secondaryTypographyProps={{ sx: { fontWeight: "bold" } }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Payment color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="طريقة الدفع"
                    secondary="الدفع عند الاستلام"
                    secondaryTypographyProps={{ sx: { fontWeight: "bold" } }}
                  />
                </ListItem>
              </List>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* تفاصيل الطلب */}
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
            }}
          >
            <LocalShipping sx={{ mr: 1, color: theme.palette.primary.main }} />
            تفاصيل الطلب
          </Typography>

          <List
            sx={{
              backgroundColor: theme.palette.grey[50],
              borderRadius: 3,
              p: 2,
              mb: 3,
            }}
          >
            {order.products.map((item: OrderProduct, idx: number) => (
              <ListItem
                key={idx}
                sx={{
                  py: 2,
                  borderBottom:
                    idx < order.products.length - 1
                      ? `1px solid ${theme.palette.divider}`
                      : "none",
                }}
              >
                <Avatar
                  src={item.image}
                  variant="rounded"
                  sx={{
                    width: 60,
                    height: 60,
                    mr: 2,
                    backgroundColor: theme.palette.grey[200],
                  }}
                >
                  <Storefront />
                </Avatar>

                <ListItemText
                  primary={
                    <Typography fontWeight="bold">{item.name}</Typography>
                  }
                  secondary={
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {item.quantity} × {item.price.toFixed(2)} ر.س
                      </Typography>
                      <Typography fontWeight="bold">
                        {(item.price * item.quantity).toFixed(2)} ر.س
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>

          {/* ملخص الطلب */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: theme.palette.grey[50],
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              ملخص الطلب
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography>المجموع الفرعي:</Typography>
                <Typography>{totalAmount.toFixed(2)} ر.س</Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography>رسوم الشحن:</Typography>
                <Typography>0.00 ر.س</Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography>الخصم:</Typography>
                <Typography>0.00 ر.س</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  الإجمالي النهائي:
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {totalAmount.toFixed(2)} ر.س
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* حالة الطلب */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              حالة الطلب
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                position: "relative",
                "&:before": {
                  content: '""',
                  position: "absolute",
                  top: 20,
                  left: { xs: 20, sm: "10%" },
                  right: { xs: 20, sm: "10%" },
                  height: 4,
                  backgroundColor: theme.palette.grey[300],
                  zIndex: 0,
                },
              }}
            >
              {[
                {
                  status: "تم الطلب",
                  date: "١٠ مارس ٢٠٢٣",
                  time: "١٠:٣٠ ص",
                  active: true,
                },
                {
                  status: "قيد التجهيز",
                  date: "١٠ مارس ٢٠٢٣",
                  time: "١١:٤٥ ص",
                  active: order.status !== "pending",
                },
            
                {
                  status: "تم التوصيل",
                  date: "١٢ مارس ٢٠٢٣",
                  time: "٠٢:٣٠ م",
                  active: order.status === "paid",
                },
              ].map((step, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: { xs: 4, sm: 0 },
                    position: "relative",
                    zIndex: 1,
                    width: { sm: "25%" },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      mb: 1,
                      backgroundColor: step.active
                        ? theme.palette.primary.main
                        : theme.palette.grey[300],
                      color: "white",
                    }}
                  >
                    {step.active ? <CheckCircle /> : index + 1}
                  </Avatar>

                  <Typography fontWeight="bold" sx={{ mb: 0.5 }}>
                    {step.status}
                  </Typography>

                  {step.active && (
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        {step.date}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {step.time}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 5,
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: "bold",
              }}
              onClick={() => navigate(`/store/${merchant?.slug || ""}`)}
            >
              متابعة التسوق
            </Button>

            <Button
              variant="outlined"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: "bold",
              }}
              onClick={() => window.print()}
            >
              طباعة الفاتورة
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

const OrderDetailsSkeleton = () => (
  <Box
    sx={{
      maxWidth: "md",
      mx: "auto",
      py: 4,
      px: { xs: 2, sm: 3 },
    }}
  >
    <Skeleton variant="rectangular" width={100} height={40} sx={{ mb: 3 }} />

    <Paper sx={{ borderRadius: 3, overflow: "hidden", mb: 4 }}>
      <Skeleton variant="rectangular" height={80} />

      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            mb: 4,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{ borderRadius: 2 }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{ borderRadius: 2 }}
            />
          </Box>
        </Box>

        <Skeleton variant="rectangular" height={2} sx={{ mb: 3 }} />

        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 3 }} />

        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.grey[50],
            borderRadius: 3,
            p: 2,
            mb: 3,
          }}
        >
          {[...Array(3)].map((_, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                py: 2,
                borderBottom: i < 2 ? "1px solid #eee" : "none",
              }}
            >
              <Skeleton
                variant="circular"
                width={60}
                height={60}
                sx={{ mr: 2 }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" height={25} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
            </Box>
          ))}
        </Box>

        <Skeleton
          variant="rectangular"
          height={180}
          sx={{ borderRadius: 3, mb: 4 }}
        />

        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 3 }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            mb: 5,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: { xs: 4, sm: 0 },
                width: { sm: "25%" },
              }}
            >
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                sx={{ mb: 1 }}
              />
              <Skeleton
                variant="text"
                width={80}
                height={25}
                sx={{ mb: 0.5 }}
              />
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={80} height={20} />
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Skeleton
            variant="rectangular"
            width={150}
            height={45}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width={150}
            height={45}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      </Box>
    </Paper>
  </Box>
);
