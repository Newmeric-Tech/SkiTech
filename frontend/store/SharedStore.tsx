"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SOPStep { id: number; text: string; }

export interface SOP {
  id: number;
  title: string;
  dept: string;
  version: string;
  status: "active" | "review" | "draft" | "archived";
  compliance: number;
  updated: string;
  author: string;
  description?: string;
  steps?: SOPStep[];
  assignedTo: string[];
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  property: string;
  stock: number;
  min: number;
  unit: string;
  status: "ok" | "low" | "critical";
}

export interface RestockRequest {
  id: number;
  itemId: number;
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

// ─── Initial Data ─────────────────────────────────────────────────────────────

const INITIAL_SOPS: SOP[] = [
  {
    id: 1, title: "Front Desk Check-In Procedure", dept: "Front Desk", version: "v2.3",
    status: "active", compliance: 96, updated: "Jan 10, 2025", author: "Sarah M.",
    description: "Standard operating procedure for guest check-in at front desk.",
    steps: [
      { id: 1, text: "Greet guest warmly and confirm reservation" },
      { id: 2, text: "Verify ID and payment method" },
      { id: 3, text: "Assign room and issue key card" },
      { id: 4, text: "Provide property map and amenities overview" },
      { id: 5, text: "Escort or direct guest to their room" },
    ],
    assignedTo: ["Front Desk", "Concierge"],
  },
  {
    id: 2, title: "Housekeeping Daily Checklist", dept: "Housekeeping", version: "v1.8",
    status: "active", compliance: 88, updated: "Jan 5, 2025", author: "Omar A.",
    description: "Daily housekeeping inspection and cleaning protocol.",
    steps: [
      { id: 1, text: "Check room status on PMS" },
      { id: 2, text: "Knock and announce before entering" },
      { id: 3, text: "Strip and replace all linens" },
      { id: 4, text: "Clean and sanitize bathroom thoroughly" },
      { id: 5, text: "Vacuum and dust all surfaces" },
    ],
    assignedTo: ["Housekeeping"],
  },
  {
    id: 3, title: "Food Safety & Hygiene Standards", dept: "F&B", version: "v3.1",
    status: "active", compliance: 91, updated: "Dec 28, 2024", author: "Priya S.",
    description: "Food handling and hygiene standards for all F&B staff.",
    steps: [
      { id: 1, text: "Wash hands before handling food" },
      { id: 2, text: "Check temperature of stored food items" },
      { id: 3, text: "Label all perishables with date and time" },
    ],
    assignedTo: ["F&B", "Kitchen"],
  },
  {
    id: 4, title: "Emergency Evacuation Protocol", dept: "Security", version: "v1.2",
    status: "review", compliance: 100, updated: "Dec 15, 2024", author: "James C.",
    description: "Emergency evacuation steps for all staff.",
    steps: [
      { id: 1, text: "Activate fire alarm" },
      { id: 2, text: "Call emergency services" },
      { id: 3, text: "Guide guests to nearest exit" },
    ],
    assignedTo: ["All Departments"],
  },
  {
    id: 5, title: "Maintenance Request Process", dept: "Maintenance", version: "v2.0",
    status: "active", compliance: 78, updated: "Jan 2, 2025", author: "Raj P.",
    description: "Process for handling and resolving maintenance requests.",
    steps: [
      { id: 1, text: "Receive request via PMS or phone" },
      { id: 2, text: "Assess urgency and assign technician" },
      { id: 3, text: "Complete repair and update status" },
    ],
    assignedTo: ["Maintenance"],
  },
  {
    id: 6, title: "Guest Complaint Resolution", dept: "Front Desk", version: "v1.5",
    status: "draft", compliance: 0, updated: "Jan 12, 2025", author: "Sarah M.",
    description: "Draft SOP for resolving guest complaints.",
    steps: [
      { id: 1, text: "Listen attentively without interrupting" },
      { id: 2, text: "Apologize and empathize" },
      { id: 3, text: "Offer a resolution or escalate" },
    ],
    assignedTo: [],
  },
  {
    id: 7, title: "Spa Treatment Protocols", dept: "Wellness", version: "v1.0",
    status: "archived", compliance: 72, updated: "Nov 20, 2024", author: "Nina P.",
    description: "Standard spa treatment protocols and safety guidelines.",
    steps: [
      { id: 1, text: "Confirm guest allergies and health conditions" },
      { id: 2, text: "Prepare treatment room and materials" },
      { id: 3, text: "Conduct treatment as per booking" },
      { id: 4, text: "Collect feedback and update records" },
    ],
    assignedTo: ["Wellness"],
  },
];

export function computeStatus(stock: number, min: number): "ok" | "low" | "critical" {
  if (stock === 0 || stock < min * 0.3) return "critical";
  if (stock < min) return "low";
  return "ok";
}

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, name: "Bath Towels", category: "Linen", property: "Grand Horizon", stock: 450, min: 200, unit: "pcs", status: "ok" },
  { id: 2, name: "Shampoo Bottles (50ml)", category: "Toiletries", property: "Grand Horizon", stock: 80, min: 150, unit: "pcs", status: "low" },
  { id: 3, name: "Bed Sheets (King)", category: "Linen", property: "Skyline Suites", stock: 120, min: 80, unit: "sets", status: "ok" },
  { id: 4, name: "Coffee Sachets", category: "F&B", property: "Amiras", stock: 30, min: 100, unit: "boxes", status: "critical" },
  { id: 5, name: "Toilet Paper Rolls", category: "Toiletries", property: "Skyline Suites", stock: 600, min: 300, unit: "rolls", status: "ok" },
  { id: 6, name: "Minibar Water (500ml)", category: "F&B", property: "Grand Horizon", stock: 95, min: 200, unit: "bottles", status: "low" },
  { id: 7, name: "Cleaning Spray", category: "Cleaning", property: "Grand Horizon", stock: 45, min: 60, unit: "bottles", status: "low" },
  { id: 8, name: "Pillowcases", category: "Linen", property: "Skyline Suites", stock: 310, min: 200, unit: "pcs", status: "ok" },
  { id: 9, name: "Hand Soap", category: "Toiletries", property: "Amiras", stock: 380, min: 150, unit: "pcs", status: "ok" },
  { id: 10, name: "Floor Cleaner", category: "Cleaning", property: "Grand Horizon", stock: 25, min: 40, unit: "liters", status: "critical" },
];

