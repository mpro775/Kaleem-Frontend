// src/pages/AboutPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/shared/api/axios";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  Skeleton,
  useTheme,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Phone,
  LocationOn,
  Schedule,
  Description,
  Policy,
  ArrowBack,
  Storefront as StorefrontIcon,
  Public,
  LocalShipping,
  Autorenew,
  Star,
  Email,
} from "@mui/icons-material";
import type {
  MerchantInfo,
  WorkingHour,
} from "@/features/mechant/merchant-settings/types";

import { getStorefrontInfo } from "@/features/mechant/storefront-theme/api";
import { setBrandVars } from "@/features/shared/brandCss";

const unwrap = (x: any) => x?.data?.data ?? x?.data ?? x;

export default function AboutPage() {
  const theme = useTheme();
  // 👇 التقط أكثر من اسم بارام لتفادي mismatch
  const params = useParams();
  const slug =
    (params.slug as string) ||
    (params.slugOrId as string) ||
    (params.id as string) ||
    "";
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        if (!slug) {
          throw new Error("لا يوجد سلاج في المسار.");
        }

        // /storefront/:slugOrId يُرجع { merchant, products, categories }
        const res = await axiosInstance.get(`/storefront/${slug}`);
        const data = unwrap(res);

        const m =
          data?.merchant ||
          data?.data?.merchant || // تحسباً لأي تغليف
          null;

        if (!m?._id) {
          throw new Error("تعذر استخراج بيانات التاجر من الاستجابة.");
        }

        if (!mounted) return;

        setMerchant(m);

        // 👇 طبّق اللون الداكن
        try {
          const sf = await getStorefrontInfo(m._id);
          setBrandVars((sf as any)?.brandDark || "#111827");
        } catch {
          setBrandVars("#111827");
        }
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "تعذر تحميل معلومات المتجر");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) return <LoadingSkeleton />;

  if (err || !merchant)
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
          {err || "تعذر تحميل معلومات المتجر"}
        </Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        maxWidth: "lg",
        mx: "auto",
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
        bgcolor: "#fff",
      }}
    >
      <Box sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          <ArrowBack sx={{ mr: 1 }} />
          العودة
        </IconButton>

        {/* Hero */}
        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            background:
              "linear-gradient(135deg, var(--brand-hover) 0%, var(--brand) 100%)",
            color: "var(--on-brand)",
            p: { xs: 3, md: 5 },
            mb: 4,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top right, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%)",
            }}
          />

          <Box sx={{ position: "relative", zIndex: 2, textAlign: "center" }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              {merchant.logoUrl ? (
                <Avatar
                  src={merchant.logoUrl}
                  alt={merchant.name}
                  sx={{
                    width: 120,
                    height: 120,
                    border: "4px solid rgba(255,255,255,0.3)",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: "var(--on-brand)",
                    color: "var(--brand)",
                  }}
                >
                  <StorefrontIcon sx={{ fontSize: 60 }} />
                </Avatar>
              )}
            </Box>

            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                mb: 2,
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                fontSize: { xs: "2rem", md: "2.5rem" },
              }}
            >
              {merchant.name}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                opacity: 0.95,
                maxWidth: 800,
                mx: "auto",
                fontSize: { xs: "1rem", md: "1.25rem" },
              }}
            >
              {merchant.businessDescription ||
                "متجرك الإلكتروني الموثوق لتجربة تسوق استثنائية"}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* معلومات التواصل وساعات العمل */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          mb: 4,
        }}
      >
        {/* معلومات التواصل */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "bold",
                  color: "var(--brand)",
                }}
              >
                <Phone sx={{ mr: 1 }} />
                معلومات التواصل
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Phone sx={{ color: "var(--brand)" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="رقم الهاتف"
                    secondary={merchant.phone || "غير متوفر"}
                    secondaryTypographyProps={{ sx: { fontWeight: "bold" } }}
                  />
                </ListItem>

                {merchant.addresses && merchant.addresses.length > 0 && (
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LocationOn sx={{ color: "var(--brand)" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="العنوان"
                      secondary={
                        <Typography sx={{ mb: 0.5 }}>
                          {merchant.addresses[0].street},{" "}
                          {merchant.addresses[0].city},{" "}
                          {merchant.addresses[0].state}
                        </Typography>
                      }
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Email sx={{ color: "var(--brand)" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="البريد الإلكتروني"
                    secondary={"غير متوفر"}
                    secondaryTypographyProps={{ sx: { fontWeight: "bold" } }}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Public sx={{ color: "var(--brand)" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="الموقع الإلكتروني"
                    secondary={(merchant as any).storefrontUrl || "www.example.com"}
                    secondaryTypographyProps={{ sx: { fontWeight: "bold" } }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* ساعات العمل */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "bold",
                  color: "var(--brand)",
                }}
              >
                <Schedule sx={{ mr: 1 }} />
                ساعات العمل
              </Typography>

              {(merchant.workingHours || []).length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {merchant.workingHours.map((h: WorkingHour, idx: number) => (
                    <Box
                      key={idx}
                      sx={{
                        width: { xs: "100%", sm: "calc(50% - 8px)" },
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 2,
                          backgroundColor: theme.palette.grey[100],
                          borderRadius: 2,
                        }}
                      >
                        <Typography fontWeight="bold">{h.day}:</Typography>
                        <Chip
                          label={`${h.openTime} - ${h.closeTime}`}
                          size="small"
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "var(--brand)",
                            color: "var(--on-brand)",
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={3}>
                  لم يتم تحديد ساعات العمل
                </Typography>
              )}

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: theme.palette.warning.light,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Star sx={{ color: theme.palette.warning.dark, mr: 1 }} />
                <Typography>المتجر مغلق أيام العطل الرسمية</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* سياسات المتجر */}
      <Box sx={{ mb: 4 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
                color: "var(--brand)",
              }}
            >
              <Policy sx={{ mr: 1 }} />
              سياسات المتجر
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
              }}
            >
              {/* سياسة الاستبدال */}
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: theme.palette.grey[50],
                  borderRadius: 3,
                  p: 3,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    color: "var(--brand)",
                  }}
                >
                  <Autorenew sx={{ mr: 1, fontSize: 30 }} />
                  <Typography variant="h6" fontWeight="bold">
                    سياسة الاستبدال
                  </Typography>
                </Box>
                <Typography>
                  {merchant.exchangePolicy ||
                    "يمكنك استبدال المنتجات خلال 7 أيام من تاريخ الشراء بشرط أن يكون المنتج في حالته الأصلية مع الاحتفاظ بالفاتورة."}
                </Typography>
              </Box>

              {/* سياسة الشحن */}
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: theme.palette.grey[50],
                  borderRadius: 3,
                  p: 3,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    color: "var(--brand)",
                  }}
                >
                  <LocalShipping sx={{ mr: 1, fontSize: 30 }} />
                  <Typography variant="h6" fontWeight="bold">
                    سياسة الشحن
                  </Typography>
                </Box>
                <Typography>
                  {merchant.shippingPolicy ||
                    "نقدم خدمة الشحن لجميع أنحاء المملكة خلال 2-5 أيام عمل. الشحن مجاني للطلبات فوق 200 ر.س."}
                </Typography>
              </Box>

              {/* سياسة الاسترجاع */}
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: theme.palette.grey[50],
                  borderRadius: 3,
                  p: 3,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    color: "var(--brand)",
                  }}
                >
                  <Description sx={{ mr: 1, fontSize: 30 }} />
                  <Typography variant="h6" fontWeight="bold">
                    سياسة الاسترجاع
                  </Typography>
                </Box>
                <Typography>
                  {merchant.returnPolicy ||
                    "يمكنك إرجاع المنتجات خلال 14 يومًا من تاريخ الشراء بشرط أن يكون المنتج في حالته الأصلية مع الاحتفاظ بالفاتورة."}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            px: 6,
            py: 1.5,
            borderRadius: 2,
            fontWeight: "bold",
            fontSize: 18,
            background: "var(--brand)",
            color: "var(--on-brand)",
            "&:hover": { background: "var(--brand-hover)" },
          }}
          onClick={() => navigate(`/store/${slug}`)}
        >
          تصفح منتجاتنا
        </Button>
      </Box>
    </Box>
  );
}

