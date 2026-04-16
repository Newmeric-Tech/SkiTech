"use client";

import { Pricing } from "@/components/marketing/Pricing";
import { FAQ } from "@/components/marketing/FAQ";
import { motion } from "motion/react";
import { Check, X, ArrowRight } from "lucide-react";
import Link from "next/link";

const comparisonRows = [
  { feature: "Properties", starter: "Up to 3", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Employees", starter: "50", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "SOP Management", starter: true, pro: true, enterprise: true },
  { feature: "KRA Dashboards", starter: false, pro: true, enterprise: true },
  { feature: "Advanced Analytics", starter: false, pro: true, enterprise: true },
  { feature: "Role-based Access", starter: false, pro: true, enterprise: true },
  { feature: "Custom Integrations", starter: false, pro: false, enterprise: true },
  { feature: "White-label", starter: false, pro: false, enterprise: true },
  { feature: "Dedicated Manager", starter: false, pro: false, enterprise: true },
  { feature: "Support", starter: "Email", pro: "Priority", enterprise: "24/7 SLA" },
];

function Cell({ val }: { val: string | boolean }) {
  if (typeof val === "boolean") {
    return val ? (
      <Check className="w-4 h-4 text-black mx-auto" />
    ) : (
      <X className="w-4 h-4 text-neutral-300 mx-auto" />
    );
  }
  return <span className="text-neutral-700 text-sm">{val}</span>;
}

export default function PricingPage() {
  return (
    <div style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
      {/* Hero */}
      <section className="bg-[#f8f7f4] py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-black/[0.03] rounded-full blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-neutral-400 text-xs uppercase tracking-widest mb-4" style={{ fontWeight: 700 }}>Pricing</p>
            <h1
              className="text-black max-w-2xl mx-auto"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em" }}
            >
              Plans for every{" "}
              <span className="italic font-light text-neutral-500">
                stage of growth
              </span>
            </h1>
            <p className="text-neutral-500 mt-5 text-sm max-w-md mx-auto leading-relaxed">
              Start free, scale as you grow. No hidden fees. Cancel anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <Pricing />

      {/* Comparison Table */}
      <section className="py-24 bg-[#f8f7f4]">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <h2 className="text-black" style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
              Full Feature Comparison
            </h2>
          </div>
          <div className="rounded-2xl border border-black/10 overflow-hidden shadow-sm bg-white/70 backdrop-blur">
            {/* Header */}
            <div className="grid grid-cols-4 bg-white/50 border-b border-black/5">
              <div className="p-5 text-neutral-600 text-sm" style={{ fontWeight: 600 }}>Feature</div>
              {["Starter", "Professional", "Enterprise"].map((plan, i) => (
                <div key={i} className={`p-5 text-center text-sm ${i === 1 ? "bg-black/[0.03] text-black" : "text-neutral-700"}`} style={{ fontWeight: 700 }}>
                  {plan}
                </div>
              ))}
            </div>
            {/* Rows */}
            {comparisonRows.map((row, i) => (
              <div key={i} className={`grid grid-cols-4 border-b border-black/5 ${i % 2 === 0 ? "bg-white/50" : "bg-black/[0.02]"}`}>
                <div className="p-4 pl-5 text-neutral-700 text-sm">{row.feature}</div>
                <div className="p-4 text-center"><Cell val={row.starter} /></div>
                <div className="p-4 text-center bg-black/[0.02]"><Cell val={row.pro} /></div>
                <div className="p-4 text-center"><Cell val={row.enterprise} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Bottom CTA */}
      <section className="py-20 bg-black text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-white mb-4" style={{ fontSize: "1.8rem", fontWeight: 800 }}>Still have questions?</h2>
          <p className="text-neutral-400 text-sm mb-8">Talk to our team and we&apos;ll help you find the right plan for your operations.</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-white text-black px-7 py-3.5 rounded-xl shadow-lg"
              style={{ fontWeight: 600 }}
            >
              Talk to Sales <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="text-neutral-400 hover:text-white text-sm transition-colors px-4">
              Contact Us →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
