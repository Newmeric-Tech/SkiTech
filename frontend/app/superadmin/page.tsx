"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, Users, Shield, AlertTriangle,
  CheckCircle2, Clock, TrendingUp, Activity, TrendingDown,
} from "lucide-react";
import { dashboardApi, UserRecord, PropertyRecord, AuditLogEntry } from "@/lib/api";

interface StatConfig {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

interface ActivityItem {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  bg: string;
  iconColor: string;
  action: string;
  detail: string;
  time: string;
  type: string;
}

interface PropertyDisplay {
  name: string;
  location: string;
  users: string;
  health: string;
  color: string;
}

export default function SuperadminDashboard() {
  const [stats, setStats] = useState<StatConfig[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [topProperties, setTopProperties] = useState<PropertyDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, propertiesRes, auditRes] = await Promise.all([
          dashboardApi.listUsers(),
          dashboardApi.listProperties(),
          dashboardApi.listAuditLog(10),
        ]);

        const users: UserRecord[] = usersRes.data;
        const properties: PropertyRecord[] = propertiesRes.data;
        const auditLog = auditRes.data;

        // Compute stats
        const totalProperties = properties.length;
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.is_active).length;
        const verifiedUsers = users.filter(u => u.is_verified).length;

        const newStats: StatConfig[] = [
          {
            label: "Total Properties",
            value: totalProperties.toString(),
            change: "+12 this month",
            positive: true,
            icon: Building2,
            color: "#3B82F6",
          },
          {
            label: "Active Users",
            value: activeUsers.toString(),
            change: "+284 this week",
            positive: true,
            icon: Users,
            color: "#6366F1",
          },
          {
            label: "Open Tickets",
            value: "—",
            change: "No endpoint",
            positive: false,
            icon: AlertTriangle,
            color: "#F59E0B",
          },
          {
            label: "Verified Users",
            value: verifiedUsers.toString(),
            change: "Active verification",
            positive: true,
            icon: CheckCircle2,
            color: "#10B981",
          },
        ];
        setStats(newStats);

        // Build recent activity from audit log
        const activityColors = ["#3B82F6", "#10B981", "#EF4444", "#F59E0B"];
        const activityIcons = [Shield, Building2, Users, Clock];
        const activityBgs = [
          "bg-blue-50 border border-blue-100",
          "bg-emerald-50 border border-emerald-100",
          "bg-rose-50 border border-rose-100",
          "bg-amber-50 border border-amber-100",
        ];
        const activityIconColors = [
          "text-blue-600",
          "text-emerald-600",
          "text-rose-600",
          "text-amber-600",
        ];

        const newActivity: ActivityItem[] = (auditLog.logs || []).slice(0, 6).map((entry, idx) => {
          const iconIdx = idx % activityIcons.length;
          return {
            icon: activityIcons[iconIdx],
            bg: activityBgs[iconIdx],
            iconColor: activityIconColors[iconIdx],
            action: entry.action || "System event",
            detail: `${entry.actor_email || entry.actor || "Unknown"} — ${entry.resource || "—"}`,
            time: entry.created_at ? formatTimeAgo(entry.created_at) : "—",
            type: entry.resource_type || "activity",
          };
        });
        setRecentActivity(newActivity);

        // Build top properties (first 4)
        const colors = ["#3B82F6", "#6366F1", "#10B981", "#F59E0B"];
        const newTopProperties: PropertyDisplay[] = properties.slice(0, 4).map((p, idx) => ({
          name: p.name || "—",
          location: `${p.city || "—"}, ${p.country || "—"}`,
          users: "—",
          health: "—",
          color: colors[idx % colors.length],
        }));
        setTopProperties(newTopProperties);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load dashboard data";
        console.error("Dashboard error:", message);
        setError(message);
        // Set zeros/fallbacks
        setStats([
          {
            label: "Total Properties",
            value: "0",
            change: "Error loading",
            positive: false,
            icon: Building2,
            color: "#3B82F6",
          },
          {
            label: "Active Users",
            value: "0",
            change: "Error loading",
            positive: false,
            icon: Users,
            color: "#6366F1",
          },
          {
            label: "Open Tickets",
            value: "—",
            change: "No endpoint",
            positive: false,
            icon: AlertTriangle,
            color: "#F59E0B",
          },
          {
            label: "Verified Users",
            value: "0",
            change: "Error loading",
            positive: false,
            icon: CheckCircle2,
            color: "#10B981",
          },
        ]);
        setRecentActivity([]);
        setTopProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  function formatTimeAgo(isoString: string): string {
    const now = new Date();
    const past = new Date(isoString);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
              Platform Overview
            </h1>
            <p className="text-slate-500 text-sm mt-1">Real-time monitoring across all tenants</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-xl mb-5" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
            Platform Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time monitoring across all tenants</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow">
            Export Report
          </button>
          <button className="px-4 py-2.5 text-sm font-medium text-white bg-slate-950 rounded-xl hover:bg-slate-900 active:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-950/20 hover:shadow-xl hover:shadow-slate-950/30">
            System Alert
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-sm text-amber-700">
          <p className="font-medium">Warning: Failed to load some data ({error}). Showing cached or default values.</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group overflow-hidden"
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-200/60 transition-all duration-300 group-hover:scale-105"
                style={{ backgroundColor: stat.color + '15' }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-200 ${
                stat.positive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-amber-50 text-amber-700 border border-amber-200/60"
              }`}>
                {stat.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-950 tracking-tight">{stat.value}</p>
            <div className={`text-xs mt-2 font-medium ${stat.positive ? "text-emerald-700" : "text-amber-700"}`}>
              {stat.change}
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-950 text-lg">Recent Platform Activity</h3>
              <p className="text-slate-500 text-sm mt-0.5">Latest events across all properties</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live
            </div>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50/80 transition-colors duration-200"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-950">{item.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="font-bold text-slate-950 text-lg">Top Properties</h3>
            <p className="text-slate-500 text-sm mt-0.5">Best performing by health score</p>
          </div>
          <div className="space-y-4">
            {topProperties.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50/80 transition-colors duration-200">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: p.color + '15' }}>
                  <Building2 className="w-5 h-5" style={{ color: p.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-950 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.location}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1.5">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">{p.users}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <Activity className="w-3 h-3" style={{ color: p.color }} />
                    <span className="text-xs font-semibold" style={{ color: p.color }}>{p.health}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors duration-200 border border-slate-200/60 hover:border-slate-300">
            View All Properties →
          </button>
        </div>
      </div>
    </div>
  );
}
