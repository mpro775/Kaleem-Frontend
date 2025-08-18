// src/pages/Home.tsx
import { Box } from "@mui/material";
import {
  SEOHead, JsonLd,
  Navbar, StickyCta,
  HeroSection, HowItWorks, FeaturesSection,
  IntegrationsSection, StorefrontSection, DemoSection,
  ComparisonSection, PricingSection, Testimonials,
  FAQSection, FinalCtaSection, CookieConsent, Footer,
} from "@/widgets/landing";

const Home = () => {
  return (
    <Box dir="rtl">
      <SEOHead />
      <JsonLd />
      <Navbar />
      <StickyCta />

      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <IntegrationsSection />
      <StorefrontSection />
      <DemoSection />
      <ComparisonSection />
      <PricingSection />
      <Testimonials />
      <FAQSection />
      <FinalCtaSection />

      <CookieConsent />
      <Footer />
    </Box>
  );
};

export default Home;
