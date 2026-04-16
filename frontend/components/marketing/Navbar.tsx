"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import Link from "next/link";

// ─── IMPORTANT ───────────────────────────────────────────────────────────────
// Replace these image URLs with your own hosted images for production.
// Using next/image with a proper domain whitelist is recommended.
// The URLs below use images.unsplash.com with crossOrigin-safe parameters.
// ─────────────────────────────────────────────────────────────────────────────

const menuLinks = [
  {
    label: "Home",
    href: "/",
    number: "01",
    tag: "Start here",
    img: "https://images.unsplash.com/photo-1497366754035-f200581374c7?auto=format&fit=crop&w=900&q=80",
    caption: "Start here",
    sub: "Your journey begins",
  },
  {
    label: "About Us",
    href: "/about",
    number: "02",
    tag: "Our story",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    caption: "Our story",
    sub: "The people behind Skitec",
  },
  {
    label: "Features",
    href: "/features",
    number: "03",
    tag: "What we do",
    img: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=900&q=80",
    caption: "What we do",
    sub: "Powerful tools, refined",
  },
  {
    label: "Solutions",
    href: "/solutions",
    number: "04",
    tag: "For you",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    caption: "For you",
    sub: "Tailored to your needs",
  },
  {
    label: "Why Skitec",
    href: "/why-skitec",
    number: "05",
    tag: "The case",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
    caption: "The case",
    sub: "Why we stand apart",
  },
  {
    label: "Pricing",
    href: "/pricing",
    number: "06",
    tag: "Fair & clear",
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    caption: "Fair & clear",
    sub: "Transparent pricing",
  },
  {
    label: "FAQs",
    href: "/faqs",
    number: "07",
    tag: "Got questions?",
    img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80",
    caption: "Got questions?",
    sub: "We have answers",
  },
];

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80";

