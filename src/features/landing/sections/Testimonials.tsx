// src/components/landing/TestimonialsSection.tsx
import {
  Box,
  Typography,
  Avatar,
  Paper,
  IconButton,
  ButtonBase,
  useTheme,
  useMediaQuery,
  styled,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import StarIcon from "@mui/icons-material/Star";
import { useEffect, useMemo, useRef, useState } from "react";

const testimonials = [
  {
    name: "متجر عطور الوسام",
    role: "صاحب متجر",
    comment:
      "من أول يوم ارتفعت نسبة الردود والطلبات! MusaidBot فعلاً وفّر علي وقت وجهد كبير.",
    rating: 5,
    date: "15 يناير 2023",
  },
  {
    name: "متجر نون للجمال",
    role: "مالكة متجر",
    comment:
      "كنت أرد بنفسي على كل رسالة، الآن كل شيء تلقائي وباحترافية. تجربة ممتازة.",
    rating: 4,
    date: "2 مارس 2023",
  },
  {
    name: "متجر التقنية أولاً",
    role: "مدير العمليات",
    comment: "تكامل البوت مع WhatsApp سلس جدًا، وفريق الدعم رائع. أنصح فيه.",
    rating: 5,
    date: "28 مايو 2023",
  },
  // يمكنك إضافة المزيد هنا...
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: 16,
  "&:before": {
    content: '"“"',
    position: "absolute",
    top: 12,
    left: 16,
    fontSize: "120px",
    color: theme.palette.primary.light,
    opacity: 0.08,
    fontFamily: "serif",
    lineHeight: 1,
    pointerEvents: "none",
  },
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  },
}));

