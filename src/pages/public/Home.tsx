// src/pages/Home.tsx
import {
  SEOHead,
  JsonLd,
  Navbar,
  HeroSection,
  HowItWorks,
  FeaturesSection,
  IntegrationsSection,
  StorefrontSection,
  DemoSection,
  ComparisonSection,
  PricingSection,
  Testimonials,
  FAQSection,
  Footer,
} from "@/features/landing";
import { Box } from "@mui/material";

import { motion } from "framer-motion";

const SectionReveal = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.15 }}
    variants={{
      hidden: { opacity: 0, y: 28 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut", delay },
      },
    }}
  >
    {children}
  </motion.div>
);

const Home = () => {
  return (
    <Box dir="rtl">
      <SEOHead />
      <JsonLd />
      <Navbar />

      <SectionReveal>
        <HeroSection />
      </SectionReveal>
      <SectionReveal>
        <HowItWorks />
      </SectionReveal>
      <SectionReveal>
        <FeaturesSection />
      </SectionReveal>
      <SectionReveal>
        <IntegrationsSection />
      </SectionReveal>
      <SectionReveal>
        <StorefrontSection />
      </SectionReveal>
      <SectionReveal>
        <DemoSection />
      </SectionReveal>
      <SectionReveal>
        <ComparisonSection />
      </SectionReveal>
      <SectionReveal>
        <PricingSection />
      </SectionReveal>
      <SectionReveal>
        <Testimonials />
      </SectionReveal>
      <SectionReveal>
        <FAQSection />
      </SectionReveal>

      <Footer />
    </Box>
  );
};

export default Home;
