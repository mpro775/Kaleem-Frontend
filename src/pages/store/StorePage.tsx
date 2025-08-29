// src/pages/StorePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Badge,
  useMediaQuery,
  useTheme,
  Container,
  Skeleton,
  Chip,
  Button,
  Stack,
} from "@mui/material";
import { useCart, CartProvider } from "../../context/CartContext";
import axiosInstance from "@/shared/api/axios";
import type { Storefront } from "@/features/mechant/storefront-theme/type";

import type { ProductResponse } from "@/features/mechant/products/type";
import type { Category } from "@/features/mechant/categories/type";
import { StoreNavbar } from "@/features/store/ui/StoreNavbar";
import { StoreHeader } from "@/features/store/ui/StoreHeader";
import { CategoryFilter } from "@/features/store/ui/CategoryFilter";
import { ProductGrid } from "@/features/store/ui/ProductGrid";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FilterListIcon from "@mui/icons-material/FilterList";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Footer } from "@/features/store/ui/Footer";
import CartDialog from "@/features/store/ui/CartDialog";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { getStorefrontInfo } from "@/features/mechant/storefront-theme/api";
import type { MerchantInfo } from "@/features/mechant/merchant-settings/types";
import { getMerchantInfo } from "@/features/mechant/merchant-settings/api";
import { getSessionId } from "@/shared/utils/session";
import { getLocalCustomer } from "@/shared/utils/customer";
import LiteIdentityCard from "@/features/store/ui/LiteIdentityCard";
import type { CustomerInfo } from "@/features/store/type";
import { useErrorHandler } from "@/shared/errors";

// يطبّق متغيّرات اللون الداكن
import { setBrandVars } from "@/features/shared/brandCss";
import { API_BASE } from "@/context/config";

async function fetchStore(slugOrId: string) {
  const res = await axiosInstance.get(`/storefront/${slugOrId}`);
  return res.data; // التطبيع يضمن الحمولة مباشرة
}

function resolveTargetSlug(slugOrId: string | undefined, isDemo: boolean) {
  const DEMO = import.meta.env.VITE_DEMO_MERCHANT_SLUG_OR_ID;
  if (isDemo && DEMO) return DEMO;
  return slugOrId ?? "demo";
}

// محاولة استخراج merchantId من أشكال متعددة
function extractMerchantId(data: any): string | null {
  if (!data) return null;
  // الشكل الكامل
  if (data?.merchant?._id) return String(data.merchant._id);
  // أحيانًا يرجع merchantId صريح
  if (data?.merchantId) return String(data.merchantId);
  // وثيقة storefront تحوي merchant كـ ObjectId
  if (typeof data?.merchant === "string") return data.merchant;
  if (typeof data?.merchant === "object" && data?.merchant?._id)
    return String(data.merchant._id);
  // أحيانًا يلفّها تحت store أو storefront
  const sf = data?.store || data?.storefront;
  if (sf?.merchant?._id) return String(sf.merchant._id);
  if (typeof sf?.merchant === "string") return sf.merchant;
  return null;
}

type OfferItem = {
  id: string; // product id
  name: string;
  slug?: string;
  priceOld?: number | null;
  priceNew?: number | null;
  priceEffective?: number | null;
  currency?: string;
  discountPct?: number | null;
  url?: string;
  isActive: boolean;
  period?: { startAt?: string | null; endAt?: string | null };
  image?: string;
};

