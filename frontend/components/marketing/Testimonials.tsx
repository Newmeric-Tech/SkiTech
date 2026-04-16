"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Star } from "lucide-react";

const font = "Merriweather, serif";

const testimonials = [
  {
    stars: 5,
    quote:
      "Skitec transformed how we manage our three properties. The centralized dashboard gives me clarity I never had before.",
    name: "Sarah Mitchell",
    role: "General Manager, Grand Horizon Property",
    initials: "SM",
  },
  {
    stars: 5,
    quote:
      "The SOP management alone saved us hours every week. Our compliance went from 72% to 94% in just two months.",
    name: "James Chen",
    role: "Operations Director, Skyline Suites",
    initials: "JC",
  },
  {
    stars: 5,
    quote:
      "Finally, a platform that understands hospitality. The KRA tracking and revenue insights are exactly what we needed.",
    name: "Priya Sharma",
    role: "Finance Manager, The Amiras Residence",
    initials: "PS",
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-70px" });

  return (
    <section
      id="testimonials"
      ref={ref}
      className="py-28 bg-black relative overflow-hidden"
      style={{ fontFamily: font }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* Large soft glow blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/[0.025] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/[0.025] blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="text-white/55 text-[10.5px] uppercase tracking-[0.22em] mb-4"
            style={{ fontWeight: 700, fontFamily: font }}
          >
            Testimonials
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.09, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              fontFamily: font,
            }}
          >
            Trusted by{" "}
            <em style={{ fontStyle: "italic", fontWeight: 900 }}>Property Teams</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
            className="text-white/55 mt-5 max-w-sm mx-auto leading-relaxed"
            style={{ fontSize: "0.88rem", fontFamily: font }}
          >
            Hear from the operations teams already running on Skitec.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 mx-auto h-px w-14 bg-white/50 origin-center"
          />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 52, scale: 0.97 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.8,
                delay: i * 0.13 + 0.1,
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.55 },
              }}
              whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              className="group relative flex flex-col border border-white/[0.08] rounded-3xl p-8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.16] transition-[background,border-color] duration-500 cursor-default overflow-hidden"
            >
              {/* Corner glow on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.04] rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -translate-y-1/2 translate-x-1/2" />

              {/* Stars */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: i * 0.13 + 0.4 }}
                className="flex gap-1 mb-6"
              >
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-3.5 h-3.5 fill-white text-white opacity-90"
                  />
                ))}
              </motion.div>

              {/* Quote mark */}
              <div
                className="text-white/10 mb-3 leading-none select-none"
                style={{ fontSize: "4rem", fontFamily: "Georgia, serif", lineHeight: 1 }}
                aria-hidden
              >
                "
              </div>

              {/* Quote text */}
              <p
                className="text-white/60 leading-[1.85] flex-1 mb-8"
                style={{ fontSize: "0.875rem", fontFamily: font }}
              >
                {t.quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3.5 pt-5 border-t border-white/[0.07]">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.06] flex items-center justify-center shrink-0 transition-all duration-400 group-hover:bg-white group-hover:border-white"
                >
                  <span
                    className="text-white/70 text-[11px] transition-colors duration-400 group-hover:text-black"
                    style={{ fontFamily: font, fontWeight: 800, letterSpacing: "0.04em" }}
                  >
                    {t.initials}
                  </span>
                </div>
                <div>
                  <p
                    className="text-white text-[13px] leading-tight mb-0.5"
                    style={{ fontFamily: font, fontWeight: 700 }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-white/55 text-[11px] leading-tight"
                    style={{ fontFamily: font, fontWeight: 400 }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