const LoadingSkeleton = () => (
  <Box sx={{ maxWidth: "lg", mx: "auto", py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
    <Box sx={{ mb: 3 }}>
      <Skeleton
        variant="rectangular"
        width={100}
        height={40}
        sx={{ mb: 2, borderRadius: 1 }}
      />
      <Skeleton
        variant="rectangular"
        height={250}
        sx={{ borderRadius: 3, mb: 4 }}
      />
    </Box>

    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 4,
        mb: 4,
      }}
    >
      <Skeleton
        variant="rectangular"
        height={300}
        sx={{ flex: 1, borderRadius: 3 }}
      />
      <Skeleton
        variant="rectangular"
        height={300}
        sx={{ flex: 1, borderRadius: 3 }}
      />
    </Box>

    <Skeleton
      variant="rectangular"
      height={200}
      sx={{ borderRadius: 3, mb: 4 }}
    />

    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
      {[...Array(4)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={200}
          sx={{
            width: {
              xs: "100%",
              sm: "calc(50% - 12px)",
              md: "calc(25% - 12px)",
            },
            borderRadius: 3,
          }}
        />
      ))}
    </Box>

    <Box sx={{ mt: 4, textAlign: "center" }}>
      <Skeleton
        variant="rectangular"
        width={200}
        height={50}
        sx={{ borderRadius: 2, mx: "auto" }}
      />
    </Box>
  </Box>
);
