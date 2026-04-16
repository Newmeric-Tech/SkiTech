"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

const stats = [
  { value: "50+", label: "Properties Managed" },
  { value: "1,200+", label: "Active Users" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "4.8★", label: "User Rating" },
];

export function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-black py-16 border-y border-white/5" style={{ fontFamily: "Merriweather, serif" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="text-center"
            >
              <div
                className="text-white"
                style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, fontFamily: "Merriweather, serif" }}
              >
                {stat.value}
              </div>
              <p className="text-white mt-1.5 text-sm" style={{ fontFamily: "Merriweather, serif" }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
