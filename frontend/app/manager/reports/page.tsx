"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, TrendingUp, TrendingDown, Users, DollarSign, Percent } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { dashboardApi, ManagerStats } from "@/lib/api";

interface OccupancyReport {
  period: string;
  reports: Array<{
    property_id: string;
    property_name: string;
    occupancy_percentage: number;
    [key: string]: unknown;
  }>;
}

interface RevenueDay { day: string; revenue: number }
interface OccupancyDay { day: string; occupancy: number }

const AreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold text-lg">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const LineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold text-lg">{payload[0].value}%</p>
        <p className="text-slate-400 text-xs">Occupancy Rate</p>
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-slate-300 text-xs">Score:</span>
          <span className="text-white font-semibold">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ManagerReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [managerStats, setManagerStats] = useState<ManagerStats | null>(null);
  const [occupancyReport, setOccupancyReport] = useState<OccupancyReport | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDay[]>([]);
  const [occupancyData, setOccupancyData] = useState<OccupancyDay[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const propertiesRes = await dashboardApi.listProperties();
        const properties = propertiesRes.data;

        if (!properties || properties.length === 0) {
          setPropertyId(null);
          setManagerStats(null);
          setOccupancyReport(null);
          setRevenueData([]);
          setOccupancyData([]);
          setLoading(false);
          return;
        }

        const firstPropertyId = properties[0].id;
        setPropertyId(firstPropertyId);

        const [statsRes, occupancyRes] = await Promise.all([
          dashboardApi.getManagerStats(firstPropertyId),
          dashboardApi.getOccupancyReport(),
        ]);

        setManagerStats(statsRes.data);
        setOccupancyReport(occupancyRes.data);

        // Map manager stats to revenue data
        // Since we only have daily_revenue, create single bar for today
        if (statsRes.data.daily_revenue !== undefined) {
          setRevenueData([{ day: "Today", revenue: statsRes.data.daily_revenue }]);
        }

        // Map occupancy report to occupancy data
        if (occupancyRes.data && occupancyRes.data.reports) {
          const currentPropertyOccupancy = occupancyRes.data.reports.find(
            (r) => r.property_id === firstPropertyId
          );
          if (currentPropertyOccupancy) {
            setOccupancyData([
              { day: "Current", occupancy: Math.round(currentPropertyOccupancy.occupancy_percentage) },
            ]);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch reports data:", err);
        setError("Failed to load reports data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-950 mb-4" />
          <p className="text-slate-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!propertyId) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center">
          <p className="text-amber-900 font-semibold">No property assigned yet</p>
          <p className="text-amber-800 text-sm mt-1">Please contact your administrator to assign a property</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-red-900 font-semibold">Error loading reports</p>
          <p className="text-red-800 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Operational Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Daily performance metrics and analytics</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5 bg-slate-950 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-slate-950/20 hover:bg-slate-800 transition-colors"
        >
          <Download className="w-4 h-4" /> Export Report
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            icon: DollarSign,
            label: "Today's Revenue",
            value: managerStats?.daily_revenue ? `$${managerStats.daily_revenue.toLocaleString()}` : "$0",
            change: "Trend unavailable",
            positive: true,
            color: "#10B981"
          },
          {
            icon: Percent,
            label: "Occupancy Rate",
            value: occupancyData[0] ? `${occupancyData[0].occupancy}%` : "N/A",
            change: "Current",
            positive: true,
            color: "#3B82F6"
          },
          {
            icon: Users,
            label: "Staff Present",
            value: managerStats?.staff_present ? `${managerStats.staff_present}/${managerStats.staff_total}` : "0",
            change: "Today",
            positive: true,
            color: "#F59E0B"
          },
          {
            icon: TrendingUp,
            label: "Pending Tasks",
            value: managerStats?.tasks_pending ?? "0",
            change: `${managerStats?.tasks_overdue ?? 0} overdue`,
            positive: (managerStats?.tasks_overdue ?? 0) === 0,
            color: "#6366F1"
          },
        ].map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: metric.color + '15' }}>
                <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                metric.positive 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" 
                  : "bg-amber-50 text-amber-700 border border-amber-200/60"
              }`}>
                {metric.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {metric.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-950 tracking-tight">{metric.value}</div>
            <div className="text-slate-500 text-sm mt-1">{metric.label}</div>
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${metric.color}, ${metric.color}80)` }}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
          <div className="mb-5">
            <h3 className="font-bold text-slate-950 text-lg">Weekly Revenue Trend</h3>
            <p className="text-slate-500 text-sm mt-0.5">Daily revenue breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenueMg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15}/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} width={55} />
              <Tooltip content={<AreaTooltip />} cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={2.5} 
                fill="url(#colorRevenueMg)"
                dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
                activeDot={{ fill: '#3B82F6', r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
          <div className="mb-5">
            <h3 className="font-bold text-slate-950 text-lg">Occupancy Rate</h3>
            <p className="text-slate-500 text-sm mt-0.5">Daily occupancy percentage</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} domain={[60, 100]} tickFormatter={v => `${v}%`} width={50} />
              <Tooltip content={<LineTooltip />} cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line 
                type="monotone" 
                dataKey="occupancy" 
                stroke="#10B981" 
                strokeWidth={2.5} 
                dot={{ fill: '#10B981', strokeWidth: 0, r: 4 }}
                activeDot={{ fill: '#10B981', r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
        <div className="mb-5">
          <h3 className="font-bold text-slate-950 text-lg">Department Performance Scores</h3>
          <p className="text-slate-500 text-sm mt-0.5">Performance metrics by department</p>
        </div>
        <div className="h-280 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <p className="font-medium">Department breakdown unavailable</p>
            <p className="text-sm mt-1">This data is not currently available from the backend</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: "Daily Operations Summary", desc: "Complete breakdown of today's activities", icon: FileText, color: "#3B82F6" },
          { title: "Staff Performance Report", desc: "Individual and team metrics", icon: Users, color: "#6366F1" },
          { title: "Revenue Analysis", desc: "Detailed revenue by source", icon: DollarSign, color: "#10B981" },
        ].map((report, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white border border-slate-200/60 rounded-2xl p-5 text-left hover:border-slate-300/80 hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: report.color + '15' }}>
              <report.icon className="w-5 h-5" style={{ color: report.color }} />
            </div>
            <h4 className="text-slate-950 font-semibold mb-1.5">{report.title}</h4>
            <p className="text-slate-500 text-sm mb-4">{report.desc}</p>
            <span className="text-slate-700 text-sm font-medium group-hover:text-slate-950 transition-colors flex items-center gap-1">
              Generate Report 
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}