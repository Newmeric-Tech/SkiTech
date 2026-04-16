"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, ChevronDown, CheckCircle2, Eye, PenSquare, Plus, Trash2,
  Building2, Users, FileText, BarChart3, Package, ShieldCheck, Briefcase, Lock
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const roles = ["Owner", "Manager", "Staff", "Security", "Finance"];

const modules = [
  { id: "properties", label: "Properties", icon: Building2, color: "#3B82F6" },
  { id: "vendors", label: "Vendors", icon: Package, color: "#6366F1" },
  { id: "owners", label: "Owners", icon: Briefcase, color: "#F59E0B" },
  { id: "finance", label: "Finance", icon: BarChart3, color: "#10B981" },
  { id: "sops", label: "SOPs", icon: FileText, color: "#8B5CF6" },
  { id: "reports", label: "Reports", icon: BarChart3, color: "#0EA5E9" },
  { id: "staff", label: "Staff Mgmt", icon: Users, color: "#3B82F6" },
  { id: "kra", label: "KRA Monitor", icon: ShieldCheck, color: "#14B8A6" },
];

type Permission = { view: boolean; create: boolean; edit: boolean; delete: boolean };
type PermMatrix = Record<string, Record<string, Permission>>;

const defaultPerms = (): Permission => ({ view: false, create: false, edit: false, delete: false });

const initMatrix: PermMatrix = {
  Owner: {
    properties: { view: true, create: true, edit: true, delete: true },
    vendors: { view: true, create: true, edit: true, delete: true },
    owners: { view: true, create: true, edit: true, delete: true },
    finance: { view: true, create: true, edit: true, delete: true },
    sops: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: true, edit: true, delete: true },
    staff: { view: true, create: true, edit: true, delete: true },
    kra: { view: true, create: true, edit: true, delete: true },
  },
  Manager: {
    properties: { view: true, create: false, edit: true, delete: false },
    vendors: { view: true, create: false, edit: false, delete: false },
    owners: { view: false, create: false, edit: false, delete: false },
    finance: { view: true, create: false, edit: false, delete: false },
    sops: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, create: true, edit: false, delete: false },
    staff: { view: true, create: true, edit: true, delete: false },
    kra: { view: true, create: false, edit: false, delete: false },
  },
  Staff: {
    properties: { view: true, create: false, edit: false, delete: false },
    vendors: { view: false, create: false, edit: false, delete: false },
    owners: { view: false, create: false, edit: false, delete: false },
    finance: { view: false, create: false, edit: false, delete: false },
    sops: { view: true, create: false, edit: false, delete: false },
    reports: { view: false, create: false, edit: false, delete: false },
    staff: { view: false, create: false, edit: false, delete: false },
    kra: { view: true, create: false, edit: false, delete: false },
  },
  Security: {
    properties: { view: true, create: false, edit: false, delete: false },
    vendors: { view: false, create: false, edit: false, delete: false },
    owners: { view: false, create: false, edit: false, delete: false },
    finance: { view: false, create: false, edit: false, delete: false },
    sops: { view: true, create: false, edit: false, delete: false },
    reports: { view: false, create: false, edit: false, delete: false },
    staff: { view: false, create: false, edit: false, delete: false },
    kra: { view: false, create: false, edit: false, delete: false },
  },
  Finance: {
    properties: { view: true, create: false, edit: false, delete: false },
    vendors: { view: true, create: false, edit: false, delete: false },
    owners: { view: true, create: false, edit: false, delete: false },
    finance: { view: true, create: true, edit: true, delete: false },
    sops: { view: false, create: false, edit: false, delete: false },
    reports: { view: true, create: true, edit: false, delete: false },
    staff: { view: true, create: false, edit: false, delete: false },
    kra: { view: true, create: false, edit: false, delete: false },
  },
};

