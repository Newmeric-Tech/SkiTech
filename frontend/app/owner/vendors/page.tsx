"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, Edit2, Trash2, X, ChevronDown,
  Phone, Mail, Building2, Link2, Unlink, CheckCircle2,
  MoreHorizontal, Package, Wrench, Zap, Truck, Brush, Shield
} from "lucide-react";
import { dashboardApi, PropertyRecord } from "@/lib/api";

// ─── Data ────────────────────────────────────────────────────────────────────
const serviceCategories = [
  "All Categories", "Cleaning", "Maintenance", "Security", "Catering",
  "Electrical", "Plumbing", "Laundry", "Pest Control", "Landscaping",
];

const serviceIcons: Record<string, React.ElementType> = {
  Cleaning: Brush, Maintenance: Wrench, Security: Shield,
  Catering: Package, Electrical: Zap, Plumbing: Truck,
  Laundry: Brush, "Pest Control": Shield, Landscaping: Truck,
};

const serviceColors: Record<string, string> = {
  Cleaning: "#6366F1", Maintenance: "#F59E0B", Security: "#3B82F6",
  Catering: "#10B981", Electrical: "#0EA5E9", Plumbing: "#0EA5E9",
  Laundry: "#8B5CF6", "Pest Control": "#EF4444", Landscaping: "#14B8A6",
};

type Vendor = {
  id: string | number;
  name?: string;
  category?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  status?: boolean;
  rating?: number;
  created_at?: string;
  [key: string]: any;
};

