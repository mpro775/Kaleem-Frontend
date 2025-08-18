// pages/StorePage.tsx
import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { useCart, CartProvider } from "../context/CartContext";
import axiosInstance from "../api/axios";
import type { MerchantInfo, Storefront } from "../types/merchant";
import type { Product } from "../types/Product";
import type { Category } from "../types/Category";
import { StoreNavbar } from "../components/store/StoreNavbar";
import { StoreHeader } from "../components/store/StoreHeader";
import { CategoryFilter } from "../components/store/CategoryFilter";
import { ProductGrid } from "../components/store/ProductGrid";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FilterListIcon from "@mui/icons-material/FilterList";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Footer } from "../components/store/Footer";
import CartDialog from "../components/store/CartDialog";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";

import { Pagination, Autoplay } from "swiper/modules";
import { getStorefrontInfo } from "../api/storefrontApi";

async function fetchStore(slug: string) {
  const res = await axiosInstance.get<{
    merchant: MerchantInfo;
    products: Product[];
    categories: Category[];
  }>(`/store/${slug}`);
  return res.data;
}

const StoreContent: React.FC = () => {
  const navigate = useNavigate();
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>("");
  const { items, addItem } = useCart();
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [storefront, setStorefront] = useState<Storefront | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    if (!slugOrId) return;
    setIsLoading(true);
    fetchStore(slugOrId)
      .then(async (data) => {
        setMerchant(data.merchant);
        setProducts(data.products);
        setCategories(data.categories);
        // جلب بيانات الواجهة
        const sf = await getStorefrontInfo(data.merchant._id);
        setStorefront(sf);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [slugOrId]);

  if (error)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          // خلفية تعتمد على storefront.primaryColor أو fallback
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
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
  if (!merchant || !storefront) return <Typography>جارٍ التحميل…</Typography>;

  // تصفية المنتجات
  const filteredProducts = products.filter(
    (p) =>
      (!activeCategory || p.category === activeCategory) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        pb: 8,
      }}
    >
      <StoreNavbar merchant={merchant} storefront={storefront} />

      {/* Floating cart button */}
      <IconButton
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1000,
          width: 60,
          height: 60,
          backgroundColor: theme.palette.primary.main,
          color: "white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
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
          <StoreHeader merchant={merchant} storefront={storefront} />
        )}
        {storefront.banners &&
          storefront.banners.filter((b) => b.active).length > 0 && (
            <Box mb={3}>
              <Swiper
                slidesPerView={1}
                loop={storefront.banners.filter((b) => b.active).length > 1}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                modules={[Pagination, Autoplay]}
                style={{ borderRadius: 18 }}
                dir="rtl" // دعم اللغة العربية
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
                              maxHeight: 180,
                              objectFit: "cover",
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
                            bgcolor: banner.color || "#f57c00",
                            color: "#fff",
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

          {isMobile && (
            <IconButton
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "white",
                borderRadius: 2,
                p: 1.5,
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <FilterListIcon />
              <Typography variant="body2" sx={{ ml: 1 }}>
                التصنيفات
              </Typography>
            </IconButton>
          )}
        </Box>

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
                  color: theme.palette.primary.main,
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
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
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
                    color: theme.palette.primary.contrastText,
                    ml: 1,
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
                onOpen={(p) => navigate(`/store/${slugOrId}/product/${p._id}`)}
              />
            )}
          </Box>
        </Box>
        <CartDialog
          open={openCart}
          onClose={() => setOpenCart(false)}
          merchantId={merchant._id}
          onOrderSuccess={(orderId) => {
            navigate(`/store/${slugOrId}/order/${orderId}`);
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
