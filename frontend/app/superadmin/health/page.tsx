"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Server,
  Database,
  Key,
  Mail,
  HardDrive,
  Globe,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  MemoryStick,
  RefreshCw,
  Archive,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { dashboardApi } from "@/lib/api";

interface HealthResponse {
  status: string;
  app: string;
  version: string;
  environment: string;
}

const latencyData = [
  { time: "00:00", api: 42, db: 11, auth: 25 },
  { time: "04:00", api: 38, db: 10, auth: 22 },
  { time: "08:00", api: 52, db: 14, auth: 31 },
  { time: "12:00", api: 68, db: 18, auth: 45 },
  { time: "16:00", api: 78, db: 22, auth: 52 },
  { time: "20:00", api: 55, db: 15, auth: 33 },
  { time: "Now", api: 45, db: 12, auth: 28 },
];

const errorRateData = [
  { time: "00:00", errors: 0.02 },
  { time: "04:00", errors: 0.01 },
  { time: "08:00", errors: 0.05 },
  { time: "12:00", errors: 0.12 },
  { time: "16:00", errors: 0.18 },
  { time: "20:00", errors: 0.08 },
  { time: "Now", errors: 0.03 },
];

const incidents = [
  { id: 1, title: "Email Service Latency Spike", status: "resolved", time: "Jan 14, 2024 15:30", duration: "23 minutes", severity: "warning" },
  { id: 2, title: "CDN Cache Invalidation Delay", status: "resolved", time: "Jan 12, 2024 09:15", duration: "8 minutes", severity: "info" },
  { id: 3, title: "Database Connection Pool Exhaustion", status: "resolved", time: "Jan 10, 2024 14:22", duration: "45 minutes", severity: "critical" },
  { id: 4, title: "API Gateway Memory Pressure", status: "ongoing", time: "Jan 15, 2024 11:00", duration: "ongoing", severity: "warning" },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "healthy": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case "degraded": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case "down": return <XCircle className="w-5 h-5 text-red-500" />;
    default: return <Clock className="w-5 h-5 text-neutral-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "healthy": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "degraded": return "bg-amber-100 text-amber-700 border-amber-200";
    case "down": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-black/5 text-neutral-700 border-black/10";
  }
};

interface ServiceStatus {
  id: number;
  name: string;
  icon: any;
  status: "healthy" | "degraded" | "down";
  uptime: number;
  lastChecked: string;
  latency: number;
}

const getServiceIcon = (name: string): any => {
  const iconMap: { [key: string]: any } = {
    "API Gateway": Globe,
    "Primary Database": Database,
    "Auth Service": Key,
    "Email Service": Mail,
    "Storage Service": HardDrive,
    "CDN": Globe,
    "WebSocket": Activity,
    "Backup Service": Archive,
  };
  return iconMap[name] || Globe;
};

