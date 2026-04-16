"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Activity,
  ThumbsUp,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";
import { dashboardApi, UserRecord, PropertyRecord } from "@/lib/api";

interface RevenueDataPoint {
  day: string;
  revenue: number;
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

interface TopProperty {
  property_id: string;
  property_name: string;
  occupancy_percentage: number;
  revenue?: number;
  growth?: number;
}

const periods = ["7d", "30d", "90d", "1y"];

export default function PlatformAnalytics() {
  const [period, setPeriod] = useState("30d");
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [occData, setOccData] = useState<Array<{ region: string; count: number }>>([]);
  const [topProperties, setTopProperties] = useState<TopProperty[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProperties, setTotalProperties] = useState(0);
  const [avgOccupancy, setAvgOccupancy] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [ownerStatsRes, occupancyRes, usersRes, propertiesRes] = await Promise.all([
          dashboardApi.getOwnerStats(),
          dashboardApi.getOccupancyReport(),
          dashboardApi.listUsers(),
          dashboardApi.listProperties(),
        ]);

        // Process revenue trend
        if (ownerStatsRes.data?.revenue_trend) {
          setRevenueData(
            ownerStatsRes.data.revenue_trend.map((day) => ({
              day: day.day,
              revenue: day.revenue,
            }))
          );
        }

        // Set daily revenue from stats
        if (ownerStatsRes.data?.daily_revenue) {
          setDailyRevenue(ownerStatsRes.data.daily_revenue);
        }

        // Process occupancy data
        if (occupancyRes.data?.reports) {
          const occupancyByProperty = occupancyRes.data.reports.map(
            (report) => ({
              region: report.property_name,
              count: report.occupancy_percentage,
            })
          );
          setOccData(occupancyByProperty);

          // Calculate average occupancy
          const avgOcc =
            occupancyRes.data.reports.reduce((sum, r) => sum + r.occupancy_percentage, 0) /
            occupancyRes.data.reports.length;
          setAvgOccupancy(Math.round(avgOcc * 10) / 10);

          // Get top properties by occupancy
          const topProps = occupancyRes.data.reports
            .sort((a, b) => b.occupancy_percentage - a.occupancy_percentage)
            .slice(0, 5)
            .map((report) => ({
              property_id: report.property_id,
              property_name: report.property_name,
              occupancy_percentage: report.occupancy_percentage,
              revenue: undefined,
              growth: undefined,
            }));
          setTopProperties(topProps);
        }

        // Process users
        if (usersRes.data) {
          setTotalUsers(usersRes.data.length);
        }

        // Process properties
        if (propertiesRes.data) {
          setTotalProperties(propertiesRes.data.length);
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const kpis = [
    {
      label: "Monthly Revenue",
      value: dailyRevenue ? `$${Math.round(dailyRevenue * 30 / 1000)}K` : "—",
      change: "—",
      trend: "up",
      icon: DollarSign
    },
    {
      label: "Total Users",
      value: totalUsers ? totalUsers.toLocaleString() : "—",
      change: "—",
      trend: "up",
      icon: Users
    },
    {
      label: "Properties",
      value: totalProperties ? totalProperties.toLocaleString() : "—",
      change: "—",
      trend: "up",
      icon: Building2
    },
    {
      label: "Avg Occupancy",
      value: avgOccupancy ? `${avgOccupancy}%` : "—",
      change: "—",
      trend: "up",
      icon: Activity
    },
    {
      label: "Churn Rate",
      value: "—",
      change: "—",
      trend: "down",
      icon: TrendingDown
    },
    {
      label: "NPS Score",
      value: "—",
      change: "—",
      trend: "up",
      icon: ThumbsUp
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            Platform Analytics
          </h1>
          <p className="text-neutral-500 text-sm mt-0.5">Insights and metrics across the entire platform</p>
        </div>
        <div className="flex gap-1 bg-black/5 p-1 rounded-lg">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? "bg-white text-black shadow-sm"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className="w-4 h-4 text-neutral-500" />
              <p className="text-sm text-neutral-500">{kpi.label}</p>
            </div>
            <p className="text-2xl font-bold text-black">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {kpi.trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs font-medium ${kpi.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                {kpi.change}
              </span>
              <span className="text-xs text-neutral-400">vs last period</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
          <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            Revenue Overview
          </h3>
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <p className="text-neutral-500">Loading...</p>
            </div>
          ) : error ? (
            <div className="h-80 flex items-center justify-center">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#737373" />
                <YAxis tick={{ fontSize: 12 }} stroke="#737373" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid #e5e5e5", borderRadius: "8px" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#18181b" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-neutral-500">No revenue data available</p>
            </div>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
          <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            User Growth
          </h3>
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <p className="text-neutral-500">Loading...</p>
            </div>
          ) : error ? (
            <div className="h-80 flex items-center justify-center">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : totalUsers > 0 ? (
            <div className="h-80 flex items-center justify-center">
              <p className="text-neutral-500 text-sm">Historical user growth data unavailable</p>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-neutral-500">No user data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
          <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            Occupancy by Property
          </h3>
          {loading ? (
            <div className="h-60 flex items-center justify-center">
              <p className="text-neutral-500">Loading...</p>
            </div>
          ) : error ? (
            <div className="h-60 flex items-center justify-center">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : occData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={occData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#737373" domain={[0, 100]} />
                <YAxis dataKey="region" type="category" tick={{ fontSize: 11 }} width={120} stroke="#737373" />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Occupancy"]}
                  contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid #e5e5e5", borderRadius: "8px" }}
                />
                <Bar dataKey="count" fill="#18181b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center">
              <p className="text-neutral-500">No occupancy data available</p>
            </div>
          )}
        </div>

        <div className="col-span-2 bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
          <div className="p-5 border-b border-black/10">
            <h3 className="text-lg font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
              Top Performing Properties
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Property</th>
                  <th className="text-center p-4 text-sm font-medium text-neutral-500">Occupancy</th>
                  <th className="text-right p-4 text-sm font-medium text-neutral-500">Monthly Revenue</th>
                  <th className="text-right p-4 text-sm font-medium text-neutral-500">Growth</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-neutral-500">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-red-500 text-sm">
                      {error}
                    </td>
                  </tr>
                ) : topProperties.length > 0 ? (
                  topProperties.map((prop) => (
                    <tr key={prop.property_id} className="border-b border-black/5 hover:bg-black/5 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-black">{prop.property_name}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-medium">{prop.occupancy_percentage}%</span>
                      </td>
                      <td className="p-4 text-right font-medium">
                        {prop.revenue ? `$${prop.revenue.toLocaleString()}` : "—"}
                      </td>
                      <td className="p-4 text-right">
                        {prop.growth ? (
                          <span className="text-emerald-600 font-medium">+{prop.growth}%</span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-neutral-500">
                      No property data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
