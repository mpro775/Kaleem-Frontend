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
  ChevronRight,
  ChevronLeft,
} from "@mui/icons-material";
import { useState, useEffect, type JSX, useMemo } from "react";
import { AiTwotoneHome } from "react-icons/ai";
import { TbMessages, TbMessageCircleCog } from "react-icons/tb";
import { FiBox } from "react-icons/fi";
import { BsRobot } from "react-icons/bs";
import { LuStore } from "react-icons/lu";
import { PiGraphLight } from "react-icons/pi";
import { SiGoogleanalytics } from "react-icons/si";
import { TiGroupOutline } from "react-icons/ti";
import { HiOutlineDocumentMagnifyingGlass } from "react-icons/hi2";
import { MdOutlineSettingsSuggest } from "react-icons/md";
import { BiSupport } from "react-icons/bi";
import { useStoreServicesFlag } from "@/shared/hooks/useStoreServicesFlag";

// القائمة الرئيسية (كما هي)
interface MenuItem {
  label: string;
  icon?: JSX.Element; // ← كانت إلزامية، خلّيناها اختيارية
  path?: string;
  subItems?: MenuItem[];
  featureKey?: string;
}
const BASE_MENU: MenuItem[] = [
  { label: "الرئيسية", icon: <AiTwotoneHome />, path: "/dashboard" },
  {
    label: "المحادثات",
    icon: <TbMessages />,
    path: "/dashboard/conversations",
  },

  // متجر كليم
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

  // باقي العناصر
  { label: "معلومات المتجر", icon: <LuStore />, path: "/dashboard/marchinfo" },
  { label: "تعليمات كليم", icon: <BsRobot />, path: "/dashboard/prompt" },
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
    path: "/dashboard/knowledge",
  },
  { label: "الدعم", icon: <BiSupport />, path: "/dashboard/support" },
  {
    label: "الاعدادات",
    icon: <MdOutlineSettingsSuggest />,
    path: "/dashboard/setting",
  },
  { label: "التوجيهات", icon: <TbMessages />, path: "/dashboard/instructions" },
  {
    label: "الإجابات المفقودة",
    icon: <TbMessages />,
    path: "/dashboard/missing-responses",
  },
];

interface SidebarProps {
  open: boolean; // للهاتف فقط (temporary)
  onClose: () => void;
  isMobile: boolean;
  onToggleCollapse?: () => void;
  collapsed?: boolean; // المستخدم على الديسكتوب
}

