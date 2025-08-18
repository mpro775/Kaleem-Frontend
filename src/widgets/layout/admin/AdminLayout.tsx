// src/pages/admin/AdminLayout.tsx
import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Divider,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Breadcrumbs,
  Stack,
  Badge,
} from "@mui/material";
import { styled, useTheme, type Theme, alpha } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ForumIcon from "@mui/icons-material/Forum";
import TuneIcon from "@mui/icons-material/Tune";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import HelpIcon from "@mui/icons-material/Help";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

// --- Config ---
const NAV_WIDTH = 280;
const NAV_MINI = 72;
const APPBAR_HEIGHT = 72;

// --- Navigation Items with Arabic labels and descriptions ---
interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { 
    to: "/admin", 
    label: "لوحة التحكم", 
    icon: <DashboardIcon />,
    description: "نظرة عامة على النظام"
  },
  {
    to: "/admin/kleem/prompts",
    label: "البرومبتات",
    icon: <TextSnippetIcon />,
    description: "إدارة قوالب المحادثة"
  },
  {
    to: "/admin/kleem/knowledge-base",
    label: "قاعدة المعرفة",
    icon: <MenuBookIcon />,
    description: "مكتبة المعلومات والأسئلة"
  },
  { 
    to: "/admin/kleem/conversations", 
    label: "المحادثات", 
    icon: <ForumIcon />,
    description: "إدارة المحادثات الجارية"
  },
  {
    to: "/admin/kleem/chat-settings",
    label: "إعدادات المحادثة",
    icon: <TuneIcon />,
    description: "تخصيص واجهة المحادثة"
  },
  {
    to: "/admin/kleem/ratings",
    label: "التقييمات",
    icon: <ThumbUpIcon />,
    description: "مراجعة تقييمات العملاء"
  },
  {
    to: "/admin/kleem/analytics",
    label: "التحليلات",
    icon: <QueryStatsIcon />,
    description: "إحصائيات وتقارير مفصلة"
  },
  {
    to: "/admin/kleem/missing-responses",
    label: "الإجابات المفقودة",
    icon: <HelpIcon />,
    description: "أسئلة تحتاج لإجابات",
    badge: 5
  },
  { 
    to: "/admin/kleem/settings", 
    label: "الإعدادات", 
    icon: <SettingsIcon />,
    description: "إعدادات النظام العامة"
  },
];

// --- Enhanced styled components ---
const DrawerPaper = styled("div", {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  width: open ? NAV_WIDTH : NAV_MINI,
  transition: theme.transitions.create(["width", "box-shadow"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
  boxSizing: "border-box",
  overflowX: "hidden",
  borderLeft: `1px solid ${theme.palette.divider}`,
  height: "100%",
  background: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.9)
    : theme.palette.background.paper,
  backdropFilter: "blur(10px)",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 100%)`,
    pointerEvents: "none",
  },
}));

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => !['isMobile', 'miniOpen'].includes(prop as string),
})<{ isMobile: boolean; miniOpen: boolean }>(({ theme, isMobile, miniOpen }) => ({
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.9)
    : alpha(theme.palette.background.paper, 0.95),
  backdropFilter: "blur(12px)",
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 1px 10px ${alpha(theme.palette.common.black, 0.1)}`,
  paddingRight: isMobile ? 0 : miniOpen ? `${NAV_MINI}px` : `${NAV_WIDTH}px`,
  transition: theme.transitions.create(["padding-right", "background"], {
    duration: theme.transitions.duration.standard,
  }),
  height: APPBAR_HEIGHT,
}));

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>(({ theme, isActive }) => ({
  borderRadius: theme.spacing(1.5),
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1.5, 2),
  transition: theme.transitions.create(["background-color", "transform", "box-shadow"], {
    duration: theme.transitions.duration.shorter,
  }),
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: "translateX(-2px)",
  },
  ...(isActive && {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
    fontWeight: 600,
    "&::before": {
      content: '""',
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      width: 3,
      backgroundColor: theme.palette.primary.main,
      borderRadius: "3px 0 0 3px",
    },
  }),
}));

