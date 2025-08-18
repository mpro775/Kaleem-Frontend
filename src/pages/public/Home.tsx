// src/pages/LandingPage.tsx
import { Box } from "@mui/material";
import Navbar from "../../components/landing/Navbar";
import SEOHead from "../../components/landing/SEOHead";
import StickyCta from "../../components/landing/StickyCta";
import HeroSection from "../../components/landing/HeroSection";
import HowItWorks from "../../components/landing/HowItWorks";
import FeaturesSection from "../../components/landing/FeaturesSection";
import IntegrationsSection from "../../components/landing/IntegrationsSection";

import DemoSection from "../../components/landing/DemoSection";
import ComparisonSection from "../../components/landing/ComparisonSection";
import PricingSection from "../../components/landing/PricingSection";
import Testimonials from "../../components/landing/Testimonials";
import FAQSection from "../../components/landing/FAQSection";
import FinalCtaSection from "../../components/landing/FinalCtaSection";
import CookieConsent from "../../components/landing/CookieConsent";
import Footer from "../../components/landing/Footer";
import JsonLd from "../../components/landing/JsonLd";
import StorefrontSection from "../../components/landing/StorefrontSection";

const LandingPage = () => {
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

export default LandingPage;
