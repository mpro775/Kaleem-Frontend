// src/components/landing/StickyCta.tsx
import { AppBar, Toolbar, Button } from "@mui/material";
export default function StickyCta() {
  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ top: 0, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
      <Toolbar sx={{ justifyContent: "center", gap: 2 }}>
        <Button variant="contained" size="small" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
          ابدأ مجانًا
        </Button>
        <Button variant="outlined" size="small" onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}>
          شاهد الديمو
        </Button>
      </Toolbar>
    </AppBar>
  );
}
