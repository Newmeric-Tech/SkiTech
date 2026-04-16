"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  AlertTriangle,
  AlertCircle,
  Database,
  Download,
  Filter,
  Search,
  User,
  Settings,
  Building2,
  Shield,
  Key,
  LogIn,
  FileText,
  Bell,
  ChevronDown,
} from "lucide-react";
import { dashboardApi, AuditLogEntry, AuditLogResponse } from "@/lib/api";

const actionTypes = ["All Actions", "LOGIN_SUCCESS", "LOGIN_FAILED", "ROLE_CHANGED", "USER_SUSPENDED", "PROPERTY_UPDATE", "CONFIG_CHANGE", "API_KEY_CREATED", "API_KEY_REVOKED"];
const severities = ["All", "info", "warning", "critical"];

const getActionIcon = (action: string) => {
  if (action.includes("LOGIN")) return <LogIn className="w-4 h-4" />;
  if (action.includes("ROLE") || action.includes("PERMISSION")) return <Shield className="w-4 h-4" />;
  if (action.includes("PROPERTY")) return <Building2 className="w-4 h-4" />;
  if (action.includes("USER")) return <User className="w-4 h-4" />;
  if (action.includes("API")) return <Key className="w-4 h-4" />;
  if (action.includes("CONFIG") || action.includes("SETTINGS")) return <Settings className="w-4 h-4" />;
  if (action.includes("EXPORT") || action.includes("IMPORT")) return <FileText className="w-4 h-4" />;
  return <Clock className="w-4 h-4" />;
};

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case "info": return "bg-black/5 text-neutral-700 border-black/10";
    case "warning": return "bg-amber-100/50 text-amber-700 border-amber-200";
    case "critical": return "bg-red-100/50 text-red-700 border-red-200";
    default: return "bg-black/5 text-neutral-700 border-black/10";
  }
};

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.listAuditLog(100);
        setLogs(response.data.logs || []);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const filteredEvents = logs.filter((event) => {
    const actor = event.actor || "—";
    const action = event.action || "—";
    const matchesSearch =
      actor.toLowerCase().includes(search.toLowerCase()) ||
      (event.resource_type?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesAction = actionFilter === "All Actions" || action.includes(actionFilter.replace("All Actions", ""));
    return matchesSearch && matchesAction;
  });

  const stats = {
    totalToday: logs.length,
    warnings: 0,
    critical: 0,
    logSize: "—",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          Audit Log
        </h1>
        <p className="text-neutral-500 text-sm mt-0.5">Track all administrative actions and changes</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Events Today</p>
          <p className="text-2xl font-bold text-black mt-1">{stats.totalToday}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Warnings</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.warnings}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Critical</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Log Size</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.logSize}</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
        <div className="p-4 flex items-center gap-4 border-b border-black/10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by user or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            {actionTypes.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <div className="flex gap-1 bg-black/5 p-1 rounded-lg">
            {severities.map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  severityFilter === s
                    ? "bg-white text-black shadow-sm"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                {s === "All" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export Logs
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-neutral-500">Loading audit events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-neutral-500">No audit events yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Timestamp</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">User</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Action Type</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Resource</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Details</th>
                  <th className="text-center p-4 text-sm font-medium text-neutral-500">Severity</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event, i) => {
                  const actorName = event.actor || "—";
                  const actionType = event.action || "—";
                  const resourceType = event.resource_type || "—";
                  const createdAt = event.created_at ? new Date(event.created_at).toLocaleString() : "—";
                  const initials = actorName !== "—" ? actorName.split(" ").map((n) => n[0]).join("") : "?";
                  const severity = "info";

                  return (
                    <motion.tr
                      key={event.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-black/5 hover:bg-black/5 transition-colors"
                    >
                      <td className="p-4 text-sm text-neutral-600 font-mono">{createdAt}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {initials}
                          </div>
                          <span className="text-sm font-medium text-black">{actorName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          {getActionIcon(actionType)}
                          {actionType.replace(/_/g, " ")}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-neutral-600">{resourceType}</td>
                      <td className="p-4 text-sm text-neutral-600 max-w-xs truncate">{event.resource || "—"}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityStyles(severity)}`}>
                          {severity}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
