"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit2, Trash2, X, ChevronDown,
  Layers, Users, Briefcase, Shield, Truck, Utensils,
  Waves, Wrench, MoreHorizontal
} from "lucide-react";
import { dashboardApi } from "@/lib/api";

// ─── Data ─────────────────────────────────────────────────────────────────────
const deptIcons: Record<string, React.ElementType> = {
  "Front Office": Briefcase, "Housekeeping": Layers, "Food & Beverage": Utensils,
  "Security": Shield, "Maintenance": Wrench, "Wellness": Waves,
  "Finance": Truck, "Management": Users,
};
const deptColors: Record<string, string> = {
  "Front Office": "#3B82F6", "Housekeeping": "#6366F1", "Food & Beverage": "#10B981",
  "Security": "#EF4444", "Maintenance": "#F59E0B", "Wellness": "#14B8A6",
  "Finance": "#8B5CF6", "Management": "#0EA5E9",
};

const managers = [
  "Sarah Mitchell", "James Chen", "Priya Sharma", "Omar Al Rashid",
  "Fatima Al-Hassan", "Ahmed Khalid", "Carlos Rivera", "Nina Patel",
];

// ─── Type definition ─────────────────────────────────────────────────────────
type Dept = {
  id: string | number;
  name: string;
  description?: string;
  head?: string;
  staffCount?: number;
  status?: boolean;
  createdDate?: string;
  is_active?: boolean;
  created_at?: string;
};

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`w-10 rounded-full transition-colors relative flex-shrink-0 ${value ? "bg-[#3B82F6]" : "bg-black/[0.06]"}`}
      style={{ height: "22px", width: "40px" }}>
      <span className="absolute top-[2px] w-[18px] h-[18px] bg-white/70 backdrop-blur rounded-full shadow-sm transition-all"
        style={{ left: value ? "calc(100% - 20px)" : "2px" }} />
    </button>
  );
}

