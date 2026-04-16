"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Building2, MapPin, Users, TrendingUp, Activity, Edit2, Trash2 } from "lucide-react";
import { dashboardApi, PropertyRecord } from "@/lib/api";

const recentActivity = [
  { text: "Monthly revenue report submitted", date: "Today, 10:30 AM" },
  { text: "Staff meeting: Morning shift briefing", date: "Today, 08:00 AM" },
  { text: "Maintenance request: Room 301 AC", date: "Yesterday, 4:15 PM" },
  { text: "KRA compliance report approved", date: "Mar 25, 2026" },
  { text: "New staff onboarding: Ahmed K.", date: "Mar 23, 2026" },
];

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyRecord | null>(null);
  const [owners, setOwners] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [propRes, ownersRes, roomsRes, bookingsRes] = await Promise.all([
          dashboardApi.getProperty(propertyId),
          dashboardApi.listPropertyOwners(propertyId),
          dashboardApi.listRooms(propertyId),
          dashboardApi.listBookings(propertyId),
        ]);

        setProperty(propRes.data);
        setOwners(ownersRes.data || []);
        setRooms(roomsRes.data || []);
        setBookings(bookingsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch property details:", err);
        setError("Failed to load property details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-950 rounded-full animate-spin" />
          <p className="text-slate-500 mt-4">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-slate-950 mb-2">Property Not Found</h2>
          <p className="text-slate-500 mb-6">{error || "The property you're looking for doesn't exist."}</p>
          <button
            onClick={() => router.push("/owner/properties")}
            className="px-4 py-2 bg-slate-950 text-white rounded-xl text-sm font-medium"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const getHealthColor = (health?: number) => {
    if (!health) return "#9CA3AF";
    if (health >= 90) return "#10B981";
    if (health >= 75) return "#F59E0B";
    return "#EF4444";
  };

  const location = property.address && property.city
    ? `${property.address}, ${property.city}${property.state ? `, ${property.state}` : ""}${property.country ? `, ${property.country}` : ""}`
    : "—";

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/owner/properties")}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-950 tracking-tight">{property.name || "—"}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 text-sm">{location}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
            property.status === "active"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              : "bg-red-50 text-red-700 border border-red-200/60"
          }`}>
            {property.status === "active" ? "Active" : "Inactive"}
          </span>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Building2, label: "Total Rooms", value: property.total_rooms ?? "—", color: "#3B82F6" },
          { icon: Users, label: "Total Staff", value: rooms?.length ?? "—", color: "#6366F1" },
          { icon: TrendingUp, label: "Daily Revenue", value: "—", color: "#10B981" },
          { icon: Activity, label: "Health Score", value: "—", color: getHealthColor() },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm overflow-hidden"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}15` }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold text-slate-950 tracking-tight">{String(stat.value)}</div>
            <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
            <div
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="font-bold text-slate-950 text-lg mb-5">Performance Metrics</h3>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Occupancy Rate</span>
                  <span className="text-sm font-bold text-slate-950">—</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Health Score</span>
                  <span className="text-sm font-bold text-slate-950">—</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-slate-500 text-xs mb-1">Property Type</p>
                  <p className="text-slate-950 text-sm font-semibold">{property.property_type || "—"}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-slate-500 text-xs mb-1">Created</p>
                  <p className="text-slate-950 text-sm font-semibold">{property.created_at ? new Date(property.created_at).toLocaleDateString() : "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="font-bold text-slate-950 text-lg mb-5">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-700 text-sm">{activity.text}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-slate-300" />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-slate-500 text-xs mb-1">Property Name</p>
                <p className="text-slate-950 text-sm font-semibold">{property.name || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Location</p>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-slate-950 text-sm font-semibold">{location}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Property Owner</p>
                <p className="text-slate-950 text-sm font-semibold">{owners?.[0]?.name || owners?.[0]?.email || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Total Rooms</p>
                <p className="text-slate-950 text-sm font-semibold">{property.total_rooms ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="font-bold text-slate-950 text-lg mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/owner/staff")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">View Staff</span>
              </button>
              <button
                onClick={() => router.push("/owner/reports")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">View Reports</span>
              </button>
              <button
                onClick={() => router.push("/owner/kra")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <Activity className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">KRA Monitoring</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
