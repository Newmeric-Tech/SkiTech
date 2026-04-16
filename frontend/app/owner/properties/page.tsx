"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Plus, Search, Building2, Users, TrendingUp, MapPin, MoreHorizontal } from "lucide-react";
import { dashboardApi, PropertyRecord } from "@/lib/api";

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [propertiesList, setPropertiesList] = useState<PropertyRecord[]>([]);
  const [formData, setFormData] = useState({ name: "", location: "", type: "", rooms: "" });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.listProperties();
        setPropertiesList(response.data || []);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        setPropertiesList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filtered = propertiesList.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Properties</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{propertiesList.length} properties in your portfolio</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Add Property
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search properties..."
          className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-colors"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-neutral-400">Loading properties...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-neutral-400">{search ? "No properties match your search." : "No properties yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm overflow-hidden group cursor-pointer"
            >
              <div className="relative h-40">
                <img src="https://images.unsplash.com/photo-1761926488116-9a5040fb1384?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className={`text-white text-xs px-2 py-0.5 rounded-full ${p.status === "active" ? "bg-[#10B981]/90" : "bg-gray-500/90"}`} style={{ fontWeight: 600 }}>
                    {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : "Active"}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4">
                  <p className="text-white text-sm" style={{ fontWeight: 700 }}>{p.name}</p>
                  <div className="flex items-center gap-1 text-white/80 text-xs mt-0.5">
                    <MapPin className="w-3 h-3" /> {p.city || p.address || "—"}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-neutral-500 bg-black/[0.04] px-2.5 py-1 rounded-full">{p.property_type || "Standard"}</span>
                  <button className="text-neutral-400 hover:text-neutral-600 p-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Building2, label: "Rooms", value: p.total_rooms ?? "—", color: "#3B82F6" },
                    { icon: Users, label: "Staff", value: "—", color: "#6366F1" },
                    { icon: TrendingUp, label: "Revenue", value: "—", color: "#10B981" },
                  ].map((stat, j) => (
                    <div key={j} className="text-center p-2 bg-white/50 rounded-xl">
                      <stat.icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: stat.color }} />
                      <div className="text-black text-sm" style={{ fontWeight: 700 }}>{stat.value}</div>
                      <div className="text-neutral-400 text-[10px]">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-neutral-500 text-xs">Occupancy</span>
                    <span className="text-neutral-700 text-xs" style={{ fontWeight: 600 }}>—</span>
                  </div>
                  <div className="h-1.5 bg-black/[0.04] rounded-full">
                    <div className="h-1.5 rounded-full bg-black" style={{ width: "0%" }} />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
                  <span className="text-neutral-500 text-xs">Manager: <span className="text-neutral-700">—</span></span>
                  <button
                    onClick={() => router.push(`/owner/properties/${p.id}`)}
                    className="text-black text-xs hover:underline"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add Property Card */}
          <motion.button
            whileHover={{ y: -4 }}
            onClick={() => setShowAdd(true)}
            className="bg-white/50 border-2 border-dashed border-black/10 rounded-2xl h-full min-h-[300px] flex flex-col items-center justify-center gap-3 text-neutral-400 hover:text-neutral-600 hover:border-black/10 hover:bg-black/[0.04]/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-black/[0.04] flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm" style={{ fontWeight: 500 }}>Add New Property</span>
          </motion.button>
        </div>
      )}

      {/* Add Modal */}
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
                  placeholder="Grand Horizon property"
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
                  placeholder="5-Star property, Boutique, etc."
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
                  // TODO: Wire to backend POST /api/v1/properties/ endpoint
                  // For now, just close the modal
                  setFormData({ name: "", location: "", type: "", rooms: "" });
                  setShowAdd(false);
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