// ─── Dept Form Modal ──────────────────────────────────────────────────────────
function DeptFormModal({ dept, onClose, onSave }: {
  dept: Dept | null;
  onClose: () => void;
  onSave: (d: Dept) => void;
}) {
  const blank: Dept = { id: Date.now(), name: "", description: "", head: managers[0], staffCount: 0, status: true, createdDate: "Mar 17, 2026" };
  const [form, setForm] = useState<Dept>(dept ?? blank);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-black/10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 bg-white/80 backdrop-blur border-b border-black/10">
          <h2 className="text-black" style={{ fontWeight: 700 }}>{dept ? "Edit Department" : "Add Department"}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Department Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Front Office"
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of department responsibilities..."
              rows={3}
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all resize-none" />
          </div>

          {/* Department Head */}
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Department Head</label>
            <div className="relative">
              <select value={form.head} onChange={e => setForm(f => ({ ...f, head: e.target.value }))}
                className="w-full appearance-none bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all">
                {managers.map(m => <option key={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-black/10 rounded-xl">
            <div>
              <p className="text-black text-sm" style={{ fontWeight: 500 }}>Department Status</p>
              <p className="text-neutral-400 text-xs">Active departments are visible to staff</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${form.status ? "text-black" : "text-neutral-400"}`} style={{ fontWeight: 500 }}>
                {form.status ? "Active" : "Inactive"}
              </span>
              <Toggle value={form.status} onChange={() => setForm(f => ({ ...f, status: !f.status }))} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-black/10 bg-white/50 flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04] transition-colors">Cancel</button>
          <button onClick={() => { if (form.name.trim()) onSave(form); }}
            disabled={!form.name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed" style={{ fontWeight: 600 }}>
            {dept ? "Save Changes" : "Add Department"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DepartmentsPage() {
  const [depts, setDepts] = useState<Dept[]>([]);
  const [search, setSearch] = useState("");
  const [formDept, setFormDept] = useState<Dept | null | "new">(null);
  const [menuOpen, setMenuOpen] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noPropertiesNotice, setNoPropertiesNotice] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        setError(null);
        setNoPropertiesNotice(false);

        // Step 1: Get list of properties
        const propsRes = await dashboardApi.listProperties();
        const properties = propsRes.data;

        if (!properties || properties.length === 0) {
          // No properties exist
          setNoPropertiesNotice(true);
          setDepts([]);
          setLoading(false);
          return;
        }

        // Step 2: Get first property's ID
        const propertyId = properties[0].id;

        // Step 3: Fetch departments for that property
        const deptsRes = await dashboardApi.listDepartments(propertyId);
        const deptsList = Array.isArray(deptsRes.data) ? deptsRes.data : [];

        // Map backend response to UI format
        const mapped: Dept[] = deptsList.map((d: any) => ({
          id: d.id,
          name: d.name ?? "—",
          description: d.description ?? "—",
          status: d.is_active ?? false,
          staffCount: 0, // Not provided by backend
          head: "—", // Not provided by backend
          createdDate: d.created_at ? new Date(d.created_at).toLocaleDateString() : "—",
          is_active: d.is_active,
          created_at: d.created_at,
        }));

        setDepts(mapped);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Failed to fetch departments:", msg);
        setError(`Failed to load departments: ${msg}`);
        setDepts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const filtered = depts.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase()) ||
    d.head?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (d: Dept) => {
    setDepts(prev => prev.find(x => x.id === d.id) ? prev.map(x => x.id === d.id ? d : x) : [d, ...prev]);
    setFormDept(null);
  };

  const handleDelete = (id: number | string) => {
    setDepts(prev => prev.filter(d => d.id !== id));
    setMenuOpen(null);
  };

  const toggleStatus = (id: number | string) => {
    setDepts(prev => prev.map(d => d.id === id ? { ...d, status: !d.status } : d));
  };


  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Department Configuration</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{depts.filter(d => d.status).length} active departments</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setFormDept("new")}
          disabled={loading || noPropertiesNotice}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md disabled:opacity-40" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Add Department
        </motion.button>
      </div>

      {/* No Properties Notice */}
      {noPropertiesNotice && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <p className="text-yellow-800 text-sm" style={{ fontWeight: 500 }}>
            No properties yet — departments will appear here once a property is created.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="text-red-800 text-sm" style={{ fontWeight: 500 }}>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-neutral-500">
            <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse"></div>
            <p className="text-sm">Loading departments...</p>
          </div>
        </div>
      )}

      {/* Stats */}
      {!loading && !noPropertiesNotice && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Departments", value: depts.length, color: "#3B82F6" },
            { label: "Active", value: depts.filter(d => d.status).length, color: "#10B981" },
            { label: "Inactive", value: depts.filter(d => !d.status).length, color: "#94A3B8" },
            { label: "Total Staff", value: depts.reduce((a, d) => a + (d.staffCount ?? 0), 0), color: "#6366F1" },
          ].map((s, i) => (
            <div key={i} className="bg-white/70 backdrop-blur rounded-xl p-5 border border-black/10 shadow-sm">
              <p className="text-neutral-500 text-xs mb-1">{s.label}</p>
              <p style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {!loading && depts.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments..."
            className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
        </div>
      )}

      {/* Table */}
      {!loading && !noPropertiesNotice && (
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr,2.5fr,1.5fr,auto,auto,auto] gap-4 px-6 py-3 bg-white/50 border-b border-black/10">
            {["Department Name", "Description", "Department Head", "Staff", "Status", "Actions"].map(h => (
              <span key={h} className="text-neutral-500 text-xs uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</span>
            ))}
          </div>

          <div className="divide-y divide-slate-50">
            {filtered.length === 0 && depts.length > 0 ? (
              <div className="px-6 py-8 text-center text-neutral-500 text-sm">
                No departments match your search.
              </div>
            ) : filtered.map((d, i) => {
            const Icon = deptIcons[d.name] ?? Layers;
            const color = deptColors[d.name] ?? "#3B82F6";
            return (
              <motion.div key={d.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex flex-col md:grid md:grid-cols-[2fr,2.5fr,1.5fr,auto,auto,auto] gap-2 md:gap-4 items-start md:items-center px-6 py-4 hover:bg-white/50/60 transition-colors">

                {/* Name */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "15" }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="text-black text-sm" style={{ fontWeight: 600 }}>{d.name}</span>
                </div>

                {/* Description */}
                <p className="text-neutral-500 text-xs leading-relaxed hidden md:block">{d.description}</p>

                {/* Head */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-black to-neutral-700 flex items-center justify-center text-white text-[9px]" style={{ fontWeight: 700 }}>
                    {(d.head && d.head !== "—") ? d.head.split(" ").map(n => n[0]).join("").slice(0, 2) : "—"}
                  </div>
                  <span className="text-neutral-700 text-xs">{d.head ?? "—"}</span>
                </div>

                {/* Staff count */}
                <div className="flex items-center gap-1.5 hidden md:flex">
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-neutral-700 text-sm" style={{ fontWeight: 600 }}>{d.staffCount ?? "—"}</span>
                </div>

                {/* Status toggle */}
                <div className="flex items-center gap-2">
                  <Toggle value={d.status} onChange={() => toggleStatus(d.id)} />
                  <span className={`text-xs ${d.status ? "text-black" : "text-neutral-400"}`} style={{ fontWeight: 500 }}>
                    {d.status ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 relative">
                  <button onClick={() => setFormDept(d)} className="p-1.5 text-neutral-400 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <button onClick={() => setMenuOpen(menuOpen === d.id ? null : d.id)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {menuOpen === d.id && (
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-8 bg-white border border-black/10 rounded-xl shadow-lg z-10 min-w-[140px] overflow-hidden">
                          <button onClick={() => handleDelete(d.id)}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {formDept && <DeptFormModal dept={formDept === "new" ? null : formDept} onClose={() => setFormDept(null)} onSave={handleSave} />}
      </AnimatePresence>
    </div>
  );
}