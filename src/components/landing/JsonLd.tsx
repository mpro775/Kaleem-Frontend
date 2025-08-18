// src/components/landing/JsonLd.tsx
export default function JsonLd() {
    const data = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Kleem",
      applicationCategory: "BusinessApplication",
      offers: {
        "@type": "Offer",
        priceCurrency: "ٌريال",
        price: "19",
      },
      inLanguage: "ar",
      description: "مساعد متاجر عربي يرد ويبيع عبر القنوات.",
    };
  
    return (
      // سيُرندِر داخل الـ <body>، وهذا مقبول للـ SEO
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    );
  }
  