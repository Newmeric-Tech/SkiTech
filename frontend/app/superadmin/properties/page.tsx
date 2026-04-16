"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Building2,
  MapPin,
  Users,
  Home,
  Activity,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react";
import { dashboardApi, PropertyRecord } from "@/lib/api";

const regions = ["All Regions", "West", "Southwest", "Midwest", "Southeast", "Northeast"];

export default function AllProperties() {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyRecord | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await dashboardApi.listProperties();
        setProperties(data || []);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        setError("Failed to load properties");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: properties.length,
    active: properties.filter((p) => p.status === "active").length,
    inactive: properties.filter((p) => p.status === "inactive").length,
    newThisMonth: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          All Properties
        </h1>
        <p className="text-neutral-500 text-sm mt-0.5">Manage and monitor all platform properties</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Total Properties</p>
          <p className="text-2xl font-bold text-black mt-1">{stats.total}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Inactive</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{stats.inactive}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">New This Month</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.newThisMonth}</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
        <div className="p-4 flex items-center gap-4 border-b border-black/10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-neutral-500">Loading properties...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : filteredProperties.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">No properties found</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Property Name</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Location</th>
                  <th className="text-center p-4 text-sm font-medium text-neutral-500"># Rooms</th>
                  <th className="text-center p-4 text-sm font-medium text-neutral-500">Occupancy %</th>
                  <th className="text-center p-4 text-sm font-medium text-neutral-500">Rating</th>
                  <th className="text-center p-4 text-sm font-medium text-neutral-500">Status</th>
                  <th className="text-center p-4 text-sm font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property, i) => (
                  <motion.tr
                    key={property.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-black/5 hover:bg-black/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-black">{property.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-neutral-600">{property.property_type || "—"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-neutral-600">
                        <MapPin className="w-4 h-4" />
                        {property.address ? `${property.address}, ${property.city}, ${property.state}` : "—"}
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm font-medium">{property.total_rooms || "—"}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium">—</span>
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm">—</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        property.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {property.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedProperty(property)}
                          className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-neutral-600" />
                        </button>
                        <button className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-neutral-600" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                Add New Property
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-black/5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Property Name</label>
                <input
                  type="text"
                  placeholder="Enter property name"
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Owner/Tenant</label>
                <input
                  type="text"
                  placeholder="Enter owner or tenant name"
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="City, State"
                    className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1"># Units</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors">
                  Add Property
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedProperty(null)}
          />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                Property Details
              </h2>
              <button onClick={() => setSelectedProperty(null)} className="p-2 hover:bg-black/5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                <Building2 className="w-12 h-12" />
                <div>
                  <h3 className="text-lg font-bold">{selectedProperty.name}</h3>
                  <p className="text-blue-100 text-sm">{selectedProperty.property_type || "Property"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-black/5 rounded-lg">
                  <p className="text-xs text-neutral-500">Address</p>
                  <p className="text-sm font-medium mt-0.5">{selectedProperty.address || "—"}</p>
                </div>
                <div className="p-3 bg-black/5 rounded-lg">
                  <p className="text-xs text-neutral-500">Total Rooms</p>
                  <p className="text-sm font-medium mt-0.5">{selectedProperty.total_rooms || "—"}</p>
                </div>
                <div className="p-3 bg-black/5 rounded-lg">
                  <p className="text-xs text-neutral-500">City</p>
                  <p className="text-sm font-medium mt-0.5">{selectedProperty.city || "—"}</p>
                </div>
                <div className="p-3 bg-black/5 rounded-lg">
                  <p className="text-xs text-neutral-500">State</p>
                  <p className="text-sm font-medium mt-0.5">{selectedProperty.state || "—"}</p>
                </div>
                <div className="p-3 bg-black/5 rounded-lg">
                  <p className="text-xs text-neutral-500">Country</p>
                  <p className="text-sm font-medium mt-0.5">{selectedProperty.country || "—"}</p>
                </div>
                <div className="p-3 bg-black/5 rounded-lg">
                  <p className="text-xs text-neutral-500">Status</p>
                  <p className="text-sm font-medium mt-0.5 capitalize">{selectedProperty.status || "—"}</p>
                </div>
              </div>
              {selectedProperty.created_at && (
                <div className="p-3 bg-black/5 rounded-lg">
                  <p className="text-xs text-neutral-500">Created</p>
                  <p className="text-sm font-medium mt-0.5">{new Date(selectedProperty.created_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
