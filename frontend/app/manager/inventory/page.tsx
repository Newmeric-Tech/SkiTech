"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, AlertTriangle, TrendingDown, Search, Plus,
  X, AlertCircle, CheckCircle2, Clock,
} from "lucide-react";
import { dashboardApi } from "@/lib/api";

// Loose inventory item type from backend
interface InventoryItem {
  id: string | number;
  name: string;
  sku?: string;
  quantity: number;
  unit?: string;
  reorder_level?: number;
  category?: string;
  created_at?: string;
  stock?: number;
  min?: number;
  property?: string;
  unit?: string;
  status?: "ok" | "low" | "critical";
}

interface RestockRequest {
  id: string | number;
  itemId: string | number;
  itemName: string;
  requestedQty: number;
  currentStock: number;
  unit: string;
  property: string;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

const statusMap = {
  ok: { label: "In Stock", bg: "bg-black/[0.04] text-black", bar: "#3B82F6" },
  low: { label: "Low Stock", bg: "bg-black/[0.04] text-neutral-600", bar: "#F59E0B" },
  critical: { label: "Critical", bg: "bg-black/[0.04] text-black", bar: "#EF4444" },
};

/* ─── Request Restock Modal ─── */
function RequestRestockModal({
  item,
  onClose,
  onSubmit,
  existingRequest,
}: {
  item: InventoryItem;
  onClose: () => void;
  onSubmit: (qty: number, reason: string) => void;
  existingRequest?: RestockRequest | null;
}) {
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const q = Number(qty);
    if (!qty || isNaN(q) || q <= 0) { setError("Enter a valid quantity"); return; }
    onSubmit(q, reason);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center border border-black/10" onClick={e => e.stopPropagation()}>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-black/[0.04] flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-8 h-8 text-black" />
            </motion.div>
            <h3 className="text-black mb-2" style={{ fontWeight: 800, fontSize: "1.1rem" }}>Request Sent!</h3>
            <p className="text-neutral-500 text-sm mb-6">Your restock request for <span style={{ fontWeight: 600 }}>{item.name}</span> has been sent to the owner for approval.</p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-black text-white text-sm" style={{ fontWeight: 600 }}>
              Done
            </button>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-black/10" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black/[0.04] flex items-center justify-center">
                <Package className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-black" style={{ fontWeight: 800, fontSize: "1rem" }}>Request Restock</h2>
                <p className="text-neutral-400 text-xs mt-0.5">Submit to owner for approval</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-black/[0.04] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Item info */}
            <div className="bg-white/50 rounded-xl p-4">
              <p className="text-black text-sm" style={{ fontWeight: 700 }}>{item.name}</p>
              <p className="text-neutral-400 text-xs mt-0.5">{item.category} · {item.property}</p>
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <p className="text-xs text-neutral-400" style={{ fontWeight: 600 }}>Current Stock</p>
                  <p className="text-lg" style={{ fontWeight: 800, color: item.status === "ok" ? "#3B82F6" : item.status === "low" ? "#F59E0B" : "#EF4444" }}>
                    {item.stock} <span className="text-sm text-neutral-400">{item.unit}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400" style={{ fontWeight: 600 }}>Min Required</p>
                  <p className="text-lg text-neutral-600" style={{ fontWeight: 700 }}>{item.min} {item.unit}</p>
                </div>
                <div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${statusMap[item.status].bg}`} style={{ fontWeight: 600 }}>
                    {statusMap[item.status].label}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending request warning */}
            {existingRequest && existingRequest.status === "pending" && (
              <div className="flex items-start gap-2.5 bg-black/[0.04] border border-[#F59E0B]/30 rounded-xl px-4 py-3">
                <Clock className="w-4 h-4 text-neutral-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  A restock request of <span style={{ fontWeight: 700 }}>{existingRequest.requestedQty} {item.unit}</span> is already pending approval.
                  Submitting another will create a new request.
                </p>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>
                Quantity to Request ({item.unit}) <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(q => String(Math.max(0, Number(q) - 1)))} className="p-2 border border-black/10 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-white/50 transition-colors">
                  <span style={{ fontSize: "1rem", lineHeight: 1 }}>−</span>
                </button>
                <input
                  type="number" min="1" value={qty}
                  onChange={e => { setQty(e.target.value); setError(""); }}
                  placeholder={`Recommended: ${Math.max(0, item.min - item.stock + item.min)}`}
                  className={`flex-1 border rounded-xl px-4 py-2.5 text-sm text-center focus:outline-none transition-colors ${error ? "border-red-300" : "border-black/10 focus:border-black/20"}`}
                  style={{ fontWeight: 700 }}
                />
                <button onClick={() => setQty(q => String(Number(q) + 1))} className="p-2 border border-black/10 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-white/50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
              {qty && Number(qty) > 0 && (
                <p className="text-xs text-neutral-500 mt-1.5">
                  After restock: <span style={{ fontWeight: 700, color: "#3B82F6" }}>{item.stock + Number(qty)} {item.unit}</span>
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs text-neutral-600 mb-1.5" style={{ fontWeight: 600 }}>Reason / Notes</label>
              <textarea
                value={reason} onChange={e => setReason(e.target.value)}
                placeholder="e.g. Running low due to high occupancy this week..."
                rows={3}
                className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/20 resize-none"
              />
            </div>
          </div>

          <div className="px-6 pb-5 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-white/50 transition-colors" style={{ fontWeight: 600 }}>
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm shadow-md flex items-center justify-center gap-2"
              style={{ fontWeight: 600 }}
            >
              <CheckCircle2 className="w-4 h-4" /> Submit Request
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Main Page ─── */
export default function ManagerInventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);
  const [search, setSearch] = useState("");
  const [requestingItem, setRequestingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  // Fetch properties and inventory on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch properties
        const propsResponse = await dashboardApi.listProperties();
        const properties = propsResponse.data;

        // If no properties, show empty state
        if (!properties || properties.length === 0) {
          setInventoryItems([]);
          setPropertyId(null);
          setLoading(false);
          return;
        }

        // Take first property ID
        const firstPropId = properties[0].id;
        setPropertyId(firstPropId);

        // Fetch inventory for first property
        const inventoryResponse = await dashboardApi.listInventory(firstPropId);
        const items = inventoryResponse.data || [];

        // Normalize backend data to UI format
        const normalized = (items as any[]).map((item: any) => {
          // Determine status based on quantity vs reorder level
          let status: "ok" | "low" | "critical" = "ok";
          const qty = item.quantity ?? item.stock ?? 0;
          const minStock = item.reorder_level ?? item.min ?? 0;
          if (qty === 0 || qty < minStock * 0.3) status = "critical";
          else if (qty < minStock) status = "low";

          return {
            id: item.id,
            name: item.name ?? "—",
            category: item.category ?? "—",
            property: properties[0].name ?? "—",
            stock: qty,
            min: minStock,
            unit: item.unit ?? "pcs",
            status,
            sku: item.sku,
            created_at: item.created_at,
          };
        });

        setInventoryItems(normalized);
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
        setError("Failed to load inventory data");
        setInventoryItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = inventoryItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = inventoryItems.filter(i => i.status !== "ok").length;
  const categories = [...new Set(inventoryItems.map(i => i.category))];
  const myPending = restockRequests.filter(r => r.status === "pending").length;

  const getExistingRequest = (itemId: string | number) =>
    restockRequests.find(r => String(r.itemId) === String(itemId) && r.status === "pending") ?? null;

  const handleRequestRestock = (qty: number, reason: string) => {
    if (!requestingItem) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const newRequest: RestockRequest = {
      id: Date.now(),
      itemId: requestingItem.id,
      itemName: requestingItem.name,
      requestedQty: qty,
      currentStock: requestingItem.stock ?? 0,
      unit: requestingItem.unit ?? "pcs",
      property: requestingItem.property ?? "—",
      requestedBy: "Manager",
      requestedAt: dateStr,
      reason,
      status: "pending",
    };
    setRestockRequests(prev => [newRequest, ...prev]);
  };

  // Empty state when no properties
  if (!loading && !propertyId) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Inventory Management</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Monitor and manage property inventory levels</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm py-12 text-center">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-neutral-500 text-sm" style={{ fontWeight: 600 }}>No properties yet — inventory will appear here.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Inventory Management</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Monitor and manage property inventory levels</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm py-12 text-center">
          <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-black mx-auto animate-spin" />
          <p className="text-neutral-500 text-sm mt-3" style={{ fontWeight: 600 }}>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Inventory Management</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Monitor and manage property inventory levels</p>
        </div>
        {myPending > 0 && (
          <div className="flex items-center gap-2 bg-black/[0.04] border border-[#F59E0B]/30 rounded-xl px-4 py-2.5">
            <Clock className="w-4 h-4 text-neutral-600" />
            <span className="text-sm text-amber-700" style={{ fontWeight: 600 }}>{myPending} request{myPending > 1 ? "s" : ""} pending owner approval</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Package, label: "Total Items", value: inventoryItems.length, color: "#3B82F6" },
          { icon: AlertTriangle, label: "Low / Critical", value: lowStockCount, color: "#EF4444" },
          { icon: TrendingDown, label: "Categories", value: categories.length, color: "#F59E0B" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white/70 backdrop-blur rounded-xl p-5 border border-black/10 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: stat.color + "15" }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div className="text-black" style={{ fontSize: "1.6rem", fontWeight: 800 }}>{stat.value}</div>
            <div className="text-neutral-500 text-sm mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#FEF2F2] to-[#FFFBEB] border border-[#FCA5A5]/30 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-black mb-1" style={{ fontWeight: 700 }}>Low Stock Alert</h3>
              <p className="text-neutral-600 text-sm">
                {lowStockCount} item{lowStockCount > 1 ? "s are" : " is"} below minimum stock level. Use <strong>Request Restock</strong> to notify the owner.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-black/10 shadow-sm flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search items by name or category..."
            className="w-full bg-white/50 border border-black/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#FEF2F2] to-[#FFFBEB] border border-[#FCA5A5]/30 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-black mb-1" style={{ fontWeight: 700 }}>Error Loading Inventory</h3>
              <p className="text-neutral-600 text-sm">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Inventory Table */}
      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10">
          <h3 className="text-black" style={{ fontWeight: 700 }}>Stock Levels</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/50 border-b border-black/10">
                {["Item", "Category", "Property", "Stock Level", "Min Stock", "Status", "Action"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs text-neutral-600" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item, i) => {
                const minStock = item.min ?? 0;
                const stock = item.stock ?? 0;
                const pct = minStock > 0 ? Math.min(100, (stock / minStock) * 100) : 0;
                const s = statusMap[item.status ?? "ok"];
                const pending = getExistingRequest(item.id);
                return (
                  <motion.tr key={item.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-black text-sm" style={{ fontWeight: 600 }}>{item.name ?? "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-black/[0.04] text-neutral-600" style={{ fontWeight: 500 }}>{item.category ?? "—"}</span>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 text-sm">{item.property ?? "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-black/[0.04] rounded-full flex-shrink-0">
                          <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: s.bar }} />
                        </div>
                        <span className="text-black text-sm" style={{ fontWeight: 600 }}>{stock} {item.unit ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 text-sm">{minStock} {item.unit ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${s.bg}`} style={{ fontWeight: 600 }}>{s.label}</span>
                    </td>
                    <td className="px-6 py-4">
                      {pending ? (
                        <span className="flex items-center gap-1.5 text-xs text-amber-600 px-3 py-1.5 rounded-lg bg-black/[0.04] border border-[#F59E0B]/30" style={{ fontWeight: 600 }}>
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setRequestingItem(item)}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                            (item.status ?? "ok") !== "ok"
                              ? "border-[#3B82F6] bg-black/[0.04] text-black hover:bg-[#DBEAFE]"
                              : "border-black/10 text-neutral-500 hover:border-black/20"
                          }`}
                          style={{ fontWeight: 600 }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {(item.status ?? "ok") !== "ok" ? "Request Restock" : "Restock"}
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-neutral-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm" style={{ fontWeight: 600 }}>No items found</p>
          </div>
        )}
      </div>

      {/* Restock request history summary */}
      {restockRequests.length > 0 && (
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-black/10">
            <h3 className="text-black" style={{ fontWeight: 700 }}>My Restock Requests</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {restockRequests.slice(0, 5).map(req => (
              <div key={req.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    req.status === "pending" ? "bg-black/[0.04]" : req.status === "approved" ? "bg-black/[0.04]" : "bg-black/[0.04]"
                  }`}>
                    {req.status === "pending" ? <Clock className="w-4 h-4 text-neutral-600" /> :
                     req.status === "approved" ? <CheckCircle2 className="w-4 h-4 text-black" /> :
                     <AlertCircle className="w-4 h-4 text-black" />}
                  </div>
                  <div>
                    <p className="text-black text-sm" style={{ fontWeight: 600 }}>{req.itemName}</p>
                    <p className="text-neutral-400 text-xs">+{req.requestedQty} {req.unit} · {req.requestedAt}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                  req.status === "pending" ? "bg-black/[0.04] text-neutral-600" :
                  req.status === "approved" ? "bg-black/[0.04] text-black" :
                  "bg-black/[0.04] text-black"
                }`} style={{ fontWeight: 600 }}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {requestingItem && (
          <RequestRestockModal
            item={requestingItem}
            onClose={() => setRequestingItem(null)}
            onSubmit={handleRequestRestock}
            existingRequest={getExistingRequest(requestingItem.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}