// ===== تجميع تلقائي بسيط دون العبث بـ BASE_MENU =====
function buildGroupedMenu(base: MenuItem[]): MenuItem[] {
  const filterByLabels = (labels: string[]) =>
    base.filter((i) => labels.includes(i.label));
  const used = new Set<string>();

  const group = (
    label: string,
    items: MenuItem[],
    featureKey?: string,
    icon?: JSX.Element
  ): MenuItem | null => {
    items.forEach((i) => used.add(i.label));
    if (!items.length) return null;
    if (items.length === 1) return items[0]; // 👈 افرد المجموعة إن كانت عنصرًا واحدًا
    return { label, icon, subItems: items, featureKey };
  };

  const core = group(
    "الأساسيات",
    filterByLabels(["الرئيسية", "المحادثات", "الاحصائيات", "معلومات المتجر"]),
    undefined,
    <AiTwotoneHome />
  );
  const ai = group(
    "Kleem IQ",
    filterByLabels([
      "تعليمات كليم",
      "التوجيهات",
      "الإجابات المفقودة",
      "الموارد الاضافية",
    ]),
    undefined,
    <BsRobot />
  );
  const store = group(
    "متجر كليم",
    base.filter((i) => i.featureKey === "storeService"),
    "storeService",
    <LuStore />
  );
  const channels = group(
    "القنوات والربط",
    filterByLabels(["قنوات الربط", "ضبط واجهه الدردشة"]),
    undefined,
    <PiGraphLight />
  );
  const crm = group(
    "العملاء",
    filterByLabels(["العملاء "]),
    undefined,
    <TiGroupOutline />
  );

  const ops = group(
    "الإعدادات والدعم",
    filterByLabels(["الاعدادات", "الدعم"]),
    undefined,
    <MdOutlineSettingsSuggest />
  );

  const rest = base.filter(
    (i) => !used.has(i.label) && i.featureKey !== "storeService"
  );
  return [core, ai, store, channels, crm, ops, ...rest].filter(
    Boolean
  ) as MenuItem[];
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
  const full = useMemo(() => buildGroupedMenu(BASE_MENU), []);

  const menu: MenuItem[] = useMemo(() => {
    const visible = (item: MenuItem) =>
      item.featureKey === "storeService" ? showStoreServices : true;

    return full
      .map((section) => {
        if (section.subItems) {
          const subs = section.subItems.filter(visible);
          return subs.length ? { ...section, subItems: subs } : null;
        }
        return visible(section) ? section : null;
      })
      .filter(Boolean) as MenuItem[];
  }, [full, showStoreServices]);

  // 4) لا تعيد تعيين expandedItems كليًا؛ دمج فقط "التوسعة الافتراضية" بناءً على المسار الحالي
  useEffect(() => {
    const currentPath = location.pathname;
    setExpandedItems((prev) => {
      const next = { ...prev };
      menu.forEach((item) => {
        if (item.subItems?.some((s) => s.path === currentPath)) {
          next[item.label] = true; // أضف التوسعة للمجموعة الموافقة للمسار
        }
      });
      return next; // لا تمسح اختيارات المستخدم السابقة
    });
    // مهم: لا تضع `menu` كمُعتمَد هنا حتى لا يُعاد ضبط الحالة
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  const toggleSubMenu = (label: string) =>
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleItemClick = () => {
    if (isMobile) onClose();
  };

  // عنصر واحد (قسم أو عنصر مفرد)
  const renderMenuItem = (item: MenuItem) => {
    const isActive = item.path === location.pathname;
    const isSubItemActive = item.subItems?.some(
      (s) => s.path === location.pathname
    );

    const buttonProps = item.path
      ? { component: NavLink, to: item.path }
      : { component: "div" as const };

    return (
      <Box key={item.label}>
        <ListItem disablePadding>
          <ListItemButton
            {...buttonProps}
            onClick={() => {
              if (item.subItems) toggleSubMenu(item.label);
              handleItemClick();
            }}
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
              "&:hover": { background: theme.palette.action.hover },
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

            {!collapsed && (
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
        {item.subItems && (
          <Collapse in={expandedItems[item.label]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 2 }}>
              {item.subItems.map((sub) => {
                const isSubActive = sub.path === location.pathname;
                return (
                  <ListItem key={sub.label} disablePadding>
                    <ListItemButton
                      component={NavLink}
                      to={sub.path || ""}
                      onClick={handleItemClick}
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
                        "&:hover": { background: theme.palette.action.hover },
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
                        {sub.icon}
                      </ListItemIcon>
                      {!collapsed && (
                        <ListItemText
                          primary={sub.label}
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

  // الشريط الجانبي
  const drawerWidth = isMobile ? 280 : collapsed ? 72 : 240;

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? open : true}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: "width 0.3s cubic-bezier(.4,2.2,.2,1)",
        "& .MuiDrawer-paper": {
          width: drawerWidth,
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
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 2, mb: 1 }}
        >
          لوحة تحكم المتجر
        </Typography>

        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              px: 2,
              mb: 2,
            }}
          >
            <IconButton onClick={onToggleCollapse}>
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Box>
        )}

        {/* القائمة */}
        <List sx={{ flex: 1, px: 1 }}>
          {menu.map((item) => (
            <Box key={item.label} onClick={handleItemClick}>
              {renderMenuItem(item)}
            </Box>
          ))}
        </List>

        {/* تذييل */}
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
          {!collapsed ? (
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
