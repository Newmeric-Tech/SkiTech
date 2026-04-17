"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Building2, Users, ClipboardList, BarChart3, Shield, Truck,
  ChevronDown, CheckCircle2, Zap, ArrowRight,
} from "lucide-react";

const font = "Merriweather, serif";

const modules = [
  {
    icon: Building2,
    title: "Property Management",
    desc: "Centralized property profiles, departments, vendor management, room tracking, and ownership details — all in one place. No more juggling spreadsheets across multiple properties.",
    stat: "Unified property control",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=85",
    tag: "Core",
    headline: "One source of truth for every property you operate.",
    bullets: [
      "Unlimited property profiles with custom fields, floor plans, and media galleries",
      "Department-level vendor lists with contract expiry alerts and renewal workflows",
      "Room-by-room status tracking — occupied, vacant, under maintenance — updated in real time",
      "Ownership & legal document vault with access-controlled visibility per role",
      "Cross-property comparison dashboards to benchmark performance at a glance",
    ],
    callout: "Teams using Property Management reduce administrative overhead by up to 40%.",
    cta: "See a property demo",
  },
  {
    icon: Users,
    title: "Employee Management",
    desc: "Workforce profiles, department mapping, shift scheduling, role assignment, and real-time staff visibility. Give every team member exactly the access they need — nothing more.",
    stat: "Full workforce visibility",
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=85",
    tag: "People",
    headline: "Your entire workforce, organised and always visible.",
    bullets: [
      "Rich employee profiles — skills, certifications, emergency contacts, and tenure history",
      "Drag-and-drop shift scheduler with conflict detection and overtime warnings",
      "Role-based permissions so staff only see data relevant to their function",
      "Leave management with approval workflows and real-time coverage impact preview",
      "Performance score cards tied directly to KRA completion and SOP adherence",
    ],
    callout: "Managers reclaim an average of 6 hours per week on scheduling alone.",
    cta: "Explore workforce features",
  },
  {
    icon: ClipboardList,
    title: "SOP Management",
    desc: "Create, version, and distribute SOPs across every property and department. Control who sees what, track compliance, and keep your standards consistent at scale.",
    stat: "Versioned & auditable",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=85",
    tag: "Compliance",
    headline: "Standards that actually stick — every shift, every property.",
    bullets: [
      "Rich-text SOP editor with embedded images, videos, and step checklists",
      "Version history with side-by-side diffs and one-click rollback to any revision",
      "Targeted distribution — assign SOPs to specific departments, roles, or shifts",
      "Digital acknowledgement tracking: know exactly who has read and signed off",
      "Compliance heatmaps that surface properties or departments falling behind",
    ],
    callout: "Consistent SOP adherence is the #1 driver of guest satisfaction scores in hospitality.",
    cta: "View compliance tools",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    desc: "Revenue dashboards, KRA compliance tracking, occupancy metrics, and automated performance reports. Make data-driven decisions with clarity instead of guesswork.",
    stat: "Automated reporting",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=85",
    tag: "Insights",
    headline: "Stop guessing. Start deciding with data.",
    bullets: [
      "Live revenue dashboards segmented by property, room type, and booking channel",
      "Automated daily, weekly, and monthly PDF reports delivered straight to your inbox",
      "Occupancy trend lines with 90-day forecasts based on historical patterns",
      "Cost-per-room analytics that highlight inefficiencies before they compound",
      "Custom report builder — pick your metrics, schedule delivery, share with stakeholders",
    ],
    callout: "Properties using Analytics see a 22% faster response time to underperformance signals.",
    cta: "See reporting in action",
  },
  {
    icon: Shield,
    title: "KRA Monitoring",
    desc: "Assign daily, weekly, and monthly KRAs to every department. Real-time compliance dashboards let managers spot underperformance early and course-correct before it becomes a problem.",
    stat: "Real-time compliance",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85",
    tag: "Performance",
    headline: "Accountability built into every department, every day.",
    bullets: [
      "Granular KRA library — create your own metrics or choose from industry templates",
      "Daily check-in prompts keep staff on track without micro-management",
      "Red/amber/green scoring gives managers an instant health signal per department",
      "Escalation rules: auto-notify senior management when KRAs breach thresholds",
      "Historical compliance archives for audits, appraisals, and strategic planning",
    ],
    callout: "Properties with structured KRA tracking report 35% lower staff turnover.",
    cta: "Explore KRA tools",
  },
  {
    icon: Truck,
    title: "Inventory & Stock",
    desc: "Track stock levels across all your properties with automated low-stock alerts, full audit trails, and reorder notifications. Never run out of essentials again.",
    stat: "Zero stockout surprises",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&q=85",
    tag: "Operations",
    headline: "Know what you have, where it is, and when to reorder.",
    bullets: [
      "Multi-property stock ledger with real-time quantity sync across all locations",
      "Configurable low-stock thresholds that trigger alerts before you run out",
      "One-click purchase order generation sent directly to preferred vendors",
      "Audit trail for every stock movement — who touched what, when, and why",
      "Wastage reporting that reveals patterns and helps cut procurement costs",
    ],
    callout: "On average, properties eliminate 3 emergency procurement runs per month.",
    cta: "See inventory demo",
  },
];

