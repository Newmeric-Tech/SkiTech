"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Search, AlertTriangle, Package, X, Edit2,
  ChevronRight, AlertCircle, Minus, Bell, CheckCircle2,
  XCircle, Clock,
} from "lucide-react";
import { useSharedStore, InventoryItem, computeStatus, RestockRequest } from "../../../store/SharedStore";
import { dashboardApi } from "@/lib/api";

// Inline type for API inventory response
interface APIInventoryItem {
  id?: string;
  name?: string;
  sku?: string;
  quantity?: number;
  unit?: string;
  reorder_level?: number;
  category?: string;
  created_at?: string;
  [k: string]: any;
}

const statusMap = {
  ok: { label: "In Stock", bg: "bg-black/[0.04] text-black" },
  low: { label: "Low Stock", bg: "bg-black/[0.04] text-neutral-600" },
  critical: { label: "Critical", bg: "bg-black/[0.04] text-black" },
};

const CATEGORIES = ["Linen", "Toiletries", "F&B", "Cleaning", "Amenities", "Electronics", "Office Supplies"];
const PROPERTIES = ["Grand Horizon", "Skyline Suites", "Amiras", "All Properties"];
const UNITS = ["pcs", "sets", "rolls", "boxes", "bottles", "kg", "liters", "bags"];

function Overlay({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      onClick={onClick}
    />
  );
}

