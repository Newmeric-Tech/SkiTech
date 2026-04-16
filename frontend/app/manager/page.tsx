"use client";

import { motion } from "framer-motion";
import { Users, ClipboardList, Clock, TrendingUp, CheckCircle2, AlertCircle, Plus, ChevronRight, TrendingDown } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { dashboardApi, ManagerStats } from "@/lib/api";

type StatItem = {
  icon: any;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  color: string;
  trend: "up" | "down";
};

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
            <span className="text-white font-semibold text-sm">{entry.value} tasks</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Helper to generate initials
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper to generate a stable color based on name
const getColorForStaff = (name: string): string => {
  const colors = ["#3B82F6", "#10B981", "#6366F1", "#EF4444", "#8B5CF6", "#F59E0B", "#EC4899", "#14B8A6"];
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function ManagerDashboard() {
  const [statsData, setStatsData] = useState<StatItem[]>([]);
  const [tasksData, setTasksData] = useState<any[]>([]);
  const [staffData, setStaffData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasProperty, setHasProperty] = useState(true);
  const [propertyName, setPropertyName] = useState("Skyline Suites");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Step 1: Get properties
        const propertiesRes = await dashboardApi.listProperties();
        const properties = propertiesRes.data;

        if (!properties || properties.length === 0) {
          setHasProperty(false);
          setLoading(false);
          return;
        }

        const propertyId = properties[0].id;
        setPropertyName(properties[0].name || "Skyline Suites");

        // Step 2: Get manager stats for the property
        const statsRes = await dashboardApi.getManagerStats(propertyId);
        const data = statsRes.data;

        // Transform stats
        const transformedStats: StatItem[] = [
          {
            icon: Users,
            label: "Staff Present",
            value: `${data.staff_present}/${data.staff_total}`,
            change: `${data.staff_total - data.staff_present} absent`,
            positive: data.staff_present === data.staff_total,
            color: "#3B82F6",
            trend: data.staff_present === data.staff_total ? "up" : "down",
          },
          {
            icon: ClipboardList,
            label: "Tasks Pending",
            value: String(data.tasks_pending),
            change: `${data.tasks_overdue} overdue`,
            positive: data.tasks_overdue === 0,
            color: "#F59E0B",
            trend: data.tasks_overdue === 0 ? "up" : "down",
          },
          {
            icon: Clock,
            label: "Check-ins Today",
            value: String(data.checkins_today),
            change: "+0 vs yesterday",
            positive: true,
            color: "#6366F1",
            trend: "up",
          },
          {
            icon: TrendingUp,
            label: "Daily Revenue",
            value: `$${data.daily_revenue.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`,
            change: "+9.1%",
            positive: true,
            color: "#10B981",
            trend: "up",
          },
        ];

        // Transform tasks
        const transformedTasks = data.todays_tasks.map((t: any) => ({
          id: t.id,
          task: t.task,
          assignee: t.assignee,
          due: t.due,
          status: t.status,
        }));

        // Transform staff attendance with generated initials and colors
        const transformedStaff = data.staff_attendance.map((s: any) => ({
          name: s.name,
          dept: s.dept,
          in: s.check_in,
          status: s.status,
          initials: getInitials(s.name),
          color: getColorForStaff(s.name),
        }));

        setStatsData(transformedStats);
        setTasksData(transformedTasks);
        setStaffData(transformedStaff);
        setChartData(data.weekly_tasks);
      } catch (error) {
        console.error("Error fetching manager dashboard data:", error);
        // Gracefully degrade to empty state
        setStatsData([]);
        setTasksData([]);
        setStaffData([]);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {!hasProperty && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-4 py-3 text-amber-700 text-sm">
          No property assigned yet.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Manager Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">{propertyName} — Today's operations</p>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-emerald-50 border border-emerald-200/60 px-4 py-2 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Morning Shift Active
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {statsData.map((s, i) => (
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
              <h3 className="font-bold text-slate-950 text-lg">Today's Tasks</h3>
              <p className="text-slate-500 text-sm mt-0.5">{tasksData.length} tasks scheduled</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Assign Task
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {tasksData.length > 0 ? (
              tasksData.map((t, i) => {
                const cfg = statusConfig[t.status as keyof typeof statusConfig];
                return (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0`} style={{ backgroundColor: cfg.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-950 text-sm font-medium truncate">{t.task}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{t.assignee} · Due {t.due}</p>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full flex-shrink-0 font-medium ${cfg.bg}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">
                {loading ? "Loading tasks..." : "No tasks scheduled for today"}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-950 text-lg">Staff Today</h3>
              <p className="text-slate-500 text-sm mt-0.5">
                {staffData.length > 0
                  ? `${staffData.filter((s) => s.status === "in").length}/${staffData.length} present`
                  : "0/0 present"}
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full">96% On Time</span>
          </div>
          <div className="divide-y divide-slate-100">
            {staffData.length > 0 ? (
              staffData.map((s, i) => (
                <div key={i} className="flex items-center gap-3.5 px-6 py-4 hover:bg-slate-50/80 transition-colors">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}CC)` }}
                  >
                    {s.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-950 text-sm font-semibold">{s.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{s.dept}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${s.status === "in" ? "text-emerald-700" : "text-red-600"}`}>
                      {s.status === "in" ? `In ${s.in}` : "Absent"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">
                {loading ? "Loading staff..." : "No staff data available"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
        <div className="mb-5">
          <h3 className="font-bold text-slate-950 text-lg">Task Completion</h3>
          <p className="text-slate-500 text-sm mt-0.5">Weekly task completion overview</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barGap={8}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
            <YAxis tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F8FAFC' }} />
            <Bar dataKey="total" name="Total" fill="#F1F5F9" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="done" name="Completed" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}