// src/features/mechant/storefront-theme/hooks.ts
import { useEffect, useMemo, useState } from "react";
import { getStorefrontInfo, updateStorefrontInfo, checkSlug } from "@/api/storefrontApi";
import type { Storefront } from "@/types/merchant";

const DEBOUNCE = 500;
const normalizeSlug = (input: string) => {
  let s = (input || "").trim().toLowerCase().replace(/[\s_]+/g, "-");
  s = s.replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  if (s.length > 50) s = s.slice(0, 50).replace(/-+$/g, "");
  return s;
};
const isValidSlug = (s: string) =>
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(s) && s.length >= 3 && s.length <= 50;

type SlugState = "idle" | "checking" | "available" | "taken" | "invalid";

export function useStorefrontTheme(merchantId: string) {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // حالة الواجهة
  const [initial, setInitial] = useState<Storefront | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#FF8500");
  const [secondaryColor, setSecondaryColor] = useState("#1976d2");
  const [buttonStyle, setButtonStyle] = useState<"rounded" | "square">("rounded");
  const [slug, setSlug] = useState("");
  const [domain, setDomain] = useState<string | undefined>(undefined);

  // فحص السلاج
  const [slugState, setSlugState] = useState<SlugState>("idle");

  useEffect(() => {
    if (!merchantId) return;
    setLoading(true);
    getStorefrontInfo(merchantId)
      .then((sf) => {
        setInitial(sf);
        setPrimaryColor(sf.primaryColor ?? "#FF8500");
        setSecondaryColor(sf.secondaryColor ?? "#1976d2");
        setButtonStyle(sf.buttonStyle ?? "rounded");
        setSlug(sf.slug ?? "");
        setDomain(sf.domain);
      })
      .catch((e) => {
        setSnackbar({ open: true, message: e?.message || "فشل تحميل إعدادات الواجهة", severity: "error" });
      })
      .finally(() => setLoading(false));
  }, [merchantId]);

  // تحقق فوري للـ slug
  useEffect(() => {
    const n = normalizeSlug(slug);
    if (!n || !isValidSlug(n)) {
      setSlugState("invalid");
      return;
    }
    // إن لم يتغير عن القيمة الابتدائية اعتبره صالحًا
    if (initial && n === initial.slug) {
      setSlugState("available");
      return;
    }

    let cancelled = false;
    setSlugState("checking");
    const t = setTimeout(async () => {
      try {
        const { available } = await checkSlug(n);
        if (!cancelled) setSlugState(available ? "available" : "taken");
      } catch {
        if (!cancelled) setSlugState("taken");
      }
    }, DEBOUNCE);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [slug, initial]);

  const normalizedSlug = useMemo(() => normalizeSlug(slug), [slug]);

  const storeUrl = useMemo(() => {
    if (domain) return `https://${domain}`;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return normalizedSlug ? `${origin}/store/${normalizedSlug}` : "";
  }, [domain, normalizedSlug]);

  const handleSave = async () => {
    try {
      setSaveLoading(true);

      // بناء payload ذكي: فقط ما تغيّر
      const payload: Partial<Storefront> = {};
      if (primaryColor !== initial?.primaryColor) payload.primaryColor = primaryColor;
      if (secondaryColor !== initial?.secondaryColor) payload.secondaryColor = secondaryColor;
      if (buttonStyle !== initial?.buttonStyle) payload.buttonStyle = buttonStyle;

      if (normalizedSlug !== initial?.slug) {
        if (slugState !== "available") {
          setSnackbar({ open: true, message: "الـ slug غير صالح أو محجوز", severity: "error" });
          setSaveLoading(false);
          return;
        }
        payload.slug = normalizedSlug;
      }

      if (Object.keys(payload).length === 0) {
        setSnackbar({ open: true, message: "لا توجد تغييرات للحفظ", severity: "success" });
        setSaveLoading(false);
        return;
      }

      const updated = await updateStorefrontInfo(merchantId, payload);
      // حدّث الـ initial ليبقى متزامنًا
      setInitial(updated);
      if (payload.slug) setSlug(updated.slug);
      setSnackbar({ open: true, message: "تم حفظ الإعدادات", severity: "success" });
    } catch (e: unknown) {
      setSnackbar({ open: true, message: e instanceof Error ? e.message : "فشل حفظ الإعدادات", severity: "error" });
    } finally {
      setSaveLoading(false);
    }
  };

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return {
    loading,
    saveLoading,
    snackbar,
    closeSnackbar,

    primaryColor,
    secondaryColor,
    buttonStyle,
    slug,
    domain,
    storeUrl,

    setPrimaryColor,
    setSecondaryColor,
    setButtonStyle,
    setSlug,

    handleSave,
    slugState, // لو حبيت تعرض مؤشر الحالة في الحقل
  };
}
