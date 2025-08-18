// components/store/ProductCard.tsx
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  useTheme,
} from "@mui/material";
import type { Product } from "../../types/Product";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ShareIcon from "@mui/icons-material/Share";
import StarIcon from "@mui/icons-material/Star";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import { useState } from "react";

type Props = {
  product: Product;
  onAddToCart: (p: Product) => void;
  onOpen: (p: Product) => void;
  viewMode: "grid" | "list";
};

export function ProductCard({ product, onAddToCart, onOpen, viewMode }: Props) {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const rating = 4.5; // يمكن استبدالها بتقييم حقيقي من بيانات المنتج

  // تحديد حالة المنتج
  const statusColor =
    product.status === "out_of_stock"
      ? "error"
      : product.status === "inactive"
      ? "default"
      : "success";

  const statusText =
    product.status === "out_of_stock"
      ? "منتهي"
      : product.status === "inactive"
      ? "غير متوفر"
      : "متوفر";

  // خصومات أو عروض خاصة
  const discount =
    product.offers && product.offers.length > 0
      ? parseInt(product.offers[0])
      : 0;

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpen(product)}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: viewMode === "grid" ? "column" : "row",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
        boxShadow: isHovered
          ? "0 10px 25px rgba(0,0,0,0.1)"
          : "0 2px 10px rgba(0,0,0,0.05)",
        transform: isHovered ? "translateY(-5px)" : "none",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* شارة الخصم */}
      {discount > 0 && (
        <Chip
          label={`خصم ${discount}%`}
          color="error"
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 2,
            fontWeight: "bold",
          }}
        />
      )}

      {/* شارة سريع البيع */}
      {product.lowQuantity && parseInt(product.lowQuantity) < 10 && (
        <Chip
          label="ينفد سريعاً"
          color="warning"
          size="small"
          icon={<FlashOnIcon fontSize="small" />}
          sx={{
            position: "absolute",
            top: discount > 0 ? 50 : 12,
            left: 12,
            zIndex: 2,
            fontWeight: "bold",
          }}
        />
      )}

      {/* صورة المنتج */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          width: viewMode === "grid" ? "100%" : 240,
          height: viewMode === "grid" ? 220 : 200,
        }}
      >
        {product.images?.[0] ? (
          <CardMedia
            component="img"
            height="100%"
            image={product.images[0]}
            alt={product.name}
            sx={{
              objectFit: "cover",
              transition: "transform 0.5s ease",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
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
              backgroundColor: theme.palette.grey[100],
            }}
          >
            <Typography color="text.secondary">لا توجد صورة</Typography>
          </Box>
        )}

        {/* أزرار الإجراءات السريعة */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          <IconButton
            sx={{
              backgroundColor: "white",
              color: theme.palette.text.primary,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: "white",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              // إضافة إلى المفضلة
            }}
          >
            <FavoriteBorderIcon fontSize="small" />
          </IconButton>

          <IconButton
            sx={{
              backgroundColor: "white",
              color: theme.palette.text.primary,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: "white",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              // إضافة للمقارنة
            }}
          >
            <CompareArrowsIcon fontSize="small" />
          </IconButton>

          <IconButton
            sx={{
              backgroundColor: "white",
              color: theme.palette.text.primary,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: "white",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              // مشاركة المنتج
            }}
          >
            <ShareIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* محتوى البطاقة */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: viewMode === "grid" ? 2 : 3,
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Chip
              label={statusText}
              size="small"
              color={statusColor}
              variant="outlined"
            />

            {product.source === "scraper" && (
              <Chip
                label="تحديث تلقائي"
                size="small"
                color="info"
                variant="outlined"
              />
            )}
          </Box>

          <Typography
            variant={viewMode === "grid" ? "subtitle1" : "h6"}
            sx={{ fontWeight: "bold", mb: 1 }}
          >
            {product.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: viewMode === "grid" ? 2 : 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {product.description || "لا يوجد وصف متوفر لهذا المنتج"}
          </Typography>

          {viewMode === "list" &&
            product.specsBlock &&
            product.specsBlock.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
                  المواصفات:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {product.specsBlock.slice(0, 3).map((spec, index) => (
                    <Chip
                      key={index}
                      label={spec}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {product.specsBlock.length > 3 && (
                    <Chip
                      label={`+${product.specsBlock.length - 3}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            )}

          {/* التقييمات */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <Box sx={{ display: "flex" }}>
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  sx={{
                    color:
                      i < Math.floor(rating)
                        ? theme.palette.warning.main
                        : theme.palette.grey[300],
                    fontSize: 16,
                  }}
                />
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({rating})
            </Typography>
          </Box>

          {/* السعر */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant={viewMode === "grid" ? "h6" : "h5"}
              fontWeight="bold"
              color="primary"
            >
              {product.price?.toFixed(2)} ر.س
            </Typography>

            {discount > 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                {(product.price / (1 - discount / 100)).toFixed(2)} ر.س
              </Typography>
            )}
          </Box>

          {viewMode === "list" &&
            product.keywords &&
            product.keywords.length > 0 && (
              <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {product.keywords.slice(0, 5).map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    size="small"
                    variant="outlined"
                    color="info"
                  />
                ))}
              </Box>
            )}
        </CardContent>

        <CardActions sx={{ p: 0, mt: "auto" }}>
          <Button
            variant="contained"
            fullWidth={viewMode === "grid"}
            startIcon={<ShoppingCartIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={product.status !== "active"}
            sx={{
              fontWeight: "bold",
              borderRadius: 2,
              py: 1,
              boxShadow: "none",
              "&:hover": {
                boxShadow: `0 4px 10px ${theme.palette.primary.main}40`,
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            أضف إلى السلة
          </Button>

          {viewMode === "list" && (
            <Button
              variant="outlined"
              sx={{
                ml: 2,
                fontWeight: "bold",
                borderRadius: 2,
                py: 1,
              }}
              onClick={() => onOpen(product)}
            >
              التفاصيل
            </Button>
          )}
        </CardActions>
      </Box>
    </Card>
  );
}
