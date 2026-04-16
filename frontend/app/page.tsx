import { Navbar } from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import { Stats } from "@/components/marketing/Stats";
import { Features } from "@/components/marketing/Features";
import { Solutions  } from "@/components/marketing/Solutions";
import { WhySkitec } from "@/components/marketing/WhySkitec";
import { Pricing } from "@/components/marketing/Pricing";
import { Testimonials } from "@/components/marketing/Testimonials";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Solutions />
      <WhySkitec />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
