// src/components/landing/IntegrationsSection.tsx
import { useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  ButtonBase,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useCarousel } from "@/features/landing/hooks/useCarousel";
import { IntegrationCard } from "@/features/landing/ui/IntegrationCard";
import { items } from "@/features/landing/data/integrationsData";

gsap.registerPlugin(ScrollTrigger);

export default function IntegrationsSection() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const slidesPerView = isMdUp ? 4 : isSmUp ? 2 : 1;

  const sectionRef = useRef<HTMLDivElement>(null);
  const {
    emblaRef,
    emblaApi,
    scrollSnaps,
    selectedIndex,
    scrollTo,
    scrollPrev,
    scrollNext,
  } = useCarousel({
    emblaOptions: { loop: true, slidesToScroll: slidesPerView, align: "start" },
    autoplayOptions: { delay: 6000, stopOnInteraction: true },
  });

  // أنميشن الدخول للقسم والبطاقات
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
      const titleElement = sectionRef.current?.querySelector(".integrations-title");
      
      if (titleElement) {
        tl.from(titleElement, {
          opacity: 0,
          y: -50,
          duration: 0.8,
          ease: "power3.out",
        }).from(
          gsap.utils.toArray(".integration-card-item"),
          {
            opacity: 0,
            y: 50,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.15, // التأثير المتتالي الرائع!
          },
          "-=0.5"
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <Box ref={sectionRef} id="integrations" sx={{ py: 8, bgcolor: "grey.50" }}>
      <Typography
        className="integrations-title"
        variant="h4"
        fontWeight="bold"
        align="center"
        color="primary.dark"
        mb={6}
      >
        تكاملات تمنحك القوة
      </Typography>

      <Box sx={{ position: "relative", maxWidth: 1200, mx: "auto" }}>
        <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
          <Box
            sx={{ display: "flex", direction: "rtl", gap: { xs: 2, sm: 3 } }}
          >
            {items.map((item, i) => (
              <Box
                key={i}
                className="integration-card-item"
                sx={{
                  flex: {
                    xs: "0 0 90%",
                    sm: "0 0 48%",
                    md: `0 0 calc(${100 / slidesPerView}% - ${
                      (3 * (slidesPerView - 1)) / slidesPerView
                    }px)`,
                  },
                }}
              >
                <IntegrationCard item={item} />
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
            left: { xs: -10, sm: -20 } /* ... */,
          }}
        >
          <ChevronLeftRoundedIcon />
        </IconButton>
        <IconButton
          onClick={scrollNext}
          sx={{
            position: "absolute",
            top: "50%",
            right: { xs: -10, sm: -20 } /* ... */,
          }}
        >
          <ChevronRightRoundedIcon />
        </IconButton>
      </Box>

      {/* نقاط التنقل */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 4 }}>
        {scrollSnaps.map((_, i) => (
          <ButtonBase
            key={i}
            onClick={() => scrollTo(i)}
            sx={{
              width: i === selectedIndex ? 24 : 12,
              height: 12,
              borderRadius: 6,
              bgcolor: i === selectedIndex ? "primary.main" : "action.selected",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
