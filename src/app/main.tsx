// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme/theme";
import App from "@/app/App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import createCache from "@emotion/cache";
import stylisRTLPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import * as Sentry from "@sentry/react";

const cacheRtl = createCache({ key: "muirtl", stylisPlugins: [stylisRTLPlugin], prepend: true });

Sentry.init({
  dsn: "https://YOUR_SENTRY_DSN",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
});

document.documentElement.setAttribute("dir", "rtl");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
          <ToastContainer position="top-center" rtl autoClose={3500} />
        </ThemeProvider>
      </CacheProvider>
    </BrowserRouter>
  </React.StrictMode>
);
