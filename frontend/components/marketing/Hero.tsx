"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const HEADLINE = "One platform for every property operation";
const SPEED_MS = 40;

function BlinkingCursor({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
      className="inline-block ml-[3px] w-[2px] h-[0.85em] bg-black rounded"
    />
  );
}

const BANDS = [
  { yp: 0.18, amp: 0.10, freq: 0.0018, speed: 0.00022, phase: 0.0, thickness: 0.22, alpha: 0.13 },
  { yp: 0.30, amp: 0.08, freq: 0.0024, speed: 0.00017, phase: 1.3, thickness: 0.18, alpha: 0.10 },
  { yp: 0.44, amp: 0.12, freq: 0.0014, speed: 0.00028, phase: 2.7, thickness: 0.25, alpha: 0.09 },
  { yp: 0.58, amp: 0.09, freq: 0.0020, speed: 0.00019, phase: 4.1, thickness: 0.20, alpha: 0.08 },
  { yp: 0.70, amp: 0.07, freq: 0.0028, speed: 0.00024, phase: 5.5, thickness: 0.16, alpha: 0.07 },
  { yp: 0.82, amp: 0.06, freq: 0.0016, speed: 0.00015, phase: 3.3, thickness: 0.14, alpha: 0.06 },
];

const SHIMMER_LINES = Array.from({ length: 60 }, () => ({
  x:      Math.random(),
  yStart: Math.random() * 0.6,
  length: 0.08 + Math.random() * 0.18,
  speed:  0.00008 + Math.random() * 0.00012,
  phase:  Math.random() * Math.PI * 2,
  alpha:  0.03 + Math.random() * 0.06,
  width:  0.4 + Math.random() * 1.2,
}));

