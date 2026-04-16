import Hero from "@/components/marketing/Hero";
import { Stats } from "@/components/marketing/Stats";
import AboutUs from "@/components/marketing/AboutUs";
import { Features } from "@/components/marketing/Features";
import { WhySkitec } from "@/components/marketing/WhySkitec";
import { Pricing } from "@/components/marketing/Pricing";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Stats />
      <AboutUs />
      <WhySkitec />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
