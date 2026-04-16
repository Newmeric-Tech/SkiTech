"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

// Import Merriweather from Google Fonts
import { Merriweather } from "next/font/google";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const plans = [
  {
    name: "Starter",
    desc: "Perfect for single-property operators getting started.",
    price: { monthly: 49, annual: 39 },
    cta: "Get Started",
    ctaStyle: "border",
    features: [
      "Up to 3 properties",
      "50 employee profiles",
      "Basic SOP management",
      "Stock tracking & alerts",
      "Standard reporting",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Professional",
    desc: "For growing teams managing multiple properties.",
    price: { monthly: 99, annual: 79 },
    cta: "Get Started",
    ctaStyle: "filled",
    features: [
      "Unlimited properties",
      "Unlimited employees",
      "Advanced KRA dashboards",
      "Revenue analytics & reports",
      "Role-based access control",
      "Priority support",
      "AI-powered insights",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    desc: "Custom solutions for large property portfolios.",
    price: { monthly: null, annual: null },
    cta: "Contact Sales",
    ctaStyle: "border",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom integrations",
      "White-label options",
      "SLA guarantee",
      "On-premise deployment",
    ],
    popular: false,
  },
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" ref={ref} className={`py-24 bg-white ${merriweather.className}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          {/* Section label */}
          <p
            className="text-xs uppercase tracking-widest mb-3"
            style={{ fontWeight: 700, color: "#000000" }}
          >
            Pricing
          </p>

          {/* Heading */}
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              fontWeight: 900,
              color: "#000000",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            Simple,{" "}
            <span
              style={{
                borderBottom: "3px solid #000000",
                paddingBottom: "2px",
              }}
            >
              Transparent Pricing
            </span>
          </h2>

          <p className="mt-3 text-sm" style={{ fontWeight: 300, color: "#555555" }}>
            Start with a 14-day free trial. No credit card required.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.25 }}
          className="flex items-center justify-center gap-3 mt-8 mb-12"
        >
          <span
            className="text-sm"
            style={{ fontWeight: annual ? 400 : 700, color: annual ? "#999999" : "#000000" }}
          >
            Monthly
          </span>

          <button
            onClick={() => setAnnual(!annual)}
            className="relative w-12 h-6 rounded-full transition-colors duration-300"
            style={{ backgroundColor: annual ? "#000000" : "#CCCCCC" }}
          >
            <motion.div
              animate={{ x: annual ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
            />
          </button>

          <span
            className="text-sm"
            style={{ fontWeight: annual ? 700 : 400, color: annual ? "#000000" : "#999999" }}
          >
            Annual
            <span
              className="ml-2 text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "#F0F0F0",
                color: "#000000",
                border: "1px solid #DDDDDD",
              }}
            >
              Save 20%
            </span>
          </span>
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 36 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              whileHover={{ y: plan.popular ? -6 : -4 }}
              className="relative rounded-2xl p-8 transition-all duration-300"
              style={
                plan.popular
                  ? {
                      backgroundColor: "#000000",
                      border: "1px solid #000000",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
                    }
                  : {
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E0E0E0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }
              }
            >
              {/* Most Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div
                    className="text-xs px-4 py-1 rounded-full flex items-center gap-1"
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: "#000000",
                      fontWeight: 700,
                      border: "1.5px solid #000000",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                    }}
                  >
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                </div>
              )}

              {/* Plan name & desc */}
              <div className="mb-6">
                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: plan.popular ? "#FFFFFF" : "#000000",
                  }}
                >
                  {plan.name}
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{
                    fontWeight: 300,
                    color: plan.popular ? "#AAAAAA" : "#666666",
                  }}
                >
                  {plan.desc}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.price.monthly ? (
                  <div className="flex items-end gap-1">
                    <span
                      style={{
                        fontSize: "2.75rem",
                        fontWeight: 900,
                        lineHeight: 1,
                        color: plan.popular ? "#FFFFFF" : "#000000",
                      }}
                    >
                      ${annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span
                      className="text-sm mb-1.5"
                      style={{
                        fontWeight: 300,
                        color: plan.popular ? "#AAAAAA" : "#888888",
                      }}
                    >
                      /month
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 900,
                      color: plan.popular ? "#FFFFFF" : "#000000",
                    }}
                  >
                    Custom
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/demo"
                  className="w-full py-3 rounded-xl text-sm transition-all duration-200 mb-8 block text-center"
                  style={
                    plan.popular
                      ? {
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontWeight: 700,
                        }
                      : {
                          backgroundColor: "#000000",
                          color: "#FFFFFF",
                          fontWeight: 700,
                          border: "1.5px solid #000000",
                        }
                  }
                >
                  {plan.cta}
                </Link>
              </motion.div>

              {/* Features list */}
              <ul className="space-y-3">
                {plan.features.map((f, j) => (
                  <li
                    key={j}
                    className="flex items-center gap-2.5 text-sm"
                    style={{
                      fontWeight: 400,
                      color: plan.popular ? "#CCCCCC" : "#444444",
                    }}
                  >
                    <Check
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: plan.popular ? "#FFFFFF" : "#000000" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
