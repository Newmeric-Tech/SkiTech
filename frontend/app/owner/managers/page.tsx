"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Search, Mail, Phone, Building2, CheckCircle2 } from "lucide-react";
import { dashboardApi, UserRecord } from "@/lib/api";

interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  status: "Active" | "Inactive";
  role: string;
  initials: string;
  color: string;
}

const COLORS = ["#3B82F6", "#6366F1", "#10B981", "#F59E0B", "#EC4899", "#06B6D4"];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColorForUser(userId: string): string {
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

export default function ManagersPage() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardApi.listUsers();
        const users = response.data;

        // TODO: filter by role name once /roles endpoint exists
        const formattedManagers: Manager[] = users.map((user: UserRecord) => {
          const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email;
          return {
            id: user.id,
            name,
            email: user.email,
            phone: user.phone_number ?? "—",
            property: "—",
            status: user.is_active ? "Active" : "Inactive",
            role: "—",
            initials: getInitials(name),
            color: getColorForUser(user.id),
          };
        });

        setManagers(formattedManagers);
      } catch (err) {
        console.error("Failed to fetch managers:", err);
        setError("Failed to load managers. Please try again.");
        setManagers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, []);

  // Filter logic with safe access
  const filtered = managers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Managers</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {loading ? "Loading..." : `${managers.length} managers across all properties`}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm shadow-md"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> Add Manager
        </motion.button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search managers..."
          className="w-full bg-white border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-black/20 transition-colors"
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-neutral-500">Loading managers...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-neutral-500 text-center">
            {managers.length === 0 ? "No managers found" : "No results match your search"}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/70 backdrop-blur rounded-2xl p-6 border border-black/10 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md"
                  style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}99)`, fontWeight: 700 }}
                >
                  {m.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-black" style={{ fontWeight: 700 }}>{m.name}</h3>
                    <span className="bg-black/[0.04] text-black text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                      {m.status}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-xs mt-0.5">{m.role}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                <div className="flex items-center gap-2 text-neutral-600 text-sm">
                  <Building2 className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  {m.property}
                </div>
                <div className="flex items-center gap-2 text-neutral-600 text-sm">
                  <Mail className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  {m.email}
                </div>
                <div className="flex items-center gap-2 text-neutral-600 text-sm">
                  <Phone className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  {m.phone}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-black/10"
          >
            <h2 className="text-black mb-6" style={{ fontWeight: 800, fontSize: "1.2rem" }}>Add Manager</h2>
            <div className="space-y-4">
              {["Full Name", "Email Address", "Phone Number", "Assign Property", "Department"].map((f, i) => (
                <div key={i}>
                  <label className="block text-neutral-700 text-sm mb-1.5" style={{ fontWeight: 500 }}>{f}</label>
                  <input className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/20 transition-colors" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-white/50 transition-colors">Cancel</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-black text-white text-sm shadow-md" style={{ fontWeight: 600 }}>Add Manager</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