// ─── Permission check cell ────────────────────────────────────────────────────
function PermCheck({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${value ? "bg-[#3B82F6] shadow-sm" : "bg-black/[0.04] hover:bg-black/[0.06]"}`}>
      <CheckCircle2 className={`w-4 h-4 ${value ? "text-white" : "text-neutral-300"}`} />
    </button>
  );
}

// ─── Module Assignment Screen ─────────────────────────────────────────────────
function ModuleAssignmentView({ matrix, setMatrix }: {
  matrix: PermMatrix;
  setMatrix: React.Dispatch<React.SetStateAction<PermMatrix>>;
}) {
  const [selectedRole, setSelectedRole] = useState("Manager");

  const perms = matrix[selectedRole] ?? {};

  const togglePerm = (moduleId: string, perm: keyof Permission) => {
    setMatrix(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [moduleId]: {
          ...(prev[selectedRole]?.[moduleId] ?? defaultPerms()),
          [perm]: !(prev[selectedRole]?.[moduleId]?.[perm] ?? false),
        },
      },
    }));
  };

  const toggleAll = (moduleId: string) => {
    const all = Object.values(perms[moduleId] ?? defaultPerms()).every(v => v);
    setMatrix(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [moduleId]: { view: !all, create: !all, edit: !all, delete: !all },
      },
    }));
  };

  const permKeys: { key: keyof Permission; label: string; icon: React.ElementType; color: string }[] = [
    { key: "view", label: "View", icon: Eye, color: "#3B82F6" },
    { key: "create", label: "Create", icon: Plus, color: "#10B981" },
    { key: "edit", label: "Edit", icon: PenSquare, color: "#F59E0B" },
    { key: "delete", label: "Delete", icon: Trash2, color: "#EF4444" },
  ];

  return (
    <div className="space-y-5">
      {/* Role selector */}
      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-4 h-4 text-neutral-400" />
          <h3 className="text-black text-sm" style={{ fontWeight: 700 }}>Select Role to Configure</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map(r => (
            <button key={r} onClick={() => setSelectedRole(r)}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${selectedRole === r ? "bg-black text-white shadow-sm" : "bg-white/50 border border-black/10 text-neutral-600 hover:border-black/20"}`}
              style={{ fontWeight: selectedRole === r ? 600 : 400 }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Module permissions */}
      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between">
          <div>
            <h3 className="text-black text-sm" style={{ fontWeight: 700 }}>Module Permissions — {selectedRole}</h3>
            <p className="text-neutral-400 text-xs mt-0.5">Toggle permissions for each system module</p>
          </div>
          <div className="flex items-center gap-3">
            {permKeys.map(p => (
              <div key={p.key} className="hidden md:flex items-center gap-1 text-xs text-neutral-500">
                <p.icon className="w-3.5 h-3.5" style={{ color: p.color }} />
                {p.label}
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {modules.map((mod, i) => {
            const modPerms = perms[mod.id] ?? defaultPerms();
            const allEnabled = Object.values(modPerms).every(v => v);
            return (
              <motion.div key={mod.id}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/50/60 transition-colors">
                {/* Module */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: mod.color + "15" }}>
                    <mod.icon className="w-4 h-4" style={{ color: mod.color }} />
                  </div>
                  <div>
                    <p className="text-black text-sm" style={{ fontWeight: 600 }}>{mod.label}</p>
                    <p className="text-neutral-400 text-xs">
                      {Object.values(modPerms).filter(v => v).length}/4 permissions
                    </p>
                  </div>
                </div>

                {/* Permission toggles */}
                <div className="flex items-center gap-2.5">
                  {permKeys.map(p => (
                    <div key={p.key} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-neutral-400 hidden md:block">{p.label}</span>
                      <PermCheck value={modPerms[p.key]} onChange={() => togglePerm(mod.id, p.key)} />
                    </div>
                  ))}
                </div>

                {/* Toggle all */}
                <button onClick={() => toggleAll(mod.id)}
                  className={`ml-2 text-xs px-3 py-1.5 rounded-lg transition-colors ${allEnabled ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-black/[0.04] text-black hover:bg-[#DBEAFE]"}`}
                  style={{ fontWeight: 500 }}>
                  {allEnabled ? "Revoke All" : "Grant All"}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Role Permission Matrix ───────────────────────────────────────────────────
function RoleMatrixView({ matrix }: { matrix: PermMatrix }) {
  const permTypes: { key: keyof Permission; color: string }[] = [
    { key: "view", color: "#3B82F6" },
    { key: "create", color: "#10B981" },
    { key: "edit", color: "#F59E0B" },
    { key: "delete", color: "#EF4444" },
  ];

  return (
    <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-black/10">
        <h3 className="text-black text-sm" style={{ fontWeight: 700 }}>Role Permission Matrix</h3>
        <p className="text-neutral-400 text-xs mt-0.5">Overview of all roles and module access</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-white/50 border-b border-black/10">
              <th className="px-6 py-3 text-left text-neutral-500 text-xs uppercase tracking-wider" style={{ fontWeight: 600 }}>Module</th>
              {roles.map(r => (
                <th key={r} className="px-4 py-3 text-center text-neutral-500 text-xs uppercase tracking-wider" style={{ fontWeight: 600 }}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-black to-neutral-700 flex items-center justify-center text-white text-[9px]" style={{ fontWeight: 700 }}>
                      {r.slice(0, 2).toUpperCase()}
                    </div>
                    {r}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {modules.map((mod, i) => (
              <tr key={mod.id} className={`hover:bg-white/50/60 transition-colors ${i % 2 === 0 ? "" : "bg-white/50/30"}`}>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: mod.color + "15" }}>
                      <mod.icon className="w-3.5 h-3.5" style={{ color: mod.color }} />
                    </div>
                    <span className="text-black text-sm" style={{ fontWeight: 500 }}>{mod.label}</span>
                  </div>
                </td>
                {roles.map(role => {
                  const rp = matrix[role]?.[mod.id] ?? defaultPerms();
                  const count = Object.values(rp).filter(v => v).length;
                  return (
                    <td key={role} className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-0.5 flex-wrap">
                        {permTypes.map(p => (
                          <div key={p.key}
                            className={`w-4 h-4 rounded-full flex items-center justify-center ${rp[p.key] ? "" : "opacity-20"}`}
                            style={{ backgroundColor: p.color + "20" }}
                            title={`${p.key} — ${rp[p.key] ? "granted" : "denied"}`}
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rp[p.key] ? p.color : "#CBD5E1" }} />
                          </div>
                        ))}
                      </div>
                      <p className="text-neutral-400 text-[10px] mt-1">{count}/4</p>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-black/10 bg-white/50 flex items-center gap-6 flex-wrap">
        <span className="text-neutral-500 text-xs" style={{ fontWeight: 600 }}>Legend:</span>
        {[
          { label: "View", color: "#3B82F6" },
          { label: "Create", color: "#10B981" },
          { label: "Edit", color: "#F59E0B" },
          { label: "Delete", color: "#EF4444" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-neutral-500">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PermissionsPage() {
  const [activeView, setActiveView] = useState<"assignment" | "matrix">("assignment");
  const [matrix, setMatrix] = useState<PermMatrix>(initMatrix);

  const totalGranted = Object.values(matrix).reduce((total, rolePerms) =>
    total + Object.values(rolePerms).reduce((rTotal, modPerms) =>
      rTotal + Object.values(modPerms).filter(v => v).length, 0), 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Admin Permission Panel</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Configure role-based access across all modules</p>
        </div>
        <button className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md" style={{ fontWeight: 600 }}>
          Save Changes
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Roles", value: roles.length, color: "#3B82F6", icon: Users },
          { label: "Modules", value: modules.length, color: "#6366F1", icon: Shield },
          { label: "Permissions Granted", value: totalGranted, color: "#10B981", icon: CheckCircle2 },
          { label: "Max Possible", value: roles.length * modules.length * 4, color: "#94A3B8", icon: Lock },
        ].map((s, i) => (
          <div key={i} className="bg-white/70 backdrop-blur rounded-xl p-5 border border-black/10 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.color + "15" }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-neutral-500 text-xs">{s.label}</p>
              <p style={{ fontWeight: 800, fontSize: "1.3rem", color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex gap-1 bg-white border border-black/10 rounded-2xl p-1.5 w-fit">
        {[
          { key: "assignment" as const, label: "Module Assignment", icon: Shield },
          { key: "matrix" as const, label: "Permission Matrix", icon: CheckCircle2 },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveView(tab.key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm transition-all ${activeView === tab.key ? "bg-black text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
            style={{ fontWeight: activeView === tab.key ? 600 : 400 }}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeView === "assignment"
        ? <ModuleAssignmentView matrix={matrix} setMatrix={setMatrix} />
        : <RoleMatrixView matrix={matrix} />
      }
    </div>
  );
}