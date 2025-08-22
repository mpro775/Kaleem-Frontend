// src/components/landing/IntegrationsSection.tsx
import {
  Box,
  Typography,
  Paper,
  Chip,
  Tooltip,
  IconButton,
  useMediaQuery,
  useTheme,
  ButtonBase,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ExtensionIcon from "@mui/icons-material/Extension";
import { useEffect, useMemo, useRef, useState } from "react";

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
  borderRadius: theme.shape.borderRadius as number * 2,
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
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md")); // ≥ md -> 4
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm")); // ≥ sm -> 2 (وإلا 1)

  const perView = isMdUp ? 4 : isSmUp ? 2 : 1;

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollInterval = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = useMemo(() => {
    const calculated = Math.ceil(items.length / perView);
    return Math.max(1, calculated);
  }, [perView, items.length]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll) return;

    const interval = setInterval(() => {
      setPage((p) => {
        const nextPage = (p + 1) % totalPages;
        return nextPage;
      });
    }, 5000);

    scrollInterval.current = interval;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoScroll, totalPages]);

  // Sync scroll position with page state
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const targetScrollLeft = page * el.clientWidth;

    // Only scroll if we're not already at the target position
    if (Math.abs(el.scrollLeft - targetScrollLeft) > 10) {
      setIsScrolling(true);
      el.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });

      // Reset scrolling flag after animation
      setTimeout(() => setIsScrolling(false), 500);
    }

    // Pause auto-scroll on manual interaction
    const pauseAutoScroll = () => {
      setAutoScroll(false);
      if (scrollInterval.current) {
        clearTimeout(scrollInterval.current);
      }
      setTimeout(() => setAutoScroll(true), 10000); // Resume after 10s
    };

    el.addEventListener("touchstart", pauseAutoScroll);
    el.addEventListener("mousedown", pauseAutoScroll);

    return () => {
      el.removeEventListener("touchstart", pauseAutoScroll);
      el.removeEventListener("mousedown", pauseAutoScroll);
    };
  }, [page, totalPages]);

  // Reset page when perView changes
  useEffect(() => {
    setPage(0);
  }, [perView]);

  // Move to specific page
  const scrollToPage = (p: number) => {
    const newPage = Math.max(0, Math.min(p, totalPages - 1));
    setPage(newPage);
    setAutoScroll(false);

    // Clear existing interval
    if (scrollInterval.current) {
      clearTimeout(scrollInterval.current);
    }

    // Resume auto-scroll after 10s
    setTimeout(() => setAutoScroll(true), 10000);
  };

  const next = () => scrollToPage(page + 1);
  const prev = () => scrollToPage(page - 1);

  // Sync indicator on manual scroll
  const onScroll = () => {
    const el = trackRef.current;
    if (!el || isScrolling) return;

    // Calculate current page based on scroll position
    const scrollPos = el.scrollLeft;
    const containerWidth = el.clientWidth;
    const currentPage = Math.round(scrollPos / containerWidth);

    if (currentPage !== page && currentPage >= 0 && currentPage < totalPages) {
      setPage(currentPage);
      setAutoScroll(false);
      if (scrollInterval.current) {
        clearTimeout(scrollInterval.current);
      }
      // Resume auto-scroll after 10 seconds
      setTimeout(() => setAutoScroll(true), 10000);
    }
  };

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

      {/* حاوية السلايدر */}
      <Box
        sx={{
          position: "relative",
          mx: { xs: -2, sm: "auto" },
          maxWidth: 1400,
          px: { xs: 0, sm: 2, md: 0 },
          // حواف تدرج شفافة
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 48,
            pointerEvents: "none",
            zIndex: 2,
            display: { xs: "none", sm: "block" },
          },
          "&::before": {
            left: 0,
            background:
              "linear-gradient(to right, rgba(248,250,252,1), rgba(248,250,252,0))",
          },
          "&::after": {
            right: 0,
            background:
              "linear-gradient(to left, rgba(248,250,252,1), rgba(248,250,252,0))",
          },
        }}
      >
        {/* المسار */}
        <Box
          ref={trackRef}
          onScroll={onScroll}
          dir="ltr"
          sx={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: { xs: "x mandatory", md: "none" },
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            gap: { xs: 8, sm: 16 },
            px: { xs: 2, sm: "48px", md: "48px" },
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          {/* العنصر (الكارت) */}
          {items.map((item) => (
            <Box
              key={item.title}
              sx={{
                flex: "0 0 auto",
                // عرض الكارت بحسب perView مع هوامش
                width: {
                  xs: "100%",
                  sm: "calc((100% - 16px) / 2)",
                  md: "calc((100% - 3 * 16px) / 4)",
                },
                mx: 0,
                my: 1,
                scrollSnapAlign: { xs: "center", md: "unset" },
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                },
              }}
            >
              <IntegrationCard>
                {item.soon && (
                  <Chip
                    label="قريبًا"
                    color="default"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      opacity: 0.9,
                    }}
                  />
                )}

                <BrandVisual item={item} />

                <Tooltip title={item.title}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 1, fontSize: "1.15rem" }}
                  >
                    {item.title}
                  </Typography>
                </Tooltip>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.9 }}
                >
                  {item.desc}
                </Typography>
              </IntegrationCard>
            </Box>
          ))}
        </Box>

        {/* أزرار التصفح */}
        <IconButton
          aria-label="السابق"
          onClick={prev}
          disabled={page === 0}
          sx={{
            position: "absolute",
            top: "50%",
            left: { xs: 4, sm: 8 },
            transform: "translateY(-50%)",
            zIndex: 3,
            bgcolor: "background.paper",
            boxShadow: 2,
            width: 40,
            height: 40,
            "&:hover": {
              bgcolor: "background.paper",
              transform: "translateY(-50%) scale(1.1)",
            },
            transition: "all 0.2s ease",
            opacity: page === 0 ? 0.5 : 1,
            "&.Mui-disabled": {
              opacity: 0.3,
            },
          }}
        >
          <ChevronLeftRoundedIcon />
        </IconButton>

        <IconButton
          aria-label="التالي"
          onClick={next}
          disabled={page === totalPages - 1}
          sx={{
            position: "absolute",
            top: "50%",
            right: { xs: 4, sm: 8 },
            transform: "translateY(-50%)",
            zIndex: 3,
            bgcolor: "background.paper",
            boxShadow: 2,
            width: 40,
            height: 40,
            "&:hover": {
              bgcolor: "background.paper",
              transform: "translateY(-50%) scale(1.1)",
            },
            transition: "all 0.2s ease",
            opacity: page === totalPages - 1 ? 0.5 : 1,
            "&.Mui-disabled": {
              opacity: 0.3,
            },
          }}
        >
          <ChevronRightRoundedIcon />
        </IconButton>
      </Box>

      {/* النقاط (Pagination) */}
      <Box
        sx={{
          mt: 4,
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
        }}
      >
        {Array.from({ length: totalPages }).map((_, i) => (
          <ButtonBase
            key={i}
            onClick={() => scrollToPage(i)}
            aria-label={`الذهاب إلى الصفحة ${i + 1}`}
            sx={{
              width: i === page ? 24 : 12,
              height: 12,
              borderRadius: 6,
              bgcolor: i === page ? "primary.main" : "action.selected",
              opacity: i === page ? 1 : 0.5,
              transition: "all 0.3s ease",
              "&:hover": {
                opacity: 1,
                bgcolor: i === page ? "primary.dark" : "action.hover",
              },
            }}
          />
        ))}
      </Box>
    </Section>
  );
}
