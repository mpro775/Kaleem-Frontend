// components/store/StoreNavbar.tsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Button,
  Box,
  Avatar,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useCart } from "../../context/CartContext";
import type { MerchantInfo, Storefront } from "../../types/merchant"; // ✏️ استيراد Storefront
import CartDialog from "./CartDialog";
import { useNavigate, useParams } from "react-router-dom";

interface Props {
  merchant: MerchantInfo;
  storefront: Storefront;                        // ✏️ إضافة storefront
}

export function StoreNavbar({ merchant, storefront }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { items } = useCart();
  const [openCart, setOpenCart] = useState(false);
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const { primaryColor } = storefront;  // 🔄 استخدم لون الثيم

  const openMenu = Boolean(anchorEl);
  const handleMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          mb: 4,
          // 🔄 جعل خلفية الشريط هو primaryColor
          backgroundColor: primaryColor,
          color: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar sx={{ maxWidth: 1280, mx: "auto", width: "100%", py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            {merchant.logoUrl && (
              <Avatar
                src={merchant.logoUrl}
                alt={merchant.name}
                sx={{
                  width: 48,
                  height: 48,
                  mr: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
            )}

            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
              onClick={() => navigate(`/store/${slugOrId}`)}
            >
              <StorefrontIcon sx={{ mr: 1 }} />
              {merchant.name}
            </Typography>
          </Box>

          {isMobile ? (
            <>
              <IconButton size="large" color="inherit" onClick={handleMenu}>
                <MenuIcon />
              </IconButton>

              <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
                <MenuItem
                  onClick={() => {
                    navigate(`/store/${slugOrId}/about`);
                    handleCloseMenu();
                  }}
                >
                  من نحن
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setOpenCart(true);
                    handleCloseMenu();
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ShoppingCartIcon sx={{ mr: 1 }} />
                    السلة
                    {items.length > 0 && (
                      <Badge badgeContent={items.length} color="error" sx={{ ml: 1 }} />
                    )}
                  </Box>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button
                color="inherit"
                sx={{ fontWeight: "bold", mx: 1 }}
                onClick={() => navigate(`/store/${slugOrId}`)}
              >
                الصفحة الرئيسية
              </Button>

              <Button
                color="inherit"
                sx={{ fontWeight: "bold", mx: 1 }}
                onClick={() => navigate(`/store/${slugOrId}/about`)}
              >
                من نحن
              </Button>

              <IconButton color="inherit" sx={{ ml: 2 }} onClick={() => setOpenCart(true)}>
                <Badge badgeContent={items.length} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <CartDialog
        open={openCart}
        onClose={() => setOpenCart(false)}
        merchantId={merchant._id}
        onOrderSuccess={(orderId) => {
          navigate(`/order/${orderId}`);
        }}
      />
    </>
  );
}
