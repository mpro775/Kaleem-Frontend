// src/pages/ProductDetailsPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/shared/api/axios";
import {
  Box,
  Button,
  Typography,
  Skeleton,
  useTheme,
  IconButton,
  Chip,
  Divider,
  Paper,
  Tabs,
  Tab,
  Rating,
  TextField,
  Avatar,
} from "@mui/material";
import {
  ShoppingCart,
  FavoriteBorder,
  Share,
  ArrowBack,
  Star,
  StarHalf,
  StarBorder,
  LocalShipping,
  Autorenew,
  Description,
} from "@mui/icons-material";
import type { ProductResponse } from "@/features/mechant/products/type";
import { useCart } from "@/context/CartContext";

// ⬅️ سحب لون المتجر الداكن وتطبيق المتغيّرات
import { getStorefrontInfo } from "@/features/mechant/storefront-theme/api";
import { setBrandVars } from "@/features/shared/brandCss";

type Currency = "SAR" | "YER" | "USD";

const CURRENCY_INFO: Record<Currency, { symbol: string; locale: string }> = {
  SAR: { symbol: "ر.س", locale: "ar-SA" },
  YER: { symbol: "﷼", locale: "ar-SA" },
  USD: { symbol: "$", locale: "en-US" },
};

function formatMoney(value: number, currency: Currency = "SAR") {
  const c = CURRENCY_INFO[currency] ?? CURRENCY_INFO.SAR;
  return `${value.toLocaleString(c.locale)} ${c.symbol}`;
}

function isOfferActive(offer?: {
  enabled?: boolean;
  newPrice?: number;
  oldPrice?: number;
  startAt?: string | Date;
  endAt?: string | Date;
}) {
  if (!offer?.enabled) return false;
  const now = Date.now();
  const start = offer.startAt ? new Date(offer.startAt).getTime() : -Infinity;
  const end = offer.endAt ? new Date(offer.endAt).getTime() : +Infinity;
  return (
    now >= start &&
    now <= end &&
    typeof offer.newPrice === "number" &&
    offer.newPrice > 0
  );
}

function discountPct(oldP?: number, newP?: number) {
  if (!oldP || !newP || newP >= oldP) return 0;
  return Math.round((1 - newP / oldP) * 100);
}

function renderCategoryTrail(product: any): string | null {
  const c = (product as any)?.category;
  if (!c) return null;
  if (typeof c === "object") {
    if (Array.isArray((c as any).trail) && (c as any).trail.length) {
      return (c as any).trail.join(" › ");
    }
    const childName = (c as any).name;
    const parentName =
      (c as any).parentName ||
      (c as any).parent?.name ||
      (Array.isArray((c as any).ancestors) &&
        (c as any).ancestorsNames?.at?.(-1));
    if (childName)
      return parentName ? `${childName} — ${parentName}` : childName;
    return null;
  }
  return null;
}

export default function ProductDetailsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { productId, slug } = useParams<{
    productId: string;
    slug: string;
  }>();
  const unwrap = (x: any) => x?.data?.data ?? x?.data ?? x;

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const { addItem } = useCart();
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
    {}
  );

  const trail = renderCategoryTrail(product);

  // ⬅️ طبّق لون المتجر الداكن حتى لو دخل مباشرة على صفحة المنتج
useEffect(() => {
  if (!slug) return;
  axiosInstance
    .get(`/storefront/${slug}`)
    .then(async (res) => {
      try {
        const merchantId =
          res?.data?.merchant?._id ||
          res?.data?.merchant?._id ||
          res?.data?.data?.merchant?._id;
        if (merchantId) {
          const sf = await getStorefrontInfo(merchantId as string);
          setBrandVars((sf as any)?.brandDark || "#111827");
        } else {
          setBrandVars("#111827");
        }
      } catch {
        setBrandVars("#111827");
      }
    })
    .catch(() => setBrandVars("#111827"));
}, [slug]);

