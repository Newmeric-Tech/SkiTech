"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

// ── Merriweather font — add this to your layout.tsx / _app.tsx ──────────────
// import { Merriweather } from "next/font/google";
// const merriweather = Merriweather({ subsets: ["latin"], weight: ["300","400","700","900"] });
// Then wrap <body className={merriweather.className}>
// ────────────────────────────────────────────────────────────────────────────

// ── Reusable fade-up wrapper ──────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Animated number counter ───────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1600;
    const step = 16;
    const increment = to / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Word-by-word reveal ───────────────────────────────────────────────────────
function WordReveal({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const words = text.split(" ");
  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.28em]"
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// ── Glass card ────────────────────────────────────────────────────────────────
function GlassCard({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(255,255,255,0.06)" }}
      className={`bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ── Horizontal rule ───────────────────────────────────────────────────────────
function Rule({ delay = 0 }: { delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ scaleX: 0 }}
      animate={inView ? { scaleX: 1 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className="h-px bg-white/10 origin-left w-full my-20"
    />
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AboutUs() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div
      className="bg-black text-white min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Merriweather', Georgia, serif" }}
    >

      {/* ══════════════════════════════════════════════════════════ HERO */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-28 pb-24 overflow-hidden">

        {/* Very subtle radial glow — kept monochrome */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.03] rounded-full blur-[120px]" />
        </div>

        {/* Thin horizontal lines — editorial texture */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="absolute w-full h-px bg-white" style={{ top: `${(i + 1) * 5.5}%` }} />
          ))}
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-5xl mx-auto">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.4em" }}
            animate={{ opacity: 1, letterSpacing: "0.25em" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/30 text-[10px] uppercase tracking-[0.25em] mb-10 font-light"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            About Skitec
          </motion.p>

          {/* Hero heading */}
          <h1
            className="leading-[1.08] tracking-[-0.03em] mb-8"
            style={{ fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 900 }}
          >
            <WordReveal text="Built for Owners." delay={0.1} />
            <br />
            <WordReveal
              text="Made for Growth."
              delay={0.3}
              className="text-white/50"
            />
          </h1>

          {/* Subheading */}
          <FadeUp delay={0.7}>
            <p
              className="text-white/40 max-w-xl mx-auto leading-relaxed"
              style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", fontWeight: 300 }}
            >
              One platform for every property operation
            </p>
          </FadeUp>

          {/* CTA */}
          <FadeUp delay={0.9}>
            <div className="mt-14">
              <Link
                href="/features"
                className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full text-sm font-bold tracking-wide transition-all duration-300 hover:bg-black hover:text-white border border-white"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Explore Platform
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </FadeUp>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════ MANIFESTO */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <Rule />

        <FadeUp>
          <p
            className="text-white/60 leading-[1.9] text-center"
            style={{ fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)", fontWeight: 300 }}
          >
            Skitec is redefining how modern property operations are managed —
            combining{" "}
            <span className="text-white font-normal">automation</span>,{" "}
            <span className="text-white font-normal">intelligence</span>, and{" "}
            <span className="text-white font-normal">simplicity</span> into one
            seamless platform.
          </p>
        </FadeUp>

        <FadeUp delay={0.15}>
          <p
            className="text-white/40 leading-[1.9] text-center mt-8"
            style={{ fontSize: "clamp(0.95rem, 1.8vw, 1.1rem)", fontWeight: 300 }}
          >
            In today&apos;s fast-paced world, property management is often
            fragmented — multiple tools, manual processes, and limited
            visibility slowing down growth. Skitec solves this by bringing
            everything together into a single AI-powered operating layer
            designed for efficiency and scale.
          </p>
        </FadeUp>

        <Rule delay={0.2} />
      </section>

      {/* ════════════════════════════════════════════════════ PROBLEM / SOLUTION */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {[
            {
              number: "01",
              label: "The Problem",
              heading: "Fragmented by design",
              body: "Property teams juggle WhatsApp groups, spreadsheets, and disconnected tools. The result: inefficiency, miscommunication, and missed revenue.",
            },
            {
              number: "02",
              label: "The Solution",
              heading: "One unified platform",
              body: "Skitec consolidates operations, analytics, communication, and automation into a single AI-powered workspace — purpose-built for property teams.",
            },
            {
              number: "03",
              label: "The Difference",
              heading: "Intelligence at the core",
              body: "Beyond management. Skitec surfaces smart insights, automates repetitive workflows, and unlocks growth opportunities that traditional tools simply miss.",
            },
          ].map((item, i) => (
            <GlassCard key={i} delay={i * 0.12} className="p-8 lg:p-10">
              <p className="font-mono text-[10px] tracking-[0.3em] text-white/20 uppercase mb-6">
                {item.number} — {item.label}
              </p>
              <h3
                className="text-white mb-4 leading-snug"
                style={{ fontSize: "clamp(1.2rem, 2vw, 1.5rem)", fontWeight: 700, letterSpacing: "-0.02em" }}
              >
                {item.heading}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                {item.body}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ STATS */}
      <section className="border-y border-white/[0.07] py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-white/[0.07]">
            {[
              { value: 10, suffix: "×", label: "Faster Operations" },
              { value: 99, suffix: "%", label: "Uptime Guaranteed" },
              { value: 50, suffix: "+", label: "Properties Served" },
              { value: 1200, suffix: "+", label: "Active Users" },
            ].map((stat, i) => (
              <FadeUp key={i} delay={i * 0.1} className="text-center py-8 px-6">
                <p
                  className="text-white leading-none mb-3"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900, letterSpacing: "-0.04em" }}
                >
                  <Counter to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-white/30 text-xs uppercase tracking-[0.2em]" style={{ fontWeight: 400 }}>
                  {stat.label}
                </p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ MISSION & VISION */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Mission */}
          <GlassCard delay={0} className="p-10 lg:p-14 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />
            <p className="font-mono text-[10px] tracking-[0.3em] text-white/20 uppercase mb-8">Mission</p>
            <h2
              className="text-white mb-6 leading-snug"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.03em" }}
            >
              Simplify operations. Enable scale.
            </h2>
            <p className="text-white/40 leading-relaxed text-sm" style={{ fontWeight: 300 }}>
              Our mission is to give every property owner and management team
              access to enterprise-grade operational intelligence — regardless
              of size or geography. We remove the friction so you can focus on
              what matters: growth.
            </p>
          </GlassCard>

          {/* Vision */}
          <GlassCard delay={0.12} className="p-10 lg:p-14 relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />
            <p className="font-mono text-[10px] tracking-[0.3em] text-white/20 uppercase mb-8">Vision</p>
            <h2
              className="text-white mb-6 leading-snug"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.03em" }}
            >
              The global OS for property management.
            </h2>
            <p className="text-white/40 leading-relaxed text-sm" style={{ fontWeight: 300 }}>
              We envision a world where property operations run themselves —
              where automation handles the routine, intelligence surfaces the
              opportunities, and teams focus entirely on delivering exceptional
              experiences.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ PILLARS */}
      <section className="border-t border-white/[0.07] py-28 max-w-7xl mx-auto px-6 lg:px-10">
        <FadeUp className="mb-16 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-white/20 uppercase mb-4">
            What we stand for
          </p>
          <h2
            className="text-white"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.03em" }}
          >
            Four principles. One direction.
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { num: "I", title: "Clarity First", body: "Every decision we make removes complexity — never adds to it." },
            { num: "II", title: "Owner Obsessed", body: "Every feature originates from a real problem faced by a real property team." },
            { num: "III", title: "Speed by Design", body: "Slow decisions cost money. Our platform is architected for velocity." },
            { num: "IV", title: "Globally Minded", body: "Built for property teams across languages, timezones, and markets." },
          ].map((p, i) => (
            <GlassCard key={i} delay={i * 0.1} className="p-8">
              <p
                className="text-white/10 mb-6 leading-none"
                style={{ fontSize: "3rem", fontWeight: 900, fontStyle: "italic" }}
              >
                {p.num}
              </p>
              <h3
                className="text-white mb-3"
                style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em" }}
              >
                {p.title}
              </h3>
              <p className="text-white/35 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                {p.body}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ CLOSING */}
      <section className="border-t border-white/[0.07] py-32 px-6 text-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.025] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <FadeUp>
            <p className="font-mono text-[10px] tracking-[0.3em] text-white/20 uppercase mb-10">
              The bottom line
            </p>
            <h2
              className="text-white leading-[1.1] mb-10"
              style={{
                fontSize: "clamp(2rem, 5vw, 4rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                fontStyle: "italic",
              }}
            >
              "Skitec isn&apos;t just a tool —<br className="hidden md:block" />
              it&apos;s your growth partner."
            </h2>
            <p className="text-white/30 text-sm leading-relaxed max-w-xl mx-auto mb-14" style={{ fontWeight: 300 }}>
              Built for owners and teams who aim to grow. Skitec goes beyond
              management — empowering smarter decisions, streamlined workflows,
              and intelligent insights at every step.
            </p>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/features"
                className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full text-sm font-bold tracking-wide transition-all duration-300 hover:bg-transparent hover:text-white border border-white"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Explore Platform
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 text-white/40 hover:text-white text-sm transition-colors duration-200 px-6 py-4"
                style={{ fontFamily: "'Merriweather', Georgia, serif" }}
              >
                Get in touch ↗
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
}
