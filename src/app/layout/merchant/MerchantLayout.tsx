// src/layouts/DashboardLayout.tsx
import {
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState, useEffect } from "react";
import MobileBottomNav from "./MobileBottomNav";

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // أغلق السايدبار عند التنقل أو تصغير الشاشة
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  return ( <> 
  {isMobile && <MobileBottomNav />}

    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f9fbfc" }} dir="rtl">
      <Sidebar
        open={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} isMobile={isMobile} />

        <Box
          component="main"
          sx={{
            pt: { xs: 7, sm: 8 },
            px: { xs: 1, sm: 4 },
            pb: { xs: 9, sm: 0 },
            flex: 1,
            minHeight: 0,
            bgcolor: "#f9fbfc",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
    </>
  );
};

export default DashboardLayout;
