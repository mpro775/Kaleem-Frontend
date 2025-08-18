import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Drawer,
  Tooltip,
  IconButton,
  Avatar,
  Typography,
  Collapse,
  useTheme,
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import {
  ExpandMore as ExpandIcon,
  ChevronRight, // ← أضف هذا
  ChevronLeft, // ← وأضف هذا إذا استخدمته
} from "@mui/icons-material";
import { useState, useEffect, type JSX } from "react";
import { AiTwotoneHome } from "react-icons/ai";
import { TbMessages } from "react-icons/tb";
import { FiBox } from "react-icons/fi";
import { BsRobot } from "react-icons/bs";
import { LuStore } from "react-icons/lu";
import { TbMessageCircleCog } from "react-icons/tb";
import { PiGraphLight } from "react-icons/pi";
import { SiGoogleanalytics } from "react-icons/si";
import { TiGroupOutline } from "react-icons/ti";
import { HiOutlineDocumentMagnifyingGlass } from "react-icons/hi2";
import { MdOutlineSettingsSuggest } from "react-icons/md";
import { BiSupport } from "react-icons/bi";
import { useStoreServicesFlag } from "../../hooks/useStoreServicesFlag";

// القائمة الرئيسية
interface MenuItem {
  label: string;
  icon: JSX.Element;
  path?: string;
  subItems?: MenuItem[];
  featureKey?: string; // ← جديد
}

const BASE_MENU: MenuItem[] = [
  { label: "الرئيسية", icon: <AiTwotoneHome />, path: "/dashboard" },
  {
    label: "المحادثات",
    icon: <TbMessages />,
    path: "/dashboard/conversations",
  },
  // ↓↓↓ تظهر فقط مع كليم (internal)
  {
    label: "المنتجات",
    icon: <FiBox />,
    path: "/dashboard/products",
    featureKey: "storeService",
  },
  {
    label: "الفئات",
    icon: <FiBox />,
    path: "/dashboard/category",
    featureKey: "storeService",
  },
  {
    label: "الطلبات",
    icon: <FiBox />,
    path: "/dashboard/orders",
    featureKey: "storeService",
  },
  {
    label: "البانرات",
    icon: <FiBox />,
    path: "/dashboard/banners",
    featureKey: "storeService",
  },
  {
    label: "تخصيص المتجر",
    icon: <LuStore />,
    path: "/dashboard/storefront-theme",
    featureKey: "storeService",
  },
  // لو بتضيف عروض:
  // { label: "العروض", icon: <FiTag />, path: "/dashboard/offers", featureKey: "storeService" },

  { label: "معلومات المتجر", icon: <LuStore />, path: "/dashboard/marchinfo" },

  { label: "تعليمات البوت", icon: <BsRobot />, path: "/dashboard/prompt" },

  {
    label: "ضبط واجهه الدردشة",
    icon: <TbMessageCircleCog />,
    path: "/dashboard/chatsetting",
  },
  { label: "قنوات الربط", icon: <PiGraphLight />, path: "/dashboard/channel" },
  {
    label: "الاحصائيات",
    icon: <SiGoogleanalytics />,
    path: "/dashboard/analytics",
  },
  { label: "العملاء ", icon: <TiGroupOutline />, path: "/dashboard/leads" },
  {
    label: "الموارد الاضافية",
    icon: <HiOutlineDocumentMagnifyingGlass />,
    path: "/dashboard/documents",
  },
  { label: "الدعم", icon: <BiSupport />, path: "/dashboard/support" },
  {
    label: "الاعدادات",
    icon: <MdOutlineSettingsSuggest />,
    path: "/dashboard/setting",
  },
];
interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  onToggleCollapse?: () => void; // جديد
  collapsed?: boolean; // جديد
}

