import {
  Box,
  Typography,
  Container,
  Link,
  IconButton,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Phone,
  LocationOn,
  AccessTime,
} from "@mui/icons-material";
import type { MerchantInfo } from "../../types/merchant";
import type { Category } from "../../types/Category";
import { Link as RouterLink } from "react-router-dom";

// تعريف الأيقونات
const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: LinkedIn,
  youtube: YouTube,
};

export function Footer({
  merchant,
  categories,
}: {
  merchant: MerchantInfo;
  categories: Category[];
}) {
  const theme = useTheme();

  // ساعات الدوام كمصفوفة نصوص
  const workingHoursStr =
    merchant.workingHours?.length > 0
      ? merchant.workingHours
          .map((h) => `${h.day}: ${h.openTime} - ${h.closeTime}`)
          .join(" | ")
      : "";

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.primary.dark,
        color: "white",
        py: 6,
        mt: "auto",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 0 },
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {/* Store Info */}
          <Box flex={2} mb={{ xs: 4, md: 0 }}>
            <Box mb={3} display="flex" alignItems="center">
              {merchant.logoUrl && (
                <img
                  src={merchant.logoUrl}
                  alt={merchant.name}
                  width={40}
                  style={{ borderRadius: 20, marginRight: 10 }}
                />
              )}
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {merchant.name}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
              {merchant.businessDescription || "متجر إلكتروني متخصص"}
            </Typography>

            {/* روابط السوشيال ميديا */}
            <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
              {merchant.socialLinks &&
                Object.entries(merchant.socialLinks).map(
                  ([platform, url]) =>
                    url ? (
                      <IconButton
                        key={platform}
                        component="a"
                        href={url}
                        target="_blank"
                        rel="noopener"
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.1)",
                          color: "white",
                          "&:hover": {
                            backgroundColor: theme.palette.primary.light,
                          },
                        }}
                      >
                        {(() => {
                          const Icon =
                            socialIcons[
                              platform as keyof typeof socialIcons
                            ];
                          return Icon ? <Icon /> : null;
                        })()}
                      </IconButton>
                    ) : null
                )}
            </Box>
          </Box>

          {/* Quick Links */}
          <Box flex={1} mb={{ xs: 4, md: 0 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 3, position: "relative" }}
            >
              روابط سريعة
              <Divider
                sx={{
                  width: "50px",
                  height: "3px",
                  backgroundColor: theme.palette.primary.light,
                  mt: 1,
                }}
              />
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link
                component={RouterLink}
                to="/"
                color="inherit"
                sx={{
                  textDecoration: "none",
                  opacity: 0.9,
                  "&:hover": { opacity: 1 },
                }}
              >
                الصفحة الرئيسية
              </Link>
              <Link
                component={RouterLink}
                to="/store"
                color="inherit"
                sx={{
                  textDecoration: "none",
                  opacity: 0.9,
                  "&:hover": { opacity: 1 },
                }}
              >
                المتجر
              </Link>
              <Link
                component={RouterLink}
                to="/store/about"
                color="inherit"
                sx={{
                  textDecoration: "none",
                  opacity: 0.9,
                  "&:hover": { opacity: 1 },
                }}
              >
                من نحن
              </Link>
            </Box>
          </Box>

          {/* Categories */}
          <Box flex={1} mb={{ xs: 4, md: 0 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 3, position: "relative" }}
            >
              التصنيفات
              <Divider
                sx={{
                  width: "50px",
                  height: "3px",
                  backgroundColor: theme.palette.primary.light,
                  mt: 1,
                }}
              />
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat._id}
                  component={RouterLink}
                  to={`/store/category/${cat._id}`}
                  color="inherit"
                  sx={{
                    textDecoration: "none",
                    opacity: 0.9,
                    "&:hover": { opacity: 1 },
                  }}
                >
                  {cat.name}
                </Link>
              ))}
            </Box>
          </Box>

          {/* Contact Info */}
          <Box flex={2}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 3, position: "relative" }}
            >
              معلومات التواصل
              <Divider
                sx={{
                  width: "50px",
                  height: "3px",
                  backgroundColor: theme.palette.primary.light,
                  mt: 1,
                }}
              />
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {merchant.addresses?.[0] && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LocationOn
                    sx={{
                      color: theme.palette.primary.light,
                      fontSize: "1.8rem",
                      mr: 2,
                    }}
                  />
                  <Typography variant="body1">
                    {merchant.addresses[0].street},{" "}
                    {merchant.addresses[0].city},{" "}
                    {merchant.addresses[0].country}
                  </Typography>
                </Box>
              )}
              {merchant.phone && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Phone
                    sx={{
                      color: theme.palette.primary.light,
                      fontSize: "1.8rem",
                      mr: 2,
                    }}
                  />
                  <Typography variant="body1">{merchant.phone}</Typography>
                </Box>
              )}
              {workingHoursStr && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AccessTime
                    sx={{
                      color: theme.palette.primary.light,
                      fontSize: "1.8rem",
                      mr: 2,
                    }}
                  />
                  <Typography variant="body1">{workingHoursStr}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 5, backgroundColor: "rgba(255,255,255,0.2)" }} />

        {/* Footer Bottom Row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} {merchant.name}. جميع الحقوق محفوظة.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
