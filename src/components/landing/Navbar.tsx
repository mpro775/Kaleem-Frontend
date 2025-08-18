// Navbar.tsx
import { AppBar, Toolbar, Box, Button, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png"; // تأكد من أن مسار الشعار صحيح

// تعريف واجهة للـ Props (على الرغم من أنها فارغة حاليًا، إلا أنها ممارسة جيدة)

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const navLinks: string[] = [
    "الرئيسية",
    "من نحن",
    "خدماتنا",
    "الباقات",
    "أعمالنا",
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: "#fff",
        border: "none",
        boxShadow: "none",
        px: { xs: 2, md: 6 },
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          p: "0 !important",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Kleem" style={{ width: "auto", height: 50 }} />
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
          {navLinks.map((label: string, i: number) => (
            <Button
              variant="outlined"
              key={label}
              sx={{
                backgroundColor: "#fff !important",
                color: "#563fa6 !important",
                border: "0px solid #563fa6 !important",
                fontWeight: "bold",
                boxShadow: "none !important",
                fontSize: "15px !important",
                backgroundImage: "none !important",
                "&::after": {
                  content: i === 0 ? '""' : "none",
                  position: "absolute",
                  bottom: -5,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "40%",
                  height: "3px",
                  backgroundColor: "#563fa6",
                  borderRadius: "2px",
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        {/* CTA Buttons */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            sx={{
              background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              px: 4,
              fontWeight: "bold",
              borderRadius: 1,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#4527a0",
              },
            }}
            onClick={() => navigate("/signup")}
          >
            اطلب الخدمة
          </Button>
          <Button
            variant="outlined"
            sx={{
              backgroundColor: "#fff !important",
              color: "#563fa6 !important",
              border: "1px solid #563fa6 !important",
              px: 3,
              fontWeight: "bold",
              boxShadow: "none !important",
              fontSize: "15px !important",
              backgroundImage: "none !important",
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "rgba(86, 63, 166, 0.04)",
                borderColor: "#563fa6",
              },
            }}
            onClick={() => navigate("/contact")}
          >
            تواصل معنا
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
