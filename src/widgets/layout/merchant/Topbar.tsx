import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Badge,
  InputBase,
  Divider,
  ListItemIcon,
  ListItemText,
  useTheme,
  Paper,
  List,
  ListItem,
  Chip,
  Grow,
  Button,
  Drawer,
} from "@mui/material";
import { useRef, useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MenuIcon from "@mui/icons-material/Menu";

const Topbar = ({ onOpenSidebar, isMobile }: TopbarProps) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  // إشعارات وهمية
  const notifications = [
    {
      id: 1,
      title: "طلب جديد",
      description: "لديك طلب جديد من أحمد محمد",
      time: "منذ 5 دقائق",
      read: false,
    },
    {
      id: 2,
      title: "تحديث النظام",
      description: "التحديث الجديد v2.1 متاح الآن",
      time: "منذ ساعة",
      read: false,
    },
    {
      id: 3,
      title: "رسالة جديدة",
      description: "عمر عبدالله أرسل رسالة جديدة",
      time: "منذ 3 ساعات",
      read: true,
    },
  ];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // --- الإعدادات ---
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleClose = () => setAnchorEl(null);

  // --- الإشعارات ---
  const handleNotifMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget as HTMLElement);
  };
  const handleNotifClose = () => setNotifAnchorEl(null);

  // إغلاق الإشعارات عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotifAnchorEl(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: "0 4px 16px #a69fd822",
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          minHeight: "64px !important",
          py: 1,
          flexDirection: "row-reverse",
          flexWrap: "wrap",
        }}
      >
        {/* يسار: بحث + إشعارات + إعدادات */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          {/* البحث: Paper في الديسكتوب، أيقونة في الجوال */}
          <Paper
            component="form"
            sx={{
              p: "2px 8px",
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              width: { sm: 140, md: 220 },
              boxShadow: "none",
              border: "1px solid #ede7f6",
              background: "#fafaff",
              mr: 1,
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: 14 }}
              placeholder="بحث..."
              inputProps={{ "aria-label": "بحث" }}
            />
            <IconButton type="submit" sx={{ p: "4px" }} aria-label="بحث">
              <SearchIcon color="primary" />
            </IconButton>
          </Paper>
          {/* زر بحث صغير للجوال */}
          <IconButton
            sx={{ display: { xs: "flex", sm: "none" }, mr: 1 }}
            color="primary"
            onClick={() => setSearchDrawerOpen(true)}
          >
            <SearchIcon />
          </IconButton>
          {/* Drawer البحث للجوال */}
          <Drawer
            anchor="top"
            open={searchDrawerOpen}
            onClose={() => setSearchDrawerOpen(false)}
            PaperProps={{
              sx: { p: 2, pt: 4 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <InputBase
                sx={{
                  ml: 2,
                  flex: 1,
                  fontSize: 16,
                  border: "1px solid #ede7f6",
                  px: 2,
                  py: 1,
                }}
                placeholder="بحث..."
                autoFocus
              />
              <IconButton onClick={() => setSearchDrawerOpen(false)}>
                <SearchIcon color="primary" />
              </IconButton>
            </Box>
          </Drawer>

          {/* إشعارات: تظهر فقط ديسكتوب */}
          {!isMobile && (
            <Box ref={notificationsRef}>
              <Tooltip title="الإشعارات">
                <IconButton
                  color="primary"
                  onClick={handleNotifMenu}
                  sx={{
                    background: notifAnchorEl
                      ? "rgba(76, 0, 120, 0.08)"
                      : "transparent",
                    mx: 0.5,
                    position: "relative",
                    fontSize: { xs: 18, sm: 22 },
                  }}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={notifAnchorEl}
                open={Boolean(notifAnchorEl)}
                onClose={handleNotifClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{
                  sx: {
                    width: 320,
                    boxShadow: theme.shadows[10],
                    maxHeight: 420,
                    overflow: "auto",
                    mt: 1,
                  },
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    pb: 1,
                    background: theme.palette.primary.main,
                    color: "#fff",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    الإشعارات ({unreadCount} جديدة)
                  </Typography>
                </Box>
                <List sx={{ py: 0 }}>
                  {notifications.map((n, i) => (
                    <Grow in={true} timeout={i * 100} key={n.id}>
                      <Box>
                        <ListItem
                          sx={{
                            background: n.read ? "inherit" : "#ede7f6",
                            borderLeft: n.read
                              ? "none"
                              : `3px solid ${theme.palette.primary.main}`,
                            py: 1.5,
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography
                                fontWeight={n.read ? "normal" : "bold"}
                              >
                                {n.title}
                              </Typography>
                            }
                            secondary={
                              <>
                                {n.description}
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="textSecondary"
                                >
                                  {n.time}
                                </Typography>
                              </>
                            }
                          />
                          {!n.read && (
                            <Chip
                              label="جديد"
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </ListItem>
                        {i < notifications.length - 1 && <Divider />}
                      </Box>
                    </Grow>
                  ))}
                </List>
                <Box sx={{ p: 1.5, textAlign: "center" }}>
                  <Button
                    variant="text"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                  >
                    عرض جميع الإشعارات
                  </Button>
                </Box>
              </Menu>
            </Box>
          )}

          {/* قائمة إعدادات المستخدم */}
          <Tooltip title="الإعدادات">
            <IconButton
              onClick={handleMenu}
              sx={{
                background: anchorEl ? "#ede7f6" : "transparent",
                "&:hover": { background: "#f3e8ff" },
                fontSize: { xs: 18, sm: 22 },
              }}
            >
              <SettingsIcon color="primary" />
              {!isMobile && <ExpandMoreIcon color="primary" fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{
              sx: {
                width: 230,
                borderRadius: 2,
                boxShadow: theme.shadows[10],
                mt: 1,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleClose();
                navigate("/dashboard/profile");
              }}
            >
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText>ملفي الشخصي</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                navigate("/dashboard/settings");
              }}
            >
              <ListItemIcon>
                <SettingsIcon color="primary" />
              </ListItemIcon>
              <ListItemText>إعداداتي</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                navigate("/dashboard/change-password");
              }}
            >
              <ListItemIcon>
                <LockIcon color="primary" />
              </ListItemIcon>
              <ListItemText>تغيير كلمة المرور</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                navigate("/dashboard/support");
              }}
            >
              <ListItemIcon>
                <SupportAgentIcon color="primary" />
              </ListItemIcon>
              <ListItemText>الدعم الفني</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleClose();
                logout();
              }}
              sx={{ color: theme.palette.error.main }}
            >
              <ListItemIcon sx={{ color: theme.palette.error.main }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText>تسجيل الخروج</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* يمين: شعار واسم المتجر */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
          <Avatar
            src={user?.storeLogoUrl}
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 44,
              height: 44,
              mr: 1,
            }}
          >
            <StorefrontIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", fontSize: { xs: 15, sm: 18 } }}
            >
              {user?.storeName || "متجرك"}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: { xs: 9, sm: 12 } }}
            >
              لوحة تحكم التاجر
            </Typography>
          </Box>
        </Box>
        {isMobile && (
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={onOpenSidebar}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
