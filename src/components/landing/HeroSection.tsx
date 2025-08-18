// HeroSection.tsx
import React from "react"; // يجب استيراد React لتعريف المكونات
import { Box, Button, Container, Typography } from "@mui/material";
import heroImage from "../../assets/hero-image.png"; // استبدل هذا بمسار الصورة الصحيح
import { motion } from "framer-motion"; // 1. استيراد motion
import bgShape from "../../assets/Vector.png";
import bgShape2 from "../../assets/Vector2.png";
import { useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
// تعريف واجهة للـ Props

const HeroSection: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        position: "relative",
        backgroundColor: "#fff",
        py: { xs: 6, md: 10 },
        overflow: "hidden",

        minHeight: "100vh",
      }}
    >
      {/* زخارف الخلفية */}
      <Box
        component="img"
        src={bgShape}
        alt="خلفية زخرفية"
        sx={{
          position: "absolute",
          top: { xs: -60, md: -80 },
          left: { xs: -60, md: -80 },
          width: { xs: 160, md: 300 },
          height: "auto",
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
      <Box
        component="img"
        src={bgShape}
        alt="خلفية زخرفية"
        sx={{
          position: "absolute",
          bottom: { xs: -80, md: -100 },
          right: { xs: -60, md: -100 },
          width: { xs: 200, md: 400 },
          height: "auto",
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          transform: "rotate(180deg)",
        }}
      />
      <Box
        component="img"
        src={bgShape2}
        alt="زخرفة مربع حوار"
        sx={{
          position: "absolute",
          top: "30%",
          left: "20%",
          width: 80,
          height: "auto",
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          transform: "rotate(15deg)",
        }}
      />
      <Box
        component="img"
        src={bgShape}
        alt="زخرفة مربع حوار"
        sx={{
          position: "absolute",
          bottom: "25%",
          right: "15%",
          width: 110,
          height: "auto",
          opacity: 0.16,
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          transform: "rotate(-10deg)",
        }}
      />

      <Container sx={{ position: "relative", zIndex: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 4, md: 8 },
            alignItems: "center",
          }}
        >
          {/* Text Content */}
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: "bold",
                color: "#563fa6",
                textAlign: "left",
                fontSize: { xs: "2.5rem", md: "2.5rem" },
                lineHeight: 1.3,
              }}
            >
              دع كليم يرد على عملائك...
              <Box component="span" sx={{ color: "#563fa6" }}>
                خلال ثوانٍ
              </Box>
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                my: 3,
                maxWidth: { xs: "100%", md: "450px" },
                mx: { xs: "auto", md: "0" },
                textAlign: "left",
              }}
            >
              بسط التواصل، وخلّي المساعد الذكي يشرح منتجاتك، يرد على الأسئلة،
              ويقترح الأفضل تلقائيًا.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/signup")}
              sx={{
                background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                px: 5,
                fontWeight: "bold",
                boxShadow: "none",
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "#4527a0",
                },
              }}
            >
              أبدأ مع كليم الآن مجاناً
            </Button>
          </Box>

          {/* Image Container */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              minHeight: { xs: 300, md: 450 },
            }}
          >
            {/* 2. تحويل عنصر الصورة إلى motion.img */}
            <motion.img
              src={heroImage}
              alt="Kaleem Assistant"
              style={{
                maxWidth: "100%",
                height: "auto",
                position: "relative",
                zIndex: 2,
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