export default function TestimonialsSection() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md")); // ≥ md -> 4
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm")); // ≥ sm -> 2، غير ذلك 1
  const perView = isMdUp ? 4 : isSmUp ? 2 : 1;

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(testimonials.length / perView)),
    [perView]
  );

  // احفظ الصفحة ضمن الحدود عند تغير المقاس
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  // --- الانتقال إلى صفحة باستخدام offsetLeft لأول عنصر في الصفحة ---
  const scrollToPage = (p: number) => {
    const el = trackRef.current;
    if (!el) return;

    const newPage = Math.max(0, Math.min(p, totalPages - 1));
    const firstIndex = newPage * perView;
    const child = el.children.item(firstIndex) as HTMLElement | null;
    const left = child ? child.offsetLeft : newPage * el.clientWidth;

    el.scrollTo({ left, behavior: "smooth" });
    setPage(newPage);
  };

  const next = () => scrollToPage((page + 1) % totalPages);
  const prev = () => scrollToPage(page === 0 ? totalPages - 1 : page - 1);

  // --- مزامنة المؤشر عند السحب اليدوي (أقرب صفحة لأول عنصر) ---
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;

    // مواضع أول عنصر في كل صفحة
    const firsts: number[] = [];
    for (let p = 0; p < totalPages; p++) {
      const idx = p * perView;
      const child = el.children.item(idx) as HTMLElement | null;
      firsts.push(child ? child.offsetLeft : p * el.clientWidth);
    }

    const x = el.scrollLeft;
    let nearest = 0;
    let best = Infinity;
    for (let p = 0; p < firsts.length; p++) {
      const d = Math.abs(firsts[p] - x);
      if (d < best) {
        best = d;
        nearest = p;
      }
    }

    if (nearest !== page) {
      setPage(nearest);
    }
  };

  // ===== Autoplay =====
  const startAuto = () => {
    stopAuto();
    intervalRef.current = setInterval(() => {
      next();
    }, 4000);
  };
  const stopAuto = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAuto();
    return stopAuto;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, perView]);

  // إيقاف/استئناف عند تفاعل المستخدم
  const handleMouseEnter = () => stopAuto();
  const handleMouseLeave = () => startAuto();
  const handleTouchStart = () => stopAuto();
  const handleTouchEnd = () => startAuto();

  return (
    <Box
      id="testimonials"
      sx={{
        py: 12,
        px: { xs: 2, md: 3 },
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
        انظر ماذا يقول عملاؤنا عن تجربتهم مع MusaidBot
      </Typography>

      {/* السلايدر */}
      <Box
        sx={{ position: "relative", mx: "auto", maxWidth: 1400 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* المسار: LTR لسهولة الحساب */}
        <Box
          ref={trackRef}
          onScroll={onScroll}
          dir="ltr"
          sx={{
            display: "flex",
            overflowX: "auto",
            // فعّل snap فقط عند perView = 1
            scrollSnapType: perView === 1 ? "x mandatory" : "none",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            gap: { xs: 4, sm: 8, md: 16 },
            px: { xs: 1, sm: 2 },
            // يساعد snap على احترام البادينغ
            scrollPaddingInline: { xs: 8, sm: 16 },
            maxWidth: "100%",
            width: "100%",
          }}
        >
          {testimonials.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                flex: "0 0 auto",
                width: {
                  xs: "calc(100% - 8px)", // perView = 1
                  sm: "calc((100% - 8px) / 2)", // perView = 2, gap = 8
                  md: "calc((100% - 3 * 16px) / 4)", // perView = 4, gap = 16
                },
                minWidth: { xs: 280, sm: 200, md: 250 },
                // snap فقط للجوال
                scrollSnapAlign: perView === 1 ? "start" : "unset",
              }}
            >
              <StyledPaper
                sx={{
                  p: { xs: 3, md: 4 },
                  boxShadow:
                    "0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.04)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "box-shadow .25s ease, transform .25s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.24)",
                  },
                }}
              >
                {/* التقييم */}
                <Box sx={{ mb: 2, display: "flex" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      sx={{
                        color:
                          i < item.rating
                            ? theme.palette.warning.main
                            : theme.palette.grey[300],
                        fontSize: 20,
                      }}
                    />
                  ))}
                </Box>

                {/* التعليق */}
                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    lineHeight: 1.9,
                    fontSize: "1.05rem",
                    color: theme.palette.text.primary,
                  }}
                >
                  {item.comment}
                </Typography>

                {/* الشخص */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mt: "auto",
                    gap: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 56,
                      height: 56,
                      fontSize: "1.5rem",
                      flexShrink: 0,
                    }}
                  >
                    {item.name[0]}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {item.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      {item.role}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.disabled"
                    >
                      {item.date}
                    </Typography>
                  </Box>
                </Box>
              </StyledPaper>
            </Box>
          ))}
        </Box>

        {/* أزرار التنقل */}
        <IconButton
          aria-label="السابق"
          onClick={prev}
          sx={{
            position: "absolute",
            top: "50%",
            left: 8,
            transform: "translateY(-50%)",
            zIndex: 3,
            bgcolor: "background.paper",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            "&:hover": { bgcolor: "background.paper" },
          }}
        >
          <ChevronLeftRoundedIcon />
        </IconButton>
        <IconButton
          aria-label="التالي"
          onClick={next}
          sx={{
            position: "absolute",
            top: "50%",
            right: 8,
            transform: "translateY(-50%)",
            zIndex: 3,
            bgcolor: "background.paper",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            "&:hover": { bgcolor: "background.paper" },
          }}
        >
          <ChevronRightRoundedIcon />
        </IconButton>
      </Box>

      {/* النقاط (Pagination) */}
      <Box
        sx={{
          mt: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        {Array.from({ length: totalPages }).map((_, i) => (
          <ButtonBase
            key={i}
            onClick={() => scrollToPage(i)}
            aria-label={`الذهاب إلى الصفحة ${i + 1}`}
            sx={{
              width: i === page ? 22 : 10,
              height: 10,
              borderRadius: 999,
              bgcolor: i === page ? "primary.main" : "divider",
              transition: "all .25s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
