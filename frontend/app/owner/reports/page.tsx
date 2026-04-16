"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";

interface RevenueDataPoint {
  [key: string]: string | number;
}

interface OccupancyReport {
  period: string;
  reports: Array<{
    property_id: string;
    property_name: string;
    total_rooms: number;
    occupied_rooms: number;
    available_rooms: number;
    occupancy_percentage: number;
    maintenance_rooms: number;
  }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300 text-xs">{entry.name}:</span>
            <span className="text-white font-semibold text-sm">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const LineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold text-lg">{payload[0].value}%</p>
        <p className="text-slate-400 text-xs">Occupancy Rate</p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl px-4 py-3 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
          <span className="text-slate-300 text-xs">{payload[0].name}:</span>
          <span className="text-white font-semibold">{payload[0].value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600 text-xs font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [occData, setOccData] = useState<Array<{ name: string; occupancy_percentage: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, occupancyRes] = await Promise.all([
          dashboardApi.getOwnerStats(),
          dashboardApi.getOccupancyReport(),
        ]);

        // Process revenue trend (7-day data from backend)
        if (statsRes.data?.revenue_trend) {
          setRevenueData(
            statsRes.data.revenue_trend.map((day: { day: string; revenue: number }) => ({
              day: day.day,
              revenue: day.revenue,
            }))
          );
        }

        // Process occupancy report (by property)
        if (occupancyRes.data?.reports) {
          const occupancyByProperty = occupancyRes.data.reports.map(
            (report: {
              property_id: string;
              property_name: string;
              total_rooms: number;
              occupied_rooms: number;
              available_rooms: number;
              occupancy_percentage: number;
              maintenance_rooms: number;
            }) => ({
              name: report.property_name,
              occupancy_percentage: report.occupancy_percentage,
            })
          );
          setOccData(occupancyByProperty);
        }
      } catch (err) {
        console.error("Error fetching reports data:", err);
        setError("Failed to load reports data");
        setRevenueData([]);
        setOccData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Performance data across all properties</p>
        </div>
        <button className="flex items-center gap-2.5 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Revenue (MTD)", value: "$131,000", change: "+18.4%", positive: true, color: "#3B82F6" },
          { label: "Avg. Occupancy", value: "84%", change: "+6.2%", positive: true, color: "#10B981" },
          { label: "RevPAR", value: "$112", change: "+14.1%", positive: true, color: "#6366F1" },
          { label: "Guest Satisfaction", value: "4.7/5", change: "+0.2", positive: true, color: "#F59E0B" },
        ].map((k, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group"
          >
            <div className="flex items-center gap-2 mb-3">
              {k.positive ? (
                <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center">
                  <TrendingDown className="w-3 h-3 text-amber-600" />
                </div>
              )}
              <span className={`text-xs font-medium ${k.positive ? "text-emerald-700" : "text-amber-700"}`}>{k.change} vs last month</span>
            </div>
            <div className="text-slate-500 text-xs mb-2">{k.label}</div>
            <div className="text-3xl font-bold text-slate-950 tracking-tight">{k.value}</div>
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${k.color}, ${k.color}80)` }}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
          <div className="mb-5">
            <h3 className="font-bold text-slate-950 text-lg">Revenue Trend</h3>
            <p className="text-slate-400 text-xs mt-1">7-day revenue performance</p>
          </div>
          {loading ? (
            <div className="h-60 flex items-center justify-center">
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : error ? (
            <div className="h-60 flex items-center justify-center">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData} barGap={8}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} width={60} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Legend content={renderLegend} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center">
              <p className="text-slate-400">No revenue data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
          <div className="mb-5">
            <h3 className="font-bold text-slate-950 text-lg">Revenue Mix</h3>
            <p className="text-slate-400 text-xs mt-1">Revenue distribution by department</p>
          </div>
          <div className="h-56 flex items-center justify-center">
            <p className="text-slate-400 text-sm">Department breakdown unavailable</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
        <div className="mb-5">
          <h3 className="font-bold text-slate-950 text-lg">Occupancy by Property</h3>
          <p className="text-slate-400 text-xs mt-1">Current occupancy rate per property</p>
        </div>
        {loading ? (
          <div className="h-60 flex items-center justify-center">
            <p className="text-slate-400">Loading...</p>
          </div>
        ) : error ? (
          <div className="h-60 flex items-center justify-center">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : occData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={occData} barGap={8}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} width={50} />
              <Tooltip content={<LineTooltip />} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="occupancy_percentage" name="Occupancy" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Legend content={renderLegend} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-60 flex items-center justify-center">
            <p className="text-slate-400">No occupancy data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
