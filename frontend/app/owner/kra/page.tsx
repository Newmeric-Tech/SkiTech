"use client";

import { motion } from "motion/react";
import { CheckCircle2, AlertCircle, Clock, Shield } from "lucide-react";

// Fix type definitions
interface StatusDef {
  icon: typeof CheckCircle2;
  color: string;
  label: string;
  bg: string;
}

const kraItems = [
  { dept: "Front Desk", task: "Shift changeover report", due: "08:00 AM", status: "done", compliance: 100 },
  { dept: "Front Desk", task: "Guest check-in verification", due: "09:15 AM", status: "done", compliance: 100 },
  { dept: "Housekeeping", task: "Room inspection — Floor 1-5", due: "10:00 AM", status: "done", compliance: 96 },
  { dept: "Housekeeping", task: "Minibar restocking audit", due: "11:00 AM", status: "pending", compliance: 0 },
  { dept: "F&B", task: "Breakfast service quality check", due: "09:30 AM", status: "done", compliance: 92 },
  { dept: "Maintenance", task: "Preventive maintenance log", due: "02:00 PM", status: "overdue", compliance: 0 },
  { dept: "Security", task: "Perimeter check report", due: "12:00 PM", status: "done", compliance: 100 },
  { dept: "Finance", task: "Daily revenue reconciliation", due: "03:00 PM", status: "pending", compliance: 0 },
];

const deptSummary = [
  { dept: "Front Desk", score: 96, color: "#3B82F6" },
  { dept: "Housekeeping", score: 88, color: "#6366F1" },
  { dept: "F&B", score: 92, color: "#10B981" },
  { dept: "Maintenance", score: 74, color: "#F59E0B" },
  { dept: "Security", score: 98, color: "#8B5CF6" },
  { dept: "Finance", score: 85, color: "#0EA5E9" },
];

const statusMap: Record<string, StatusDef> = {
  done: { icon: CheckCircle2, color: "#10B981", label: "Completed", bg: "bg-black/[0.04] text-black" },
  pending: { icon: Clock, color: "#F59E0B", label: "Pending", bg: "bg-black/[0.04] text-neutral-600" },
  overdue: { icon: AlertCircle, color: "#EF4444", label: "Overdue", bg: "bg-black/[0.04] text-black" },
};

export default function KRAPage() {
  const overall = Math.round(deptSummary.reduce((a, d) => a + d.score, 0) / deptSummary.length);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>KRA Monitoring</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Key Result Area compliance — Today</p>
        </div>
        <div className="flex items-center gap-2 bg-black/[0.04] border border-black/10 rounded-xl px-4 py-2.5">
          <Shield className="w-4 h-4 text-black" />
          <span className="text-black text-sm" style={{ fontWeight: 700 }}>Overall: {overall}%</span>
        </div>
      </div>

      {/* Dept Compliance */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {deptSummary.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-black/10 shadow-sm text-center"
          >
            <div className="relative w-12 h-12 mx-auto mb-3">
              <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={d.color} strokeWidth="3"
                  strokeDasharray={`${d.score} ${100 - d.score}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs" style={{ fontWeight: 700, color: d.color }}>
                {d.score}%
              </span>
            </div>
            <p className="text-neutral-700 text-xs" style={{ fontWeight: 600 }}>{d.dept}</p>
          </motion.div>
        ))}
      </div>

      {/* KRA Table */}
      <div className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10">
          <h3 className="text-black" style={{ fontWeight: 700 }}>Today's KRA Tasks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/50">
                {["Department", "KRA Task", "Due Time", "Status"].map((h, i) => (
                  <th key={i} className="px-5 py-3.5 text-left text-neutral-500 text-xs uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kraItems.map((item, i) => {
                const s = statusMap[item.status as keyof typeof statusMap];
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-t border-black/5 hover:bg-white/50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-xs bg-black/[0.04] text-black px-2.5 py-1 rounded-full" style={{ fontWeight: 600 }}>{item.dept}</span>
                    </td>
                    <td className="px-5 py-4 text-black text-sm">{item.task}</td>
                    <td className="px-5 py-4 text-neutral-500 text-sm">{item.due}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${s.bg}`} style={{ fontWeight: 600 }}>
                        <s.icon className="w-3 h-3" />
                        {s.label}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
