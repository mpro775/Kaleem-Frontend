// =========================
// File: src/features/store/hooks/useKleemWidget.ts
// =========================
import { useEffect } from "react";
import { API_BASE } from "@/context/config";
import type { MerchantInfo, Storefront } from "../types";

export function useKleemWidget(
  merchant: MerchantInfo | null,
  storefront: Storefront | null
) {
  useEffect(() => {
    if (!merchant || !storefront) return;

    const existing = document.getElementById(
      "kleem-chat"
    ) as HTMLScriptElement | null;

    const cfg = {
      merchantId: merchant._id,
      apiBaseUrl: API_BASE,
      mode: "bubble", // ✅ زر خفيف (فقاعة) بدل نموذج عشوائي على الشاشة
      brandColor: storefront.brandDark,
      headerBgColor: storefront.brandDark,
      bodyBgColor: "#FFFFFF",
      fontFamily: "Tajawal",
      publicSlug: (merchant as any)?.publicSlug,
    };

    if (!existing) {
      const script = document.createElement("script");
      script.id = "kleem-chat";
      script.async = true;
      script.src = `${(
        import.meta?.env?.VITE_PUBLIC_WIDGET_HOST || "http://localhost:5173"
      ).replace(/\/+$/, "")}/public/widget.js`;
      script.setAttribute("data-config", JSON.stringify(cfg));
      document.body.appendChild(script);
    } else {
      try {
        const current = JSON.parse(
          existing.getAttribute("data-config") || "{}"
        );
        existing.setAttribute(
          "data-config",
          JSON.stringify({ ...current, ...cfg })
        );
      } catch {
        existing.setAttribute("data-config", JSON.stringify(cfg));
      }
    }
  }, [merchant, storefront]);
}
