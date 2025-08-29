// src/components/landing/Footer.tsx
import {
  Box,
  Container,
  Typography,
  Link as MLink,
  IconButton,
  TextField,
  Button,
  Divider,
  Tooltip,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import { useLocation, useNavigate } from "react-router-dom";

type FooterLink = { label: string; href: string; external?: boolean };

const FooterRoot = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(6),
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%), radial-gradient(1000px 600px at 80% -10%, rgba(255,133,0,0.08), transparent 50%)"
      : "linear-gradient(180deg, #ffffff, #f8fafc), radial-gradient(1000px 600px at 80% -10%, rgba(255,133,0,0.10), transparent 50%)",
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const FooterA = styled(MLink)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 6,
  color: theme.palette.text.secondary,
  textDecoration: "none",
  padding: "6px 0",
  transition: "color .2s ease, transform .2s ease",
  "&:hover": {
    color: theme.palette.text.primary,
    transform: "translateX(-2px)",
  },
}));

export default function Footer({ brand = "كليم" }: { brand?: string }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const year = new Date().getFullYear();

  const primaryNav: FooterLink[] = [
    { label: "الميزات", href: "#features" },
    { label: "التكاملات", href: "#integrations" },
    { label: "الأسعار", href: "#pricing" },
    { label: "جرّبه الآن", href: "#cta" },
  ];

  const secondaryNav: FooterLink[] = [
    { label: "التوثيق", href: "/docs", external: false },
    { label: "الأسئلة الشائعة", href: "#faq" },
    { label: "عنّا", href: "/about" },
    { label: "اتصل بنا", href: "/contact" },
  ];

  const legal: FooterLink[] = [
    { label: "سياسة الخصوصية", href: "/privacy" },
    { label: "الشروط والأحكام", href: "/terms" },
  ];

  const handleLink = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (href.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/" + href);
        setTimeout(() => {
          const id = href.replace("#", "");
          document
            .getElementById(id)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
      } else {
        document
          .getElementById(href.replace("#", ""))
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    navigate(href);
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <FooterRoot dir="rtl">
      <Container maxWidth="lg" sx={{ px: 2 }}>
        {/* شبكة عليا */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1.5fr" },
            gap: { xs: 3, md: 4 },
            alignItems: "flex-start",
            mb: 4,
          }}
        >
          {/* البراند */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
              {brand}
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.9, mb: 2 }}>
              {brand} — مساعد متاجر ذكي بالعربية لزيادة مبيعاتك عبر القنوات
              المختلفة، مع تجربة سلسة وسريعة الانطلاق.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="X / Twitter">
                <IconButton
                  size="small"
                  component="a"
                  href="#"
                  target="_blank"
                  rel="noopener"
                >
                  <TwitterIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Instagram">
                <IconButton
                  size="small"
                  component="a"
                  href="#"
                  target="_blank"
                  rel="noopener"
                >
                  <InstagramIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="WhatsApp">
                <IconButton
                  size="small"
                  component="a"
                  href="#"
                  target="_blank"
                  rel="noopener"
                >
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Telegram">
                <IconButton
                  size="small"
                  component="a"
                  href="#"
                  target="_blank"
                  rel="noopener"
                >
                  <TelegramIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="البريد">
                <IconButton
                  size="small"
                  component="a"
                  href="mailto:hello@kleem.store"
                >
                  <MailOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* روابط أساسية */}
          <Box component="nav" aria-label="روابط المنتج">
            <Typography sx={{ fontWeight: 800, mb: 2, letterSpacing: 0.2 }}>
              المنتج
            </Typography>
            {primaryNav.map((l) => (
              <FooterA key={l.label} href={l.href} onClick={handleLink(l.href)}>
                {l.label}
                {!l.href.startsWith("#") && l.external && (
                  <LaunchRoundedIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                )}
              </FooterA>
            ))}
          </Box>

          {/* روابط ثانوية */}
          <Box component="nav" aria-label="مزيد من الروابط">
            <Typography sx={{ fontWeight: 800, mb: 2, letterSpacing: 0.2 }}>
              المزيد
            </Typography>
            {secondaryNav.map((l) => (
              <FooterA
                key={l.label}
                href={l.href}
                onClick={handleLink(l.href)}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener" : undefined}
              >
                {l.label}
                {l.external && (
                  <LaunchRoundedIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                )}
              </FooterA>
            ))}
          </Box>

       
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* شريط سفلي */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mt: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {legal.map((l) => (
              <FooterA key={l.label} href={l.href} onClick={handleLink(l.href)}>
                {l.label}
              </FooterA>
            ))}
          </Box>

          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ order: { xs: 3, md: 2 } }}
          >
            © {year} {brand}. جميع الحقوق محفوظة.
          </Typography>

          <Tooltip title="العودة للأعلى">
            <IconButton
              aria-label="للأعلى"
              onClick={scrollTop}
              sx={{
                order: { xs: 2, md: 3 },
                bgcolor: "background.paper",
                border: (t) => `1px solid ${t.palette.divider}`,
              }}
            >
              <KeyboardArrowUpRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Container>
    </FooterRoot>
  );
}