const Sidebar = ({
  open,
  onClose,
  isMobile,
  onToggleCollapse,
  collapsed,
}: SidebarProps) => {
  const theme = useTheme();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );
  const showStoreServices = useStoreServicesFlag();
  const menu = BASE_MENU.filter((item) => {
    if (item.featureKey === "storeService") return showStoreServices;
    return true;
  });
  // لتوسيع قائمة فرعية تلقائياً إذا المسار الحالي بداخلها
  useEffect(() => {
    const currentPath = location.pathname;
    const newExpandedItems: Record<string, boolean> = {};
    menu.forEach((item) => {
      if (item.subItems) {
        const shouldExpand = item.subItems.some(
          (subItem) => subItem.path === currentPath
        );
        if (shouldExpand) {
          newExpandedItems[item.label] = true;
        }
      }
    });
    setExpandedItems(newExpandedItems);
  }, [location.pathname]);

  const toggleSubMenu = (label: string) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };
  const handleItemClick = () => {
    if (isMobile) onClose();
  };

  // عنصر القائمة الواحد
  const renderMenuItem = (item: MenuItem) => {
    const isActive = item.path === location.pathname;
    const isSubItemActive = item.subItems?.some(
      (subItem) => subItem.path === location.pathname
    );

    return (
      <Box key={item.label}>
        <ListItem disablePadding>
          <ListItemButton
            component={item.path ? NavLink : "div"}
            to={item.path || ""}
            onClick={() => item.subItems && toggleSubMenu(item.label)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              ...(isActive && {
                background:
                  theme.palette.mode === "dark"
                    ? `${theme.palette.primary.dark}22`
                    : "none !important",
                backgroundImage:
                  theme.palette.mode === "dark"
                    ? "none"
                    : `linear-gradient(90deg, ${
                        theme.palette.background.paper
                      } 0%, ${
                        theme.palette.primary.light || "#ede7f6"
                      } 100%) !important`,
                color: theme.palette.primary.main,
                fontWeight: "bold",
                "&:hover": {
                  background:
                    theme.palette.mode === "dark"
                      ? `${theme.palette.primary.dark}33`
                      : `linear-gradient(90deg, ${
                          theme.palette.primary.light
                        } 0%, ${
                          theme.palette.primary.light || "#ede7f6"
                        } 100%) !important`,
                },
              }),
              ...(isSubItemActive && {
                background: `linear-gradient(90deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light} 100%) !important`,
                color: theme.palette.primary.main,
              }),
              transition: "all 0.3s ease",
              "&:hover": {
                background: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: isActive
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                minWidth: "40px !important",
                fontSize: 22,
                transition: "color 0.18s",
              }}
            >
              {item.icon}
            </ListItemIcon>

            {!collapsed && open && (
              <>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? "bold" : "normal",
                    color: isActive
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                  }}
                />
                {item.subItems && (
                  <ExpandIcon
                    sx={{
                      transform: expandedItems[item.label]
                        ? "rotate(180deg)"
                        : "none",
                      transition: "transform 0.3s",
                    }}
                  />
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {/* القوائم الفرعية */}
        {item.subItems && open && (
          <Collapse in={expandedItems[item.label]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 2 }}>
              {item.subItems.map((subItem) => {
                const isSubActive = subItem.path === location.pathname;
                return (
                  <ListItem key={subItem.label} disablePadding>
                    <ListItemButton
                      component={NavLink}
                      to={subItem.path || ""}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        pl: 4,
                        ...(isSubActive && {
                          background:
                            theme.palette.primary.main + " !important",
                          color: theme.palette.primary.contrastText,
                          "&:hover": {
                            background:
                              theme.palette.primary.dark + " !important",
                          },
                        }),
                        "&:hover": {
                          background: theme.palette.action.hover,
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isSubActive
                            ? theme.palette.primary.contrastText
                            : theme.palette.primary.main,
                          minWidth: "40px !important",
                        }}
                      >
                        {subItem.icon}
                      </ListItemIcon>
                      {open && (
                        <ListItemText
                          primary={subItem.label}
                          primaryTypographyProps={{
                            fontSize: "0.9rem",
                            fontWeight: isSubActive ? "bold" : "normal",
                            color: isSubActive
                              ? theme.palette.primary.contrastText
                              : theme.palette.text.primary,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  // التصميم النهائي للشريط الجانبي
  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: collapsed ? 72 : 240, // هنا الفرق!
        flexShrink: 0,
        transition: "width 0.3s cubic-bezier(.4,2.2,.2,1)",
        "& .MuiDrawer-paper": {
          width: open ? 240 : 72,
          transition: "width 0.3s cubic-bezier(.4,2.2,.2,1)",
          overflowX: "hidden",
          background:
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : "linear-gradient(180deg, #fff 80%, #f3e8ff 120%)",
          border: "none",
          boxShadow: theme.shadows[3],
          zIndex: theme.zIndex.drawer + 2,
        },
      }}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", height: "100%", py: 2 }}
      >
        {/* رأس الشريط */}
        {/* رأس الشريط */}

        <Typography variant="caption" color="text.secondary">
          لوحة تحكم المتجر
        </Typography>
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: open ? "space-between" : "center",
              px: 2,
              mb: 2,
            }}
          >
            {/* شعار وأسم المتجر ... */}
            <IconButton onClick={onToggleCollapse}>
              {open ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Box>
        )}
        {/* القائمة الرئيسية */}
        <List sx={{ flex: 1, px: 1 }}>
          {BASE_MENU.map((item) => (
            <Box key={item.label} onClick={handleItemClick}>
              {renderMenuItem(item)}
            </Box>
          ))}
        </List>
        {/* تذييل الشريط */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            background: theme.palette.grey[100],
            borderRadius: 2,
            mx: 1,
            textAlign: "center",
          }}
        >
          {open ? (
            <Typography variant="caption" color="text.secondary">
              كليم
            </Typography>
          ) : (
            <Tooltip title="MusaidBot v2.0" placement="right">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  mx: "auto",
                  bgcolor: theme.palette.primary.main,
                  fontSize: 12,
                }}
              >
                MB
              </Avatar>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
