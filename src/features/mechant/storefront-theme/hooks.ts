// src/features/storefront-theme/hooks.ts
import { useEffect, useMemo, useState, useCallback } from "react";
import { getStorefrontInfo, updateStorefrontInfo } from "@/api/storefrontApi";
import { STOREFRONT_BASE_URL } from "./utils";
import type { ButtonStyle, Storefront } from "./type";

export function useStorefrontTheme(merchantId: string) {
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const [primaryColor, setPrimaryColor] = useState("#FF8500");
  const [secondaryColor, setSecondaryColor] = useState("#1976d2");
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>("rounded");
  const [slug, setSlug] = useState("");
  const [domain, setDomain] = useState<string | undefined>();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    if (!merchantId) return;
    setLoading(true);
    getStorefrontInfo(merchantId)
      .then((data) => {
        setStorefront(data);
        setPrimaryColor(data.primaryColor || "#FF8500");
        setSecondaryColor(data.secondaryColor || "#1976d2");
        setButtonStyle((data.buttonStyle as ButtonStyle) || "rounded");
        setSlug(data.slug || "");
        setDomain(data.domain);
      })
      .finally(() => setLoading(false));
  }, [merchantId]);

  const storeUrl = useMemo(() => {
    if (domain) return `https://${domain}`;
    if (slug) return `${STOREFRONT_BASE_URL}${slug}`;
    return "";
  }, [domain, slug]);

  const handleSave = useCallback(async () => {
    if (!storefront?._id) {
      setSnackbar({ open: true, message: "تعذر جلب بيانات المتجر!", severity: "error" });
      return;
    }
    if (!slug) {
      setSnackbar({ open: true, message: "معرّف الرابط (slug) مطلوب", severity: "error" });
      return;
    }
    setSaveLoading(true);
    try {
      await updateStorefrontInfo(storefront._id, {
        primaryColor,
        secondaryColor,
        buttonStyle,
        slug,
      });
      setStorefront((prev) =>
        prev ? { ...prev, primaryColor, secondaryColor, buttonStyle, slug } : prev
      );
      setSnackbar({ open: true, message: "تم حفظ إعدادات الثيم بنجاح!", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "حدث خطأ أثناء الحفظ", severity: "error" });
    } finally {
      setSaveLoading(false);
    }
  }, [storefront?._id, primaryColor, secondaryColor, buttonStyle, slug]);

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return {
    // state
    loading,
    saveLoading,
    primaryColor,
    secondaryColor,
    buttonStyle,
    slug,
    domain,
    storeUrl,
    snackbar,
    // setters
    setPrimaryColor,
    setSecondaryColor,
    setButtonStyle,
    setSlug,
    // actions
    handleSave,
    closeSnackbar,
  };
}
