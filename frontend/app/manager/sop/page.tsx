"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Search, Eye, Edit3, Archive, CheckCircle2, Plus,
  X, ChevronDown, AlertCircle, Clock, Users,
} from "lucide-react";
import { dashboardApi } from "../../../lib/api";

const deptsList = ["All"];
const statusList = ["All", "pending", "in_progress", "completed"];

const DEPT_OPTIONS: string[] = [];
const ASSIGN_OPTIONS: string[] = [];

const statusConfig: Record<string, { bg: string; icon: typeof CheckCircle2; color: string }> = {
  active: { bg: "bg-black/[0.04] text-black", icon: CheckCircle2, color: "#10B981" },
  review: { bg: "bg-black/[0.04] text-neutral-600", icon: Clock, color: "#F59E0B" },
  draft: { bg: "bg-black/[0.04] text-neutral-500", icon: AlertCircle, color: "#94A3B8" },
  archived: { bg: "bg-black/[0.04] text-black", icon: Archive, color: "#EF4444" },
};

/* ─── Compact Edit Modal (manager view — no step editing) ─── */
function SOPModal({ sop, onClose, onSave }: {
  sop: any | null;
  onClose: () => void;
  onSave: (s: any) => void;
}) {
  const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const blank: any = {
    id: undefined, title: "", description: "",
    priority: "medium", status: "pending", due_date: null,
  };
  const [form, setForm] = useState<any>(sop ?? blank);
  const [error, setError] = useState("");

  const toggleDept = (dept: string) => {
    // Placeholder for department assignment if needed
  };

  const handleSave = () => {
    if (!form.title?.trim()) { setError("Title is required"); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-black/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 bg-white/80 backdrop-blur border-b border-black/10">
          <h2 className="text-black" style={{ fontWeight: 700 }}>{sop ? "Edit SOP" : "Create New SOP"}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>SOP Title <span className="text-red-500">*</span></label>
            <input
              value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setError(""); }}
              placeholder="e.g. Front Desk Check-In Procedure"
              className={`w-full bg-[#F8FAFC] border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all ${error ? "border-red-300" : "border-black/10"}`}
            />
            {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Priority</label>
              <div className="relative">
                <select
                  value={form.priority ?? "medium"} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full appearance-none bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-black/20 transition-all"
                >
                  {["low", "medium", "high"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Status</label>
              <div className="relative">
                <select
                  value={form.status ?? "pending"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full appearance-none bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-black/20 transition-all"
                >
                  {["pending", "in_progress", "completed"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Due Date</label>
            <input
              type="datetime-local"
              value={form.due_date ? new Date(form.due_date).toISOString().slice(0, 16) : ""}
              onChange={e => setForm(f => ({ ...f, due_date: e.target.value ? new Date(e.target.value).toISOString() : null }))}
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 600 }}>Description</label>
            <textarea
              value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of this SOP's purpose..." rows={2}
              className="w-full bg-[#F8FAFC] border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-all resize-none"
            />
          </div>

        </div>

        <div className="px-6 py-4 border-t border-black/10 bg-white/50 flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04] transition-colors" style={{ fontWeight: 600 }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md"
            style={{ fontWeight: 600 }}
          >
            {sop ? "Save Changes" : "Create SOP"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── View Modal ─── */
function ViewSOPModal({ sop, onClose, onEdit }: { sop: any; onClose: () => void; onEdit: () => void }) {
  const statusIcon = sop?.status === "completed" ? CheckCircle2 : (sop?.status === "in_progress" ? Clock : AlertCircle);
  const priorityColor: Record<string, string> = {
    high: "#EF4444",
    medium: "#F59E0B",
    low: "#94A3B8",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-black/10 max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 bg-white/80 backdrop-blur border-b border-black/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <p className="text-black text-sm" style={{ fontWeight: 700 }}>{sop?.id?.toString().slice(0, 8) ?? "—"}</p>
              <p className="text-neutral-400 text-xs">{sop?.priority ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5" style={{ fontWeight: 600 }}>
              <Edit3 className="w-3 h-3" /> Edit
            </button>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-black mb-3" style={{ fontWeight: 800, fontSize: "1.1rem" }}>{sop?.title ?? "—"}</h2>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-full capitalize bg-black/[0.04] text-black" style={{ fontWeight: 600 }}>
              {sop?.status ?? "—"}
            </span>
            {sop?.priority && (
              <span className="text-xs px-2.5 py-1 rounded-full capitalize bg-black/[0.04]" style={{ fontWeight: 600, color: priorityColor[sop.priority] ?? "#000" }}>
                {sop.priority}
              </span>
            )}
            {sop?.updated_at && (
              <>
                <span className="text-neutral-400 text-xs">Updated {new Date(sop.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                <span className="text-neutral-400 text-xs">·</span>
              </>
            )}
            {sop?.due_date && (
              <span className="text-neutral-400 text-xs">Due {new Date(sop.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            )}
          </div>

          {sop?.description && (
            <div className="bg-white/50 rounded-xl p-4 mb-5">
              <p className="text-neutral-600 text-sm leading-relaxed">{sop.description}</p>
            </div>
          )}

          <div className="bg-white border border-black/10 rounded-xl p-4 mb-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500" style={{ fontWeight: 600 }}>Category ID</span>
              <span className="text-xs text-neutral-700" style={{ fontWeight: 600 }}>{sop?.category_id?.toString().slice(0, 8) ?? "—"}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManagerSOPPage() {
  const [sops, setSOPs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalSop, setModalSop] = useState<any | null | "new">(null);
  const [viewingSop, setViewingSop] = useState<any | null>(null);

  // Fetch properties, then SOPs and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get first property
        const propsRes = await dashboardApi.listProperties();
        const props = propsRes.data;

        if (!props || props.length === 0) {
          setPropertyId(null);
          setSOPs([]);
          setCategories([]);
          setLoading(false);
          return;
        }

        const propId = props[0].id;
        setPropertyId(propId);

        // Fetch both categories and SOPs in parallel
        const [catsRes, sopsRes] = await Promise.all([
          dashboardApi.listSopCategories(propId),
          dashboardApi.listSops(propId),
        ]);

        setCategories(catsRes.data || []);
        setSOPs(sopsRes.data || []);
      } catch (err: any) {
        console.error("Error fetching SOP data:", err);
        setError("Failed to load SOPs");
        setSOPs([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = sops.filter(s => {
    const matchSearch = s?.title?.toLowerCase().includes(search.toLowerCase()) ?? false;
    const matchStatus = statusFilter === "All" || s?.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSave = async (s: any) => {
    // TODO: Implement backend save (create/update)
    if (s.id) {
      setSOPs(prev => prev.map(x => x.id === s.id ? s : x));
    } else {
      setSOPs(prev => [s, ...prev]);
    }
    setModalSop(null);
  };

  const handleEditFromView = () => {
    setModalSop(viewingSop);
    setViewingSop(null);
  };

  // Empty state when no properties
  if (!loading && !propertyId) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>SOP Management</h1>
          </div>
        </div>
        <div className="flex flex-col items-center py-14 text-neutral-400">
          <FileText className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-base font-medium">No properties yet — SOPs will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>SOP Management</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{sops.filter((s: any) => s?.status === "completed").length ?? 0} completed SOPs</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setModalSop("new")}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Create SOP
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total SOPs", value: sops.length, color: "#3B82F6" },
          { label: "Completed", value: sops.filter((s: any) => s?.status === "completed").length ?? 0, color: "#10B981" },
          { label: "In Progress", value: sops.filter((s: any) => s?.status === "in_progress").length ?? 0, color: "#F59E0B" },
          { label: "Pending", value: sops.filter((s: any) => s?.status === "pending").length ?? 0, color: "#94A3B8" },
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
          <input
            value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SOPs..."
            className="w-full bg-white/50 border border-black/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
          />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="appearance-none bg-white/50 border border-black/10 rounded-lg px-4 py-2.5 pr-8 text-sm focus:outline-none focus:border-black/20 transition-all capitalize">
            {["All", "pending", "in_progress", "completed"].map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      {/* SOP Table */}
      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[2.5fr,1fr,1fr,1fr,1fr,auto] gap-4 px-6 py-3 bg-white/50 border-b border-black/10">
          {["SOP Title", "Priority", "Category", "Due Date", "Status", "Actions"].map(h => (
            <span key={h} className="text-neutral-500 text-xs uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</span>
          ))}
        </div>
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="flex flex-col items-center py-14 text-neutral-400">
              <Clock className="w-8 h-8 mb-2 opacity-30 animate-spin" />
              <p className="text-sm">Loading SOPs...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-14 text-neutral-400">
              <AlertCircle className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-neutral-400">
              <FileText className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No SOPs match your filters</p>
            </div>
          ) : (
            filtered.map((sop: any, i: number) => {
              const status = sop?.status ?? "—";
              const priority = sop?.priority ?? "—";
              const statusBg = status === "completed" ? "bg-black/[0.04] text-black" : (status === "in_progress" ? "bg-black/[0.04] text-black" : "bg-black/[0.04] text-black");

              return (
                <motion.div
                  key={sop?.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex flex-col md:grid md:grid-cols-[2.5fr,1fr,1fr,1fr,1fr,auto] gap-2 md:gap-4 items-start md:items-center px-6 py-4 hover:bg-white/50/60 transition-colors"
                 >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black/[0.04] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <p className="text-black text-sm" style={{ fontWeight: 600 }}>{sop?.title ?? "—"}</p>
                      {sop?.description && (
                        <p className="text-neutral-400 text-xs mt-0.5 truncate">{sop.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-neutral-600 text-xs bg-black/[0.04] px-2.5 py-1 rounded-full capitalize" style={{ fontWeight: 500 }}>{priority}</span>
                  <span className="text-neutral-500 text-sm hidden md:block">{sop?.category_id?.toString().slice(0, 8) ?? "—"}</span>
                  <span className="text-neutral-500 text-xs hidden md:block">{sop?.due_date ? new Date(sop.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize flex items-center gap-1.5 w-fit ${statusBg}`} style={{ fontWeight: 600 }}>
                    {status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewingSop(sop)} className="p-1.5 text-neutral-400 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setModalSop(sop)} className="p-1.5 text-neutral-400 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalSop !== null && (
          <SOPModal sop={modalSop === "new" ? null : modalSop} onClose={() => setModalSop(null)} onSave={handleSave} />
        )}
        {viewingSop && !modalSop && (
          <ViewSOPModal sop={viewingSop} onClose={() => setViewingSop(null)} onEdit={handleEditFromView} />
        )}
      </AnimatePresence>
    </div>
  );
}