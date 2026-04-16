"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, FileText, Eye, Edit3, CheckCircle2,
  X, ChevronRight, Trash2, GripVertical, AlertCircle, Archive,
} from "lucide-react";
import { useSharedStore, SOP, SOPStep } from "../../../store/SharedStore";
import { dashboardApi } from "@/lib/api";

const depts = ["All", "Front Desk", "Housekeeping", "F&B", "Security", "Maintenance", "Wellness"];

const statusStyles: Record<string, string> = {
  active: "bg-black/[0.04] text-black",
  review: "bg-black/[0.04] text-neutral-600",
  draft: "bg-black/[0.04] text-neutral-500",
  archived: "bg-black/[0.04] text-black",
};

const DEPT_OPTIONS = ["Front Desk", "Housekeeping", "F&B", "Security", "Maintenance", "Engineering", "Wellness"];
const STATUS_OPTIONS: Array<"draft" | "review" | "active"> = ["draft", "review", "active"];

function Overlay({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      onClick={onClick}
    />
  );
}

/* ─── View Modal ─── */
function ViewSOPModal({ sop, onClose, onEdit }: { sop: SOP; onClose: () => void; onEdit: () => void }) {
  return (
    <>
      <Overlay onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black/[0.04] flex items-center justify-center">
              <FileText className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>SOP Document</p>
              <p className="text-neutral-700 text-sm" style={{ fontWeight: 700 }}>{sop.version}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-black/[0.04] text-black transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </motion.button>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h2 className="text-black mb-2" style={{ fontSize: "1.15rem", fontWeight: 800 }}>{sop.title}</h2>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusStyles[sop.status]}`} style={{ fontWeight: 600 }}>{sop.status}</span>
            <span className="text-neutral-400 text-xs">{sop.dept}</span>
            <span className="text-neutral-400 text-xs">·</span>
            <span className="text-neutral-400 text-xs">Updated {sop.updated}</span>
            <span className="text-neutral-400 text-xs">·</span>
            <span className="text-neutral-400 text-xs">By {sop.author}</span>
          </div>

          {sop.assignedTo && sop.assignedTo.length > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs text-neutral-500" style={{ fontWeight: 600 }}>Assigned to:</span>
              {sop.assignedTo.map(d => (
                <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-black/[0.04] text-black" style={{ fontWeight: 600 }}>{d}</span>
              ))}
            </div>
          )}

          {sop.description && (
            <div className="bg-white/50 rounded-xl p-4 mb-5">
              <p className="text-neutral-600 text-sm leading-relaxed">{sop.description}</p>
            </div>
          )}

          {sop.status === "active" && (
            <div className="bg-white border border-black/10 rounded-xl p-4 mb-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-black" /> Compliance Rate</span>
                <span className="text-sm" style={{ fontWeight: 700, color: sop.compliance >= 90 ? "#10B981" : "#F59E0B" }}>{sop.compliance}%</span>
              </div>
              <div className="h-2 bg-black/[0.04] rounded-full">
                <div className="h-2 rounded-full bg-black" style={{ width: `${sop.compliance}%` }} />
              </div>
            </div>
          )}

          {sop.steps && sop.steps.length > 0 && (
            <div>
              <h3 className="text-neutral-700 text-sm mb-3" style={{ fontWeight: 700 }}>Procedure Steps</h3>
              <div className="space-y-2.5">
                {sop.steps.map((step, idx) => (
                  <div key={step.id} className="flex items-start gap-3 bg-white border border-black/10 rounded-xl px-4 py-3 shadow-sm">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-black to-neutral-700 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5" style={{ fontWeight: 700 }}>
                      {idx + 1}
                    </div>
                    <p className="text-neutral-700 text-sm leading-relaxed">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

/* ─── Create / Edit Form Modal ─── */
interface SOPFormProps {
  initial?: SOP | null;
  onClose: () => void;
  onSave: (sop: SOP) => void;
}

function SOPFormModal({ initial, onClose, onSave }: SOPFormProps) {
  const isEdit = !!initial;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [dept, setDept] = useState(initial?.dept ?? DEPT_OPTIONS[0]);
  const [version, setVersion] = useState(initial?.version ?? "v1.0");
  const [status, setStatus] = useState<"draft" | "review" | "active">(
    (initial?.status === "archived" ? "active" : initial?.status) ?? "draft"
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [steps, setSteps] = useState<SOPStep[]>(initial?.steps ?? [{ id: Date.now(), text: "" }]);
  const [assignedTo, setAssignedTo] = useState<string[]>(initial?.assignedTo ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ASSIGN_OPTIONS = ["Front Desk", "Housekeeping", "F&B", "Security", "Maintenance", "Wellness", "All Departments"];

  const addStep = () => setSteps(prev => [...prev, { id: Date.now(), text: "" }]);
  const removeStep = (id: number) => setSteps(prev => prev.filter(s => s.id !== id));
  const updateStep = (id: number, text: string) => setSteps(prev => prev.map(s => s.id === id ? { ...s, text } : s));
  const toggleAssign = (d: string) => setAssignedTo(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!version.trim()) e.version = "Version is required";
    if (steps.some(s => !s.text.trim())) e.steps = "All steps must have content";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    onSave({
      id: initial?.id ?? Date.now(),
      title: title.trim(),
      dept,
      version: version.trim(),
      status,
      compliance: initial?.compliance ?? 0,
      updated: dateStr,
      author: initial?.author ?? "Admin",
      description: description.trim(),
      steps: steps.filter(s => s.text.trim()),
      assignedTo,
    });
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <div>
            <h2 className="text-black" style={{ fontWeight: 800, fontSize: "1.05rem" }}>
              {isEdit ? "Edit SOP" : "Create New SOP"}
            </h2>
            <p className="text-neutral-400 text-xs mt-0.5">{isEdit ? "Update procedure details" : "Define a new standard operating procedure"}</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>SOP Title <span className="text-red-400">*</span></label>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Front Desk Check-In Procedure"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors ${errors.title ? "border-red-300" : "border-black/10 focus:border-black/20"}`}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
          </div>

          {/* Dept + Version */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Department</label>
              <select value={dept} onChange={e => setDept(e.target.value)} className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 bg-white">
                {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Version <span className="text-red-400">*</span></label>
              <input
                value={version} onChange={e => setVersion(e.target.value)} placeholder="v1.0"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors ${errors.version ? "border-red-300" : "border-black/10 focus:border-black/20"}`}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s} onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-xl text-xs capitalize transition-all border ${status === s ? "bg-black text-white border-transparent shadow-sm" : "border-black/10 text-neutral-600 hover:border-black/20"}`}
                  style={{ fontWeight: 600 }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Description</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this SOP's purpose..." rows={3}
              className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-colors resize-none"
            />
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-xs text-neutral-600 mb-2" style={{ fontWeight: 600 }}>Assign to Departments</label>
            <div className="flex flex-wrap gap-2">
              {ASSIGN_OPTIONS.map(d => (
                <button
                  key={d} onClick={() => toggleAssign(d)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${assignedTo.includes(d) ? "bg-black/[0.04] border-[#3B82F6] text-black" : "border-black/10 text-neutral-500 hover:border-black/20"}`}
                  style={{ fontWeight: assignedTo.includes(d) ? 600 : 400 }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-neutral-600" style={{ fontWeight: 600 }}>Procedure Steps <span className="text-red-400">*</span></label>
              <button onClick={addStep} className="text-xs text-black flex items-center gap-1 hover:underline" style={{ fontWeight: 600 }}>
                <Plus className="w-3.5 h-3.5" /> Add Step
              </button>
            </div>
            {errors.steps && <p className="text-red-400 text-xs mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.steps}</p>}
            <div className="space-y-2.5">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-start gap-2.5">
                  <div className="flex items-center gap-1.5 mt-2.5 text-neutral-300">
                    <GripVertical className="w-4 h-4" />
                    <span className="text-xs" style={{ fontWeight: 700, color: "#3B82F6", minWidth: "18px" }}>{idx + 1}</span>
                  </div>
                  <input
                    value={step.text} onChange={e => updateStep(step.id, e.target.value)}
                    placeholder={`Step ${idx + 1} description...`}
                    className="flex-1 border border-black/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black/20 transition-colors"
                  />
                  {steps.length > 1 && (
                    <button onClick={() => removeStep(step.id)} className="mt-2 p-1 text-neutral-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-black/10 flex items-center gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-white/50 transition-colors" style={{ fontWeight: 600 }}>
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md flex items-center justify-center gap-2"
            style={{ fontWeight: 600 }}
          >
            <ChevronRight className="w-4 h-4" />
            {isEdit ? "Save Changes" : "Create SOP"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Main Page ─── */
export default function SOPPage() {
  const { addSOP, updateSOP, archiveSOP } = useSharedStore();
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [viewingSOP, setViewingSOP] = useState<SOP | null>(null);
  const [editingSOP, setEditingSOP] = useState<SOP | null>(null);

  // API state
  const [sops, setSOPs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch SOPs from backend
  useEffect(() => {
    const fetchSOPs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get first property
        const propsRes = await dashboardApi.listProperties();
        const properties = propsRes.data;

        if (!properties || properties.length === 0) {
          setSOPs([]);
          setLoading(false);
          return;
        }

        const propId = properties[0].id;

        // Fetch categories and SOPs in parallel
        const [categoriesRes, sopsRes] = await Promise.all([
          dashboardApi.listSopCategories(propId),
          dashboardApi.listSops(propId),
        ]);

        const categories = categoriesRes.data || [];
        const sopItems = sopsRes.data || [];

        // Map API response to SOP type, using optional chaining and fallbacks
        const mappedSOPs: any[] = sopItems.map((item: any) => ({
          id: item.id ?? Date.now(),
          title: item.title ?? "Untitled SOP",
          dept: item.category_name ?? "General",
          version: item.version ?? "v1.0",
          status: item.status ?? "draft",
          compliance: item.compliance ?? 0,
          updated: item.updated_at ? new Date(item.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
          author: item.author ?? "Admin",
          description: item.description ?? undefined,
          steps: item.steps ? (Array.isArray(item.steps) ? item.steps.map((s: any, idx: number) => ({ id: idx, text: s?.text ?? "" })) : []) : undefined,
          assignedTo: item.assigned_to ?? [],
        }));

        setSOPs(mappedSOPs);
      } catch (err) {
        console.error("Error fetching SOPs:", err);
        setError("Failed to load SOPs");
        setSOPs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSOPs();
  }, []);

  const filtered = sops.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === "All" || s.dept === dept;
    return matchSearch && matchDept;
  });

  const handleSave = (saved: SOP) => {
    const exists = sops.find(s => s.id === saved.id);
    if (exists) updateSOP(saved);
    else addSOP(saved);
    setShowCreate(false);
    setEditingSOP(null);
  };

  const handleEditFromView = () => {
    setEditingSOP(viewingSOP);
    setViewingSOP(null);
  };

  // Handle no properties state
  if (loading && sops.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-16 text-neutral-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p style={{ fontWeight: 600 }}>Loading SOPs...</p>
        </div>
      </div>
    );
  }

  if (sops.length === 0 && !loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-16 text-neutral-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p style={{ fontWeight: 600 }}>No properties yet — SOPs will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>SOP Management</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{sops.length} SOPs across all departments</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Create SOP
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SOPs..."
            className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {depts.map(d => (
            <button
              key={d} onClick={() => setDept(d)}
              className={`px-3 py-2 rounded-xl text-sm transition-all ${dept === d ? "bg-black text-white shadow-sm" : "bg-white border border-black/10 text-neutral-600 hover:border-black/20"}`}
              style={{ fontWeight: dept === d ? 600 : 400 }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p style={{ fontWeight: 600 }}>No SOPs found</p>
          <p className="text-sm mt-1">Try adjusting your filters or create a new SOP</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((sop, i) => (
            <motion.div
              key={sop.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}
              className="bg-white/70 backdrop-blur rounded-2xl p-6 border border-black/10 shadow-sm"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-black text-sm leading-tight" style={{ fontWeight: 700 }}>{sop.title}</h3>
                  <p className="text-neutral-400 text-xs mt-0.5">{sop.dept} · {sop.version}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${statusStyles[sop.status]}`} style={{ fontWeight: 600 }}>
                  {sop.status}
                </span>
                {sop.steps && <span className="text-xs text-neutral-400">{sop.steps.length} steps</span>}
              </div>

              {sop.status === "active" && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <CheckCircle2 className="w-3 h-3 text-black" /> Compliance
                    </div>
                    <span className="text-xs" style={{ fontWeight: 700, color: sop.compliance >= 90 ? "#10B981" : "#F59E0B" }}>{sop.compliance}%</span>
                  </div>
                  <div className="h-1.5 bg-black/[0.04] rounded-full">
                    <div className="h-1.5 rounded-full bg-black" style={{ width: `${sop.compliance}%` }} />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                <span className="text-neutral-400 text-xs">Updated {sop.updated}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setViewingSOP(sop)} className="p-1.5 text-neutral-400 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors" title="View">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingSOP(sop)} className="p-1.5 text-neutral-400 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors" title="Edit">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {sop.status !== "archived" && (
                    <button onClick={() => archiveSOP(sop.id)} className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors" title="Archive">
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && <SOPFormModal onClose={() => setShowCreate(false)} onSave={handleSave} />}
        {editingSOP && <SOPFormModal initial={editingSOP} onClose={() => setEditingSOP(null)} onSave={handleSave} />}
        {viewingSOP && !editingSOP && <ViewSOPModal sop={viewingSOP} onClose={() => setViewingSOP(null)} onEdit={handleEditFromView} />}
      </AnimatePresence>
    </div>
  );
}
