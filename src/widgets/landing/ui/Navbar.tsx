// Navbar.tsx
import {
	AppBar, Toolbar, Box, Button, useTheme, IconButton, Drawer,
	List, ListItemButton, ListItemText, Divider, Typography
  } from "@mui/material";
  import MenuIcon from "@mui/icons-material/Menu";
  import CloseIcon from "@mui/icons-material/Close";
  import { useNavigate } from "react-router-dom";
  import logo from "@/assets/logo.png";
  import React from "react";
  import type { User } from "@/context/AuthContext";
  	
  // إن كان لديك كونتكست مصادقة فعّال، أبقه. إن لم يكن موجودًا لديك، احذف السطرين التاليين.
  // وتبقى آلية localStorage تعمل بدون أخطاء.
  import { useAuth } from "@/context/AuthContext"; // <-- احذف هذا السطر إذا لم تستخدم كونتكست
  // ---------------------------------------------
  
  const Navbar: React.FC = () => {
	const navigate = useNavigate();
	const theme = useTheme();
  
	// محاولة جلب حالة المستخدم من الكونتكست إن وجدت
	let userFromContext: User | null = null;
	let tokenFromContext: string | null = null;
	try {
	  // سيعمل فقط إذا كان useAuth متوفرًا
	  const auth = useAuth?.();
	  userFromContext = auth?.user ?? null;
	  tokenFromContext = auth?.token ?? null;
	} catch {
	  // تجاهل — سنعتمد على localStorage كنسخة احتياطية
	}
  
	// فحص تسجيل الدخول (كونتكست + localStorage)
	const isAuthed =
	  !!userFromContext ||
	  !!tokenFromContext ||
	  !!localStorage.getItem("accessToken") ||
	  !!localStorage.getItem("token");
  
	const DASHBOARD_PATH = "/dashboard";
  
	const navLinks: { label: string; href?: string }[] = [
	  { label: "الرئيسية", href: "#" },
	  { label: "من نحن", href: "#about" },
	  { label: "خدماتنا", href: "#features" },
	  { label: "الباقات", href: "#pricing" },
	  { label: "أعمالنا", href: "#cases" },
	];
  
	const [open, setOpen] = React.useState(false);
	const toggle = (v: boolean) => () => setOpen(v);
  
	const handleAnchor = (href?: string) => () => {
	  if (!href) return;
	  if (href.startsWith("#")) {
		const id = href.slice(1);
		const el = document.getElementById(id);
		if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
		setOpen(false);
		return;
	  }
	  navigate(href);
	  setOpen(false);
	};
  
	return (
	  <AppBar
		position="sticky"
		sx={{
		  bgcolor: "rgba(255,255,255,0.9)",
		  backdropFilter: "blur(8px)",
		  borderBottom: (t) => `1px solid ${t.palette.divider}`,
		  boxShadow: "none",
		  px: { xs: 2, md: 6 },
		}}
	  >
		<Toolbar
		  sx={{
			display: "flex",
			justifyContent: "space-between",
			p: "0 !important",
			minHeight: 68,
		  }}
		>
		  {/* Logo */}
		  <Box
			sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
			onClick={() => navigate("/")}
		  >
			<img src={logo} alt="Kleem" style={{ width: "auto", height: 44 }} />
		  </Box>
  
		  {/* Navigation Links (Desktop) */}
		  <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
			{navLinks.map((l) => (
			  <Button
				variant="contained"
				key={l.label}
				onClick={handleAnchor(l.href)}
				sx={{
				  color: "#563fa6",
				  background: "white",
				  borderRadius: 2,
				  boxShadow: "none",
				  fontWeight: 600,
				  px: 1.5,
				  position: "relative",
				}}
			  >
				{l.label}
			  </Button>
			))}
		  </Box>
  
		  {/* CTA Buttons (Desktop) */}
		  <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1.2 }}>
			{isAuthed ? (
			  <Button
				variant="contained"
				sx={{
				  background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
				  px: 3,
				  fontWeight: 700,
				  borderRadius: 2,
				  boxShadow: "none",
				  "&:hover": { backgroundColor: "#4527a0" },
				}}
				onClick={() => navigate(DASHBOARD_PATH)}
			  >
				لوحة التحكم
			  </Button>
			) : (
			  <Button
				variant="contained"
				sx={{
				  background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
				  px: 3,
				  fontWeight: 700,
				  borderRadius: 2,
				  boxShadow: "none",
				  "&:hover": { backgroundColor: "#4527a0" },
				}}
				onClick={() => navigate("/signup")}
			  >
				اطلب الخدمة
			  </Button>
			)}
  
			<Button
			  variant="outlined"
			  sx={{
				color: "#563fa6",
				border: "1px solid #563fa6",
				px: 2.5,
				fontWeight: 700,
				borderRadius: 2,
				backgroundImage: "none",
				"&:hover": { backgroundColor: "rgba(86,63,166,.06)" },
			  }}
			  onClick={() => navigate("/contact")}
			>
			  تواصل معنا
			</Button>
		  </Box>
  
		  {/* Hamburger (Mobile) */}
		  <Box sx={{ display: { xs: "flex", md: "none" } }}>
			<IconButton onClick={toggle(true)} aria-label="فتح القائمة">
			  <MenuIcon />
			</IconButton>
		  </Box>
		</Toolbar>
  
		{/* Drawer Mobile */}
		<Drawer anchor="right" open={open} onClose={toggle(false)}>
		  <Box sx={{ width: 290, p: 2 }} role="presentation">
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
			  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<img src={logo} alt="Kleem" style={{ width: 28, height: 28 }} />
				<Typography fontWeight={800}>كليم</Typography>
			  </Box>
			  <IconButton aria-label="إغلاق" onClick={toggle(false)}>
				<CloseIcon />
			  </IconButton>
			</Box>
			<Divider />
			<List>
			  {navLinks.map((l) => (
				<ListItemButton key={l.label} onClick={handleAnchor(l.href)}>
				  <ListItemText primary={l.label} />
				</ListItemButton>
			  ))}
			</List>
  
			<Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, mt: 1 }}>
			  {isAuthed ? (
				<Button
				  fullWidth
				  variant="contained"
				  sx={{
					background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
					fontWeight: 700,
					borderRadius: 2,
					boxShadow: "none",
				  }}
				  onClick={() => {
					navigate(DASHBOARD_PATH);
					setOpen(false);
				  }}
				>
				  لوحة التحكم
				</Button>
			  ) : (
				<Button
				  fullWidth
				  variant="contained"
				  sx={{
					background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
					fontWeight: 700,
					borderRadius: 2,
					boxShadow: "none",
				  }}
				  onClick={() => {
					navigate("/signup");
					setOpen(false);
				  }}
				>
				  اطلب الخدمة
				</Button>
			  )}
  
			  <Button
				fullWidth
				variant="outlined"
				sx={{ color: "#563fa6", border: "1px solid #563fa6", borderRadius: 2 }}
				onClick={() => {
				  navigate("/contact");
				  setOpen(false);
				}}
			  >
				تواصل معنا
			  </Button>
			</Box>
		  </Box>
		</Drawer>
	  </AppBar>
	);
  };
  
  export default Navbar;
  