// ─── Reusable UI ─────────────────────────────────────────────────────────────
function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: color + "15", color, fontWeight: 600 }}>
      {children}
    </span>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`w-10 h-5.5 rounded-full transition-colors relative flex-shrink-0 ${value ? "bg-[#3B82F6]" : "bg-black/[0.06]"}`} style={{ height: "22px", width: "40px" }}>
      <span className="absolute top-[2px] w-[18px] h-[18px] bg-white/70 backdrop-blur rounded-full shadow-sm transition-all" style={{ left: value ? "calc(100% - 20px)" : "2px" }} />
    </button>
  );
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────
function VendorModal({ vendor, onClose, onSave, properties }: {
  vendor: Vendor | null;
  onClose: () => void;
  onSave: (v: Vendor) => void;
  properties: PropertyRecord[];
}) {
  const [form, setForm] = useState<Vendor>(
    vendor ?? { id: Date.now(), name: "", category: "Cleaning", contact_phone: "", contact_email: "", address: "", status: true }
  );

  const toggleProperty = (id: string) => {
    const linkedProperties = form.properties || [];
    setForm(f => ({ ...f, properties: linkedProperties.includes(id) ? linkedProperties.filter((p: string) => p !== id) : [...linkedProperties, id] }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-black/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 bg-white/80 backdrop-blur border-b border-black/10">
          <h2 className="text-black" style={{ fontWeight: 700, fontSize: "1rem" }}>{vendor ? "Edit Vendor" : "Add New Vendor"}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Vendor Name */}
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Vendor Name <span className="text-red-500">*</span></label>
            <input value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Al Noor Cleaning Services"
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
          </div>

          {/* Category */}
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Service Category</label>
            <div className="relative">
              <select value={form.category ?? "Cleaning"} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full appearance-none bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all pr-8">
                {serviceCategories.slice(1).map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Phone</label>
              <input value={form.contact_phone ?? ""} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                placeholder="+971 4 000 0000"
                className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
            </div>
            <div>
              <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Email</label>
              <input value={form.contact_email ?? ""} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                placeholder="vendor@email.com"
                className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Address</label>
            <input value={form.address ?? ""} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Street, City, UAE"
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
          </div>

          {/* Properties */}
          <div>
            <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 600 }}>Associated Properties</label>
            <div className="space-y-2">
              {properties.length > 0 ? properties.map(p => {
                const linkedProperties = form.properties || [];
                return (
                  <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${linkedProperties.includes(p.id) ? "border-[#3B82F6] bg-black/[0.04]" : "border-black/10 bg-[#F8FAFC] hover:border-black/20"}`}>
                    <input type="checkbox" checked={linkedProperties.includes(p.id)} onChange={() => toggleProperty(p.id)} className="w-4 h-4 accent-[#3B82F6]" />
                    <Building2 className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-black" style={{ fontWeight: linkedProperties.includes(p.id) ? 600 : 400 }}>{p.name}</span>
                  </label>
                );
              }) : (
                <p className="text-neutral-400 text-xs py-2">No properties available</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-black/10 rounded-xl">
            <div>
              <p className="text-black text-sm" style={{ fontWeight: 500 }}>Vendor Status</p>
              <p className="text-neutral-400 text-xs">Active vendors appear in assignments</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${form.status ? "text-black" : "text-neutral-400"}`} style={{ fontWeight: 500 }}>
                {form.status ? "Active" : "Inactive"}
              </span>
              <Toggle value={form.status} onChange={() => setForm(f => ({ ...f, status: !f.status }))} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/10 bg-white/50 flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04] transition-colors">Cancel</button>
          <button
            onClick={() => { if (form.name.trim()) onSave(form); }}
            disabled={!form.name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontWeight: 600 }}
          >
            {vendor ? "Save Changes" : "Add Vendor"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Property Association Panel ───────────────────────────────────────────────
function AssociationPanel({ vendor, onClose, properties }: { vendor: Vendor; onClose: () => void; properties: PropertyRecord[] }) {
  const [linked, setLinked] = useState<string[]>(vendor.properties || []);

  const toggleLink = (id: string) => setLinked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-black/10"
      >
        <div className="px-6 py-5 border-b border-black/10 bg-white/80 backdrop-blur border-b border-black/10 flex items-center justify-between">
          <div>
            <h2 className="text-black" style={{ fontWeight: 700 }}>Property Associations</h2>
            <p className="text-neutral-400 text-xs mt-0.5">{vendor.name}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vendor card */}
        <div className="p-5 border-b border-black/10">
          <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (serviceColors[vendor.category] ?? "#3B82F6") + "15" }}>
              {(() => { const Icon = serviceIcons[vendor.category] ?? Package; return <Icon className="w-5 h-5" style={{ color: serviceColors[vendor.category] ?? "#3B82F6" }} />; })()}
            </div>
            <div>
              <p className="text-black text-sm" style={{ fontWeight: 700 }}>{vendor.name}</p>
              <p className="text-neutral-500 text-xs">{vendor.category} · {linked.length} properties linked</p>
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="p-5 space-y-3">
          <p className="text-neutral-600 text-xs" style={{ fontWeight: 600 }}>LINK / UNLINK PROPERTIES</p>
          {properties.length > 0 ? properties.map(p => {
            const isLinked = linked.includes(p.id);
            return (
              <div key={p.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${isLinked ? "border-[#3B82F6] bg-black/[0.04]" : "border-black/10 bg-[#F8FAFC]"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLinked ? "bg-[#3B82F6]/10" : "bg-black/[0.04]"}`}>
                  <Building2 className={`w-4 h-4 ${isLinked ? "text-black" : "text-neutral-400"}`} />
                </div>
                <span className="flex-1 text-sm text-black" style={{ fontWeight: isLinked ? 600 : 400 }}>{p.name}</span>
                <button
                  onClick={() => toggleLink(p.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${isLinked ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-black/[0.04] text-black hover:bg-[#DBEAFE]"}`}
                  style={{ fontWeight: 500 }}
                >
                  {isLinked ? <><Unlink className="w-3 h-3" /> Unlink</> : <><Link2 className="w-3 h-3" /> Link</>}
                </button>
              </div>
            );
          }) : (
            <p className="text-neutral-400 text-xs py-2">No properties available</p>
          )}
        </div>

        <div className="px-5 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-black text-white text-sm shadow-md" style={{ fontWeight: 600 }}>
            Save Associations
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VendorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All Categories");
  const [modalOpen, setModalOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [assocVendor, setAssocVendor] = useState<Vendor | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch properties first
        const propsRes = await dashboardApi.listProperties();
        const propsData = propsRes.data || [];
        setProperties(propsData);

        // If no properties, show empty state
        if (propsData.length === 0) {
          setVendors([]);
          setLoading(false);
          return;
        }

        // Fetch vendors for the first property
        const firstPropertyId = propsData[0].id;
        const vendorsRes = await dashboardApi.listVendors(firstPropertyId);
        const vendorsData = (vendorsRes.data || []) as any[];
        setVendors(vendorsData);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setError("Failed to load vendors");
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = vendors.filter(v => {
    const vendorName = (v.name ?? "").toLowerCase();
    const vendorEmail = (v.contact_email ?? "").toLowerCase();
    const matchSearch = vendorName.includes(search.toLowerCase()) ||
      vendorEmail.includes(search.toLowerCase());
    const matchCat = catFilter === "All Categories" || v.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleSave = (v: Vendor) => {
    setVendors(prev => prev.find(x => x.id === v.id) ? prev.map(x => x.id === v.id ? v : x) : [v, ...prev]);
    setModalOpen(false);
    setEditVendor(null);
  };

  const handleDelete = (id: string | number) => {
    setVendors(prev => prev.filter(v => v.id !== id));
    setMenuOpen(null);
  };

  // Empty state when no properties
  if (!loading && properties.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <Building2 className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-base font-semibold">No properties yet — vendors will appear here.</p>
          <p className="text-sm mt-2">Create a property to manage vendors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Vendor Management</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{vendors.length} vendors across all properties</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setEditVendor(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md"
          style={{ fontWeight: 600 }}
          disabled={loading}
        >
          <Plus className="w-4 h-4" /> Add Vendor
        </motion.button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Vendors", value: vendors.length, color: "#3B82F6" },
          { label: "Active", value: vendors.filter(v => v.status).length, color: "#10B981" },
          { label: "Inactive", value: vendors.filter(v => !v.status).length, color: "#94A3B8" },
          { label: "Categories", value: new Set(vendors.map(v => v.category)).size, color: "#6366F1" },
        ].map((s, i) => (
          <div key={i} className="bg-white/70 backdrop-blur rounded-xl p-5 border border-black/10 shadow-sm">
            <p className="text-neutral-500 text-xs mb-1">{s.label}</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-black/10 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..."
            className="w-full bg-white/50 border border-black/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <div className="relative">
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="appearance-none bg-white/50 border border-black/10 rounded-lg px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all">
              {serviceCategories.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[2fr,1.2fr,1.5fr,1.5fr,1.2fr,auto,auto] gap-4 px-6 py-3 bg-white/50 border-b border-black/10">
          {["Vendor Name", "Service Type", "Phone", "Email", "Linked Properties", "Status", "Actions"].map(h => (
            <span key={h} className="text-neutral-500 text-xs uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</span>
          ))}
        </div>

        <div className="divide-y divide-black/5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <Package className="w-10 h-10 mb-3 opacity-30 animate-pulse" />
              <p className="text-sm">Loading vendors...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <Package className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <Package className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">{search || catFilter !== "All Categories" ? "No vendors found" : "No vendors yet"}</p>
            </div>
          ) : filtered.map((v, i) => {
            const Icon = serviceIcons[v.category ?? "Cleaning"] ?? Package;
            const color = serviceColors[v.category ?? "Cleaning"] ?? "#3B82F6";
            const linkedCount = (v.properties || []).length;
            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex flex-col md:grid md:grid-cols-[2fr,1.2fr,1.5fr,1.5fr,1.2fr,auto,auto] gap-2 md:gap-4 items-start md:items-center px-6 py-4 hover:bg-white/50/60 transition-colors"
              >
                {/* Vendor Name */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "15" }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-black text-sm" style={{ fontWeight: 600 }}>{v.name ?? "—"}</p>
                    <p className="text-neutral-400 text-xs md:hidden">{v.category ?? "—"}</p>
                  </div>
                </div>
                {/* Service Type */}
                <div className="hidden md:block">
                  <Badge color={color}>{v.category ?? "—"}</Badge>
                </div>
                {/* Phone */}
                <div className="flex items-center gap-1.5 text-neutral-600 text-sm">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs md:text-sm">{v.contact_phone ?? "—"}</span>
                </div>
                {/* Email */}
                <div className="flex items-center gap-1.5 text-neutral-600 text-sm hidden md:flex">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs truncate">{v.contact_email ?? "—"}</span>
                </div>
                {/* Linked Properties */}
                <div className="hidden md:flex items-center gap-1.5">
                  <span className="text-black text-sm" style={{ fontWeight: 600 }}>{linkedCount}</span>
                  <span className="text-neutral-400 text-xs">properties</span>
                </div>
                {/* Status */}
                <div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${v.status ? "bg-black/[0.04] text-black" : "bg-black/[0.04] text-neutral-500"}`} style={{ fontWeight: 600 }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${v.status ? "bg-[#10B981]" : "bg-slate-400"}`} />
                    {v.status ? "Active" : "Inactive"}
                  </span>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 relative">
                  <button onClick={() => setAssocVendor(v)} className="p-1.5 text-neutral-400 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors" title="Manage Properties">
                    <Link2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setEditVendor(v); setModalOpen(true); }} className="p-1.5 text-neutral-400 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <button onClick={() => setMenuOpen(menuOpen === v.id ? null : v.id)} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {menuOpen === v.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-8 bg-white border border-black/10 rounded-xl shadow-lg z-10 min-w-[140px] overflow-hidden"
                        >
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Vendor
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

      {/* Modals */}
      <AnimatePresence>
        {modalOpen && <VendorModal vendor={editVendor} onClose={() => { setModalOpen(false); setEditVendor(null); }} onSave={handleSave} properties={properties} />}
        {assocVendor && <AssociationPanel vendor={assocVendor} onClose={() => setAssocVendor(null)} properties={properties} />}
      </AnimatePresence>
    </div>
  );
}
