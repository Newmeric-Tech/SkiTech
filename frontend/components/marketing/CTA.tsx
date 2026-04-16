"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const font = "Merriweather, serif";

export function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-32 bg-white relative overflow-hidden"
      style={{ fontFamily: font }}
    >
      {/* Soft radial vignette — white center, very faint gray edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, #ffffff 0%, #f4f4f4 100%)",
        }}
      />

      {/* Large ghost "Skitec" text in background */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden
      >
        <span
          style={{
            fontSize: "clamp(6rem, 20vw, 16rem)",
            fontWeight: 900,
            fontFamily: font,
            fontStyle: "italic",
            color: "rgba(0,0,0,0.028)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          Skitec
        </span>
      </div>

      <div className="relative max-w-3xl mx-auto px-6 lg:px-10 text-center">

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="text-black/60 text-[10.5px] uppercase tracking-[0.22em] mb-6"
          style={{ fontWeight: 700, fontFamily: font }}
        >
          Get Started
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
            fontWeight: 800,
            color: "#000",
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            fontFamily: font,
          }}
        >
          Ready to Streamline Your{" "}
          <em style={{ fontStyle: "italic", fontWeight: 900 }}>Operations?</em>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.18, ease: "easeOut" }}
          className="text-black/45 mt-6 max-w-lg mx-auto leading-[1.85]"
          style={{ fontSize: "0.9rem", fontFamily: font }}
        >
          Join property teams who have simplified their daily operations with Skitec's
          centralized management platform. Start your free 14-day trial today.
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 mx-auto h-px w-14 bg-black/20 origin-center"
        />

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          {/* Primary */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href="/demo"
              className="group inline-flex items-center gap-2.5 bg-black text-white px-8 py-4 rounded-2xl hover:bg-black/85 transition-colors duration-300"
              style={{ fontFamily: font, fontWeight: 700, fontSize: "0.9rem" }}
            >
              Request a Demo
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>

          {/* Secondary */}
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
          >
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-1.5 text-black/70 hover:text-black px-5 py-4 rounded-2xl border border-transparent hover:border-black/10 transition-all duration-300"
              style={{ fontFamily: font, fontWeight: 700, fontSize: "0.88rem" }}
            >
              View Pricing
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-black/50 text-[11px] uppercase tracking-[0.16em]"
          style={{ fontFamily: font, fontWeight: 700 }}
        >
          No credit card required · 14-day free trial · Cancel anytime
        </motion.p>
      </div>
    </section>
  );
}
