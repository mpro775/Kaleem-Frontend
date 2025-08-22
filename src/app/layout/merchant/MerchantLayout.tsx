import {
  Box,
  useMediaQuery,
  useTheme,
  Badge,
  IconButton,
  Popover,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState, useEffect } from "react";
import { useAdminNotifications } from "@/shared/hooks/useAdminNotifications";
import type { AdminNotification } from "@/shared/types/notification";
import { toast } from "react-toastify";

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  function playBeep() {
    try {
      const ctx = new window.AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.type = "sine";
      oscillator.frequency.value = 800; // التردد (هيرتز) - يمكنك تغييره للصوت المناسب
      gain.gain.value = 0.1; // خفض الصوت حتى لا يكون مزعج
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        ctx.close();
      }, 200); // مدة الصوت (ms)
    } catch {
      console.log("خطاء");
    }
  }
  useAdminNotifications((payload) => {
    setNotifications((prev) => [...prev, payload]);
    toast.info(
      <>
        <b>رسالة جديدة:</b>
        <br />
        <span>{payload.message.text}</span>
      </>
    );
    playBeep();
  });

  // أغلق السايدبار عند التنقل أو تصغير الشاشة
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // فتح/إغلاق نافذة الإشعارات
  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
  };
  const handleNotifClose = () => {
    setNotifAnchor(null);
  };

  const notifOpen = Boolean(notifAnchor);

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fbfc" }}
    >
      <Sidebar
        open={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
          isMobile={isMobile}
          extra={
            <IconButton onClick={handleNotifClick} sx={{ ml: 2 }}>
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          }
        ></Topbar>

        {/* نافذة الإشعارات */}
        <Popover
          open={notifOpen}
          anchorEl={notifAnchor}
          onClose={handleNotifClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Box sx={{ p: 2, minWidth: 250 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              الإشعارات الجديدة
            </Typography>
            {notifications.length === 0 && (
              <Typography color="text.secondary">لا توجد إشعارات</Typography>
            )}
            {notifications
              .slice(-10)
              .reverse()
              .map((notif, idx) => (
                <Box
                  key={idx}
                  sx={{ mb: 1, borderBottom: "1px solid #eee", pb: 1 }}
                >
                  <Typography fontSize={15}>
                    <b>جلسة:</b> {notif.sessionId}
                  </Typography>
                  <Typography fontSize={14}>{notif.message.text}</Typography>
                </Box>
              ))}
          </Box>
        </Popover>

        <Box
          sx={{
            pt: { xs: 7, sm: 8 },
            px: { xs: 1, sm: 4 },
            flex: 1,
            minHeight: 0,
            backgroundColor: "#f9fbfc",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
