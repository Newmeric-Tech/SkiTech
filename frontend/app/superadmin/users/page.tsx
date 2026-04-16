"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  Shield,
  MoreHorizontal,
  Mail,
  Edit,
  Trash2,
  X,
  Crown,
  Briefcase,
  User,
  Ban,
} from "lucide-react";
import { dashboardApi, UserRecord } from "@/lib/api";

interface UserDisplay {
  id: string;
  name: string;
  email: string;
  role: string;
  property: string;
  lastActive: string;
  status: "active" | "inactive";
  tenant: string;
  isVerified: boolean;
}

const roleFilters = ["All", "Owner", "Manager", "Staff", "Suspended"];

const getRoleIcon = (role: string) => {
  switch (role) {
    case "Owner": return <Crown className="w-4 h-4" />;
    case "Manager": return <Briefcase className="w-4 h-4" />;
    case "Staff": return <User className="w-4 h-4" />;
    case "Suspended": return <Ban className="w-4 h-4" />;
    default: return <User className="w-4 h-4" />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "Owner": return "bg-amber-100 text-amber-700 border-amber-200";
    case "Manager": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Staff": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Suspended": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-neutral-100 text-neutral-700 border-neutral-200";
  }
};

export default function AllUsers() {
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDisplay | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.listUsers();
        const backendUsers = response.data || [];

        const displayUsers: UserDisplay[] = backendUsers.map((user: UserRecord) => {
          const name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email;
          const lastActiveDate = user.last_login ? new Date(user.last_login) : null;
          const lastActive = lastActiveDate ? formatLastActive(lastActiveDate) : "Never";

          return {
            id: user.id,
            name,
            email: user.email,
            // TODO: resolve role name from role_id UUID
            role: "Member",
            property: user.tenant_id || "—",
            lastActive,
            status: user.is_active ? "active" : "inactive",
            tenant: user.tenant_id,
            isVerified: user.is_verified,
          };
        });

        setUsers(displayUsers);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatLastActive = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    activeToday: users.filter((u) => u.lastActive.includes("minute") || u.lastActive.includes("hour")).length,
    newThisWeek: 0,
    suspended: users.filter((u) => u.status === "inactive").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          All Users
        </h1>
        <p className="text-neutral-500 text-sm mt-0.5">Manage users across all properties and roles</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Total Users</p>
          <p className="text-2xl font-bold text-black mt-1">{stats.total}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Active Today</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.activeToday}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">New This Week</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.newThisWeek}</p>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-4">
          <p className="text-sm text-neutral-500">Suspended</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{stats.suspended}</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
        <div className="p-4 flex items-center gap-4 border-b border-black/10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>
          <div className="flex gap-1 bg-black/5 p-1 rounded-lg">
            {roleFilters.map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  roleFilter === role
                    ? "bg-white text-black shadow-sm"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Invite User
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-neutral-500">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-neutral-500">
                {users.length === 0 ? "No users found" : "No users match your search"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Role</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Tenant</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">Last Active</th>
                  <th className="text-center p-4 text-sm font-medium text-neutral-500">Status</th>
                  <th className="text-center p-4 text-sm font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-black/5 hover:bg-black/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-medium text-black">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-neutral-600">{user.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-neutral-600">{user.tenant}</td>
                    <td className="p-4 text-sm text-neutral-500">{user.lastActive}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {user.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-neutral-600" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                Invite New User
              </h2>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-black/5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                  <select className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20">
                    <option>Owner</option>
                    <option>Manager</option>
                    <option>Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Property</label>
                  <select className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20">
                    <option>Summit Ridge Apartments</option>
                    <option>Lakeside Residences</option>
                    <option>Pine Valley Estates</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2.5 border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors">
                  Send Invite
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditingUser(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-black/10 shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                Edit User
              </h2>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-black/5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-xl text-white">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                  {editingUser.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{editingUser.name}</h3>
                  <p className="text-neutral-300 text-sm">{editingUser.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                <select
                  defaultValue={editingUser.role}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                >
                  <option>Owner</option>
                  <option>Manager</option>
                  <option>Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Property</label>
                <select
                  defaultValue={editingUser.property}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                >
                  <option>Summit Ridge Apartments</option>
                  <option>Lakeside Residences</option>
                  <option>Pine Valley Estates</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select
                  defaultValue={editingUser.status}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingUser(null)}
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
