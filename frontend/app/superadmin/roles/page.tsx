"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Plus,
  Users,
  Lock,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  X,
  Crown,
  Briefcase,
  User,
  Settings,
} from "lucide-react";

const roles = [
  {
    id: 1,
    name: "Superadmin",
    description: "Full platform access with all permissions enabled. Can manage all properties, users, and system settings.",
    userCount: 3,
    permissionCount: 24,
    color: "bg-purple-500",
    isSystem: true,
  },
  {
    id: 2,
    name: "Owner",
    description: "Property-level access. Can manage their own properties, view financials, and invite managers.",
    userCount: 47,
    permissionCount: 16,
    color: "bg-amber-500",
    isSystem: true,
  },
  {
    id: 3,
    name: "Manager",
    description: "Property management access. Can handle daily operations, staff scheduling, and tenant communications.",
    userCount: 124,
    permissionCount: 12,
    color: "bg-blue-500",
    isSystem: true,
  },
  {
    id: 4,
    name: "Staff",
    description: "Limited property access for maintenance and basic tenant interactions.",
    userCount: 289,
    permissionCount: 6,
    color: "bg-emerald-500",
    isSystem: true,
  },
  {
    id: 5,
    name: "Auditor",
    description: "Read-only access to property data and financials. Cannot modify any settings.",
    userCount: 8,
    permissionCount: 4,
    color: "bg-neutral-500",
    isSystem: false,
  },
  {
    id: 6,
    name: "Billing Admin",
    description: "Access to financial data and billing systems. Cannot access property operations.",
    userCount: 5,
    permissionCount: 8,
    color: "bg-rose-500",
    isSystem: false,
  },
];

const permissions = [
  { id: "users", name: "Users", read: true, write: true, admin: true },
  { id: "properties", name: "Properties", read: true, write: true, admin: true },
  { id: "billing", name: "Billing", read: true, write: true, admin: false },
  { id: "reports", name: "Reports", read: true, write: false, admin: false },
  { id: "settings", name: "Settings", read: true, write: true, admin: true },
  { id: "audit", name: "Audit Logs", read: true, write: false, admin: false },
  { id: "integrations", name: "Integrations", read: true, write: true, admin: false },
  { id: "api", name: "API Access", read: true, write: true, admin: true },
];

const rolePermissions: Record<string, { read: boolean; write: boolean; admin: boolean }> = {
  Superadmin: { read: true, write: true, admin: true },
  Owner: { read: true, write: true, admin: false },
  Manager: { read: true, write: true, admin: false },
  Staff: { read: true, write: false, admin: false },
  Auditor: { read: true, write: false, admin: false },
  "Billing Admin": { read: true, write: true, admin: false },
};

export default function RolesPermissions() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<typeof roles[0] | null>(null);

  const stats = {
    totalRoles: roles.length,
    permissionsDefined: permissions.length,
    customRoles: roles.filter((r) => !r.isSystem).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          Roles & Permissions
        </h1>
        <p className="text-neutral-500 text-sm mt-0.5">Configure access control and user roles</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Total Roles</p>
          <p className="text-2xl font-bold text-black mt-1">{stats.totalRoles}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Permissions Defined</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.permissionsDefined}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Custom Roles Created</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.customRoles}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {roles.map((role, i) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${role.color} rounded-lg flex items-center justify-center`}>
                  {role.name === "Superadmin" && <Shield className="w-5 h-5 text-white" />}
                  {role.name === "Owner" && <Crown className="w-5 h-5 text-white" />}
                  {role.name === "Manager" && <Briefcase className="w-5 h-5 text-white" />}
                  {role.name === "Staff" && <User className="w-5 h-5 text-white" />}
                  {role.name === "Auditor" && <CheckCircle2 className="w-5 h-5 text-white" />}
                  {role.name === "Billing Admin" && <Settings className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h3 className="font-bold text-black">{role.name}</h3>
                  <span className={`text-xs ${role.isSystem ? "text-blue-600" : "text-neutral-500"}`}>
                    {role.isSystem ? "System Role" : "Custom Role"}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{role.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-black/10">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-black">{role.userCount}</p>
                  <p className="text-xs text-neutral-500">Users</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-black">{role.permissionCount}</p>
                  <p className="text-xs text-neutral-500">Permissions</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingRole(role)}
                  className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-neutral-600" />
                </button>
                {!role.isSystem && (
                  <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
        <div className="p-4 border-b border-black/10">
          <h2 className="text-lg font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            Permission Matrix
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/10">
                <th className="text-left p-4 text-sm font-medium text-neutral-500">Permission</th>
                {roles.slice(0, 5).map((role) => (
                  <th key={role.id} className="text-center p-4 text-sm font-medium text-neutral-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 ${role.color} rounded`} />
                      {role.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, i) => (
                <tr key={perm.id} className="border-b border-black/5 hover:bg-black/5 transition-colors">
                  <td className="p-4 font-medium text-black">{perm.name}</td>
                  {roles.slice(0, 5).map((role) => {
                    const perms = rolePermissions[role.name];
                    return (
                      <td key={role.id} className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {perms.read && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {!perms.read && <XCircle className="w-4 h-4 text-neutral-300" />}
                          {perms.write && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {!perms.write && <XCircle className="w-4 h-4 text-neutral-300" />}
                          {perms.admin && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {!perms.admin && <XCircle className="w-4 h-4 text-neutral-300" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-black/5">
                <td className="p-4 text-sm text-neutral-500">Legend:</td>
                <td colSpan={5} className="p-4">
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Read
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Write
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Admin
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                Create Custom Role
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-black/5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Role Name</label>
                <input
                  type="text"
                  placeholder="Enter role name"
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  placeholder="Describe what this role can do..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors">
                  Create Role
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditingRole(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                Edit Role
              </h2>
              <button onClick={() => setEditingRole(null)} className="p-2 hover:bg-black/5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-xl text-white">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${editingRole.color} rounded-lg flex items-center justify-center`}>
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">{editingRole.name}</h3>
                    <p className="text-sm text-neutral-300">{editingRole.isSystem ? "System Role" : "Custom Role"}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  defaultValue={editingRole.description}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingRole(null)}
                  className="flex-1 px-4 py-2.5 border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
