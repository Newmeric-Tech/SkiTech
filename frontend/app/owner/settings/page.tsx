"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, CreditCard, Globe, Save } from "lucide-react";
import { dashboardApi } from "@/lib/api";
import { api } from "@/lib/api";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await dashboardApi.getMe();
        const user = response.data;
        setFirstName(user.first_name || "");
        setLastName(user.last_name || "");
        setEmail(user.email);
        setPhoneNumber(user.phone_number || "");
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        alert("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/users/me", {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Settings</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Manage your account and platform preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-2">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all mb-0.5 ${tab === t.id ? "bg-gradient-to-r from-black/10 to-neutral-700/10 text-black" : "text-neutral-600 hover:bg-white/50"}`}
                style={{ fontWeight: tab === t.id ? 600 : 400 }}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {tab === "profile" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-8">
              <h2 className="text-black mb-6" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Profile Information</h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-neutral-500">Loading profile...</p>
                </div>
              ) : (
                <>
                  {/* Avatar */}
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-black to-neutral-700 flex items-center justify-center text-white" style={{ fontWeight: 800, fontSize: "1.3rem" }}>
                      {firstName.charAt(0)}{lastName.charAt(0)}
                    </div>
                    <div>
                      <button className="text-sm text-black border border-black/30 px-4 py-2 rounded-lg hover:bg-black/[0.04] transition-colors">
                        Change Photo
                      </button>
                      <p className="text-neutral-400 text-xs mt-1.5">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>First Name</label>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Last Name</label>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Email Address</label>
                      <input
                        value={email}
                        disabled
                        className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-neutral-500 focus:outline-none cursor-not-allowed opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Phone Number</label>
                      <input
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* Non-persistent fields */}
                  <div className="mt-6">
                    <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Timezone</label>
                    <input
                      disabled
                      defaultValue="(UTC+04:00) Asia/Dubai"
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-neutral-500 focus:outline-none cursor-not-allowed opacity-60"
                    />
                    <p className="text-neutral-400 text-xs mt-1">Read-only. Contact support to change.</p>
                  </div>

                  <div className="mt-6">
                    <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Language</label>
                    <input
                      disabled
                      defaultValue="English"
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-neutral-500 focus:outline-none cursor-not-allowed opacity-60"
                    />
                    {/* TODO: persist preferences once /users/me PATCH supports them */}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    disabled={saving}
                    className={`mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-sm shadow-md transition-all disabled:opacity-50 ${saved ? "bg-[#10B981] text-white" : "bg-black text-white"}`}
                    style={{ fontWeight: 600 }}
                  >
                    <Save className="w-4 h-4" />
                    {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          {tab === "notifications" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-8">
              <h2 className="text-black mb-6" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: "Daily Revenue Summary", desc: "Receive a daily email with revenue metrics", enabled: true },
                  { label: "KRA Compliance Alerts", desc: "Get notified when compliance drops below 80%", enabled: true },
                  { label: "Low Stock Alerts", desc: "Alert when inventory falls below minimum level", enabled: true },
                  { label: "Staff Attendance", desc: "Daily attendance summary report", enabled: false },
                  { label: "Task Overdue Alerts", desc: "Immediate notification for overdue KRA tasks", enabled: true },
                ].map((n, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-black/10">
                    <div>
                      <p className="text-black text-sm" style={{ fontWeight: 600 }}>{n.label}</p>
                      <p className="text-neutral-400 text-xs mt-0.5">{n.desc}</p>
                    </div>
                    <div className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${n.enabled ? "bg-[#3B82F6]" : "bg-black/[0.06]"}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white/70 backdrop-blur rounded-full shadow transition-all ${n.enabled ? "left-6" : "left-1"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "security" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-8">
              <h2 className="text-black mb-6" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Security</h2>
              <div className="space-y-5">
                {["Current Password", "New Password", "Confirm New Password"].map((f, i) => (
                  <div key={i}>
                    <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>{f}</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/20 transition-all" />
                  </div>
                ))}
                <button className="bg-black text-white px-6 py-3 rounded-xl text-sm shadow-md" style={{ fontWeight: 600 }}>
                  Update Password
                </button>
              </div>
            </motion.div>
          )}

          {tab === "billing" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur rounded-2xl border border-black/10 shadow-sm p-8">
              <h2 className="text-black mb-6" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Billing & Plan</h2>
              <div className="bg-gradient-to-br from-[#EFF6FF] to-[#EEF2FF] rounded-2xl p-6 border border-black/10 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-500 text-xs mb-0.5">Current Plan</p>
                    <p className="text-black" style={{ fontWeight: 800, fontSize: "1.3rem" }}>Professional</p>
                    <p className="text-neutral-500 text-sm mt-1">$99/month · Renews Feb 1, 2025</p>
                  </div>
                  <div className="text-right">
                    <button className="bg-black text-white px-4 py-2 rounded-xl text-sm shadow-md" style={{ fontWeight: 600 }}>
                      Upgrade
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="text-black mb-4" style={{ fontWeight: 600, fontSize: "0.95rem" }}>Billing History</h3>
              <div className="space-y-2">
                {["Jan 1, 2025 — $99.00", "Dec 1, 2024 — $99.00", "Nov 1, 2024 — $99.00"].map((b, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-black/10 text-sm">
                    <span className="text-neutral-700">{b}</span>
                    <span className="text-black" style={{ fontWeight: 600 }}>Paid</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