export default function Hero() {
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const [displayed,  setDisplayed]  = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [showPill,   setShowPill]   = useState(false);
  const [showSub,    setShowSub]    = useState(false);
  const [showCTAs,   setShowCTAs]   = useState(false);
  const [mouse,      setMouse]      = useState({ x: -9999, y: -9999 });

  /* ── MOUSE SPOTLIGHT ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const onLeave = () => setMouse({ x: -9999, y: -9999 });
    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  /* ── TYPEWRITER ── */
  useEffect(() => {
    let idx = 0;
    const tick = () => {
      idx += 1;
      setDisplayed(HEADLINE.slice(0, idx));
      if (idx < HEADLINE.length) {
        const jitter = Math.random() * 18 - 9;
        setTimeout(tick, SPEED_MS + jitter);
      } else {
        setTimeout(() => setTypingDone(true), 100);
        setTimeout(() => setShowPill(true),   200);
        setTimeout(() => setShowSub(true),    500);
        setTimeout(() => setShowCTAs(true),   800);
      }
    };
    const start = setTimeout(tick, 300);
    return () => clearTimeout(start);
  }, []);

  /* ── SPLIT HEADLINE ── */
  const splitIndex = displayed.toLowerCase().indexOf("every");
  const line1 = splitIndex === -1 ? displayed : displayed.slice(0, splitIndex).trim();
  const line2 = splitIndex === -1 ? ""        : displayed.slice(splitIndex);

  /* ── CANVAS: BLACK/GRAY AURORA ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W: number, H: number;

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (ts: number) => {
      ctx.clearRect(0, 0, W, H);

      /* aurora bands */
      BANDS.forEach((b, bi) => {
        const points: { x: number; y: number }[] = [];
        const step = 6;
        for (let x = -step; x <= W + step; x += step) {
          const nx    = x / W;
          const wave1 = Math.sin(nx * b.freq * W + ts * b.speed + b.phase) * b.amp;
          const wave2 = Math.sin(nx * b.freq * W * 1.6 + ts * b.speed * 0.7 + b.phase + 1.2) * b.amp * 0.4;
          const wave3 = Math.cos(nx * b.freq * W * 0.8 + ts * b.speed * 1.3 + b.phase + 2.4) * b.amp * 0.25;
          points.push({ x, y: H * (b.yp + wave1 + wave2 + wave3) });
        }

        const thickness = H * b.thickness;

        for (let t2 = 0; t2 <= 1; t2 += 0.015) {
          const easedAlpha = Math.sin(t2 * Math.PI) * b.alpha;
          if (easedAlpha < 0.002) continue;
          ctx.beginPath();
          points.forEach((p, i) => {
            const py = p.y + (t2 - 0.5) * thickness;
            i === 0 ? ctx.moveTo(p.x, py) : ctx.lineTo(p.x, py);
          });
          const grayVal = Math.floor(30 + t2 * 140);
          ctx.strokeStyle = `rgba(${grayVal},${grayVal},${grayVal},${easedAlpha})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        /* shimmer spine */
        ctx.beginPath();
        points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        const shimmerAlpha = (Math.sin(ts * 0.0006 + bi * 1.1) * 0.5 + 0.5) * b.alpha * 1.8;
        ctx.strokeStyle = `rgba(80,80,80,${shimmerAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      /* vertical shimmer streaks */
      SHIMMER_LINES.forEach((sl) => {
        const x     = sl.x * W;
        const pulse = Math.sin(ts * sl.speed * 1000 + sl.phase);
        const alpha = sl.alpha * (0.4 + pulse * 0.6);
        if (alpha < 0.005) return;
        const yTop = H * sl.yStart + Math.sin(ts * sl.speed * 800 + sl.phase) * H * 0.04;
        const yBot = yTop + sl.length * H;
        const g    = ctx.createLinearGradient(x, yTop, x, yBot);
        g.addColorStop(0,   `rgba(0,0,0,0)`);
        g.addColorStop(0.3, `rgba(60,60,60,${alpha})`);
        g.addColorStop(0.7, `rgba(40,40,40,${alpha * 0.7})`);
        g.addColorStop(1,   `rgba(0,0,0,0)`);
        ctx.beginPath();
        ctx.moveTo(x, yTop);
        ctx.lineTo(x, yBot);
        ctx.strokeStyle = g;
        ctx.lineWidth = sl.width;
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-white overflow-hidden px-4 pt-32 pb-24 flex flex-col justify-center"
    >
      {/* Aurora canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Mouse spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(500px circle at ${mouse.x}px ${mouse.y}px,
            rgba(0,0,0,0.04) 0%,
            rgba(0,0,0,0.015) 40%,
            transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">

        {/* Pill */}
        <AnimatePresence>
          {showPill && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-5 py-2 rounded-full border border-black/10 bg-white/70 backdrop-blur-sm text-xs text-neutral-700"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Built for Owners. Made for Growth
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Headline */}
        <h1 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.1] text-black">
          <motion.span
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="block font-medium"
          >
            {line1}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="block italic text-neutral-600 font-light"
          >
            {line2}
          </motion.span>
          <BlinkingCursor visible={!typingDone} />
        </h1>

        {/* Subtext */}
        <AnimatePresence>
          {showSub && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-neutral-700 max-w-xl leading-relaxed"
            >
              Centralise property management, workforce, SOPs, finance, and
              reporting — in one elegant, automated workspace.
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA */}
        <AnimatePresence>
          {showCTAs && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10"
            >
              <Link
                href="/demo"
                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 transition shadow-lg shadow-black/10 hover:shadow-xl"
              >
                Book a Demo <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust badges */}
        <AnimatePresence>
          {showCTAs && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10"
            >
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">

                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/70 border border-black/10 backdrop-blur-md hover:border-black/20 transition shadow-sm"
                >
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                  </svg>
                  <span className="text-sm font-medium text-black">Fast Setup</span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/70 border border-black/10 backdrop-blur-md hover:border-black/20 transition shadow-sm"
                >
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l7 4v6c0 5-3.8 9.7-7 10-3.2-.3-7-5-7-10V6l7-4z" />
                  </svg>
                  <span className="text-sm font-medium text-black">Enterprise Security</span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/70 border border-black/10 backdrop-blur-md hover:border-black/20 transition shadow-sm"
                >
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18M7 13l3-3 4 4 5-5" />
                  </svg>
                  <span className="text-sm font-medium text-black">Real-Time Analytics</span>
                </motion.div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Dashboard image */}
      <AnimatePresence>
        {showCTAs && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
            className="mt-8 md:mt-10 w-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-7xl px-4"
            >
              <div className="absolute inset-x-8 -bottom-6 top-10 bg-black/30 blur-3xl rounded-3xl -z-10" />
              <div className="absolute inset-x-16 -bottom-2 top-16 bg-black/20 blur-2xl rounded-3xl -z-10" />
              <div className="relative backdrop-blur-sm bg-white/10 rounded-3xl p-1 border border-white/20 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl pointer-events-none" />
                <motion.img
                  src="/dashboard.png"
                  alt="Dashboard Preview"
                  className="relative w-full rounded-3xl shadow-[0_80px_160px_rgba(0,0,0,0.45)] border border-white/30"
                  initial={{ scale: 0.94 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent rounded-b-3xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
