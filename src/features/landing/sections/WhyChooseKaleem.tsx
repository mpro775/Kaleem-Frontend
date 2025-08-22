// src/components/landing/WhyChooseKaleem.tsx
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  useMediaQuery,
  useTheme,
  ButtonBase,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import HubIcon from "@mui/icons-material/Hub";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import SecurityIcon from "@mui/icons-material/Security";
import StoreIcon from "@mui/icons-material/Store";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LanguageIcon from "@mui/icons-material/Language";
import { useEffect, useMemo, useRef, useState } from "react";

const features = [
  {
    icon: <AutoAwesomeIcon />,
    title: "ذكاء يفهم لهجتك",
    desc: "يرد على عملائك بشكل طبيعي ومخصص حتى باللهجات المحلية، مما يجعل تجربة التواصل أكثر قرباً وسلاسة...",
    gradient: "linear-gradient(90deg, #7E66AC, #502e91)",
  },
  {
    icon: <HubIcon />,
    title: "كل القنوات في مكان واحد",
    desc: "تحكم كامل في واتساب، تيليجرام، ودردشة الموقع من لوحة واحدة سهلة الاستخدام...",
    gradient: "linear-gradient(90deg, #7E66AC, #502e91)",
  },
  {
    icon: <ThumbUpAltIcon />,
    title: "ردود فورية مخصصة",
    desc: "كل عميل يحصل على رد يناسب سؤاله مباشرة بدون انتظار، بفضل الذكاء الاصطناعي...",
    gradient: "linear-gradient(90deg, #7E66AC, #502e91)",
  },
  {
    icon: <StoreIcon />,
    title: "ربط متجرك بسهولة",
    desc: "يدعم جميع المنصات الكبرى — سلة، زد، وغيرها — مع خطوات ربط سهلة وسريعة...",
    gradient: "linear-gradient(90deg, #7E66AC, #502e91)",
  },
  {
    icon: <SecurityIcon />,
    title: "أمان وخصوصية",
    desc: "بياناتك وبيانات عملائك بأمان تام، وتحكم كامل لك في جميع الإعدادات والصلاحيات...",
    gradient: "linear-gradient(90deg, #7E66AC, #502e91)",
  },
  {
    icon: <QueryStatsIcon />,
    title: "تحليلات وتقارير فورية",
    desc: "اكتشف أسئلة واهتمامات عملائك ونمِّ مبيعاتك من خلال تقارير وتحليلات فورية...",
    gradient: "linear-gradient(90deg, #7E66AC, #502e91)",
  },
  {
    icon: <AccessTimeIcon />,
    title: "توفر دائم 24/7",
    desc: "كليم يعمل ليل نهار لخدمة عملائك وزيادة مبيعاتك دون توقف...",
    gradient: "linear-gradient(90deg, #7E66AC, #502e91)",
  },
  {
    icon: <LanguageIcon />,
    title: "واجهة عربية سهلة",
    desc: "لوحة تحكم واضحة ودعم كامل للغة العربية، لتتمكن من إدارة جميع مهامك بسهولة...",
    gradient: "linear-gradient(90deg, #7E66AC, #502e91)",
  },
];

export default function WhyChooseKaleem() {
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
    const calculated = Math.ceil(features.length / perView);
    return Math.max(1, calculated);
  }, [perView, features.length]);

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
    <Box sx={{ my: 8, px: 2, backgroundColor: "#fff" }} dir="rtl">
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
        color="primary.dark"
        mb={4}
      >
        لماذا كليم؟
      </Typography>

      {/* حاوية السلايدر: نجعل المسار LTR لتبسيط الاتجاه، والمحتوى يبقى RTL */}
      <Box
        sx={{
          position: "relative",
          mx: { xs: -2, sm: "auto" },
          maxWidth: 1400,
          px: { xs: 0, sm: 2 },
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
              "linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))",
          },
          "&::after": {
            right: 0,
            background:
              "linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))",
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
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            gap: { xs: 8, sm: 16 },
            px: { xs: 2, sm: 2 },
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          {/* العنصر (الكارت) */}
          {features.map((feature, i) => (
            <Box
              key={i}
              sx={{
                flex: "0 0 auto",
                // عرض الكارت بحسب perView مع هوامش
                width: {
                  xs: "calc(100% - 16px)",
                  sm: `calc(50% - 20px)`,
                  md: `calc(25% - 24px)`,
                },
                mx: { xs: 1, sm: 1 },
                my: 1,
                scrollSnapAlign: "center",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                },
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  minHeight: 220,
                  position: "relative",
                  borderRadius: "20px",
                  p: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  transition: "all 0.3s ease",
                  overflow: "visible",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                    borderColor: "primary.light",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "10px",
                    background: feature.gradient,
                    borderTopLeftRadius: "100px",
                    borderTopRightRadius: "100px",
                  },
                }}
              >
                <CardContent sx={{ p: "0 !important" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "12px",
                        background: feature.gradient,
                        color: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        flexShrink: 0,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="primary.dark"
                      sx={{ mb: 0 }}
                    >
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    fontSize={16}
                    fontWeight={400}
                    lineHeight={1.7}
                    sx={{ textAlign: "center" }}
                  >
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
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
    </Box>
  );
}