// ─── Single card ─────────────────────────────────────────────────────────────

function FeatureCard({
  mod,
  index,
}: {
  mod: (typeof modules)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [open, setOpen] = useState(false);
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 52, scale: 0.985 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.06,
        opacity: { duration: 0.55 },
      }}
      className="group border border-black/[0.07] rounded-3xl overflow-hidden bg-white transition-[border-color,box-shadow] duration-500 hover:border-black/20 hover:shadow-[0_24px_64px_-20px_rgba(0,0,0,0.13)] cursor-default"
    >
      {/* ── Main row ── */}
      <div className="flex flex-col md:flex-row">

        {/* Image panel */}
        <div
          className={`relative w-full md:w-[320px] lg:w-[380px] shrink-0 overflow-hidden ${
            !isEven ? "md:order-2" : ""
          }`}
        >
          <img
            src={mod.img}
            alt={mod.title}
            className="w-full h-56 md:h-full object-cover transition-[transform,filter] duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:brightness-[1.04]"
          />

          {/* Scrim */}
          <div className="absolute inset-0 z-10 bg-black/[0.18] group-hover:bg-black/0 transition-colors duration-700 ease-out" />

          {/* Directional fade */}
          <div
            className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-0 ${
              isEven
                ? "bg-gradient-to-r from-transparent to-white/[0.15]"
                : "bg-gradient-to-l from-transparent to-white/[0.15]"
            }`}
          />

          {/* Tag badge */}
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: index * 0.06 + 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute top-4 left-4 z-20 inline-flex items-center px-3 py-1 bg-white/[0.93] backdrop-blur-md text-black rounded-full border border-black/[0.07] text-[10px] uppercase tracking-[0.15em]"
            style={{ fontFamily: font, fontWeight: 700 }}
          >
            {mod.tag}
          </motion.span>

          {/* Bottom sweep line */}
          <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-black transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-20" />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-8 lg:p-10 flex-1 min-w-0">
          <div>
            {/* Icon + title */}
            <div className="flex items-start gap-4 mb-5">
              <motion.div
                whileHover={{ rotate: 7, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 280, damping: 16 }}
                className="w-11 h-11 rounded-2xl border border-black/[0.09] flex items-center justify-center shrink-0 mt-0.5 transition-[background,border-color] duration-500 group-hover:bg-black group-hover:border-transparent"
              >
                <mod.icon className="w-[17px] h-[17px] text-black transition-colors duration-500 group-hover:text-white" />
              </motion.div>
              <h3
                className="text-black leading-snug pt-1.5"
                style={{ fontSize: "1.1rem", fontWeight: 900, fontFamily: font }}
              >
                {mod.title}
              </h3>
            </div>

            {/* Description */}
            <p
              className="text-black/50 leading-[1.9]"
              style={{ fontSize: "0.84rem", fontFamily: font }}
            >
              {mod.desc}
            </p>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              delay: index * 0.06 + 0.38,
              ease: "easeOut",
            }}
            className="flex items-center justify-between pt-5 mt-6 border-t border-black/[0.06]"
          >
            <span
              className="text-[10px] uppercase tracking-[0.15em] text-black/50"
              style={{ fontFamily: font, fontWeight: 700 }}
            >
              {mod.stat}
            </span>

            {/* Read more / Show less button */}
            <motion.button
              onClick={() => setOpen((v) => !v)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-4 py-[7px] rounded-full border border-black/[0.1] bg-transparent hover:bg-black hover:border-black transition-[background,border-color] duration-300 group/btn"
              style={{ fontFamily: font }}
            >
              <span
                className="text-[11px] text-black/55 group-hover/btn:text-white transition-colors duration-300"
                style={{ fontWeight: 700, letterSpacing: "0.04em" }}
              >
                {open ? "Show less" : "Read more"}
              </span>
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <ChevronDown className="w-3.5 h-3.5 text-black/45 group-hover/btn:text-white transition-colors duration-300" />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* ── Expandable panel ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.3, ease: "easeOut" },
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: 16 }}
              animate={{ y: 0 }}
              exit={{ y: 8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mx-5 md:mx-8 mb-7 rounded-2xl bg-[#F7F8FA] border border-black/[0.05] overflow-hidden"
            >
              {/* Gradient top stripe */}
              <div className="h-[3px] bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

              <div className="p-6 md:p-8">
                {/* Headline */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.04 }}
                  className="text-black/80 mb-5"
                  style={{
                    fontFamily: font,
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    lineHeight: 1.6,
                  }}
                >
                  {mod.headline}
                </motion.p>

                {/* Bullets */}
                <ul className="space-y-3 mb-6">
                  {mod.bullets.map((b, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.38,
                        delay: 0.07 + i * 0.06,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-black/35 mt-[2px] shrink-0" />
                      <span
                        className="text-black/55 leading-relaxed"
                        style={{ fontFamily: font, fontSize: "0.8rem" }}
                      >
                        {b}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* Callout */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: 0.36 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-black/[0.03] border border-black/[0.06] mb-6"
                >
                  <Zap className="w-4 h-4 text-black/40 mt-[2px] shrink-0" />
                  <p
                    className="text-black/55 leading-relaxed"
                    style={{
                      fontFamily: font,
                      fontSize: "0.78rem",
                      fontStyle: "italic",
                    }}
                  >
                    {mod.callout}
                  </p>
                </motion.div>

                {/* CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.42 }}
                  whileHover={{ x: 3 }}
                  className="inline-flex items-center gap-1.5 text-black hover:text-black/50 transition-colors duration-300"
                  style={{
                    fontFamily: font,
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    letterSpacing: "0.03em",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {mod.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function Features() {
  const ref = useRef(null);
  const headerInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="features"
      ref={ref}
      className="py-28 bg-[#F7F8FA]"
      style={{ fontFamily: font }}
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-black/55 text-[10px] uppercase tracking-[0.22em] mb-4"
            style={{ fontWeight: 700, fontFamily: font }}
          >
            Core Modules
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(1.9rem, 4vw, 2.7rem)",
              fontWeight: 900,
              color: "#000",
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              fontFamily: font,
            }}
          >
            Everything to Run Your{" "}
            <em style={{ fontStyle: "italic" }}>Properties</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.22, ease: "easeOut" }}
            className="text-black/40 mt-4 max-w-sm mx-auto leading-relaxed"
            style={{ fontSize: "0.85rem", fontFamily: font }}
          >
            Six powerful modules working together to eliminate spreadsheets and
            disconnected tools.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={headerInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{
              duration: 0.9,
              delay: 0.34,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-6 mx-auto h-px w-12 bg-black origin-center"
          />
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-5">
          {modules.map((mod, i) => (
            <FeatureCard key={i} mod={mod} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
