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
  Chip,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import { useMemo } from "react";

type FooterLink = { label: string; href: string; external?: boolean };

const FooterRoot = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(4),
  background:
    theme.palette.mode === "dark"
      ? "radial-gradient(1000px 600px at 80% -10%, rgba(255,133,0,0.08), transparent 50%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent)"
      : "radial-gradient(1000px 600px at 80% -10%, rgba(255,133,0,0.10), transparent 50%), linear-gradient(180deg, #ffffff, #f8fafc)",
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  marginBottom: theme.spacing(2),
  letterSpacing: 0.2,
  fontSize: "1.05rem",
}));

const Column = styled(Box)(({ theme }) => ({
  flex: "1 1 220px",
  minWidth: 220,
  maxWidth: 360,
  padding: theme.spacing(1),
}));

const FooterA = styled(MLink)(({ theme }) => ({
  display: "inline-flex",
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
  const year = new Date().getFullYear();

  // روابط الأعمدة
  const product: FooterLink[] = useMemo(
    () => [
      { label: "الميزات", href: "#features" },
      { label: "التكاملات", href: "#integrations" },
      { label: "المتجر المصغّر", href: "#storefront" },
      { label: "الأسعار", href: "#pricing" },
      { label: "جرّبه الآن", href: "#cta" },
    ],
    []
  );

  const resources: FooterLink[] = useMemo(
    () => [
      { label: "التوثيق", href: "/docs" },
      { label: "مركز المساعدة", href: "/help" },
      { label: "الأسئلة الشائعة", href: "#faq" },
      { label: "حالة النظام", href: "/status", external: true },
    ],
    []
  );

  const company: FooterLink[] = useMemo(
    () => [
      { label: "عنّا", href: "/about" },
      { label: "اتصل بنا", href: "/contact" },
      { label: "الشراكات", href: "/partners" },
      { label: "الوظائف", href: "/careers" },
    ],
    []
  );

  const legal: FooterLink[] = useMemo(
    () => [
      { label: "سياسة الخصوصية", href: "/privacy" },
      { label: "الشروط والأحكام", href: "/terms" },
      { label: "سياسة الاستخدام", href: "/acceptable-use" },
    ],
    []
  );

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <FooterRoot dir="rtl">
      <Container maxWidth="lg" sx={{ px: 2 }}>
        {/* الصف العلوي: نبذة + أعمدة روابط + نشرة بريدية */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          {/* العمود: البراند + سوشال + شِب */}
          <Column sx={{ maxWidth: 420 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              {/* لو عندك شعار صورة، استبدل النص التالي بـ <Box component="img" src="/assets/logo.svg" sx={{ height: 28 }} /> */}
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {brand}
              </Typography>
              <Chip
                label="Beta"
                size="small"
                color="default"
                sx={{ fontWeight: 700, letterSpacing: 0.4 }}
              />
            </Box>
            <Typography color="text.secondary" sx={{ lineHeight: 1.9, mb: 2 }}>
              {brand} — مساعد متاجر ذكي بالعربية: يرد ويبيع عبر
              واتساب، تيليجرام، والويب، ويمكّنك من بدء البيع فورًا عبر
              <MLink href="#storefront" sx={{ mx: 0.5 }}>
                المتجر المصغّر
              </MLink>
              حتى بدون سلة/زد.
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
                <IconButton size="small" component="a" href="#" target="_blank" rel="noopener">
                  <InstagramIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="WhatsApp">
                <IconButton size="small" component="a" href="#" target="_blank" rel="noopener">
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Telegram">
                <IconButton size="small" component="a" href="#" target="_blank" rel="noopener">
                  <TelegramIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="البريد">
                <IconButton size="small" component="a" href="mailto:hello@kleem.store">
                  <MailOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1.5, color: "text.secondary" }}>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 18, opacity: 0.8 }} />
                <Typography variant="caption">منطقة الشرق الأوسط</Typography>
              </Box>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                <PhoneInTalkOutlinedIcon sx={{ fontSize: 18, opacity: 0.8 }} />
                <Typography variant="caption">+966-0000-0000</Typography>
              </Box>
            </Box>
          </Column>

          {/* أعمدة الروابط */}
          <Column>
            <SectionTitle>المنتج</SectionTitle>
            {product.map((l) => (
              <FooterA key={l.label} href={l.href}>
                {l.label}
                {!l.href.startsWith("#") && l.external && (
                  <LaunchRoundedIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                )}
              </FooterA>
            ))}
          </Column>

          <Column>
            <SectionTitle>الموارد</SectionTitle>
            {resources.map((l) => (
              <FooterA
                key={l.label}
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener" : undefined}
              >
                {l.label}
                {l.external && <LaunchRoundedIcon sx={{ fontSize: 14, opacity: 0.6 }} />}
              </FooterA>
            ))}
          </Column>

          <Column>
            <SectionTitle>الشركة</SectionTitle>
            {company.map((l) => (
              <FooterA key={l.label} href={l.href}>
                {l.label}
              </FooterA>
            ))}
          </Column>

          <Column>
            <SectionTitle>النشرة البريدية</SectionTitle>
            <Typography color="text.secondary" sx={{ mb: 1.5 }}>
              نصائح ومزايا جديدة — رسالة واحدة بالشهر.
            </Typography>
            <Box
              component="form"
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" });
              }}
              sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
            >
              <TextField
                size="small"
                type="email"
                placeholder="بريدك الإلكتروني"
                sx={{ flex: "1 1 200px", minWidth: 220 }}
              />
              <Button variant="contained" type="submit">
                اشترك
              </Button>
            </Box>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: "block" }}>
              بالاشتراك أنت توافق على{" "}
              <MLink href="/privacy">سياسة الخصوصية</MLink>.
            </Typography>
          </Column>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* الصف السفلي: قانوني + حقوق + زر للأعلى */}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            {legal.map((l) => (
              <FooterA key={l.label} href={l.href}>
                {l.label}
              </FooterA>
            ))}
          </Box>

          <Typography variant="caption" color="text.disabled" sx={{ order: { xs: 3, md: 2 } }}>
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
