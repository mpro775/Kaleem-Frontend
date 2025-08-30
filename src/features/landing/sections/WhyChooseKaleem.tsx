// src/components/landing/WhyChooseKaleem.tsx
import { useEffect, useRef } from "react";
import { Box, Typography, IconButton, ButtonBase } from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useFeatureCarousel } from "@/features/landing/hooks/useFeatureCarousel";
import { FeatureCard } from "@/features/landing/ui/FeatureCard";
import { features } from "@/features/landing/data/featuresData"; // افترضنا أنك نقلت بيانات الميزات لملف منفصل

gsap.registerPlugin(ScrollTrigger);

export default function WhyChooseKaleem() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const {
    emblaRef,
    scrollSnaps,
    selectedIndex,
    scrollTo,
    scrollPrev,
    scrollNext,
  } = useFeatureCarousel();

  // حركة الدخول للقسم بالكامل
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      const titleElement = sectionRef.current?.querySelector(".section-title");
      const emblaElement = sectionRef.current?.querySelector(".embla");
      
      if (titleElement) {
        tl.from(titleElement, {
          opacity: 0,
          y: -50,
          duration: 0.8,
          ease: "power3.out",
        });
      }
      
      if (emblaElement) {
        tl.from(emblaElement, 
          { opacity: 0, y: 50, duration: 1, ease: "power3.out" },
          "-=0.5"
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <Box
      ref={sectionRef}
      id="features"
      sx={{ my: 8, py: 6, backgroundColor: "#f9fafb" }}
      dir="rtl"
    >
      <Typography
        className="section-title"
        variant="h4"
        fontWeight="bold"
        align="center"
        color="primary.dark"
        mb={5}
      >
        لماذا كليم؟
      </Typography>

      <Box
        className="embla"
        sx={{ position: "relative", maxWidth: 1200, mx: "auto" }}
      >
        <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
          <Box
            sx={{ display: "flex", gap: { xs: 2, sm: 3 }, direction: "rtl" }}
          >
            {features.map((feature, i) => (
              <Box
                key={i}
                sx={{ flex: { xs: "0 0 90%", sm: "0 0 48%", md: "0 0 23.5%" } }}
              >
                <FeatureCard feature={feature} />
              </Box>
            ))}
          </Box>
        </Box>

        {/* أزرار التحكم */}
        <IconButton
          onClick={scrollPrev}
          sx={{
            position: "absolute",
            top: "50%",
            left: -10,
            transform: "translateY(-50%)",
            zIndex: 1 /* ... styles */,
          }}
        >
          <ChevronLeftRoundedIcon />
        </IconButton>
        <IconButton
          onClick={scrollNext}
          sx={{
            position: "absolute",
            top: "50%",
            right: -10,
            transform: "translateY(-50%)",
            zIndex: 1 /* ... styles */,
          }}
        >
          <ChevronRightRoundedIcon />
        </IconButton>

        {/* نقاط التنقل */}
        <Box
          sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 4 }}
        >
          {scrollSnaps.map((_, i) => (
            <ButtonBase
              key={i}
              onClick={() => scrollTo(i)}
              sx={{
                width: i === selectedIndex ? 24 : 12,
                height: 12,
                borderRadius: 6,
                bgcolor:
                  i === selectedIndex ? "primary.main" : "action.selected",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
