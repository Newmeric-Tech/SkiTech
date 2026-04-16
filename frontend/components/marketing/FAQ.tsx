"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Plus, Minus } from "lucide-react";

const font = "Merriweather, serif";

const faqs = [
  {
    q: "What is Skitec?",
    a: "Skitec is a Property Operations Management System that centralizes property management, staff operations, SOPs, task tracking, attendance, and reporting into one powerful dashboard.",
  },
  {
    q: "How many properties can I manage?",
    a: "With our Starter plan, you can manage up to 3 properties. The Professional plan gives you unlimited properties. Enterprise plans are fully custom.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! All plans include a 14-day free trial with full access to all features. No credit card required to get started.",
  },
  {
    q: "Can I import existing data?",
    a: "Absolutely. Skitec supports CSV import for properties, employees, inventory, and SOPs. Our onboarding team can also assist with bulk data migration for Enterprise customers.",
  },
  {
    q: "What kind of support do you offer?",
    a: "Starter plans include email support. Professional plans get priority support. Enterprise customers receive a dedicated account manager and 24/7 SLA-backed support.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Skitec uses enterprise-grade encryption, role-based access control, and regular security audits. All data is stored in compliant data centers with 99.9% uptime SLA.",
  },
];

function FAQItem({ faq, index, isPageInView }: { faq: (typeof faqs)[0]; index: number; isPageInView: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isPageInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.65,
        delay: index * 0.08 + 0.1,
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 0.45 },
      }}
    >
      <div
        className={`border rounded-2xl overflow-hidden transition-[border-color,box-shadow] duration-400 ${
          open
            ? "border-black/20 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.10)]"
            : "border-black/[0.07] hover:border-black/[0.14]"
        } bg-white`}
      >
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-7 py-5 text-left group"
          aria-expanded={open}
        >
          <span
            className="text-black pr-5 leading-snug transition-opacity duration-300"
            style={{
              fontSize: "0.93rem",
              fontWeight: open ? 800 : 700,
              fontFamily: font,
            }}
          >
            {faq.q}
          </span>

          {/* Icon toggles between + and — */}
          <div
            className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-400 ${
              open
                ? "bg-black border-transparent"
                : "border-black/[0.09] group-hover:border-black/20"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.div
                  key="minus"
                  initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <Minus className="w-3.5 h-3.5 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ opacity: 0, rotate: 90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: -90, scale: 0.7 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <Plus className="w-3.5 h-3.5 text-black/50" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="answer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.28, ease: "easeOut" },
              }}
              className="overflow-hidden"
            >
              <div className="px-7 pb-6 pt-0">
                {/* Hairline separator */}
                <div className="h-px bg-black/[0.06] mb-5" />
                <p
                  className="text-black/55 leading-[1.9]"
                  style={{ fontSize: "0.875rem", fontFamily: font }}
                >
                  {faq.a}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-70px" });

  return (
    <section
      id="faq"
      ref={ref}
      className="py-28 bg-[#F7F8FA]"
      style={{ fontFamily: font }}
    >
      <div className="max-w-2xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="text-black/60 text-[10.5px] uppercase tracking-[0.22em] mb-4"
            style={{ fontWeight: 700, fontFamily: font }}
          >
            FAQ
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.09, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 800,
              color: "#000",
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              fontFamily: font,
            }}
          >
            Frequently Asked{" "}
            <em style={{ fontStyle: "italic", fontWeight: 900 }}>Questions</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
            className="text-black/40 mt-5 max-w-sm mx-auto leading-relaxed"
            style={{ fontSize: "0.88rem", fontFamily: font }}
          >
            Everything you need to know before you get started.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 mx-auto h-px w-14 bg-black origin-center"
          />
        </div>

        {/* Accordion list */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} isPageInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}
