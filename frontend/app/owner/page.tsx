"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Users, TrendingUp, ClipboardList, ArrowUpRight, CheckCircle2, AlertCircle, Clock, TrendingDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dashboardApi, OwnerStats, RevenueDay } from "@/lib/api";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold text-lg">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function OwnerDashboard() {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: "", location: "", type: "", rooms: "" });
  const [dashboardData, setDashboardData] = useState<OwnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getOwnerStats();
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch owner stats:", err);
        setError("Failed to load dashboard data");
        // Fall back to empty values
        setDashboardData({
          total_properties: 0,
          total_staff: 0,
          daily_revenue: 0,
          pending_tasks: 0,
          overdue_tasks: 0,
          revenue_trend: [],
          recent_alerts: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Build stats array from API data
  const stats = dashboardData ? [
    { icon: Building2, label: "Total Properties", value: dashboardData.total_properties.toString(), change: "+1 this month", positive: true, color: "#3B82F6", trend: "up" },
    { icon: Users, label: "Total Staff", value: dashboardData.total_staff.toString(), change: "+3 this week", positive: true, color: "#6366F1", trend: "up" },
    { icon: TrendingUp, label: "Daily Revenue", value: `$${dashboardData.daily_revenue.toLocaleString()}`, change: "+12.4% vs yesterday", positive: true, color: "#10B981", trend: "up" },
    { icon: ClipboardList, label: "Pending Tasks", value: dashboardData.pending_tasks.toString(), change: `${dashboardData.overdue_tasks} overdue`, positive: dashboardData.pending_tasks === 0, color: "#F59E0B", trend: "down" },
  ] : [];

  const revenueData = dashboardData?.revenue_trend || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Welcome back, Owner</h2>
           <p className="text-slate-500 text-sm mt-1">Here's your operations snapshot for today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm">
            Download Report
          </button>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2.5 text-sm font-medium text-white bg-slate-950 rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-950/20">
            Add Property
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm animate-pulse"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-200 mb-4" />
              <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
              <div className="h-8 bg-slate-200 rounded w-16" />
            </div>
          ))
        ) : (
          stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                  stat.positive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : "bg-amber-50 text-amber-700 border border-amber-200/60"
                }`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-950 tracking-tight">{stat.value}</p>
              <div
                className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }}
              />
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-950 text-lg">Revenue Trend</h3>
              <p className="text-slate-500 text-sm mt-0.5">Daily revenue for the past week</p>
            </div>
            <select className="text-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            {loading || !revenueData || revenueData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                {loading ? "Loading revenue data..." : "No revenue data available"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                     <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15}/>
                       <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                     dataKey="day"
                     axisLine={false}
                     tickLine={false}
                     tick={{fontSize: 12, fill: '#94A3B8', fontWeight: 500}}
                     dy={12}
                  />
                  <YAxis
                     axisLine={false}
                     tickLine={false}
                     tick={{fontSize: 12, fill: '#94A3B8', fontWeight: 500}}
                     tickFormatter={(val) => `$${val/1000}k`}
                     width={60}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area
                     type="monotone"
                     dataKey="revenue"
                     stroke="#3B82F6"
                     strokeWidth={2.5}
                     fillOpacity={1}
                     fill="url(#colorRevenue)"
                     dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
                     activeDot={{ fill: '#3B82F6', r: 6, stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="col-span-1 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 overflow-hidden flex flex-col">
           <div className="mb-6">
             <h3 className="font-bold text-slate-950 text-lg">Recent Alerts</h3>
             <p className="text-slate-500 text-sm mt-0.5">Latest notifications from your properties</p>
           </div>
           <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin">
             {loading ? (
               <div className="text-slate-500 text-sm">Loading alerts...</div>
             ) : dashboardData?.recent_alerts && dashboardData.recent_alerts.length > 0 ? (
               dashboardData.recent_alerts.map((alert, i) => {
                 // Map alert type to icon and colors
                 let icon = AlertCircle;
                 let color = "text-amber-600";
                 let bg = "bg-amber-50 border border-amber-100";

                 if (alert.type?.toLowerCase().includes("complete") || alert.type?.toLowerCase().includes("success")) {
                   icon = CheckCircle2;
                   color = "text-emerald-600";
                   bg = "bg-emerald-50 border border-emerald-100";
                 } else if (alert.type?.toLowerCase().includes("error") || alert.type?.toLowerCase().includes("failure")) {
                   icon = AlertCircle;
                   color = "text-red-600";
                   bg = "bg-red-50 border border-red-100";
                 } else if (alert.type?.toLowerCase().includes("pending") || alert.type?.toLowerCase().includes("waiting")) {
                   icon = Clock;
                   color = "text-slate-500";
                   bg = "bg-slate-50 border border-slate-100";
                 } else if (alert.type?.toLowerCase().includes("staff") || alert.type?.toLowerCase().includes("user")) {
                   icon = Users;
                   color = "text-slate-700";
                   bg = "bg-slate-100 border border-slate-200";
                 }

                 return (
                   <div key={i} className="flex gap-3 p-3.5 rounded-xl hover:bg-slate-50/80 transition-colors">
                     <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                       <icon className={`w-5 h-5 ${color}`} />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-semibold text-slate-950">{alert.title}</h4>
                       <div className="flex items-center gap-2 mt-1.5">
                         <span className="text-xs text-slate-500 font-medium">{alert.property_name}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-300" />
                         <span className="text-xs text-slate-400">{alert.time_ago}</span>
                       </div>
                     </div>
                   </div>
                 );
               })
             ) : (
               <div className="text-slate-500 text-sm">No recent alerts</div>
             )}
           </div>
<button className="w-full mt-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/60">
               View All Alerts
            </button>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-black/10"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-black mb-6" style={{ fontWeight: 800, fontSize: "1.2rem" }}>Add New Property</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Property Name</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 transition-colors"
                  placeholder="Grand Horizon Hotel"
                />
              </div>
              <div>
                <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Location</label>
                <input
                  value={formData.location}
                  onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                  className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 transition-colors"
                  placeholder="Dubai Marina, UAE"
                />
              </div>
              <div>
                <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Property Type</label>
                <input
                  value={formData.type}
                  onChange={e => setFormData(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 transition-colors"
                  placeholder="5-Star Hotel, Boutique, etc."
                />
              </div>
              <div>
                <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>Number of Rooms</label>
                <input
                  value={formData.rooms}
                  onChange={e => setFormData(f => ({ ...f, rooms: e.target.value }))}
                  type="number"
                  className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 transition-colors"
                  placeholder="142"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAdd(false); setFormData({ name: "", location: "", type: "", rooms: "" }); }}
                className="flex-1 py-3 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-white/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!formData.name.trim()) return;
                  setShowAdd(false);
                  setFormData({ name: "", location: "", type: "", rooms: "" });
                }}
                className="flex-1 py-3 rounded-xl bg-black text-white text-sm shadow-md"
                style={{ fontWeight: 600 }}
              >
                Add Property
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
