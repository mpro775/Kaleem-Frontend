// src/components/landing/TestimonialsSection.tsx
import {
  Box,
  Typography,
  ButtonBase,
  useTheme,
  IconButton,
} from "@mui/material";

import { useCallback } from "react";
import { TestimonialCard } from "../ui/TestimonialCard";
import { testimonials } from "../data/testimonialsData";
import { useCarousel } from "../hooks/useCarousel";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";




export default function TestimonialsSection() {
  const theme = useTheme();

  // 1. كل ما نحتاجه يأتي من هذا الخطاف فقط. لا يوجد state أو refs إضافية.
  const {
    emblaRef,
    emblaApi,
    scrollSnaps,
    selectedIndex,
    scrollTo,
    scrollPrev,
    scrollNext,
  } = useCarousel({
    emblaOptions: { loop: true, align: "center" },
    autoplayOptions: { delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true },
  });

  // 2. دالة حساب التأثير بقيت كما هي لأنها تعتمد على emblaApi الصحيح
  const getTweenValues = useCallback((emblaApi: any) => {
    if (!emblaApi) return [];
    const scrollSnapList = emblaApi.scrollSnapList();
    return scrollSnapList.map((scrollSnap: number) => {
      const diffToTarget = scrollSnap - emblaApi.scrollProgress();
      const tweenFactor = 1 - Math.abs(diffToTarget);
      return Math.max(0, tweenFactor);
    });
  }, []);

  const tweenValues = getTweenValues(emblaApi);

  return (
    <Box
    id="testimonials"
    sx={{
      py: 12,
      px: { xs: 0, md: 3 }, // تعديل بسيط لإعطاء مساحة للأطراف
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      position: "relative",
      overflow: "hidden",
    }}
    dir="rtl"
  >
      {/* زخارف */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(0, 180, 216, 0.05)",
          filter: "blur(60px)",
          transform: "translate(50%, -50%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(0, 119, 182, 0.05)",
          filter: "blur(70px)",
          transform: "translate(-50%, 50%)",
        }}
      />

      {/* العنوان */}
      <Typography
        variant="h4"
        align="center"
        sx={{
          fontWeight: "bold",
          color: theme.palette.primary.dark,
          mb: 1.5,
          fontSize: { xs: "1.8rem", md: "2.4rem" },
          position: "relative",
          display: "inline-block",
          left: "50%",
          transform: "translateX(-50%)",
          "&:after": {
            content: '""',
            position: "absolute",
            bottom: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 80,
            height: 4,
            background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
            borderRadius: 2,
          },
        }}
      >
        آراء عملائنا
      </Typography>

      <Typography
        variant="body1"
        align="center"
        sx={{
          color: theme.palette.text.secondary,
          maxWidth: 700,
          mx: "auto",
          mb: 5,
        }}
      >
        انظر ماذا يقول عملاؤنا عن تجربتهم مع Kaleem
      </Typography>

  {/* السلايدر */}
  <Box sx={{ position: "relative", mx: "auto", maxWidth: 1400 }}>
        {/* 3. حاوية Embla الرئيسية */}
        <Box className="embla" ref={emblaRef} sx={{ overflow: "hidden" }}>
          <Box sx={{ display: "flex", direction: "rtl" }}>
            {testimonials.map((item, i) => (
              <Box
                key={i}
                sx={{
                  flex: "0 0 85%", // تعديل بسيط لترك مساحة جانبية
                  sm: "0 0 48%",
                  md: "0 0 32%",
                  pl: { xs: 1, sm: 2 }, // استخدام padding بدلاً من gap
                }}
              >
                <TestimonialCard
                  testimonial={item}
                  scale={tweenValues[i] * 0.1 + 0.9}
                  opacity={tweenValues[i] * 0.5 + 0.5}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* 4. أزرار التحكم تستخدم دوال الخطاف مباشرة */}
        <IconButton onClick={scrollPrev} sx={{ position: "absolute", top: "50%", left: 8, /* ... */ }}>
          <ChevronLeftRoundedIcon />
        </IconButton>
        <IconButton onClick={scrollNext} sx={{ position: "absolute", top: "50%", right: 8, /* ... */ }}>
          <ChevronRightRoundedIcon />
        </IconButton>
      </Box>

      {/* 5. النقاط (Pagination) تستخدم selectedIndex و scrollTo */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 1.5 }}>
        {scrollSnaps.map((_, i) => (
          <ButtonBase
            key={i}
            onClick={() => scrollTo(i)}
            sx={{
              width: i === selectedIndex ? 24 : 12,
              height: 12,
              borderRadius: 6,
              bgcolor: i === selectedIndex ? "primary.main" : "divider",
              transition: "all .3s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