const ToolbarOffset = styled("div")(({ theme }) => ({
  height: APPBAR_HEIGHT,
  minHeight: APPBAR_HEIGHT,
}));

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery((t: Theme) => t.breakpoints.down("md"));
  const isTablet = useMediaQuery((t: Theme) => t.breakpoints.down("lg"));

  // Drawer states with responsive defaults
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [miniOpen, setMiniOpen] = React.useState(!isTablet); // auto-collapse on tablet
  const [darkMode, setDarkMode] = React.useState(false);

  // User menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState<null | HTMLElement>(null);
  const openUser = Boolean(anchorEl);
  const openNotifications = Boolean(notificationAnchor);

  // Auto-adjust sidebar on screen size change
  React.useEffect(() => {
    if (isTablet && miniOpen) {
      setMiniOpen(false);
    }
  }, [isTablet]);

  const toggleMobile = () => setMobileOpen((p) => !p);
  const toggleMini = () => setMiniOpen((p) => !p);
  const toggleDarkMode = () => setDarkMode((p) => !p);
  
  const handleLogout = () => {
    // Add logout logic here
    navigate('/auth/login');
  };

  // Theme direction note: make sure your app root sets <html dir="rtl"> or wraps MUI with RTL cache for full flipping

  // Breadcrumbs from path
  const crumbs = React.useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const map: Record<string, string> = {
      admin: "لوحة التحكم",
      kleem: "كليم",
      prompts: "البرومبتات",
      "knowledge-base": "قاعدة المعرفة",
      conversations: "المحادثات",
      "chat-settings": "إعدادات المحادثة",
      analytics: "التحليلات",
      settings: "الإعدادات",
    };
    const links: { to: string; label: string }[] = [];
    parts.reduce((acc, curr) => {
      const to = `${acc}/${curr}`;
      links.push({ to, label: map[curr] || curr });
      return to;
    }, "");
    return links;
  }, [pathname]);

  // Helper: active matcher (exact or startsWith for groups)
  const isActive = (to: string) => {
    if (to === "/admin") return pathname === "/admin";
    return pathname.startsWith(to);
  };

  // Enhanced navigation list with tooltips and badges
  const NavList = (
    <List sx={{ p: 1, pt: 2 }}>
      {navItems.map((item) => {
        const active = isActive(item.to);
        const navButton = (
          <StyledListItemButton
            key={item.to}
            isActive={active}
            onClick={() => navigate(item.to)}
          >
            <ListItemIcon sx={{ 
              minWidth: miniOpen ? 40 : 24, 
              justifyContent: 'center',
              color: active ? 'primary.main' : 'inherit',
              transition: 'all 0.2s ease'
            }}>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error" variant="dot">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            {miniOpen && (
              <ListItemText 
                primary={
                  <Typography variant="body2" sx={{ fontWeight: active ? 600 : 400 }}>
                    {item.label}
                  </Typography>
                }
                secondary={miniOpen && item.description ? (
                  <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                    {item.description}
                  </Typography>
                ) : undefined}
                sx={{ 
                  margin: 0,
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem'
                  }
                }}
              />
            )}
          </StyledListItemButton>
        );

        // Wrap with tooltip for mini mode
        if (!miniOpen) {
          return (
            <Tooltip 
              key={item.to}
              title={`${item.label}${item.description ? ` - ${item.description}` : ''}`} 
              placement="left"
              arrow
            >
              <Box>{navButton}</Box>
            </Tooltip>
          );
        }

        return navButton;
      })}
    </List>
  );

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      {/* Enhanced AppBar */}
      <StyledAppBar
        position="fixed"
        color="inherit"
        elevation={0}
        isMobile={isMobile}
        miniOpen={miniOpen}
      >
        <Toolbar sx={{ 
          gap: 2, 
          justifyContent: "space-between",
          minHeight: APPBAR_HEIGHT,
          px: { xs: 2, sm: 3 }
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* Mobile menu */}
            {isMobile && (
              <IconButton 
                onClick={toggleMobile} 
                aria-label="فتح القائمة"
                sx={{ 
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Brand with enhanced styling */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton 
                onClick={() => navigate("/")} 
                aria-label="الرئيسية"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  borderRadius: 2,
                  width: 44,
                  height: 44,
                }}
              >
                <HomeIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  لوحة تحكم كليم
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    display: { xs: 'none', md: 'block' },
                    fontSize: '0.75rem'
                  }}
                >
                  إدارة متقدمة للنظام
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Notifications */}
            <Tooltip title="الإشعارات">
              <IconButton 
                onClick={(e) => setNotificationAnchor(e.currentTarget)}
                sx={{ borderRadius: 2 }}
              >
                <Badge badgeContent={3} color="error" variant="dot">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Theme toggle with icons */}
            <Tooltip title={darkMode ? "الوضع الفاتح" : "الوضع الداكن"}>
              <IconButton 
                onClick={toggleDarkMode}
                sx={{ 
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                  }
                }}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Enhanced User menu */}
            <Tooltip title="حسابي">
              <IconButton 
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  borderRadius: 2,
                  border: `2px solid ${alpha(theme.palette.primary.main, openUser ? 0.2 : 0)}`
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 38, 
                    height: 38,
                    bgcolor: 'primary.main',
                    fontWeight: 700,
                    fontSize: '1rem'
                  }}
                >
                  كم
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>

        {/* Enhanced Menus */}
        <Menu
          anchorEl={anchorEl}
          open={openUser}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 200,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              مرحباً كليم
            </Typography>
            <Typography variant="caption" color="text.secondary">
              admin@kleem.ai
            </Typography>
          </Box>
          <MenuItem 
            onClick={() => setAnchorEl(null)}
            sx={{ py: 1.5, gap: 1.5 }}
          >
            <AccountCircleIcon sx={{ fontSize: 20 }} />
            الملف الشخصي
          </MenuItem>
          <MenuItem 
            onClick={() => setAnchorEl(null)}
            sx={{ py: 1.5, gap: 1.5 }}
          >
            <SettingsIcon sx={{ fontSize: 20 }} />
            إعدادات الحساب
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={handleLogout}
            sx={{ 
              py: 1.5, 
              gap: 1.5,
              color: 'error.main',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.08)
              }
            }}
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
            تسجيل الخروج
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={notificationAnchor}
          open={openNotifications}
          onClose={() => setNotificationAnchor(null)}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 320,
              maxWidth: 400,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
            }
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              الإشعارات
            </Typography>
          </Box>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            <MenuItem sx={{ py: 2, alignItems: 'flex-start' }}>
              <Stack spacing={0.5} sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  إجابة جديدة مطلوبة
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  يوجد 5 أسئلة جديدة تحتاج لإجابات
                </Typography>
                <Typography variant="caption" color="primary.main">
                  منذ 5 دقائق
                </Typography>
              </Stack>
            </MenuItem>
          </Box>
        </Menu>
      </StyledAppBar>

      {/* Side Navigation */}
      {/* Mobile temporary drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleMobile}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { width: NAV_WIDTH } }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography fontWeight={700}>القائمة</Typography>
            <IconButton onClick={toggleMobile}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </Toolbar>
          <Divider />
          {NavList}
        </Drawer>
      ) : (
        // Desktop mini/expanded drawer
        <Box
          component={DrawerPaper}
          open={miniOpen}
          sx={{
            position: "fixed",
            right: 0,
            top: 64,
            bottom: 0,
            zIndex: (t) => t.zIndex.appBar - 1,
          }}
        >
          <Toolbar
            sx={{
              height: 64,
              position: "fixed",
              right: 0,
              width: miniOpen ? NAV_WIDTH : NAV_MINI,
              zIndex: 1,
              bgcolor: "background.paper",
              borderBottom: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: miniOpen ? "space-between" : "center",
              }}
            >
              {miniOpen && <Typography fontWeight={700}>التنقل</Typography>}
              <IconButton size="small" onClick={toggleMini}>
                {/* In RTL, ChevronRight collapses to mini */}
                {miniOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Box>
          </Toolbar>
          <ToolbarOffset />
          {NavList}
        </Box>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          pt: 10,
          pr: isMobile
            ? 2
            : miniOpen
            ? `${NAV_MINI + 16}px`
            : `${NAV_WIDTH + 16}px`,
          transition: (t) =>
            t.transitions.create(["padding-right"], {
              duration: t.transitions.duration.standard,
            }),
        }}
      >
        {/* Enhanced Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs 
            separator={<ChevronLeftIcon sx={{ fontSize: 16, color: 'text.disabled' }} />} 
            aria-label="مؤشر الصفحات"
            sx={{
              '& .MuiBreadcrumbs-ol': {
                flexWrap: 'wrap',
              }
            }}
          >
            <Link to="/admin" style={{ textDecoration: "none" }}>
              <Typography 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                لوحة التحكم
              </Typography>
            </Link>
            {crumbs.slice(1).map((c, index, arr) => (
              <Link key={c.to} to={c.to} style={{ textDecoration: "none" }}>
                <Typography 
                  sx={{ 
                    color: index === arr.length - 1 ? 'text.primary' : 'text.secondary',
                    fontWeight: index === arr.length - 1 ? 600 : 400,
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: index === arr.length - 1 ? 'none' : 'underline'
                    }
                  }}
                >
                  {c.label}
                </Typography>
              </Link>
            ))}
          </Breadcrumbs>
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
}

/*
📌 ملاحظات هامة للـ RTL الكامل في MUI:
- للحصول على قلب تلقائي للأساليب (margin/padding) مع RTL استخدم CacheProvider و stylis-plugin-rtl:

import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';

const cacheRtl = createCache({ key: 'mui-rtl', stylisPlugins: [rtlPlugin] });

<CacheProvider value={cacheRtl}>
  <ThemeProvider theme={createTheme({ direction: 'rtl' })}>
    <CssBaseline />
    <AdminLayout />
  </ThemeProvider>
</CacheProvider>

*/
