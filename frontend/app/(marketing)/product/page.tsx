"use client";

import { motion } from "motion/react";
import { Building2, Users, ClipboardList, BarChart3, Shield, Truck, CheckCircle2, ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import featuresImage from "@/assets/images/29e74de416f53872ca69eea9a24e1e8b027f7ef5.png";

const modules = [
  {
    icon: Building2,
    title: "Property Management",
    color: "#3B82F6",
    desc: "Manage all your properties from one place.",
    bgPos: "0% 0%",
    features: [
      "Centralized property profiles",
      "Room & suite tracking",
      "Department management",
      "Vendor & supplier registry",
      "Ownership structure mapping",
    ],
  },
  {
    icon: Users,
    title: "Employee Management",
    color: "#6366F1",
    desc: "Full workforce visibility across every property.",
    bgPos: "50% 0%",
    features: [
      "Staff profiles & roles",
      "Department assignments",
      "Shift scheduling",
      "Attendance tracking",
      "Performance records",
    ],
  },
  {
    icon: ClipboardList,
    title: "SOP Management",
    color: "#10B981",
    desc: "Standardize operations with versioned SOPs.",
    bgPos: "100% 0%",
    features: [
      "Create & version SOPs",
      "Department-specific access",
      "Compliance tracking",
      "Staff acknowledgment",
      "Audit trail",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    color: "#8B5CF6",
    desc: "Data-driven decisions from real-time dashboards.",
    bgPos: "0% 100%",
    features: [
      "Revenue dashboards",
      "Occupancy tracking",
      "Departmental KPI reports",
      "Export to PDF / CSV",
      "Automated scheduled reports",
    ],
  },
  {
    icon: Shield,
    title: "KRA Monitoring",
    color: "#0EA5E9",
    desc: "Hold every team accountable with clear KRAs.",
    bgPos: "50% 100%",
    features: [
      "Daily / weekly / monthly KRAs",
      "Real-time compliance scores",
      "Department-level dashboards",
      "Manager accountability views",
      "Trend analysis",
    ],
  },
  {
    icon: Truck,
    title: "Inventory & Stock",
    color: "#06B6D4",
    desc: "Track stock across all properties seamlessly.",
    bgPos: "100% 100%",
    features: [
      "Multi-property stock tracking",
      "Low-stock alerts",
      "Purchase order management",
      "Audit trail & history",
      "Category-based organization",
    ],
  },
];

function ModuleCard({ mod, index }: { mod: typeof modules[0]; index: number }) {
  const isOdd = index % 2 === 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: 0.05 }}
      className={`bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center group ${isOdd ? "md:flex-row-reverse" : ""}`}
    >
      <div className="flex-1 w-full">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
          style={{ backgroundColor: mod.color + "15" }}
        >
          <mod.icon className="w-6 h-6" style={{ color: mod.color }} />
        </div>
        <h3 className="text-slate-900 mb-2" style={{ fontSize: "1.3rem", fontWeight: 800 }}>{mod.title}</h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">{mod.desc}</p>
        <ul className="space-y-2.5">
          {mod.features.map((f, j) => (
            <li key={j} className="flex items-center gap-2.5 text-sm text-slate-700">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: mod.color }} />
              {f}
            </li>
          ))}
        </ul>
      </div>
      {/* Visual */}
      <div className="flex-1 w-full relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center p-8 sm:p-12 min-h-[320px]">
        <div
          className="w-full aspect-[16/10] max-w-[480px] relative transition-transform duration-700 group-hover:scale-[1.03] rounded-xl shadow-[0_8px_30px_-6px_rgba(0,0,0,0.12)] border border-slate-200/50 overflow-hidden bg-white"
          style={{
            backgroundImage: `url(${featuresImage.src})`,
            backgroundSize: "300% 200%",
            backgroundPosition: mod.bgPos,
          }}
        />
      </div>
    </motion.div>
  );
}

export default function ProductPage() {
  return (
    <main className="pt-16">
      {/* Hero */}
      <section className="bg-[#060D1A] py-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-[#3B82F6]/12 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#4F46E5]/10 rounded-full blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[#60A5FA] text-xs uppercase tracking-widest mb-4" style={{ fontWeight: 700 }}>Product</p>
            <h1
              className="text-white max-w-3xl mx-auto"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}
            >
              A complete operating system for{" "}
              <span className="bg-gradient-to-r from-[#60A5FA] to-[#818CF8] bg-clip-text text-transparent">
                property teams
              </span>
            </h1>
            <p className="text-slate-400 mt-6 max-w-xl mx-auto leading-relaxed text-sm">
              Six integrated modules that replace your spreadsheets, WhatsApp groups, and disconnected tools — all in one platform.
            </p>
            <div className="flex items-center justify-center gap-4 mt-10">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/demo"
                  className="bg-gradient-to-r from-[#3B82F6] to-[#4F46E5] text-white px-7 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/40"
                  style={{ fontWeight: 600 }}
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-2 text-slate-300 border border-white/15 px-6 py-3.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" /> Watch Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules Detail */}
      <section className="py-24 bg-[#F8F9FB]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <p className="text-[#3B82F6] text-xs uppercase tracking-widest mb-3" style={{ fontWeight: 700 }}>Modules</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 800, color: "#0F172A", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
              Everything you need,{" "}
              <span className="bg-gradient-to-r from-[#3B82F6] to-[#4F46E5] bg-clip-text text-transparent">
                nothing you don't
              </span>
            </h2>
            <p className="text-slate-500 mt-4 text-sm max-w-lg mx-auto leading-relaxed">
              Each module is purpose-built for hospitality operations and deeply integrated with the others.
            </p>
          </div>
          <div className="space-y-8">
            {modules.map((mod, i) => (
              <ModuleCard key={i} mod={mod} index={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
