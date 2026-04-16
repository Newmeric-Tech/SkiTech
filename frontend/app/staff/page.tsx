"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, ClipboardList, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, FileText, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { dashboardApi, StaffStats, WeeklyTaskDay, TaskItem } from "@/lib/api";

const statusConfig = {
  done: { color: "#10B981", bg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60", label: "Done" },
  pending: { color: "#F59E0B", bg: "bg-amber-50 text-amber-700 border border-amber-200/60", label: "Pending" },
  upcoming: { color: "#3B82F6", bg: "bg-blue-50 text-blue-700 border border-blue-200/60", label: "Upcoming" },
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300 text-xs">{entry.name}:</span>
            <span className="text-white font-semibold text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function StaffDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StaffStats>({
    shift_hours: 0,
    my_tasks_today: 0,
    my_tasks_overdue: 0,
    completed_this_week: 0,
    pending_sops: 0,
    todays_tasks: [],
    weekly_performance: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getStaffStats();
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch staff stats:", error);
        // Fall back to zero values on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Build stats array dynamically from fetched data
  const stats = [
    {
      icon: Clock,
      label: "Hours Today",
      value: `${data.shift_hours}h`,
      change: "Shift ends at 6:00 PM",
      positive: true,
      color: "#3B82F6",
      trend: "up",
    },
    {
      icon: ClipboardList,
      label: "My Tasks",
      value: String(data.my_tasks_today),
      change: data.my_tasks_overdue > 0 ? `${data.my_tasks_overdue} overdue` : "All on track",
      positive: data.my_tasks_overdue === 0,
      color: "#F59E0B",
      trend: data.my_tasks_overdue > 0 ? "down" : "up",
    },
    {
      icon: CheckCircle2,
      label: "Completed This Week",
      value: String(data.completed_this_week),
      change: "+0 from last week",
      positive: true,
      color: "#10B981",
      trend: "up",
    },
    {
      icon: FileText,
      label: "Pending SOPs",
      value: String(data.pending_sops),
      change: data.pending_sops > 0 ? "Review required" : "All reviewed",
      positive: data.pending_sops === 0,
      color: "#6366F1",
      trend: data.pending_sops > 0 ? "down" : "up",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">My Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back — here's your day at a glance</p>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-emerald-50 border border-emerald-200/60 px-4 py-2 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          On Shift
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                s.positive 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" 
                  : "bg-amber-50 text-amber-700 border border-amber-200/60"
              }`}>
                {s.trend === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-950 tracking-tight">{s.value}</div>
            <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            <div className={`text-xs mt-2 font-medium ${s.positive ? "text-emerald-700" : "text-amber-700"}`}>{s.change}</div>
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}80)` }}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-950 text-lg">My Tasks Today</h3>
              <p className="text-slate-500 text-sm mt-0.5">{data.my_tasks_today} tasks scheduled</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors">
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {data.todays_tasks.length > 0 ? (
              data.todays_tasks.map((t, i) => {
                const cfg = statusConfig[t.status as keyof typeof statusConfig];
                return (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0`} style={{ backgroundColor: cfg.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-950 text-sm font-medium truncate">{t.task}</p>
                      <p className="text-slate-400 text-xs mt-0.5">Due {t.due}</p>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full flex-shrink-0 font-medium ${cfg.bg}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">No tasks today</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-950 text-lg">Quick Actions</h3>
              <p className="text-slate-500 text-sm mt-0.5">Common tasks</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200/60">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Punch In / Out</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200/60">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">View My Tasks</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200/60">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Read SOPs</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
        <div className="mb-5">
          <h3 className="font-bold text-slate-950 text-lg">My Weekly Performance</h3>
          <p className="text-slate-500 text-sm mt-0.5">Task completion overview</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.weekly_performance} barGap={8}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
            <YAxis tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F8FAFC' }} />
            <Bar dataKey="total" name="Total" fill="#F1F5F9" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="done" name="Completed" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