// ── Preload all images as soon as the module loads ────────────────────────────
if (typeof window !== "undefined") {
  [DEFAULT_IMG, ...menuLinks.map((l) => l.img)].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

// ── Single image slide ────────────────────────────────────────────────────────
function ImageSlide({
  src,
  alt,
  visible,
  caption,
  sub,
}: {
  src: string;
  alt: string;
  visible: boolean;
  caption?: string;
  sub?: string;
}) {
  return (
    <motion.div
      className="absolute inset-0"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Image with zoom-out on activate */}
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        animate={{ scale: visible ? 1 : 1.08 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        loading="eager"
      />

      {/* Caption overlay — only for named slides */}
      {caption && sub && (
        <motion.div
          className="absolute inset-0 flex flex-col justify-end"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)",
          }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.4, delay: visible ? 0.1 : 0 }}
        >
          <div className="px-7 pb-7">
            <motion.p
              className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/60 mb-[5px]"
              animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 7 }}
              transition={{ duration: 0.35, delay: visible ? 0.18 : 0 }}
            >
              {caption}
            </motion.p>
            <motion.p
              className="text-white font-light leading-snug"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(1.1rem, 1.6vw, 1.5rem)",
                letterSpacing: "-0.01em",
              }}
              animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 9 }}
              transition={{ duration: 0.4, delay: visible ? 0.22 : 0 }}
            >
              {sub}
            </motion.p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* ══════════════════════════════════════════════════════════ NAVBAR */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.07)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-between h-[68px] lg:h-[76px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-black rounded-[10px] flex items-center justify-center transition-all duration-300 group-hover:rounded-full group-hover:scale-105">
                <Zap className="w-[15px] h-[15px]" fill="white" strokeWidth={0} />
              </div>
              <span
                className="text-black font-semibold text-[17px] tracking-[-0.01em]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Skitec
              </span>
            </Link>

            {/* Right controls */}
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="hidden md:inline-flex items-center text-black/40 hover:text-black text-[13px] font-medium transition-colors duration-200"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Sign Up
              </Link>
              <span className="hidden md:block w-px h-3.5 bg-black/12" />

              {/* Menu button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
                className="group relative flex items-center gap-3 px-[18px] py-[9px] rounded-full bg-black text-white overflow-hidden"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="flex flex-col justify-center gap-[4.5px] w-[16px] relative z-10">
                  <span className="block h-[1.5px] w-full bg-white rounded-full" />
                  <span className="block h-[1.5px] w-[10px] bg-white/60 rounded-full" />
                </span>
                <span
                  className="text-[10.5px] font-semibold tracking-[0.2em] uppercase relative z-10"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Menu
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ══════════════════════════════════════════════ FULLSCREEN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden"
          >

            {/* ── TOP BAR ── */}
            <div className="flex items-center justify-between px-8 md:px-16 pt-6 pb-4 shrink-0">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 group"
              >
                <div className="w-7 h-7 bg-black rounded-[8px] flex items-center justify-center transition-all duration-300 group-hover:rounded-full">
                  <Zap className="w-[13px] h-[13px]" fill="white" strokeWidth={0} />
                </div>
                <span
                  className="text-black font-semibold text-[15px]"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Skitec
                </span>
              </Link>

              <motion.button
                onClick={() => setIsOpen(false)}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-black/12 hover:border-black/30 transition-all duration-200"
              >
                <span className="relative w-3 h-3 flex items-center justify-center">
                  <span className="block w-3 h-[1.5px] bg-black/40 group-hover:bg-black rotate-45 absolute transition-colors duration-200" />
                  <span className="block w-3 h-[1.5px] bg-black/40 group-hover:bg-black -rotate-45 absolute transition-colors duration-200" />
                </span>
                <span
                  className="text-[10px] font-semibold tracking-[0.2em] uppercase text-black/40 group-hover:text-black transition-colors duration-200"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Close
                </span>
              </motion.button>
            </div>

            {/* top rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
              className="h-px bg-black/8 mx-8 md:mx-16 origin-left shrink-0"
            />

            {/* ── BODY ── */}
            <div className="flex-1 flex min-h-0 overflow-hidden">

              {/* LEFT — links */}
              <div className="flex-1 flex items-center min-h-0 overflow-hidden">
                <div className="w-full px-8 md:px-16">
                  {menuLinks.map((link, i) => (
                    <div key={link.label} className="relative">

                      {/* hover fill bg */}
                      <motion.div
                        className="absolute inset-y-0 -inset-x-8 md:-inset-x-16 pointer-events-none"
                        animate={{ opacity: hovered === i ? 1 : 0 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(0,0,0,0.025) 0%, transparent 80%)",
                        }}
                      />

                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        className="group flex items-center gap-5 md:gap-8 py-[10px] md:py-[12px] relative"
                      >
                        {/* ordinal + tag */}
                        <div className="flex flex-col items-end w-10 md:w-20 shrink-0">
                          <motion.span
                            animate={{ opacity: hovered === i ? 0.7 : 0.2 }}
                            transition={{ duration: 0.2 }}
                            className="font-mono text-[10px] tracking-[0.25em] text-black tabular-nums"
                          >
                            {link.number}
                          </motion.span>
                          <motion.span
                            animate={{ opacity: hovered === i ? 0.4 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="hidden md:block text-[9px] tracking-widest uppercase text-black/50 mt-0.5 whitespace-nowrap"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {link.tag}
                          </motion.span>
                        </div>

                        {/* vertical divider */}
                        <motion.div
                          className="hidden md:block w-px self-stretch"
                          animate={{
                            background:
                              hovered === i ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.07)",
                          }}
                          transition={{ duration: 0.2 }}
                        />

                        {/* label */}
                        <motion.span
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: 0.16 + i * 0.065,
                            duration: 0.55,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="flex-1 leading-none font-light transition-all duration-300"
                          style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: "clamp(1.65rem, 3.8vw, 3.4rem)",
                            letterSpacing: "-0.02em",
                            color:
                              hovered === null
                                ? "#0a0a0a"
                                : hovered === i
                                ? "#000"
                                : "rgba(0,0,0,0.15)",
                          }}
                        >
                          {link.label}
                        </motion.span>

                        {/* arrow circle */}
                        <motion.div
                          className="shrink-0 w-9 h-9 rounded-full border border-black/20 flex items-center justify-center"
                          animate={{
                            opacity: hovered === i ? 1 : 0,
                            scale: hovered === i ? 1 : 0.6,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-black/50 text-base leading-none">→</span>
                        </motion.div>
                      </Link>

                      {/* item rule */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          delay: 0.1 + i * 0.05,
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="h-px bg-black/7 origin-left"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — image panel (lg screens only) */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="hidden lg:flex w-[38%] shrink-0 items-center justify-center py-8 pr-12"
              >
                {/* card */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-neutral-100 shadow-[0_24px_64px_rgba(0,0,0,0.10),0_4px_16px_rgba(0,0,0,0.06)]">

                  {/* Default ambient image */}
                  <ImageSlide
                    src={DEFAULT_IMG}
                    alt="Skitec"
                    visible={hovered === null}
                  />

                  {/* Per-item images — all 7 including Home */}
                  {menuLinks.map((link, i) => (
                    <ImageSlide
                      key={link.label}
                      src={link.img}
                      alt={link.label}
                      visible={hovered === i}
                      caption={link.caption}
                      sub={link.sub}
                    />
                  ))}

                  {/* Brand pill top-right */}
                  <motion.div
                    className="absolute top-5 right-5 z-10 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span
                      className="text-white/80 text-[9px] tracking-[0.2em] uppercase font-semibold"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Skitec
                    </span>
                  </motion.div>

                </div>
              </motion.div>
            </div>

            {/* ── BOTTOM BAR ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.35 }}
              className="shrink-0"
            >
              <div className="h-px bg-black/7 mx-8 md:mx-16" />
              <div className="flex items-center justify-between px-8 md:px-16 py-4">
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-black/25">
                  © 2026 Skitec
                </span>
                <div className="flex items-center gap-5">
                  {["Instagram ↗", "Twitter ↗", "LinkedIn ↗"].map((s) => (
                    <a
                      key={s}
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono tracking-[0.18em] uppercase text-black/25 hover:text-black/60 transition-colors duration-200"
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
