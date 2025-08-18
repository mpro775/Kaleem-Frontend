// src/components/landing/SEOHead.tsx
import { useEffect } from "react";

export default function SEOHead() {
  // لو ما ضبطت lang/dir في index.html، نحددها هنا
  useEffect(() => {
    const html = document.documentElement;
    html.lang = "ar";
    html.dir = "rtl";
  }, []);

  return (
    <>
      {/* سيتم رفع هذه الوسوم تلقائيًا إلى <head> بواسطة React 19 */}
      <title>كليم — مساعد متاجر ذكي بالعربية</title>
      <meta
        name="description"
        content="كليم: بوت عربي ذكي يرد على عملائك ويبيع عبر واتساب وتيليجرام والويب. جرّبه الآن."
      />

      {/* Open Graph */}
      <meta property="og:title" content="كليم — مساعد متاجر ذكي بالعربية" />
      <meta
        property="og:description"
        content="يرد ويبيع عبر قنواتك، متكامل مع Salla وZid."
      />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}