const StoreContent: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storefront, setStorefront] = useState<Storefront | null>(null);

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const { items, addItem } = useCart();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [sessionId] = useState<string>(() => getSessionId());
  const localCustomer = getLocalCustomer() as CustomerInfo;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [showOffersOnly, setShowOffersOnly] = useState(false);
  const { handleError } = useErrorHandler();

  const isDemo =
    slug === "demo" || new URLSearchParams(location.search).has("demo");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setIsLoading(true);
        setError("");

        const target = resolveTargetSlug(slug, isDemo);
        const data = await fetchStore(target);

        // 1) استخرج merchantId بشكل مرن
        let mid = extractMerchantId(data);

        // 2) إن لم نجد mid من /storefront/:slugOrId، جرّب public resolver
        if (!mid) {
          try {
            const pub = await axiosInstance.get(`/public/${target}`);
            mid =
              pub.data?.merchant?.id ||
              pub.data?.merchant?._id ||
              pub.data?.merchantId ||
              null;
          } catch {
            // نتجاهل هنا، سنرمي خطأ أو نُظهر رسالة لاحقًا
          }
        }

        if (!mid) {
          throw new Error("تعذر تحديد هوية التاجر من هذا السلاج.");
        }

        // 3) جهّز merchant + storefront (مرة واحدة فقط)
        const [miRes, sfRes] = await Promise.all([
          getMerchantInfo(mid),
          getStorefrontInfo(mid),
        ]);

        if (!mounted) return;

        const merchantObj = miRes; // getMerchantInfo يُرجِّع MerchantInfo مباشرة
        setMerchant(merchantObj);

        const sf = {
          ...sfRes,
          banners: Array.isArray(sfRes?.banners) ? sfRes.banners : [],
        };
        setStorefront(sf);

        setBrandVars((sf as any)?.brandDark || "#111827");

        // 4) المنتجات/التصنيفات: إن لم تُرجع من الاندبوينت الأول، اجلبها صراحة
        if (Array.isArray(data?.products) && Array.isArray(data?.categories)) {
          setProducts(data.products);
          setCategories(data.categories);
        } else {
          const [prods, cats] = await Promise.all([
            axiosInstance
              .get<ProductResponse[]>("/products", {
                params: { merchantId: mid, limit: 200 },
              })
              .then((r) => r.data)
              .catch(() => []),
            axiosInstance
              .get<Category[]>("/categories", {
                params: { merchantId: mid },
              })
              .then((r) => r.data)
              .catch(() => []),
          ]);
          if (!mounted) return;
          setProducts(prods || []);
          setCategories(cats || []);
        }

        // 5) العروض
        try {
          setOffersLoading(true);
          const { data: off } = await axiosInstance.get<OfferItem[]>(
            "/offers",
            {
              params: { merchantId: mid, limit: 100 },
            }
          );
          if (!mounted) return;
          setOffers(off || []);
        } catch (err) {
          handleError(err);
          console.warn("offers fetch failed");
        } finally {
          if (mounted) setOffersLoading(false);
        }
      } catch (err: any) {
        const msg = err?.message || "فشل تحميل بيانات المتجر";
        setError(msg);
        handleError(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug, isDemo, handleError]);

  // زرع/تحديث سكربت الودجت
  useEffect(() => {
    if (!merchant || !storefront) return;

    const existing = document.getElementById(
      "kleem-chat"
    ) as HTMLScriptElement | null;

    const cfg = {
      merchantId: merchant._id,
      apiBaseUrl: API_BASE,
      mode: "bubble",
      brandColor: storefront.brandDark,
      headerBgColor: storefront.brandDark,
      bodyBgColor: "#FFFFFF",
      fontFamily: "Tajawal",
      publicSlug: (merchant as any)?.publicSlug,
      // openOnLoad: true, autoOpenDelay: 1200,
    };

    if (!existing) {
      const script = document.createElement("script");
      script.id = "kleem-chat";
      script.async = true;
      script.src = `${(
        import.meta?.env?.VITE_PUBLIC_WIDGET_HOST || "https://kaleem-ai.com"
      ).replace(/\/+$/, "")}/public/widget.js`;
      script.setAttribute("data-config", JSON.stringify(cfg));
      document.body.appendChild(script);
    } else {
      try {
        const current = JSON.parse(
          existing.getAttribute("data-config") || "{}"
        );
        existing.setAttribute(
          "data-config",
          JSON.stringify({ ...current, ...cfg })
        );
      } catch {
        existing.setAttribute("data-config", JSON.stringify(cfg));
      }
    }
  }, [merchant, storefront]);

  // منع الأرشفة عند الديمو
  useEffect(() => {
    if (!isDemo) return;
    document.title = "متجر تجريبي — Kleem";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, [isDemo]);

  // خريطة منتجات حسب ID
  const productById = useMemo(() => {
    const m = new Map<string, ProductResponse>();
    if (Array.isArray(products)) {
      for (const p of products) m.set(p._id, p);
    }
    return m;
  }, [products]);

  // تحويل العروض إلى شكل ProductGrid
  const offerAsProducts: ProductResponse[] = useMemo(() => {
    if (!Array.isArray(offers)) return [];
    return offers.map((o) => {
      const base = productById.get(o.id);
      const price = o.priceEffective ?? o.priceNew ?? (base as any)?.price ?? 0;

      return {
        ...(base ?? ({} as any)),
        _id: o.id,
        name: o.name ?? base?.name ?? "",
        images: o.image ? [o.image] : base?.images ?? [],
        price,
        currency: (o.currency as any) ?? (base as any)?.currency ?? "SAR",
        hasActiveOffer: o.isActive as any,
        priceEffective: o.priceEffective ?? undefined,
        offer: {
          enabled: true,
          oldPrice: o.priceOld ?? (base as any)?.offer?.oldPrice,
          newPrice: o.priceNew ?? (base as any)?.offer?.newPrice,
          startAt: o.period?.startAt,
          endAt: o.period?.endAt,
        } as any,
      } as ProductResponse;
    });
  }, [offers, productById]);

  if (error)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#fff",
        }}
      >
        <Typography
          variant="h5"
          color="error"
          sx={{ textAlign: "center", p: 3 }}
        >
          {error}
        </Typography>
      </Box>
    );

  if (!merchant || !storefront)
    return <Typography sx={{ p: 3 }}>جارٍ التحميل…</Typography>;

  // اختيار المصدر الظاهر
  const sourceList: ProductResponse[] = showOffersOnly
    ? offerAsProducts
    : Array.isArray(products)
    ? products
    : [];

  // فلترة
  const filteredProducts = (Array.isArray(sourceList) ? sourceList : []).filter(
    (p) =>
      (!activeCategory || p.category === activeCategory) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box sx={{ minHeight: "100vh", background: "#fff", pb: 8 }}>
      <StoreNavbar merchant={merchant} storefront={storefront} />

      {/* زر السلة العائم */}
      <IconButton
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1000,
          width: 60,
          height: 60,
          backgroundColor: "var(--brand)",
          color: "var(--on-brand)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          "&:hover": {
            backgroundColor: "var(--brand-hover)",
            transform: "scale(1.1)",
          },
          transition: "all 0.3s ease",
        }}
        onClick={() => setOpenCart(true)}
      >
        <Badge badgeContent={cartCount} color="error">
          <ShoppingCartIcon fontSize="large" />
        </Badge>
      </IconButton>

      <Container maxWidth="xl" sx={{ pt: 4, pb: 10 }}>
        {isLoading ? (
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={200}
              sx={{ borderRadius: 3, mb: 3 }}
            />
            <Skeleton
              variant="text"
              width="60%"
              height={40}
              sx={{ mx: "auto", mb: 2 }}
            />
            <Skeleton
              variant="text"
              width="80%"
              height={30}
              sx={{ mx: "auto" }}
            />
          </Box>
        ) : (
          <>
            {!isLoading && merchant && (
              <LiteIdentityCard merchantId={merchant._id} />
            )}
            <StoreHeader merchant={merchant} storefront={storefront} />
          </>
        )}

        {/* سلايدر البانرات */}
        {(storefront?.banners?.filter((b) => b?.active !== false).length ?? 0) >
          0 && (
          <Box mb={3}>
            <Swiper
              slidesPerView={1}
              loop={storefront.banners.filter((b) => b.active).length > 1}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              modules={[Pagination, Autoplay]}
              style={{ borderRadius: 18 }}
              dir="rtl"
            >
              {storefront.banners
                .filter((b) => b.active)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((banner, idx) => (
                  <SwiperSlide key={idx}>
                    {banner.image ? (
                      <Box
                        sx={{
                          width: "100%",
                          textAlign: "center",
                          cursor: banner.url ? "pointer" : "default",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                        onClick={() =>
                          banner.url && window.open(banner.url, "_blank")
                        }
                      >
                        <img
                          src={banner.image}
                          alt={banner.text}
                          style={{
                            width: "100%",
                            maxHeight: 600,
                            objectFit: "contain",
                            borderRadius: 18,
                            display: "block",
                            margin: "0 auto",
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          bgcolor: banner.color || "var(--brand)",
                          color: "var(--on-brand)",
                          textAlign: "center",
                          py: 2,
                          px: 1,
                          borderRadius: 3,
                          fontWeight: "bold",
                          fontSize: 18,
                          cursor: banner.url ? "pointer" : "default",
                          minHeight: 80,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() =>
                          banner.url && window.open(banner.url, "_blank")
                        }
                      >
                        {banner.text}
                      </Box>
                    )}
                  </SwiperSlide>
                ))}
            </Swiper>
          </Box>
        )}

        {/* شريط التحكم: بحث + زر عروض */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
            gap: 2,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <TextField
            label="ابحث عن منتج"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{
              maxWidth: isMobile ? "100%" : 500,
              "& .MuiOutlinedInput-root": {
                borderRadius: 50,
                backgroundColor: "white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                "&:hover": {
                  boxShadow: "0 2px 15px rgba(0,0,0,0.1)",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: "action.active", mr: 1 }} />
              ),
            }}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={<LocalOfferIcon />}
              color={showOffersOnly ? "primary" : "default"}
              label={
                showOffersOnly
                  ? "عرض جميع المنتجات"
                  : `العروض ${
                      offersLoading
                        ? "…"
                        : offers.length
                        ? `(${offers.length})`
                        : ""
                    }`
              }
              onClick={() => setShowOffersOnly((v) => !v)}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            />

            {isMobile && (
              <IconButton
                sx={{
                  backgroundColor: "var(--brand)",
                  color: "var(--on-brand)",
                  borderRadius: 2,
                  p: 1.5,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  "&:hover": { backgroundColor: "var(--brand-hover)" },
                }}
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <FilterListIcon />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  التصنيفات
                </Typography>
              </IconButton>
            )}
          </Stack>
        </Box>

        {/* قسم العروض المختصر */}
        {offers.length > 0 && !showOffersOnly && (
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: 3,
              boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
              p: 2,
              mb: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "bold",
                  color: "var(--brand)",
                }}
              >
                <LocalOfferIcon sx={{ mr: 1 }} />
                عروضنا
              </Typography>
              <Button variant="text" onClick={() => setShowOffersOnly(true)}>
                عرض كل العروض
              </Button>
            </Box>

            <ProductGrid
              products={offerAsProducts.slice(0, 8)}
              onAddToCart={addItem}
              onOpen={(p) => navigate(`/store/${slug}/product/${p._id}`)}
            />
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 4 }}>
          {!isMobile && (
            <Box
              sx={{
                width: 250,
                flexShrink: 0,
                backgroundColor: "white",
                borderRadius: 3,
                boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                p: 3,
                height: "fit-content",
                position: "sticky",
                top: 20,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "bold",
                  color: "var(--brand)",
                }}
              >
                <StorefrontIcon sx={{ mr: 1 }} />
                التصنيفات
              </Typography>
              <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onChange={setActiveCategory}
              />
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }}>
            {mobileFiltersOpen && isMobile && (
              <Box
                sx={{
                  backgroundColor: "white",
                  borderRadius: 3,
                  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                  p: 2,
                  mb: 3,
                }}
              >
                <CategoryFilter
                  categories={categories}
                  activeCategory={activeCategory}
                  onChange={setActiveCategory}
                />
              </Box>
            )}

            {activeCategory && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 3,
                  backgroundColor: "var(--brand)",
                  color: "var(--on-brand)",
                  borderRadius: 3,
                  p: 1.5,
                  width: "fit-content",
                }}
              >
                <LocalOfferIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {categories.find((c) => c._id === activeCategory)?.name}
                </Typography>
                <IconButton
                  size="small"
                  sx={{
                    color: "var(--on-brand)",
                    ml: 1,
                    "&:hover": { opacity: 0.85 },
                  }}
                  onClick={() => setActiveCategory(null)}
                >
                  ✕
                </IconButton>
              </Box>
            )}

            {isLoading ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "1fr 1fr 1fr",
                  },
                  gap: 3,
                }}
              >
                {[...Array(6)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      backgroundColor: "white",
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Skeleton variant="rectangular" width="100%" height={200} />
                    <Box sx={{ p: 2 }}>
                      <Skeleton variant="text" height={30} />
                      <Skeleton variant="text" height={25} width="60%" />
                      <Skeleton variant="text" height={20} width="40%" />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <ProductGrid
                products={filteredProducts}
                onAddToCart={addItem}
                onOpen={(p) => navigate(`/store/${slug}/product/${p._id}`)}
              />
            )}
          </Box>
        </Box>

        <CartDialog
          open={openCart}
          onClose={() => setOpenCart(false)}
          merchantId={merchant._id}
          sessionId={sessionId}
          defaultCustomer={localCustomer}
          onOrderSuccess={(orderId) => {
            navigate(`/store/${slug}/order/${orderId}`);
          }}
        />
      </Container>

      <Footer merchant={merchant} categories={categories} />
    </Box>
  );
};

export default function StorePage() {
  return (
    <CartProvider>
      <StoreContent />
    </CartProvider>
  );
}
