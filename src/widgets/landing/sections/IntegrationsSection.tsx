// src/components/landing/IntegrationsSection.tsx
import { Box, Typography, Paper, Chip, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ExtensionIcon from "@mui/icons-material/Extension";

import SallaIcon from "@/assets/Salla.svg";
import ZidIcon from "@/assets/Zid.svg";
import ShopifyIcon from "@/assets/Shopify.svg";
import WooCommerceIcon from "@/assets/WooCommerce.svg";

type Item = {
  title: string;
  desc: string;
  iconImg?: string;
  Icon?: typeof StorefrontIcon;
  soon?: boolean;
  /** مقياس اختياري لتكبير/تصغير الشعار داخل الإطار الموحّد */
  scale?: number; // 1 = عادي، 1.2 = تكبير 20%
};

const items: Item[] = [
  {
    title: "Salla",
    desc: "مزامنة سلسة للمنتجات، الأسعار، والمخزون مع متجرك.",
    iconImg: SallaIcon,
    // تكبير بسيط لتعويض فراغ الـ viewBox
    scale: 1.25,
  },
  {
    title: "Zid",
    desc: "تحديثات فورية للمخزون وبيانات المنتجات تلقائيًا.",
    iconImg: ZidIcon,
    scale: 1.25,
  },
  {
    title: "Shopify",
    desc: "تكامل عالمي لمتجر إلكتروني احترافي.",
    iconImg: ShopifyIcon,
    Icon: ShoppingBagIcon,
    soon: true,
  },
  {
    title: "WooCommerce",
    desc: "ربط قوي مع منصة ووردبريس لإدارة أعمالك.",
    iconImg: WooCommerceIcon,
    Icon: ExtensionIcon,
    soon: true,
  },
];

const Section = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(10),
  paddingBottom: theme.spacing(10),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : theme.palette.grey[50],
  position: "relative",
  overflow: "hidden",
}));

const IntegrationCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: "100%",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[5],
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  cursor: "default",
  position: "relative",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[12],
  },
}));

/** إطار موحّد لكل الشعارات */
const BRAND_BOX = {
  // مربّع أيقونة موحّد
  width: { xs: 64, md: 72 },
  height: { xs: 64, md: 72 },
  mb: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

function BrandVisual({ item }: { item: Item }) {
  const scale = item.scale ?? 1; // افتراضي بدون سكّيل
  if (item.iconImg) {
    return (
      <Box sx={BRAND_BOX}>
        <Box
          component="img"
          src={item.iconImg}
          alt={item.title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: `scale(${scale})`,
            transformOrigin: "center",
            userSelect: "none",
            display: "block",
          }}
        />
      </Box>
    );
  }
  if (item.Icon) {
    const Cmp = item.Icon;
    return (
      <Box sx={BRAND_BOX}>
        <Cmp
          sx={{
            fontSize: { xs: 48, md: 56 },
            color: (theme) => theme.palette.primary.main,
            transform: `scale(${scale})`,
            transformOrigin: "center",
          }}
        />
      </Box>
    );
  }
  return <Box sx={BRAND_BOX} />;
}

export default function IntegrationsSection() {
  return (
    <Section>
      <Typography
        variant="h4"
        textAlign="center"
        sx={{ mb: { xs: 5, md: 8 }, fontWeight: 800, letterSpacing: 0.2 }}
        color="primary"
      >
        تكاملات تمنحك القوة
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: 3, md: 4 },
          justifyContent: "center",
        }}
      >
        {items.map((it) => (
          <Box
            key={it.title}
            sx={{
              flex: "1 1 280px",
              maxWidth: { xs: "100%", md: 320 },
              minWidth: 260,
            }}
          >
            <IntegrationCard>
              {it.soon && (
                <Chip
                  label="قريبًا"
                  color="default"
                  size="small"
                  sx={{ position: "absolute", top: 10, right: 10, opacity: 0.9 }}
                />
              )}

              <BrandVisual item={it} />

              <Tooltip title={it.title}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: "1.15rem" }}>
                  {it.title}
                </Typography>
              </Tooltip>

              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                {it.desc}
              </Typography>
            </IntegrationCard>
          </Box>
        ))}
      </Box>
    </Section>
  );
}
