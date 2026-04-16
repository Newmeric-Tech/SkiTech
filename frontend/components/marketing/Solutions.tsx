"use client";

// Add to layout.tsx <head>:
// <link rel="preconnect" href="https://fonts.googleapis.com" />
// <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet" />

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED ILLUSTRATIONS — one unique SVG animation per card
// ─────────────────────────────────────────────────────────────────────────────

/** Card 1: Property Owners — animated building + revenue bar chart */
function IllustrationOwners({ hovered }: { hovered: boolean }) {
  return (
    <svg viewBox="0 0 260 140" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f4ff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="bldg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#333" />
        </linearGradient>
      </defs>
      <rect width="260" height="140" fill="url(#sky1)" rx="12" />

      {/* Ground line */}
      <line x1="0" y1="118" x2="260" y2="118" stroke="#e5e7eb" strokeWidth="1" />

      {/* Building 1 - tall */}
      <motion.rect
        x="30" y="40" width="38" height="78" rx="3" fill="url(#bldg1)"
        initial={{ scaleY: 0 }} animate={{ scaleY: hovered ? 1 : 0.85 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ transformOrigin: "30px 118px" }}
      />
      {/* windows */}
      {[50,62,74,86,98].map((y, i) => (
        <motion.rect key={i} x="35" y={y} width="8" height="6" rx="1"
          fill={hovered ? "#fbbf24" : "#555"}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.07 }}
        />
      ))}
      {[50,62,74,86,98].map((y, i) => (
        <motion.rect key={i} x="48" y={y} width="8" height="6" rx="1"
          fill={hovered && i % 2 === 0 ? "#fbbf24" : "#555"}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.35 + i * 0.07 }}
        />
      ))}

      {/* Building 2 - medium */}
      <motion.rect
        x="80" y="62" width="30" height="56" rx="3" fill="#2d2d2d"
        initial={{ scaleY: 0 }} animate={{ scaleY: hovered ? 1 : 0.85 }}
        transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
        style={{ transformOrigin: "80px 118px" }}
      />
      {[68,80,92,104].map((y, i) => (
        <motion.rect key={i} x="85" y={y} width="7" height="5" rx="1"
          fill={hovered && i === 1 ? "#fbbf24" : "#555"}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.4 + i * 0.07 }}
        />
      ))}
      {[68,80,92,104].map((y, i) => (
        <motion.rect key={i} x="96" y={y} width="7" height="5" rx="1"
          fill="#444"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.4 + i * 0.07 }}
        />
      ))}

      {/* Animated revenue bars on right */}
      <text x="138" y="30" fontSize="8" fill="#9ca3af" fontFamily="Merriweather, Georgia, serif">Revenue</text>
      {[
        { h: 35, x: 138, delay: 0.1, label: "Jan" },
        { h: 52, x: 155, delay: 0.18, label: "Feb" },
        { h: 42, x: 172, delay: 0.26, label: "Mar" },
        { h: 65, x: 189, delay: 0.34, label: "Apr" },
        { h: 58, x: 206, delay: 0.42, label: "May" },
        { h: 80, x: 223, delay: 0.50, label: "Jun" },
      ].map((b) => (
        <g key={b.x}>
          <motion.rect
            x={b.x} y={118 - b.h} width="12" height={b.h} rx="3"
            fill={b.h === 80 ? "#111" : "#d1d5db"}
            initial={{ scaleY: 0 }} animate={{ scaleY: hovered ? 1 : 0.6 }}
            transition={{ duration: 0.55, delay: b.delay, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${b.x}px 118px` }}
          />
          <text x={b.x + 6} y="128" fontSize="6.5" fill="#9ca3af" textAnchor="middle"
            fontFamily="Merriweather, Georgia, serif">{b.label}</text>
        </g>
      ))}

      {/* Rising trend line */}
      <motion.polyline
        points="144,83 161,66 178,76 195,53 212,60 229,38"
        stroke="#111" strokeWidth="1.5" fill="none" strokeDasharray="120"
        initial={{ strokeDashoffset: 120 }} animate={{ strokeDashoffset: hovered ? 0 : 120 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      {/* Dot at end */}
      <motion.circle cx="229" cy="38" r="3" fill="#111"
        initial={{ scale: 0 }} animate={{ scale: hovered ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.9 }}
      />
      <motion.text x="233" y="36" fontSize="7.5" fill="#111" fontFamily="Merriweather, Georgia, serif" fontWeight="600"
        initial={{ opacity: 0 }} animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ delay: 0.9 }}
      >+24%</motion.text>
    </svg>
  );
}

/** Card 2: Property Managers — animated task board / kanban */
function IllustrationManagers({ hovered }: { hovered: boolean }) {
  const tasks = [
    { label: "Clean Room 204", status: "done", y: 38 },
    { label: "Maintenance – HVAC", status: "progress", y: 58 },
    { label: "Guest Check-in 3PM", status: "todo", y: 78 },
    { label: "Invoice Approval", status: "done", y: 98 },
  ];
  const colorMap: Record<string, string> = { done: "#16a34a", progress: "#f59e0b", todo: "#6b7280" };
  const bgMap: Record<string, string> = { done: "#f0fdf4", progress: "#fffbeb", todo: "#f9fafb" };

  return (
    <svg viewBox="0 0 260 140" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="260" height="140" fill="#f8fafc" rx="12" />
      {/* Header bar */}
      <rect x="12" y="14" width="120" height="16" rx="4" fill="#111" />
      <text x="20" y="25.5" fontSize="8" fill="white" fontFamily="Merriweather, Georgia, serif" fontWeight="500">Task Manager</text>
      <motion.rect x="140" y="14" width="16" height="16" rx="4" fill="#111"
        animate={{ rotate: hovered ? 90 : 0 }} transition={{ duration: 0.3 }}
      />

      {tasks.map((t, i) => (
        <motion.g key={t.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
        >
          <rect x="12" y={t.y} width="236" height="17" rx="5"
            fill={bgMap[t.status]} stroke={colorMap[t.status]} strokeOpacity="0.25" strokeWidth="1" />
          {/* Status dot */}
          <circle cx="24" cy={t.y + 8.5} r="3.5" fill={colorMap[t.status]} />
          <text x="33" y={t.y + 12} fontSize="7.5" fill="#374151" fontFamily="Merriweather, Georgia, serif">{t.label}</text>
          {/* Animated checkmark for "done" */}
          {t.status === "done" && (
            <motion.path
              d={`M ${236} ${t.y + 5} l 4 4 6 -6`}
              stroke={colorMap.done} strokeWidth="1.5" fill="none" strokeLinecap="round"
              strokeDasharray="14" initial={{ strokeDashoffset: 14 }}
              animate={{ strokeDashoffset: hovered ? 0 : 14 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            />
          )}
          {/* Progress bar for "in progress" */}
          {t.status === "progress" && (
            <>
              <rect x="180" y={t.y + 6} width="60" height="4" rx="2" fill="#fde68a" />
              <motion.rect x="180" y={t.y + 6} width="0" height="4" rx="2" fill="#f59e0b"
                animate={{ width: hovered ? 38 : 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              />
            </>
          )}
        </motion.g>
      ))}

      {/* Floating avatar stack */}
      {[0, 1, 2].map((j) => (
        <motion.circle key={j} cx={220 + j * 10} cy="22" r="6"
          fill={["#111", "#555", "#999"][j]}
          stroke="white" strokeWidth="1.5"
          animate={{ x: hovered ? j * 2 : 0 }}
          transition={{ duration: 0.3, delay: j * 0.05 }}
        />
      ))}
    </svg>
  );
}

/** Card 3: Business Analytics — animated donut + sparklines */
function IllustrationAnalytics({ hovered }: { hovered: boolean }) {
  // Donut arc helper — round to 4 decimals to avoid SSR/client float mismatch
  const r4 = (n: number) => Number(n.toFixed(4));
  const polarToXY = (cx: number, cy: number, r: number, angle: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: r4(cx + r * Math.cos(rad)), y: r4(cy + r * Math.sin(rad)) };
  };
  const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
    const s = polarToXY(cx, cy, r, start);
    const e = polarToXY(cx, cy, r, end);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const segments = [
    { start: 0, end: 145, color: "#111", label: "Occupied" },
    { start: 148, end: 248, color: "#d1d5db", label: "Vacant" },
    { start: 251, end: 360, color: "#6b7280", label: "Maintenance" },
  ];

  return (
    <svg viewBox="0 0 260 140" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="260" height="140" fill="#fafafa" rx="12" />

      {/* Donut chart */}
      {segments.map((s, i) => (
        <motion.path key={i}
          d={describeArc(70, 72, 42, s.start, s.end)}
          stroke={s.color} strokeWidth="16" strokeLinecap="round" fill="none"
          strokeDasharray="200"
          initial={{ strokeDashoffset: 200 }}
          animate={{ strokeDashoffset: hovered ? 0 : 200 }}
          transition={{ duration: 0.7, delay: 0.1 + i * 0.15, ease: "easeOut" }}
        />
      ))}
      {/* Inner label */}
      <motion.text x="70" y="67" textAnchor="middle" fontSize="14" fontWeight="800" fill="#111"
        fontFamily="Merriweather, serif"
        animate={{ opacity: hovered ? 1 : 0.4 }}
        transition={{ duration: 0.3 }}
      >78%</motion.text>
      <text x="70" y="80" textAnchor="middle" fontSize="6.5" fill="#9ca3af" fontFamily="Merriweather, Georgia, serif">Occupancy</text>

      {/* Legend */}
      {segments.map((s, i) => (
        <g key={i}>
          <rect x="124" y={20 + i * 14} width="7" height="7" rx="2" fill={s.color} />
          <text x="135" y={27.5 + i * 14} fontSize="7" fill="#6b7280" fontFamily="Merriweather, Georgia, serif">{s.label}</text>
        </g>
      ))}

      {/* Sparkline — Revenue */}
      <text x="124" y="78" fontSize="7" fill="#9ca3af" fontFamily="Merriweather, Georgia, serif">Revenue trend</text>
      <motion.polyline
        points="124,112 140,102 156,107 172,95 188,98 204,84 220,88 236,72"
        stroke="#111" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="160"
        initial={{ strokeDashoffset: 160 }}
        animate={{ strokeDashoffset: hovered ? 0 : 160 }}
        transition={{ duration: 0.9, delay: 0.3 }}
      />
      {/* Area fill */}
      <motion.path
        d="M124,112 140,102 156,107 172,95 188,98 204,84 220,88 236,72 236,120 124,120 Z"
        fill="#111" fillOpacity="0.05"
        initial={{ opacity: 0 }} animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
      {/* End dot */}
      <motion.circle cx="236" cy="72" r="3" fill="#111"
        initial={{ scale: 0 }} animate={{ scale: hovered ? 1 : 0 }}
        transition={{ delay: 1 }}
      />
    </svg>
  );
}

/** Card 4: AI Automation — animated neural/flow nodes */
function IllustrationAI({ hovered }: { hovered: boolean }) {
  const nodes = [
    { x: 30, y: 70, label: "Input" },
    { x: 90, y: 40, label: "Parse" },
    { x: 90, y: 100, label: "Filter" },
    { x: 155, y: 70, label: "AI Core" },
    { x: 220, y: 45, label: "Alert" },
    { x: 220, y: 95, label: "Action" },
  ];
  const edges = [
    [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5],
  ];

  return (
    <svg viewBox="0 0 260 140" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="aicore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#111" />
          <stop offset="100%" stopColor="#333" />
        </radialGradient>
      </defs>
      <rect width="260" height="140" fill="#f9fafb" rx="12" />

      {/* Edges */}
      {edges.map(([a, b], i) => {
        const na = nodes[a], nb = nodes[b];
        const len = Math.hypot(nb.x - na.x, nb.y - na.y);
        return (
          <motion.line key={i}
            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke="#d1d5db" strokeWidth="1.5" strokeDasharray={len}
            initial={{ strokeDashoffset: len }}
            animate={{ strokeDashoffset: hovered ? 0 : len }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
          />
        );
      })}

      {/* Animated pulse on edges when hovered */}
      {hovered && edges.map(([a, b], i) => {
        const na = nodes[a], nb = nodes[b];
        return (
          <motion.circle key={`p${i}`} r="3" fill="#111"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity, ease: "linear" }}
            style={{
              offsetPath: `path("M ${na.x} ${na.y} L ${nb.x} ${nb.y}")`,
            } as React.CSSProperties}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n, i) => {
        const isCore = n.label === "AI Core";
        return (
          <motion.g key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 + i * 0.08, duration: 0.4, type: "spring", stiffness: 200 }}
          >
            <motion.circle cx={n.x} cy={n.y} r={isCore ? 18 : 12}
              fill={isCore ? "url(#aicore)" : "white"}
              stroke={isCore ? "#111" : "#d1d5db"} strokeWidth={isCore ? 0 : 1.5}
              animate={{ scale: hovered && isCore ? [1, 1.08, 1] : 1 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {/* Outer pulse ring for AI Core */}
            {isCore && (
              <motion.circle cx={n.x} cy={n.y} r="18"
                stroke="#111" strokeWidth="1" fill="none"
                animate={{ r: hovered ? [18, 26, 18] : 18, opacity: hovered ? [0.4, 0, 0.4] : 0.2 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <text x={n.x} y={n.y + (isCore ? 4 : 3.5)} textAnchor="middle"
              fontSize={isCore ? 7 : 6} fill={isCore ? "white" : "#374151"}
              fontFamily="Merriweather, Georgia, serif" fontWeight="600">
              {n.label}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

/** Card 5: Multi-Property — animated map pins with property grid */
function IllustrationMulti({ hovered }: { hovered: boolean }) {
  const pins = [
    { x: 55, y: 52, size: 14, label: "Dubai" },
    { x: 110, y: 78, size: 10, label: "London" },
    { x: 165, y: 44, size: 12, label: "NYC" },
    { x: 210, y: 88, size: 9, label: "Paris" },
    { x: 78, y: 96, size: 8, label: "Berlin" },
  ];

  return (
    <svg viewBox="0 0 260 140" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="260" height="140" fill="#f0f4ff" rx="12" />
      {/* World-map style grid */}
      {[30,50,70,90,110].map(y => (
        <line key={y} x1="10" y1={y} x2="250" y2={y} stroke="#c7d2fe" strokeWidth="0.5" strokeDasharray="4 4" />
      ))}
      {[40,80,120,160,200,240].map(x => (
        <line key={x} x1={x} y1="10" x2={x} y2="130" stroke="#c7d2fe" strokeWidth="0.5" strokeDasharray="4 4" />
      ))}

      {/* Connection lines between pins */}
      {[[0,1],[1,2],[2,3],[0,4],[4,1]].map(([a,b],i) => (
        <motion.line key={i}
          x1={pins[a].x} y1={pins[a].y}
          x2={pins[b].x} y2={pins[b].y}
          stroke="#818cf8" strokeWidth="1" strokeOpacity="0.5"
          strokeDasharray="80"
          initial={{ strokeDashoffset: 80 }}
          animate={{ strokeDashoffset: hovered ? 0 : 80 }}
          transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
        />
      ))}

      {/* Pins */}
      {pins.map((p, i) => (
        <motion.g key={i}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 + i * 0.12, type: "spring", stiffness: 200 }}
        >
          {/* Shadow */}
          <ellipse cx={p.x} cy={p.y + p.size * 0.8} rx={p.size * 0.5} ry={3} fill="rgba(0,0,0,0.1)" />
          {/* Pin body */}
          <motion.path
            d={`M ${p.x} ${p.y - p.size}
               a ${p.size * 0.6} ${p.size * 0.6} 0 1 1 0.01 0
               L ${p.x} ${p.y}`}
            fill="#111"
            animate={{ scale: hovered ? 1.15 : 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            style={{ transformOrigin: `${p.x}px ${p.y}px` }}
          />
          <circle cx={p.x} cy={p.y - p.size * 0.55} r={p.size * 0.28} fill="white" />
          {/* Label bubble */}
          <motion.g
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
            transition={{ duration: 0.25, delay: 0.2 + i * 0.06 }}
          >
            <rect x={p.x - 16} y={p.y - p.size - 18} width="32" height="13" rx="4" fill="#111" />
            <text x={p.x} y={p.y - p.size - 8.5} textAnchor="middle"
              fontSize="6.5" fill="white" fontFamily="Merriweather, Georgia, serif">{p.label}</text>
          </motion.g>
        </motion.g>
      ))}

      {/* Stats overlay bottom-right */}
      <motion.rect x="175" y="102" width="72" height="30" rx="8" fill="white"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.10))" }}
        animate={{ y: hovered ? 100 : 102 }}
        transition={{ duration: 0.4 }}
      />
      <text x="182" y="115" fontSize="7" fill="#9ca3af" fontFamily="Merriweather, Georgia, serif">Properties</text>
      <motion.text x="182" y="127" fontSize="11" fontWeight="800" fill="#111" fontFamily="Merriweather, serif"
        animate={{ opacity: hovered ? 1 : 0.5 }}
      >248</motion.text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const TABS = ["All", "Owners", "Managers", "Enterprise"] as const;
type Tab = (typeof TABS)[number];

const solutions = [
  {
    tab: "Owners" as Tab,
    Illustration: IllustrationOwners,
    title: "Property Owners",
    description: "Take full control of your property business with real-time visibility and smarter decision-making.",
    bullets: ["Monitor bookings and revenue in one place", "Manage multiple properties effortlessly", "Get AI-driven insights to grow faster"],
    cta: "Manage Smarter",
  },
  {
    tab: "Managers" as Tab,
    Illustration: IllustrationManagers,
    title: "Property Managers",
    description: "Streamline daily operations and eliminate manual chaos with structured workflows.",
    bullets: ["Automate routine operational tasks", "Assign, track, and manage staff activities", "Improve efficiency across departments"],
    cta: "Optimize Operations",
  },
  {
    tab: "Enterprise" as Tab,
    Illustration: IllustrationAnalytics,
    title: "Business Analytics",
    description: "Turn your data into actionable insights that drive measurable growth.",
    bullets: ["Visual dashboards for better decisions", "Forecast revenue and occupancy trends", "Identify opportunities to increase profits"],
    cta: "Grow Faster",
  },
  {
    tab: "Enterprise" as Tab,
    Illustration: IllustrationAI,
    title: "AI-Powered Automation",
    description: "Let intelligent automation handle repetitive work while you focus on growth.",
    bullets: ["Smart alerts and recommendations", "Automated workflows and task handling", "AI-powered decision support"],
    cta: "Work Smarter",
  },
  {
    tab: "Owners" as Tab,
    Illustration: IllustrationMulti,
    title: "Multi-Property Management",
    description: "Scale your business with centralized control across all your properties.",
    bullets: ["Manage all properties from a single dashboard", "Unified reporting and performance tracking", "Seamless expansion without complexity"],
    cta: "Scale Easily",
  },
];

const STATS = [
  { value: "+40%", label: "Operational Efficiency" },
  { value: "+25%", label: "Revenue Growth" },
  { value: "−60%", label: "Manual Work" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CARD — with 3-D tilt on mouse-move
// ─────────────────────────────────────────────────────────────────────────────
function SolutionCard({ Illustration, title, description, bullets, cta, index }: (typeof solutions)[0] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [hovered, setHovered] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => {
    mx.set(0); my.set(0); setHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      className="group relative flex flex-col rounded-2xl bg-white overflow-hidden cursor-pointer"
    >
      {/* Border + shadow via wrapper */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          boxShadow: hovered
            ? "0 32px 72px rgba(0,0,0,0.13), 0 4px 20px rgba(0,0,0,0.07)"
            : "0 2px 14px rgba(0,0,0,0.05)",
        }}
        transition={{ duration: 0.35 }}
        style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: "inherit", pointerEvents: "none" }}
      />

      {/* Animated top line */}
      <motion.div className="absolute top-0 left-0 h-[2px] bg-black z-10"
        initial={{ width: "0%" }}
        animate={{ width: hovered ? "100%" : "0%" }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      />

      {/* ── Illustration area ── */}
      <div className="relative h-[148px] overflow-hidden bg-gradient-to-br from-gray-50 to-white border-b border-black/[0.06]">
        {/* Floating decorative circles */}
        <motion.div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-black/[0.03]"
          animate={{ scale: hovered ? 1.2 : 1, opacity: hovered ? 1 : 0.5 }}
          transition={{ duration: 0.6 }}
        />
        <motion.div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-black/[0.02]"
          animate={{ scale: hovered ? 1.3 : 1 }}
          transition={{ duration: 0.7 }}
        />
        <div className="absolute inset-0 p-3">
          <Illustration hovered={hovered} />
        </div>
      </div>

      {/* ── Text content ── */}
      <div className="relative flex flex-col flex-1 p-6">
        <h3 className="text-[1.05rem] font-bold text-black mb-2 tracking-tight"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          {title}
        </h3>
        <p className="text-[0.8rem] text-black/45 leading-relaxed mb-4 font-light"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          {description}
        </p>
        <ul className="flex-1 space-y-2 mb-5" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-[0.79rem] text-black/60">
              <motion.span className="mt-[6px] flex-shrink-0 w-[4px] h-[4px] rounded-full bg-black/30"
                animate={{ scale: hovered ? 1.4 : 1, backgroundColor: hovered ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)" }}
                transition={{ duration: 0.25 }}
              />
              {b}
            </li>
          ))}
        </ul>
        <motion.div className="flex items-center gap-1.5 text-[0.75rem] font-medium tracking-wide"
          animate={{ x: hovered ? 3 : 0, color: hovered ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.38)" }}
          transition={{ duration: 0.22 }}
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}
        >
          {cta}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIDE CARD — spans 2 columns, text left / illustration right
// ─────────────────────────────────────────────────────────────────────────────
function SolutionCardWide({ Illustration, title, description, bullets, cta, index }: (typeof solutions)[0] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col md:flex-row rounded-2xl bg-white overflow-hidden cursor-pointer h-full"
      style={{
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: hovered ? "0 28px 72px rgba(0,0,0,0.12), 0 4px 20px rgba(0,0,0,0.07)" : "0 2px 14px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "box-shadow 0.35s ease, transform 0.35s ease",
      }}
    >
      <motion.div className="absolute top-0 left-0 h-[2px] bg-black z-10"
        initial={{ width: "0%" }} animate={{ width: hovered ? "100%" : "0%" }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      />
      {/* Text */}
      <div className="flex flex-col justify-center p-7 md:p-8 md:w-[52%] flex-shrink-0">
        <h3 className="text-[1.1rem] font-bold text-black mb-2.5 tracking-tight"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}>{title}</h3>
        <p className="text-[0.8rem] text-black/45 leading-relaxed mb-4 font-light"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}>{description}</p>
        <ul className="space-y-2 mb-5" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-[0.79rem] text-black/60">
              <span className="mt-[6px] flex-shrink-0 w-[4px] h-[4px] rounded-full bg-black/30" />{b}
            </li>
          ))}
        </ul>
        <motion.div className="flex items-center gap-1.5 text-[0.75rem] font-medium tracking-wide"
          animate={{ x: hovered ? 3 : 0, color: hovered ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.38)" }}
          transition={{ duration: 0.22 }} style={{ fontFamily: "'Merriweather', Georgia, serif" }}
        >
          {cta}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </motion.div>
      </div>
      {/* Illustration */}
      <div className="relative flex-1 min-h-[180px] bg-gradient-to-br from-gray-50 to-white border-t md:border-t-0 md:border-l border-black/[0.06] overflow-hidden">
        <motion.div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-black/[0.03]"
          animate={{ scale: hovered ? 1.2 : 1 }} transition={{ duration: 0.6 }} />
        <div className="absolute inset-0 p-4">
          <Illustration hovered={hovered} />
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BANNER CARD — full width, dark inverted, text left / illustration right
// ─────────────────────────────────────────────────────────────────────────────
function SolutionCardBanner({ Illustration, title, description, bullets, cta, index }: (typeof solutions)[0] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col md:flex-row rounded-2xl bg-black overflow-hidden cursor-pointer"
      style={{
        boxShadow: hovered ? "0 32px 80px rgba(0,0,0,0.22), 0 4px 20px rgba(0,0,0,0.14)" : "0 4px 24px rgba(0,0,0,0.12)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "box-shadow 0.35s ease, transform 0.35s ease",
      }}
    >
      {/* Shimmer top line */}
      <motion.div className="absolute top-0 left-0 h-[2px] z-10"
        style={{ background: "linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.3) 100%)" }}
        initial={{ width: "0%" }} animate={{ width: hovered ? "100%" : "30%" }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
      />
      {/* Text */}
      <div className="flex flex-col justify-center p-8 md:p-10 md:w-[45%] flex-shrink-0">
        <span className="text-[9px] tracking-[0.32em] text-white/30 mb-4 uppercase font-medium"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}>Scale your portfolio</span>
        <h3 className="text-[1.3rem] md:text-[1.5rem] font-black text-white mb-3 tracking-tight leading-snug"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}>{title}</h3>
        <p className="text-[0.82rem] text-white/45 leading-relaxed mb-5 font-light"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}>{description}</p>
        <ul className="space-y-2.5 mb-7" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-[0.79rem] text-white/60">
              <span className="mt-[6px] flex-shrink-0 w-[4px] h-[4px] rounded-full bg-white/30" />{b}
            </li>
          ))}
        </ul>
        <motion.div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-[0.76rem] font-medium self-start"
          animate={{ scale: hovered ? 1.04 : 1, boxShadow: hovered ? "0 8px 24px rgba(255,255,255,0.15)" : "none" }}
          transition={{ duration: 0.22 }} style={{ fontFamily: "'Merriweather', Georgia, serif" }}
        >
          {cta}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </motion.div>
      </div>
      {/* Illustration on dark */}
      <div className="relative flex-1 min-h-[200px] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bgrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bgrid)" />
        </svg>
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{ background: hovered ? "radial-gradient(circle at 60% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)" : "none" }}
          transition={{ duration: 0.4 }}
        />
        <div className="absolute inset-0 p-6">
          <Illustration hovered={hovered} />
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING BACKGROUND ORBS
// ─────────────────────────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[
        { w: 500, h: 500, top: "-10%", left: "-8%", delay: 0 },
        { w: 400, h: 400, top: "40%", right: "-6%", delay: 2 },
        { w: 300, h: 300, bottom: "5%", left: "30%", delay: 4 },
      ].map((orb, i) => (
        <motion.div key={i}
          className="absolute rounded-full bg-black/[0.025]"
          style={{ width: orb.w, height: orb.h, top: (orb as any).top, left: (orb as any).left, right: (orb as any).right, bottom: (orb as any).bottom }}
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, delay: orb.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export function Solutions() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-40px" });

  const filtered = activeTab === "All" ? solutions : solutions.filter((s) => s.tab === activeTab);

  return (
    <section className="relative w-full bg-white overflow-hidden py-24 md:py-36 px-6 lg:px-12"
      style={{ fontFamily: "'Merriweather', Georgia, serif" }}>



      <div className="relative max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div ref={headingRef} className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
            className="text-[10px] tracking-[0.38em] text-black/30 mb-5 font-medium uppercase"
          >Built for Every Property Business</motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 28 }} animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.62, delay: 0.08 }}
            className="text-4xl md:text-5xl lg:text-[3.4rem] font-black text-black leading-[1.07] tracking-tight mb-5"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            Solutions Built for<br />
            <span className="italic font-light text-black/35">Every Property Owner</span>
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }} animate={headingInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mb-6 h-px w-14 bg-black/15 origin-center"
          />

          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.26 }}
            className="text-base md:text-lg text-black/40 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Whether you manage a single property or an entire portfolio, Skitec gives you the tools
            to simplify operations, boost efficiency, and drive consistent growth.
          </motion.p>
        </div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.34 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex gap-1 p-1 rounded-full" style={{ border: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)" }}>
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="relative px-5 py-2 rounded-full text-[0.78rem] font-medium outline-none"
                style={{ color: activeTab === tab ? "#fff" : "rgba(0,0,0,0.42)", fontFamily: "'Merriweather', Georgia, serif" }}
              >
                {activeTab === tab && (
                  <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-black"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Cards — Bento Grid ── */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
            style={{ perspective: 1000 }}
          >
            {activeTab === "All" ? (
              /* ── BENTO: 2×2 top row + 1 wide bottom ── */
              <div className="flex flex-col gap-5">
                {/* Row 1 — 2 equal cards */}
                <div className="grid md:grid-cols-2 gap-5">
                  {solutions.slice(0, 2).map((s, i) => (
                    <SolutionCard key={s.title} {...s} index={i} />
                  ))}
                </div>
                {/* Row 2 — 3 cards: left wide + 2 stacked right */}
                <div className="grid md:grid-cols-3 gap-5">
                  {/* Card 3 spans 2 cols — horizontal layout */}
                  <div className="md:col-span-2">
                    <SolutionCardWide {...solutions[2]} index={2} />
                  </div>
                  {/* Card 4 normal */}
                  <SolutionCard {...solutions[3]} index={3} />
                </div>
                {/* Row 3 — card 5 full width */}
                <SolutionCardBanner {...solutions[4]} index={4} />
              </div>
            ) : (
              /* ── FILTERED: standard 2-col grid ── */
              <div className="grid md:grid-cols-2 gap-5">
                {filtered.map((s, i) => (
                  <SolutionCard key={s.title} {...s} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Stats strip ── */}
        <div ref={statsRef} className="mt-20 rounded-2xl bg-black overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.1)" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {STATS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 20 }} animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="flex flex-col items-center justify-center py-10 px-8 text-center"
              >
                <motion.span
                  className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2"
                  style={{ fontFamily: "'Merriweather', Georgia, serif" }}
                  animate={statsInView ? { scale: [0.8, 1.05, 1] } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                >{s.value}</motion.span>
                <span className="text-[0.72rem] tracking-[0.2em] text-white/35 uppercase font-medium"
                  style={{ fontFamily: "'Merriweather', Georgia, serif" }}>{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