export default function SystemHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([
    { id: 1, name: "API Gateway", icon: Globe, status: "healthy", uptime: 99.98, lastChecked: "—", latency: 0 },
    { id: 2, name: "Primary Database", icon: Database, status: "healthy", uptime: 99.99, lastChecked: "—", latency: 0 },
    { id: 3, name: "Auth Service", icon: Key, status: "healthy", uptime: 99.95, lastChecked: "—", latency: 0 },
    { id: 4, name: "Email Service", icon: Mail, status: "healthy", uptime: 99.90, lastChecked: "—", latency: 0 },
    { id: 5, name: "Storage Service", icon: HardDrive, status: "healthy", uptime: 99.99, lastChecked: "—", latency: 0 },
    { id: 6, name: "CDN", icon: Globe, status: "healthy", uptime: 99.97, lastChecked: "—", latency: 0 },
    { id: 7, name: "WebSocket", icon: Activity, status: "healthy", uptime: 99.89, lastChecked: "—", latency: 0 },
    { id: 8, name: "Backup Service", icon: Archive, status: "healthy", uptime: 100.0, lastChecked: "—", latency: 0 },
  ]);

  const fetchHealth = async () => {
    try {
      const response = await dashboardApi.getHealth();
      const data = response.data as HealthResponse;
      setHealth(data);
      setError(null);

      // Update service statuses based on API status
      setServices((prevServices) =>
        prevServices.map((service) => ({
          ...service,
          status: data.status === "ok" || data.status === "healthy" ? "healthy" : "down",
          lastChecked: new Date().toLocaleTimeString(),
        }))
      );
    } catch (err) {
      setError("Health check failed");
      setServices((prevServices) =>
        prevServices.map((service) => ({
          ...service,
          status: "down",
          lastChecked: new Date().toLocaleTimeString(),
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const allHealthy = services.every((s) => s.status === "healthy");
  const anyDown = services.some((s) => s.status === "down");
  const anyDegraded = services.some((s) => s.status === "degraded");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          System Health
        </h1>
        <p className="text-neutral-500 text-sm mt-0.5">Monitor platform infrastructure and services</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border-2 ${
          error
            ? "bg-red-50 border-red-200"
            : anyDown
            ? "bg-red-50 border-red-200"
            : anyDegraded
            ? "bg-amber-50 border-amber-200"
            : "bg-emerald-50 border-emerald-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {error ? (
              <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            ) : anyDown ? (
              <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            ) : anyDegraded ? (
              <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
            )}
            <div>
              <h2 className="text-lg font-bold text-black">
                {error
                  ? "API: Down"
                  : anyDown
                  ? "System Outage Detected"
                  : anyDegraded
                  ? "Partial Degradation"
                  : "All Systems Operational"}
              </h2>
              <p className="text-sm text-neutral-600">
                {error
                  ? "Unable to reach health endpoint"
                  : loading
                  ? "Checking system status..."
                  : anyDown
                  ? "One or more critical services are currently down"
                  : anyDegraded
                  ? "Some services are experiencing reduced performance"
                  : `App: ${health?.app || "SkiTech"} | v${health?.version || "—"} | ${health?.environment || "—"}`}
              </p>
            </div>
          </div>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh Status"}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {services.map((service, i) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black/5 rounded-lg flex items-center justify-center">
                  <service.icon className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-black">{service.name}</h3>
                  <p className="text-xs text-neutral-500">Last checked: {service.lastChecked}</p>
                </div>
              </div>
              {getStatusIcon(service.status)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Uptime</span>
                <span className="font-medium text-black">{service.uptime}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    service.uptime >= 99.9
                      ? "bg-emerald-500"
                      : service.uptime >= 99
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${service.uptime}%` }}
                />
              </div>
              {service.latency > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Latency</span>
                  <span className="font-medium text-black">{service.latency}ms</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
          <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            API Latency (ms)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#737373" />
              <YAxis tick={{ fontSize: 11 }} stroke="#737373" />
              <Tooltip
                contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid #e5e5e5", borderRadius: "8px" }}
              />
              <Line type="monotone" dataKey="api" stroke="#18181b" strokeWidth={2} dot={{ fill: "#18181b", r: 3 }} name="API" />
              <Line type="monotone" dataKey="db" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 3 }} name="Database" />
              <Line type="monotone" dataKey="auth" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} name="Auth" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
          <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            Error Rate (%)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={errorRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#737373" />
              <YAxis tick={{ fontSize: 11 }} stroke="#737373" />
              <Tooltip
                contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid #e5e5e5", borderRadius: "8px" }}
              />
              <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
          <div className="p-5 border-b border-black/10">
            <h3 className="text-lg font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
              Recent Incidents
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className={`p-4 rounded-lg border ${
                  incident.severity === "critical"
                    ? "bg-red-50/50 border-red-200"
                    : incident.severity === "warning"
                    ? "bg-amber-50/50 border-amber-200"
                    : "bg-black/5 border-black/10"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-black">{incident.title}</h4>
                    <p className="text-sm text-neutral-500 mt-0.5">{incident.time}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      incident.status === "ongoing"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {incident.status}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mt-2">
                  Duration: <span className="font-medium">{incident.duration}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
          <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            System Resources
          </h3>
          <div className="space-y-4">
            <div className="text-center py-8 text-neutral-500">
              <p className="text-sm">Detailed metrics not available from current health endpoint</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-black/10">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-black/5 rounded-lg">
                <Cpu className="w-5 h-5 mx-auto text-neutral-600 mb-1" />
                <p className="text-sm font-medium text-black">—</p>
                <p className="text-xs text-neutral-500">CPU Usage</p>
              </div>
              <div className="text-center p-3 bg-black/5 rounded-lg">
                <MemoryStick className="w-5 h-5 mx-auto text-neutral-600 mb-1" />
                <p className="text-sm font-medium text-black">—</p>
                <p className="text-xs text-neutral-500">Memory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
