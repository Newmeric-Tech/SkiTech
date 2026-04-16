"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Shield,
  CreditCard,
  Bell,
  Plug,
  Key,
  Database,
  Globe,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Save,
} from "lucide-react";

const sections = [
  { id: "general", label: "General", icon: Globe },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "data-export", label: "Data Export", icon: Database },
];

const apiKeys = [
  { id: 1, name: "Production API Key", key: "sk_live_8x7f9d7k2m1n5p8q3r", created: "Jan 15, 2024", lastUsed: "2 minutes ago" },
  { id: 2, name: "Staging API Key", key: "sk_test_4k9p2m8n5q1r7t3x6y", created: "Dec 20, 2023", lastUsed: "3 days ago" },
  { id: 3, name: "Development Key", key: "sk_dev_7h8j1m4n6p9q2r5s8t", created: "Nov 10, 2023", lastUsed: "1 week ago" },
];

const integrations = [
  { id: 1, name: "Slack", connected: true, description: "Channel notifications and alerts" },
  { id: 2, name: "Stripe", connected: true, description: "Payment processing integration" },
  { id: 3, name: "SendGrid", connected: true, description: "Email delivery service" },
  { id: 4, name: "Twilio", connected: false, description: "SMS notifications" },
  { id: 5, name: "QuickBooks", connected: false, description: "Accounting integration" },
];

export default function PlatformSettings() {
  const [activeSection, setActiveSection] = useState("general");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [enforce2FA, setEnforce2FA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("24h");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackWebhook, setSlackWebhook] = useState("https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXX");
  const [platformName, setPlatformName] = useState("SkiTech Platform");
  const [timezone, setTimezone] = useState("America/Denver");
  const [showKey, setShowKey] = useState<number | null>(null);

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                General Settings
              </h3>
              <div className="space-y-4">
                <div className="bg-white/50 border border-black/10 rounded-xl p-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Platform Name</label>
                      <input
                        type="text"
                        value={platformName}
                        onChange={(e) => setPlatformName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Logo URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Default Timezone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-white/50 border border-black/10 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-black">Maintenance Mode</h4>
                      <p className="text-sm text-neutral-500 mt-0.5">When enabled, users will see a maintenance page</p>
                    </div>
                    <button
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        maintenanceMode ? "bg-black" : "bg-neutral-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          maintenanceMode ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
              Security Settings
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 border border-black/10 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-black">Enforce 2FA</h4>
                    <p className="text-sm text-neutral-500 mt-0.5">Require two-factor authentication for all users</p>
                  </div>
                  <button
                    onClick={() => setEnforce2FA(!enforce2FA)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      enforce2FA ? "bg-black" : "bg-neutral-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        enforce2FA ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="bg-white/50 border border-black/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-black">Session Timeout</h4>
                    <p className="text-sm text-neutral-500 mt-0.5">Auto-logout after period of inactivity</p>
                  </div>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="px-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  >
                    <option value="1h">1 hour</option>
                    <option value="8h">8 hours</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                  </select>
                </div>
              </div>
              <div className="bg-white/50 border border-black/10 rounded-xl p-5">
                <div className="mb-4">
                  <h4 className="font-medium text-black">IP Allowlist</h4>
                  <p className="text-sm text-neutral-500 mt-0.5">Restrict admin access to specific IP addresses</p>
                </div>
                <textarea
                  placeholder="Enter IP addresses (one per line)"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
                  defaultValue="192.168.1.0/24
10.0.0.0/8"
                />
              </div>
              <div className="bg-white/50 border border-black/10 rounded-xl p-5">
                <div className="mb-4">
                  <h4 className="font-medium text-black">Password Policy</h4>
                  <p className="text-sm text-neutral-500 mt-0.5">Minimum requirements for user passwords</p>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300" />
                    Minimum 12 characters
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300" />
                    At least one uppercase letter
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300" />
                    At least one number
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300" />
                    At least one special character
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
              Notification Settings
            </h3>
            <div className="space-y-4">
              <div className="bg-white/50 border border-black/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-black">Email Alerts</h4>
                    <p className="text-sm text-neutral-500 mt-0.5">Send email notifications for important events</p>
                  </div>
                  <button
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      emailAlerts ? "bg-black" : "bg-neutral-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        emailAlerts ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="bg-white/50 border border-black/10 rounded-xl p-5">
                <div className="mb-4">
                  <h4 className="font-medium text-black">Slack Webhook URL</h4>
                  <p className="text-sm text-neutral-500 mt-0.5">Receive notifications in your Slack workspace</p>
                </div>
                <input
                  type="url"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
              <div className="bg-white/50 border border-black/10 rounded-xl p-5">
                <h4 className="font-medium text-black mb-4">Notification Events</h4>
                <div className="space-y-3">
                  {["New user registration", "Property status change", "Billing alerts", "System warnings", "Security events"].map((event) => (
                    <label key={event} className="flex items-center justify-between py-2">
                      <span className="text-sm text-neutral-700">{event}</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300" />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
              Connected Integrations
            </h3>
            <div className="grid gap-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="bg-white/50 border border-black/10 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        integration.connected ? "bg-emerald-100" : "bg-neutral-100"
                      }`}>
                        <Plug className={`w-6 h-6 ${integration.connected ? "text-emerald-600" : "text-neutral-400"}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-black">{integration.name}</h4>
                        <p className="text-sm text-neutral-500">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {integration.connected ? (
                        <span className="flex items-center gap-1 text-sm text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-neutral-500">
                          <XCircle className="w-4 h-4" />
                          Not Connected
                        </span>
                      )}
                      <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors">
                        {integration.connected ? "Configure" : "Connect"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "api-keys":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
                API Keys
              </h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium">
                <Plus className="w-4 h-4" />
                Create New Key
              </button>
            </div>
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="bg-white/50 border border-black/10 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-black">{apiKey.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-neutral-500">
                          Created: {apiKey.created}
                        </span>
                        <span className="text-sm text-neutral-500">
                          Last used: {apiKey.lastUsed}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                        className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                      >
                        {showKey === apiKey.id ? (
                          <EyeOff className="w-4 h-4 text-neutral-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-neutral-600" />
                        )}
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 px-4 py-2 bg-neutral-100 rounded-lg font-mono text-sm">
                    {showKey === apiKey.id ? apiKey.key : `${apiKey.key.slice(0, 12)}${"•".repeat(20)}${apiKey.key.slice(-4)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "data-export":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
              Data Export
            </h3>
            <div className="bg-white/50 border border-black/10 rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Export Format</label>
                <select className="w-full px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20">
                  <option value="csv">CSV (.csv)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="xlsx">Excel (.xlsx)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Date Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    className="px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                  <input
                    type="date"
                    className="px-4 py-2.5 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Data to Export</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300" />
                    Users and roles
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300" />
                    Properties and units
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300" />
                    Billing and payment records
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300" />
                    Audit logs
                  </label>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg text-sm font-medium"
              >
                <Database className="w-4 h-4" />
                Export Data
              </motion.button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          Platform Settings
        </h1>
        <p className="text-neutral-500 text-sm mt-0.5">Configure global platform preferences and integrations</p>
      </div>

      <div className="flex gap-6">
        <div className="w-64 shrink-0">
          <nav className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-2 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-black text-white"
                    : "text-neutral-600 hover:bg-black/5"
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
                {activeSection === section.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-6"
          >
            {renderSection()}
            <div className="flex justify-end mt-6 pt-6 border-t border-black/10">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/90 transition-colors">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