// ⬅️ جلب المنتج (مع فكّ التغليف + معالجة الأخطاء)
useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/products/${productId}`);
      const prod = unwrap(res) as ProductResponse | null;

      if (!mounted) return;

      if (!prod || !prod._id) {
        // المنتج غير موجود
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct(prod);

      // ضبط السمات المختارة افتراضياً
      const init: Record<string, string> = {};
      const attrs = (prod as any).attributes as
        | Record<string, string[]>
        | undefined;

      if (attrs) {
        Object.entries(attrs).forEach(([k, vals]) => {
          if (Array.isArray(vals) && vals[0]) init[k] = String(vals[0]);
        });
      }
      setSelectedAttrs(init);
      setLoading(false);
    } catch (e) {
      if (!mounted) return;
      setProduct(null);
      setLoading(false);
    }
  })();
  return () => {
    mounted = false;
  };
}, [productId]);

  if (!product) return loading ? <ProductDetailsSkeleton /> : null;

  const offerOld = product.offer?.oldPrice ?? product.price;
  const offerNew = product.offer?.newPrice ?? product.price;
  const pct = discountPct(offerOld, offerNew);

  const handleAddToCart = () => {
    if (product)
      addItem(
        { ...product, selectedAttributes: selectedAttrs } as any,
        quantity
      );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++)
      stars.push(
        <Star key={`full-${i}`} sx={{ color: theme.palette.warning.main }} />
      );
    if (hasHalfStar)
      stars.push(
        <StarHalf key="half" sx={{ color: theme.palette.warning.main }} />
      );
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++)
      stars.push(
        <StarBorder
          key={`empty-${i}`}
          sx={{ color: theme.palette.grey[400] }}
        />
      );
    return stars;
  };

  if (loading) return <ProductDetailsSkeleton />;

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
      </Box>

      {trail && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {trail}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          mb: 6,
        }}
      >
        {/* معرض الصور */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          {/* الصور المصغرة */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              order: { xs: 2, md: 1 },
              gap: 1,
              maxWidth: { md: 80 },
              overflowX: "auto",
              py: 1,
            }}
          >
            {product.images?.map((img, index) => {
              const selected = selectedImage === index;
              return (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: selected
                      ? "2px solid var(--brand)"
                      : `1px solid ${theme.palette.divider}`,
                    opacity: selected ? 1 : 0.7,
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              );
            })}
          </Box>

          {/* الصورة الرئيسية */}
          <Box
            sx={{
              flex: 1,
              order: { xs: 1, md: 2 },
              borderRadius: 3,
              overflow: "hidden",
              position: "relative",
              height: { xs: 300, md: 450 },
              backgroundColor: theme.palette.grey[100],
            }}
          >
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: 20,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.palette.grey[200],
                }}
              >
                <Typography color="text.secondary">لا توجد صورة</Typography>
              </Box>
            )}

            {/* شارات المنتج */}
            <Box sx={{ position: "absolute", top: 16, left: 16 }}>
              {product.status === "out_of_stock" && (
                <Chip
                  label="منتهي"
                  color="error"
                  sx={{ fontWeight: "bold", mr: 1 }}
                />
              )}
              {product.lowQuantity && product.lowQuantity < 10 && (
                <Chip
                  label="ينفد سريعاً"
                  color="warning"
                  sx={{ fontWeight: "bold" }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* تفاصيل المنتج */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{ mb: 2, fontSize: { xs: "1.8rem", md: "2.2rem" } }}
          >
            {product.name}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Rating
              value={4.5}
              precision={0.5}
              readOnly
              sx={{ color: theme.palette.warning.main }}
            />
            <Typography
              variant="body2"
              sx={{ ml: 1, color: theme.palette.text.secondary }}
            >
              (4.5 من ١٢٠ تقييم)
            </Typography>
          </Box>

          {isOfferActive(product.offer) ? (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="error.main"
                sx={{ display: "inline", mr: 1 }}
              >
                {formatMoney(offerNew, (product as any).currency || "SAR")}
              </Typography>
              <Typography
                component="span"
                sx={{
                  textDecoration: "line-through",
                  color: "text.disabled",
                  mr: 1,
                }}
              >
                {formatMoney(offerOld, (product as any).currency || "SAR")}
              </Typography>
              {pct > 0 && (
                <Chip
                  label={`-${pct}%`}
                  color="error"
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
              )}
            </Box>
          ) : (
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ mb: 3, color: "var(--brand)" }}
            >
              {formatMoney(
                product.price ?? 0,
                (product as any).currency || "SAR"
              )}
            </Typography>
          )}

          <Typography
            sx={{ mb: 4, color: theme.palette.text.secondary, lineHeight: 1.8 }}
          >
            {product.description || "لا يوجد وصف متوفر لهذا المنتج."}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* سمات المنتج */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <Box sx={{ mb: 3 }}>
              {Object.entries(product.attributes).map(([key, values]) => (
                <Box key={key} sx={{ mb: 2 }}>
                  <Typography fontWeight="bold" sx={{ mb: 1 }}>
                    {key}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {(values as string[]).map((val) => {
                      const selected = selectedAttrs[key] === val;
                      return (
                        <Chip
                          key={val}
                          label={val}
                          clickable
                          onClick={() =>
                            setSelectedAttrs((s) => ({ ...s, [key]: val }))
                          }
                          variant={selected ? "filled" : "outlined"}
                          sx={{
                            ...(selected
                              ? {
                                  bgcolor: "var(--brand)",
                                  color: "var(--on-brand)",
                                  borderColor: "transparent",
                                }
                              : {}),
                            fontWeight: "bold",
                          }}
                          data-testid="attribute-chip"
                        />
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          <Divider sx={{ mb: 3 }} />

          {/* الكمية */}
          <Box sx={{ mb: 4 }}>
            <Typography fontWeight="bold" sx={{ mb: 2 }}>
              الكمية
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                data-testid="quantity-minus"
              >
                -
              </IconButton>
              <TextField
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0) setQuantity(value);
                }}
                inputProps={{ min: 1, max: product.quantity || 999 }}
                sx={{ width: 80, textAlign: "center" }}
                data-testid="quantity-input"
              />
              <IconButton
                onClick={() =>
                  setQuantity(Math.min(product.quantity || 999, quantity + 1))
                }
                disabled={quantity >= (product.quantity || 999)}
                data-testid="quantity-plus"
              >
                +
              </IconButton>
            </Box>
          </Box>

          {/* أزرار الإجراءات */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={product.status !== "active"}
              sx={{
                flex: 1,
                minWidth: 200,
                py: 1.5,
                borderRadius: 2,
                fontWeight: "bold",
                background: "var(--brand)",
                color: "var(--on-brand)",
                "&:hover": { background: "var(--brand-hover)" },
              }}
            >
              أضف إلى السلة
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<FavoriteBorder />}
              sx={{ borderRadius: 2, fontWeight: "bold", background: "var(--brand)", color: "var(--on-brand)" }}
            >
              المفضلة
            </Button>

            <IconButton
              size="large"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Share />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* معلومات الشحن */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 3,
              p: 2,
              backgroundColor: theme.palette.grey[50],
              borderRadius: 2,
            }}
          >
            <LocalShipping sx={{ color: "var(--brand)", fontSize: 40 }} />
            <Box>
              <Typography fontWeight="bold" sx={{ mb: 0.5 }}>
                الشحن والتوصيل
              </Typography>
              <Typography variant="body2">
                توصيل سريع خلال 2-5 أيام عمل | شحن مجاني للطلبات فوق 200 ر.س
              </Typography>
            </Box>
          </Box>

          {/* سياسات المتجر */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
            <Chip
              icon={<Autorenew fontSize="small" />}
              label="استبدال خلال 7 أيام"
              variant="outlined"
              sx={{ fontWeight: "bold" }}
            />
            <Chip
              icon={<Description fontSize="small" />}
              label="إرجاع خلال 14 يوم"
              variant="outlined"
              sx={{ fontWeight: "bold" }}
            />
          </Box>
        </Box>
      </Box>

      {/* التبويبات */}
      <Box sx={{ mb: 6 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTabs-indicator": { backgroundColor: "var(--brand)" },
            "& .MuiTab-root.Mui-selected": { color: "var(--brand)" },
          }}
        >
          <Tab label="المواصفات" data-testid="specs-tab" />
          <Tab label="التقييمات" data-testid="reviews-tab" />
          <Tab label="الأسئلة الشائعة" data-testid="faq-tab" />
        </Tabs>

        {/* محتوى التبويبات */}
        {activeTab === 0 && (
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: theme.palette.grey[50],
            }}
            data-testid="tab-content"
          >
            {product.specsBlock && product.specsBlock.length > 0 ? (
              <Box
                component="ul"
                sx={{ pl: 2, m: 0, columnCount: { md: 2 }, columnGap: 4 }}
              >
                {product.specsBlock.map((spec, index) => (
                  <Box
                    component="li"
                    key={index}
                    sx={{
                      mb: 1.5,
                      breakInside: "avoid",
                      "&::marker": { color: "var(--brand)" },
                    }}
                  >
                    <Typography>{spec}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography textAlign="center" py={2}>
                لا توجد مواصفات متاحة لهذا المنتج
              </Typography>
            )}
          </Paper>
        )}

        {activeTab === 1 && (
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: theme.palette.grey[50],
            }}
            data-testid="tab-content"
          >
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  mb: 3,
                  pb: 3,
                  borderBottom:
                    i < 2 ? `1px solid ${theme.palette.divider}` : "none",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      backgroundColor: "var(--brand)",
                      color: "var(--on-brand)",
                    }}
                  >
                    {["م", "ع", "ح"][i]}
                  </Avatar>
                  <Box>
                    <Typography fontWeight="bold">محمد أحمد</Typography>
                    <Box sx={{ display: "flex" }}>{renderStars(4.5)}</Box>
                  </Box>
                </Box>

                <Typography sx={{ mb: 1 }}>
                  منتج رائع وجودة عالية، التوصيل كان سريعاً والمنتج مطابق للوصف
                  تماماً. أنصح الجميع بهذا المنتج.
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  15 مارس 2023
                </Typography>
              </Box>
            ))}

            <Button variant="outlined" sx={{ fontWeight: "bold" }}>
              اضافة تقييم
            </Button>
          </Paper>
        )}

        {activeTab === 2 && (
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: theme.palette.grey[50],
            }}
            data-testid="tab-content"
          >
            {[
              {
                question: "ما هي مدة التوصيل المتوقعة؟",
                answer:
                  "مدة التوصيل تتراوح بين 2-5 أيام عمل داخل المملكة حسب المنطقة.",
              },
              {
                question: "هل يمكن استبدال المنتج؟",
                answer:
                  "نعم، يمكنك استبدال المنتج خلال 7 أيام من تاريخ الشراء بشرط أن يكون المنتج في حالته الأصلية.",
              },
              {
                question: "ما هي سياسة الإرجاع؟",
                answer:
                  "يمكنك إرجاع المنتج خلال 14 يومًا من تاريخ الشراء بشرط أن يكون المنتج في حالته الأصلية مع الاحتفاظ بالفاتورة.",
              },
            ].map((faq, i) => (
              <Box key={i} sx={{ mb: 3 }}>
                <Typography
                  fontWeight="bold"
                  sx={{ mb: 1, color: "var(--brand)" }}
                >
                  {faq.question}
                </Typography>
                <Typography>{faq.answer}</Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Box>

      {/* منتجات قد تعجبك (Placeholder/Skeleton) */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: "var(--brand)" }}>
        منتجات قد تعجبك
      </Typography>

      <Box sx={{ display: "flex", gap: 3, overflowX: "auto", py: 1, pb: 3 }}>
        {[...Array(4)].map((_, i) => (
          <Paper
            key={i}
            sx={{
              minWidth: 250,
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              position: "relative",
            }}
          >
            <Box
              sx={{
                height: 180,
                backgroundColor: theme.palette.grey[200],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Skeleton variant="rectangular" width={120} height={120} />
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography fontWeight="bold" sx={{ mb: 1 }}>
                <Skeleton variant="text" width="80%" />
              </Typography>
              <Typography sx={{ color: "var(--brand)", fontWeight: "bold" }}>
                <Skeleton variant="text" width="40%" />
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

const ProductDetailsSkeleton = () => (
  <Box sx={{ maxWidth: "lg", mx: "auto", py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
    <Box sx={{ mb: 3 }}>
      <Skeleton
        variant="rectangular"
        width={100}
        height={40}
        sx={{ borderRadius: 1 }}
      />
    </Box>

    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 4,
        mb: 6,
      }}
    >
      {/* معرض الصور */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              gap: 1,
              maxWidth: { md: 80 },
              overflowX: "auto",
              py: 1,
            }}
          >
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={80}
                height={80}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Box>
          <Skeleton
            variant="rectangular"
            height={450}
            sx={{ flex: 1, borderRadius: 3 }}
          />
        </Box>
      </Box>

      {/* تفاصيل المنتج */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton variant="text" height={50} sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", mb: 3 }}>
          <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={150} />
        </Box>
        <Skeleton variant="text" height={40} sx={{ mb: 3, width: "30%" }} />
        <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={30} sx={{ mb: 1, width: "80%" }} />
        <Skeleton variant="rectangular" height={2} sx={{ mb: 3 }} />
        <Skeleton variant="text" height={30} sx={{ mb: 1, width: "40%" }} />
        <Box sx={{ display: "flex", mb: 4 }}>
          <Skeleton
            variant="rectangular"
            width={40}
            height={40}
            sx={{ borderRadius: "8px 0 0 8px" }}
          />
          <Skeleton
            variant="rectangular"
            width={80}
            height={40}
            sx={{ borderRadius: 0 }}
          />
          <Skeleton
            variant="rectangular"
            width={40}
            height={40}
            sx={{ borderRadius: "0 8px 8px 0" }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          <Skeleton
            variant="rectangular"
            width={180}
            height={50}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width={120}
            height={50}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton variant="circular" width={50} height={50} />
        </Box>
        <Skeleton variant="rectangular" height={2} sx={{ mb: 3 }} />
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Skeleton
            variant="rectangular"
            width={120}
            height={50}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width={120}
            height={50}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      </Box>
    </Box>

    <Skeleton variant="text" height={40} sx={{ mb: 3, width: "30%" }} />
    <Skeleton
      variant="rectangular"
      height={300}
      sx={{ borderRadius: 3, mb: 6 }}
    />

    <Skeleton variant="text" height={40} sx={{ mb: 3, width: "30%" }} />
    <Box sx={{ display: "flex", gap: 3, overflowX: "auto", py: 1, pb: 3 }}>
      {[...Array(4)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          width={250}
          height={220}
          sx={{ borderRadius: 3 }}
        />
      ))}
    </Box>
  </Box>
);