/* ─── Add Item Modal ─── */
function AddItemModal({ onClose, onAdd }: { onClose: () => void; onAdd: (item: InventoryItem) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [property, setProperty] = useState(PROPERTIES[0]);
  const [stock, setStock] = useState("");
  const [min, setMin] = useState("");
  const [unit, setUnit] = useState(UNITS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Item name is required";
    if (!stock || isNaN(Number(stock)) || Number(stock) < 0) e.stock = "Valid stock quantity required";
    if (!min || isNaN(Number(min)) || Number(min) < 0) e.min = "Valid minimum quantity required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const stockNum = Number(stock);
    const minNum = Number(min);
    onAdd({ id: Date.now(), name: name.trim(), category, property, stock: stockNum, min: minNum, unit, status: computeStatus(stockNum, minNum) });
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-black/10" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black/[0.04] flex items-center justify-center">
                <Package className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-black" style={{ fontWeight: 800, fontSize: "1rem" }}>Add Inventory Item</h2>
                <p className="text-neutral-400 text-xs">Add a new item to track</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Item Name <span className="text-red-400">*</span></label>
              <input
                value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bath Towels"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors ${errors.name ? "border-red-300" : "border-black/10 focus:border-black/20"}`}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/20 bg-white">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Property</label>
                <select value={property} onChange={e => setProperty(e.target.value)} className="w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/20 bg-white">
                  {PROPERTIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Current Stock <span className="text-red-400">*</span></label>
                <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} placeholder="0"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors ${errors.stock ? "border-red-300" : "border-black/10 focus:border-black/20"}`}
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Min Stock <span className="text-red-400">*</span></label>
                <input type="number" min="0" value={min} onChange={e => setMin(e.target.value)} placeholder="0"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors ${errors.min ? "border-red-300" : "border-black/10 focus:border-black/20"}`}
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Unit</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-black/20 bg-white">
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            {stock && min && (
              <div className="bg-white/50 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-neutral-500" style={{ fontWeight: 600 }}>Predicted Status</span>
                <span className={`text-xs px-2.5 py-1 rounded-full ${statusMap[computeStatus(Number(stock), Number(min))].bg}`} style={{ fontWeight: 600 }}>
                  {statusMap[computeStatus(Number(stock), Number(min))].label}
                </span>
              </div>
            )}
          </div>
          <div className="px-6 pb-5 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-white/50 transition-colors" style={{ fontWeight: 600 }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleAdd}
              className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
              <Plus className="w-4 h-4" /> Add Item
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Edit Stock Modal ─── */
function EditStockModal({ item, onClose, onSave }: { item: InventoryItem; onClose: () => void; onSave: (id: number, newStock: number) => void }) {
  const [stock, setStock] = useState(item.stock);
  const [adjustment, setAdjustment] = useState("");
  const [mode, setMode] = useState<"set" | "add" | "subtract">("set");
  const [error, setError] = useState("");

  const previewStock = () => {
    const adj = Number(adjustment) || 0;
    if (mode === "add") return stock + adj;
    if (mode === "subtract") return Math.max(0, stock - adj);
    return stock;
  };

  const handleSave = () => {
    const final = mode === "set" ? stock : previewStock();
    if (isNaN(final) || final < 0) { setError("Invalid stock value"); return; }
    onSave(item.id, final);
  };

  const adjNum = Number(adjustment) || 0;

  return (
    <>
      <Overlay onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-black/10" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
            <div>
              <h2 className="text-black" style={{ fontWeight: 800, fontSize: "1rem" }}>Edit Stock</h2>
              <p className="text-neutral-400 text-xs mt-0.5">{item.name}</p>
            </div>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="bg-white/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400" style={{ fontWeight: 600 }}>Current Stock</p>
                <p className="text-2xl mt-0.5" style={{ fontWeight: 800, color: "#3B82F6" }}>{item.stock} <span className="text-sm text-neutral-400">{item.unit}</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-400" style={{ fontWeight: 600 }}>Min Required</p>
                <p className="text-lg mt-0.5 text-neutral-600" style={{ fontWeight: 700 }}>{item.min} {item.unit}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-600 mb-2" style={{ fontWeight: 600 }}>Adjustment Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(["set", "add", "subtract"] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setError(""); }}
                    className={`py-2 rounded-xl text-xs capitalize transition-all border ${mode === m ? "bg-black text-white border-transparent" : "border-black/10 text-neutral-600 hover:border-black/20"}`}
                    style={{ fontWeight: 600 }}>
                    {m === "set" ? "Set Value" : m === "add" ? "Add" : "Remove"}
                  </button>
                ))}
              </div>
            </div>
            {mode === "set" ? (
              <div>
                <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>New Stock Value ({item.unit})</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setStock(Math.max(0, stock - 1))} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg border border-black/10 transition-colors"><Minus className="w-4 h-4" /></button>
                  <input type="number" min="0" value={stock} onChange={e => setStock(Math.max(0, Number(e.target.value)))}
                    className="flex-1 border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 text-center" style={{ fontWeight: 700 }} />
                  <button onClick={() => setStock(stock + 1)} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg border border-black/10 transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Amount to {mode === "add" ? "Add" : "Remove"} ({item.unit})</label>
                <input type="number" min="0" value={adjustment} onChange={e => { setAdjustment(e.target.value); setError(""); }}
                  placeholder="Enter quantity..."
                  className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20"
                />
                {adjustment && (
                  <p className="text-xs text-neutral-500 mt-1.5">
                    {item.stock} {mode === "add" ? "+" : "-"} {adjNum} = <span style={{ fontWeight: 700, color: "#3B82F6" }}>{previewStock()} {item.unit}</span>
                  </p>
                )}
              </div>
            )}
            {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
            <div className="bg-white/50 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-neutral-500" style={{ fontWeight: 600 }}>New Status</span>
              <span className={`text-xs px-2.5 py-1 rounded-full ${statusMap[computeStatus(mode === "set" ? stock : previewStock(), item.min)].bg}`} style={{ fontWeight: 600 }}>
                {statusMap[computeStatus(mode === "set" ? stock : previewStock(), item.min)].label}
              </span>
            </div>
          </div>
          <div className="px-6 pb-5 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-white/50 transition-colors" style={{ fontWeight: 600 }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
              <ChevronRight className="w-4 h-4" /> Update Stock
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Restock Request Detail/Reject Modal ─── */
function RejectModal({ req, onClose, onReject }: { req: RestockRequest; onClose: () => void; onReject: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <>
      <Overlay onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-black/10" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
            <h2 className="text-black" style={{ fontWeight: 800, fontSize: "1rem" }}>Reject Restock Request</h2>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="bg-black/[0.04] rounded-xl p-4">
              <p className="text-sm text-red-700" style={{ fontWeight: 600 }}>{req.itemName}</p>
              <p className="text-xs text-red-500 mt-0.5">Request for {req.requestedQty} {req.unit} by {req.requestedBy}</p>
            </div>
            <div>
              <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Reason for Rejection (optional)</label>
              <textarea
                value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Explain why this request is being rejected..."
                rows={3}
                className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 resize-none"
              />
            </div>
          </div>
          <div className="px-6 pb-5 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-white/50 transition-colors" style={{ fontWeight: 600 }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => onReject(reason)}
              className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-sm shadow-md flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
              <XCircle className="w-4 h-4" /> Reject Request
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Restock Requests Panel ─── */
function RestockRequestsPanel({ onClose }: { onClose: () => void }) {
  const { restockRequests, approveRestockRequest, rejectRestockRequest } = useSharedStore();
  const [rejectingReq, setRejectingReq] = useState<RestockRequest | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const filtered = restockRequests.filter(r => filter === "all" || r.status === filter);
  const pending = restockRequests.filter(r => r.status === "pending");

  const reqStatusStyle = {
    pending: "bg-black/[0.04] text-neutral-600",
    approved: "bg-black/[0.04] text-black",
    rejected: "bg-black/[0.04] text-black",
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black/[0.04] flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-neutral-600" />
              {pending.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-xs rounded-full flex items-center justify-center" style={{ fontWeight: 700 }}>
                  {pending.length}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-black" style={{ fontWeight: 800, fontSize: "1rem" }}>Restock Requests</h2>
              <p className="text-neutral-400 text-xs">{pending.length} pending approval</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-black/10">
          {(["pending", "approved", "rejected", "all"] as const).map(f => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${filter === f ? "bg-[#3B82F6] text-white" : "text-neutral-500 hover:bg-black/[0.04]"}`}
              style={{ fontWeight: 600 }}
            >
              {f} {f !== "all" && `(${restockRequests.filter(r => r.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Requests list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-neutral-400">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm" style={{ fontWeight: 600 }}>No {filter !== "all" ? filter : ""} requests</p>
            </div>
          ) : (
            filtered.map(req => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-black text-sm" style={{ fontWeight: 700 }}>{req.itemName}</p>
                    <p className="text-neutral-400 text-xs mt-0.5">{req.property}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize flex-shrink-0 ml-2 ${reqStatusStyle[req.status]}`} style={{ fontWeight: 600 }}>
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-white/50 rounded-xl px-3 py-2">
                    <p className="text-xs text-neutral-400" style={{ fontWeight: 600 }}>Current Stock</p>
                    <p className="text-sm text-neutral-700 mt-0.5" style={{ fontWeight: 700 }}>{req.currentStock} {req.unit}</p>
                  </div>
                  <div className="bg-black/[0.04] rounded-xl px-3 py-2">
                    <p className="text-xs text-black" style={{ fontWeight: 600 }}>Requested</p>
                    <p className="text-sm text-black mt-0.5" style={{ fontWeight: 700 }}>+{req.requestedQty} {req.unit}</p>
                  </div>
                </div>

                {req.reason && (
                  <div className="bg-white/50 rounded-xl px-3 py-2 mb-3">
                    <p className="text-xs text-neutral-500 italic">"{req.reason}"</p>
                  </div>
                )}

                {req.rejectionReason && (
                  <div className="bg-black/[0.04] rounded-xl px-3 py-2 mb-3">
                    <p className="text-xs text-red-500" style={{ fontWeight: 600 }}>Rejection note:</p>
                    <p className="text-xs text-red-400 italic mt-0.5">"{req.rejectionReason}"</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Clock className="w-3 h-3" />
                    {req.requestedAt} · {req.requestedBy}
                  </div>
                  {req.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setRejectingReq(req)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-black/10 text-neutral-500 hover:border-red-300 hover:text-black transition-colors"
                        style={{ fontWeight: 600 }}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => approveRestockRequest(req.id)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-black text-white shadow-sm"
                        style={{ fontWeight: 600 }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {rejectingReq && (
          <RejectModal
            req={rejectingReq}
            onClose={() => setRejectingReq(null)}
            onReject={reason => {
              rejectRestockRequest(rejectingReq.id, reason);
              setRejectingReq(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Main Page ─── */
export default function InventoryPage() {
  const { addInventoryItem, updateStock, pendingCount } = useSharedStore();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showRequests, setShowRequests] = useState(false);

  // Fetch properties and inventory on mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch properties first
        const propsRes = await dashboardApi.listProperties();
        const properties = propsRes.data;

        if (!properties || properties.length === 0) {
          setInventoryItems([]);
          setLoading(false);
          return;
        }

        // Get first property's ID
        const propertyId = properties[0].id;

        // Fetch inventory for that property
        const invRes = await dashboardApi.listInventory(propertyId);
        const apiItems = invRes.data as APIInventoryItem[];

        // Transform API items to InventoryItem format
        const transformed: InventoryItem[] = (apiItems || []).map((item, idx) => {
          const quantity = item.quantity ?? 0;
          const reorderLevel = item.reorder_level ?? 0;
          return {
            id: parseInt(item.id?.toString() || String(idx + 1), 10),
            name: item.name ?? "—",
            category: item.category ?? "—",
            property: properties[0].name ?? "—",
            stock: quantity,
            min: reorderLevel,
            unit: item.unit ?? "pcs",
            status: computeStatus(quantity, reorderLevel),
          };
        });

        setInventoryItems(transformed);
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
        setError("Failed to load inventory. Please try again.");
        setInventoryItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const filtered = inventoryItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowCount = inventoryItems.filter(i => i.status !== "ok").length;

  return (
    <div className="p-6 lg:p-8">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-red-50 border border-red-300 rounded-xl px-5 py-4 mb-6"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Inventory</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {loading ? "Loading..." : inventoryItems.length === 0 ? "No properties yet — inventory will appear here." : `${inventoryItems.length} items tracked`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Restock requests button */}
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowRequests(true)}
            className="relative flex items-center gap-2 bg-white border border-black/10 text-neutral-700 px-4 py-2.5 rounded-xl text-sm hover:border-[#3B82F6] hover:text-black transition-colors"
            style={{ fontWeight: 600 }}
          >
            <Bell className="w-4 h-4" />
            Restock Requests
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#EF4444] text-white text-xs rounded-full flex items-center justify-center" style={{ fontWeight: 700 }}>
                {pendingCount}
              </span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md"
            style={{ fontWeight: 600 }}
          >
            <Plus className="w-4 h-4" /> Add Item
          </motion.button>
        </div>
      </div>

      {/* Alert Banner */}
      {lowCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-black/[0.04] border border-[#F59E0B]/30 rounded-xl px-5 py-4 mb-6"
        >
          <AlertTriangle className="w-5 h-5 text-neutral-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span style={{ fontWeight: 600 }}>{lowCount} items</span> are below minimum stock level and need restocking.
          </p>
          {pendingCount > 0 && (
            <button onClick={() => setShowRequests(true)} className="ml-auto text-xs text-amber-700 underline" style={{ fontWeight: 600 }}>
              View {pendingCount} pending request{pendingCount > 1 ? "s" : ""}
            </button>
          )}
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Items", value: inventoryItems.length, color: "#3B82F6", icon: Package },
          { label: "Low Stock", value: inventoryItems.filter(i => i.status === "low").length, color: "#F59E0B", icon: AlertTriangle },
          { label: "Critical", value: inventoryItems.filter(i => i.status === "critical").length, color: "#EF4444", icon: AlertTriangle },
        ].map((s, i) => (
          <div key={i} className="bg-white/70 backdrop-blur rounded-xl p-4 border border-black/10 shadow-sm">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: s.color + "15" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div className="text-2xl" style={{ fontWeight: 800, color: s.color }}>{s.value}</div>
            <div className="text-neutral-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..."
          className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-neutral-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30 animate-pulse" />
            <p className="text-sm" style={{ fontWeight: 600 }}>Loading inventory...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/50">
                    {["Item", "Category", "Property", "Stock Level", "Min Stock", "Status", ""].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-neutral-500 text-xs uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => {
                    const pct = Math.min(100, (item.stock / item.min) * 100);
                    const s = statusMap[item.status];
                    return (
                      <tr key={item.id} className="border-t border-black/5 hover:bg-white/50/50 transition-colors">
                        <td className="px-5 py-4 text-black text-sm" style={{ fontWeight: 600 }}>{item.name}</td>
                        <td className="px-5 py-4 text-neutral-500 text-sm">{item.category}</td>
                        <td className="px-5 py-4 text-neutral-500 text-sm">{item.property}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-black/[0.04] rounded-full max-w-20">
                              <div className="h-1.5 rounded-full transition-all"
                                style={{ width: `${pct}%`, backgroundColor: item.status === "ok" ? "#3B82F6" : item.status === "low" ? "#F59E0B" : "#EF4444" }} />
                            </div>
                            <span className="text-sm text-neutral-700">{item.stock} {item.unit}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-neutral-500 text-sm">{item.min} {item.unit}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full ${s.bg}`} style={{ fontWeight: 600 }}>{s.label}</span>
                        </td>
                        <td className="px-5 py-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setEditingItem(item)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-black/10 text-neutral-500 hover:border-[#3B82F6] hover:text-black transition-colors"
                            style={{ fontWeight: 600 }}
                          >
                            <Edit2 className="w-3 h-3" /> Edit Stock
                          </motion.button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && !loading && (
              <div className="py-12 text-center text-neutral-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm" style={{ fontWeight: 600 }}>No items found</p>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showAdd && <AddItemModal onClose={() => setShowAdd(false)} onAdd={item => { addInventoryItem(item); setShowAdd(false); }} />}
        {editingItem && <EditStockModal item={editingItem} onClose={() => setEditingItem(null)} onSave={(id, stock) => { updateStock(id, stock); setEditingItem(null); }} />}
        {showRequests && <RestockRequestsPanel onClose={() => setShowRequests(false)} />}
      </AnimatePresence>
    </div>
  );
}
