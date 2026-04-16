"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Building2, Mail, Phone, MapPin, Eye,
  Edit2, X, ChevronDown, TrendingUp, CheckCircle2, ArrowUpRight
} from "lucide-react";
import { dashboardApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Owner = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  share_percentage?: number;
  created_at?: string;
  propertyName?: string;
  avatar?: string;
  color?: string;
  address?: string;
  joinedDate?: string;
  revenue?: string;
  portfolioValue?: string;
  activity?: { text: string; date: string }[];
  propertyIds?: string[];
};

type Property = {
  id?: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status?: string;
  total_rooms?: number;
  created_at?: string;
};

// ─── Owner Profile Modal ──────────────────────────────────────────────────────
function OwnerProfileModal({ owner, onClose, properties }: { owner: Owner; onClose: () => void; properties: Property[] }) {
  const ownedProperties = properties.filter(p => owner.propertyIds?.includes(p.id ?? ""));
  const [linkedIds, setLinkedIds] = useState(owner.propertyIds ?? []);

  const toggleProp = (id: string) => setLinkedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-black/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 bg-white/80 backdrop-blur border-b border-black/10">
          <h2 className="text-black" style={{ fontWeight: 700 }}>Owner Profile</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Profile card */}
          <div className="p-6 border-b border-black/10">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl flex-shrink-0 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${owner.color ?? "#3B82F6"}, ${owner.color ?? "#3B82F6"}99)`, fontWeight: 800 }}>
                {owner.avatar ?? owner.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "OW"}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-black" style={{ fontWeight: 800, fontSize: "1.1rem" }}>{owner.name ?? "—"}</h3>
                    <p className="text-neutral-400 text-xs mt-0.5">Member since {owner.joinedDate ?? "—"}</p>
                  </div>
                  <span className="bg-black/[0.04] text-black text-xs px-2.5 py-1 rounded-full" style={{ fontWeight: 600 }}>Active Owner</span>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-neutral-600 text-sm"><Mail className="w-3.5 h-3.5 text-neutral-400" />{owner.email ?? "—"}</div>
                  <div className="flex items-center gap-2 text-neutral-600 text-sm"><Phone className="w-3.5 h-3.5 text-neutral-400" />{owner.phone ?? "—"}</div>
                  <div className="flex items-center gap-2 text-neutral-600 text-sm"><MapPin className="w-3.5 h-3.5 text-neutral-400" />{owner.address ?? "—"}</div>
                </div>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: "Properties", value: (owner.propertyIds?.length ?? 0).toString(), icon: Building2, color: "#3B82F6" },
                { label: "Ownership %", value: `${owner.share_percentage ?? 0}%`, icon: TrendingUp, color: "#10B981" },
                { label: "Added", value: owner.created_at ? new Date(owner.created_at).getFullYear().toString() : "—", icon: ArrowUpRight, color: "#6366F1" },
              ].map((s, i) => (
                <div key={i} className="bg-white/50 rounded-xl p-3 text-center">
                  <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
                  <p className="text-black text-sm" style={{ fontWeight: 800 }}>{s.value}</p>
                  <p className="text-neutral-400 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Property Mapping */}
          <div className="p-6 border-b border-black/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-black text-sm" style={{ fontWeight: 700 }}>Property Mapping</h4>
              <span className="text-neutral-400 text-xs">{linkedIds.length} linked</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-black/10">
              <div className="grid grid-cols-[2fr,1.5fr,1fr,auto] gap-4 px-4 py-2.5 bg-white/50 border-b border-black/10">
                {["Property Name", "Location", "Units", "Status"].map(h => (
                  <span key={h} className="text-neutral-500 text-xs" style={{ fontWeight: 600 }}>{h}</span>
                ))}
              </div>
              {properties.length > 0 ? (
                properties.map((p, i) => {
                  const isLinked = linkedIds.includes(p.id ?? "");
                  return (
                    <div key={p.id} className={`grid grid-cols-[2fr,1.5fr,1fr,auto] gap-4 px-4 py-3 items-center ${i < properties.length - 1 ? "border-b border-black/10" : ""} ${isLinked ? "bg-black/[0.04]/40" : ""} hover:bg-white/50 transition-colors`}>
                      <div className="flex items-center gap-2">
                        <Building2 className={`w-4 h-4 ${isLinked ? "text-black" : "text-neutral-300"}`} />
                        <span className="text-black text-sm" style={{ fontWeight: isLinked ? 600 : 400 }}>{p.name ?? "—"}</span>
                      </div>
                      <span className="text-neutral-500 text-xs">{p.address ?? p.city ?? "—"}</span>
                      <span className="text-neutral-600 text-sm">{p.total_rooms ?? "—"}</span>
                      <button
                        onClick={() => toggleProp(p.id ?? "")}
                        className={`text-xs px-3 py-1 rounded-lg transition-colors ${isLinked ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-black/[0.04] text-black hover:bg-[#DBEAFE]"}`}
                        style={{ fontWeight: 500 }}
                      >
                        {isLinked ? "Remove" : "Add"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-neutral-500 text-sm">No properties available</div>
              )}
            </div>
          </div>

          {/* Activity Summary */}
          {owner.activity && owner.activity.length > 0 && (
            <div className="p-6">
              <h4 className="text-black text-sm mb-4" style={{ fontWeight: 700 }}>Owner Activity</h4>
              <div className="space-y-3">
                {owner.activity.map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#3B82F6] mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-neutral-700 text-sm">{act.text}</p>
                      <p className="text-neutral-400 text-xs mt-0.5">{act.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-black/10 bg-white/50 flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04] transition-colors">Close</button>
          <button className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md" style={{ fontWeight: 600 }}>
            Save Property Mapping
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────
function OwnerFormModal({ owner, onClose, onSave, properties }: {
  owner: Owner | null;
  onClose: () => void;
  onSave: (o: Owner) => void;
  properties: Property[];
}) {
  const blank: Owner = { id: `owner_${Date.now()}`, name: "", email: "", phone: "", address: "", avatar: "OW", color: "#3B82F6", propertyIds: [], joinedDate: "Mar 2026", revenue: "$0", portfolioValue: "$0M", activity: [] };
  const [form, setForm] = useState<Owner>(owner ?? blank);

  const toggleProp = (id: string) => setForm(f => ({ ...f, propertyIds: (f.propertyIds ?? []).includes(id) ? (f.propertyIds ?? []).filter(x => x !== id) : [...(f.propertyIds ?? []), id] }));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-black/10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 bg-white/80 backdrop-blur border-b border-black/10">
          <h2 className="text-black" style={{ fontWeight: 700 }}>{owner ? "Edit Owner" : "Add New Owner"}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {[
            { label: "Full Name", field: "name" as const, placeholder: "e.g. Khalid Al Mansouri" },
            { label: "Email Address", field: "email" as const, placeholder: "owner@email.ae" },
            { label: "Phone Number", field: "phone" as const, placeholder: "+971 50 000 0000" },
            { label: "Address", field: "address" as const, placeholder: "Villa, Tower, Area, Dubai, UAE" },
          ].map(f => (
            <div key={f.field}>
              <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>{f.label}</label>
              <input value={form[f.field] as string} onChange={e => setForm(prev => ({ ...prev, [f.field]: e.target.value }))} placeholder={f.placeholder}
                className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
            </div>
          ))}
          <div>
            <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 600 }}>Associated Properties</label>
            <div className="space-y-2">
              {properties.length > 0 ? (
                properties.map(p => (
                  <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${(form.propertyIds ?? []).includes(p.id ?? "") ? "border-[#3B82F6] bg-black/[0.04]" : "border-black/10 bg-[#F8FAFC] hover:border-black/20"}`}>
                    <input type="checkbox" checked={(form.propertyIds ?? []).includes(p.id ?? "")} onChange={() => toggleProp(p.id ?? "")} className="w-4 h-4 accent-[#3B82F6]" />
                    <Building2 className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-black" style={{ fontWeight: (form.propertyIds ?? []).includes(p.id ?? "") ? 600 : 400 }}>{p.name ?? "—"}</span>
                  </label>
                ))
              ) : (
                <p className="text-neutral-500 text-sm p-3">No properties available</p>
              )}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-black/10 bg-white/50 flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04] transition-colors">Cancel</button>
          <button onClick={() => { if (form.name.trim()) onSave({ ...form, avatar: form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() }); }}
            disabled={!form.name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md disabled:opacity-40 disabled:cursor-not-allowed" style={{ fontWeight: 600 }}>
            {owner ? "Save Changes" : "Add Owner"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [profileOwner, setProfileOwner] = useState<Owner | null>(null);
  const [formOwner, setFormOwner] = useState<Owner | null | "new">(null);

  // Fetch properties and owners on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch properties
        const propsRes = await dashboardApi.listProperties();
        const propsData = propsRes.data ?? [];
        setProperties(propsData);

        // If no properties, set empty owners
        if (!propsData || propsData.length === 0) {
          setOwners([]);
          setLoading(false);
          return;
        }

        // Fetch owners for each property in parallel
        const ownerPromises = propsData.map(prop =>
          dashboardApi
            .listPropertyOwners(prop.id ?? "")
            .then(res => {
              const ownersData = Array.isArray(res.data) ? res.data : [];
              return ownersData.map(owner => ({
                ...owner,
                propertyName: prop.name,
              }));
            })
            .catch(err => {
              console.error(`Failed to fetch owners for property ${prop.id}:`, err);
              return [];
            })
        );

        const allOwnerArrays = await Promise.all(ownerPromises);
        const flattened = allOwnerArrays.flat();
        setOwners(flattened);
      } catch (err) {
        console.error("Failed to fetch properties and owners:", err);
        setError("Failed to load property owners. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = owners.filter(o =>
    (o.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (o.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (o: Owner) => {
    setOwners(prev => prev.find(x => x.id === o.id) ? prev.map(x => x.id === o.id ? o : x) : [o, ...prev]);
    setFormOwner(null);
  };

  const totalProperties = owners.length > 0
    ? owners.reduce((a, o) => a + (o.propertyIds?.length ?? 0), 0)
    : 0;
  const avgPortfolio = owners.length > 0 ? Math.round(totalProperties / owners.length) : 0;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Owner Details</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Loading...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-6 animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-neutral-200 mb-4" />
              <div className="h-4 bg-neutral-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-neutral-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Owner Details</h1>
            <p className="text-neutral-500 text-sm mt-0.5">0 property owners in your portfolio</p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setFormOwner("new")}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md" style={{ fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> Add Owner
          </motion.button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Owners", value: 0, color: "#3B82F6" },
            { label: "Total Properties", value: 0, color: "#6366F1" },
            { label: "Avg. Portfolio", value: "0 props", color: "#10B981" },
          ].map((s, i) => (
            <div key={i} className="bg-white/70 backdrop-blur rounded-xl p-5 border border-black/10 shadow-sm">
              <p className="text-neutral-500 text-xs mb-1">{s.label}</p>
              <p style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
          <p className="text-neutral-500 text-lg mb-2">No properties yet</p>
          <p className="text-neutral-400 text-sm max-w-sm mx-auto">Owners will appear here once a property is added.</p>
        </div>

        <AnimatePresence>
          {formOwner && <OwnerFormModal owner={formOwner === "new" ? null : formOwner} onClose={() => setFormOwner(null)} onSave={handleSave} properties={properties} />}
        </AnimatePresence>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Owner Details</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Error loading owners</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Owner Details</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{owners.length} property owners in your portfolio</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setFormOwner("new")}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md" style={{ fontWeight: 600 }}>
          <Plus className="w-4 h-4" /> Add Owner
        </motion.button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Owners", value: owners.length, color: "#3B82F6" },
          { label: "Total Properties", value: totalProperties, color: "#6366F1" },
          { label: "Avg. Portfolio", value: `${avgPortfolio} props`, color: "#10B981" },
        ].map((s, i) => (
          <div key={i} className="bg-white/70 backdrop-blur rounded-xl p-5 border border-black/10 shadow-sm">
            <p className="text-neutral-500 text-xs mb-1">{s.label}</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search owners..."
          className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all" />
      </div>

      {/* Owner Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((o, i) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3 }}
            className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-6 cursor-pointer hover:shadow-md transition-all"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md"
                style={{ background: `linear-gradient(135deg, ${o.color ?? "#3B82F6"}, ${o.color ?? "#3B82F6"}99)`, fontWeight: 800 }}>
                {o.avatar ?? o.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "OW"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-black text-sm truncate" style={{ fontWeight: 700 }}>{o.name ?? "—"}</h3>
                  <span className="bg-black/[0.04] text-black text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0" style={{ fontWeight: 600 }}>Active</span>
                </div>
                <p className="text-neutral-400 text-xs mt-0.5">Ownership: {o.share_percentage ?? 0}%</p>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-neutral-600 text-sm">
                <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <span className="truncate text-xs">{o.email ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600 text-sm">
                <Phone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <span className="text-xs">{o.phone ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600 text-sm">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <span className="text-xs truncate">{o.propertyName ?? "—"}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/[0.04] rounded-xl p-3 text-center">
                <p className="text-black text-base" style={{ fontWeight: 800 }}>{o.share_percentage ?? 0}%</p>
                <p className="text-neutral-500 text-xs">Ownership</p>
              </div>
              <div className="bg-black/[0.04] rounded-xl p-3 text-center">
                <p className="text-black text-base" style={{ fontWeight: 800 }}>{o.created_at ? new Date(o.created_at).getFullYear() : "—"}</p>
                <p className="text-neutral-500 text-xs">Year Added</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-black/10 flex items-center gap-2">
              <button onClick={() => setProfileOwner(o)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-black/10 text-neutral-600 text-xs hover:bg-white/50 transition-colors" style={{ fontWeight: 500 }}>
                <Eye className="w-3.5 h-3.5" /> View Profile
              </button>
              <button onClick={() => setFormOwner(o)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-black/[0.04] text-black text-xs hover:bg-[#DBEAFE] transition-colors" style={{ fontWeight: 500 }}>
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {profileOwner && <OwnerProfileModal owner={profileOwner} onClose={() => setProfileOwner(null)} properties={properties} />}
        {formOwner && <OwnerFormModal owner={formOwner === "new" ? null : formOwner} onClose={() => setFormOwner(null)} onSave={handleSave} properties={properties} />}
      </AnimatePresence>
    </div>
  );
}