// ─── Context Definition ───────────────────────────────────────────────────────

interface SharedStoreCtx {
  // SOPs
  sops: SOP[];
  addSOP: (sop: SOP) => void;
  updateSOP: (sop: SOP) => void;
  archiveSOP: (id: number) => void;

  // Inventory
  inventoryItems: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  updateStock: (id: number, newStock: number) => void;

  // Restock Requests
  restockRequests: RestockRequest[];
  addRestockRequest: (req: Omit<RestockRequest, "id" | "requestedAt" | "status">) => void;
  approveRestockRequest: (id: number) => void;
  rejectRestockRequest: (id: number, reason?: string) => void;
  pendingCount: number;
}

const SharedStoreContext = createContext<SharedStoreCtx | null>(null);

export function SharedStoreProvider({ children }: { children: ReactNode }) {
  const [sops, setSOPs] = useState<SOP[]>(INITIAL_SOPS);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);

  // ── SOP actions ──────────────────────────────────────────────────────────
  const addSOP = (sop: SOP) => setSOPs(prev => [sop, ...prev]);

  const updateSOP = (sop: SOP) =>
    setSOPs(prev => prev.map(s => s.id === sop.id ? sop : s));

  const archiveSOP = (id: number) =>
    setSOPs(prev => prev.map(s => s.id === id ? { ...s, status: "archived" } : s));

  // ── Inventory actions ─────────────────────────────────────────────────────
  const addInventoryItem = (item: InventoryItem) =>
    setInventoryItems(prev => [item, ...prev]);

  const updateStock = (id: number, newStock: number) =>
    setInventoryItems(prev =>
      prev.map(i => i.id !== id ? i : { ...i, stock: newStock, status: computeStatus(newStock, i.min) })
    );

  // ── Restock request actions ───────────────────────────────────────────────
  const addRestockRequest = (req: Omit<RestockRequest, "id" | "requestedAt" | "status">) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setRestockRequests(prev => [
      { ...req, id: Date.now(), requestedAt: dateStr, status: "pending" },
      ...prev,
    ]);
  };

  const approveRestockRequest = (id: number) => {
    setRestockRequests(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        // Update the inventory stock too
        updateStock(r.itemId, r.currentStock + r.requestedQty);
        return { ...r, status: "approved" };
      })
    );
  };

  const rejectRestockRequest = (id: number, reason?: string) =>
    setRestockRequests(prev =>
      prev.map(r => r.id !== id ? r : { ...r, status: "rejected", rejectionReason: reason })
    );

  const pendingCount = restockRequests.filter(r => r.status === "pending").length;

  return (
    <SharedStoreContext.Provider value={{
      sops, addSOP, updateSOP, archiveSOP,
      inventoryItems, addInventoryItem, updateStock,
      restockRequests, addRestockRequest, approveRestockRequest, rejectRestockRequest,
      pendingCount,
    }}>
      {children}
    </SharedStoreContext.Provider>
  );
}

export function useSharedStore() {
  const ctx = useContext(SharedStoreContext);
  if (!ctx) throw new Error("useSharedStore must be used inside SharedStoreProvider");
  return ctx;
}
