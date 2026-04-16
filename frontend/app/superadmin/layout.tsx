"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, Building2, Users, Shield, BarChart3,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu, X,
  Eye, AlertTriangle, Bell, Search,
} from "lucide-react";

const superadminNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/superadmin" },
  { icon: Building2, label: "All Properties", href: "/superadmin/properties" },
  { icon: Users, label: "All Users", href: "/superadmin/users" },
  { icon: Shield, label: "Roles & Permissions", href: "/superadmin/roles" },
  { icon: BarChart3, label: "Platform Analytics", href: "/superadmin/analytics" },
  { icon: AlertTriangle, label: "Audit Log", href: "/superadmin/audit" },
  { icon: Eye, label: "System Health", href: "/superadmin/health" },
];

const configNav = [
  { icon: Settings, label: "Platform Settings", href: "/superadmin/settings" },
];

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("skitech_role");
    if (role !== "superadmin") {
      router.push("/auth/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="flex h-screen bg-[#f8f7f4] overflow-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 md:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
        className="fixed md:relative z-50 h-full bg-black text-white flex flex-col shadow-xl"
      >
        {/* Logo */}
        <div className={`h-20 flex items-center ${collapsed ? "justify-center" : "px-6 justify-between"} border-b border-white/10`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-black" fill="black" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white font-bold text-xl tracking-tight"
              >
                Superadmin
              </motion.span>
            )}
          </div>
          {!collapsed && (
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-white/50">
              <X />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 space-y-8 px-4">
          <div className="space-y-1">
            {!collapsed && <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-2 mb-2">Platform</p>}
            {superadminNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? "bg-white text-black shadow-md shadow-white/10"
                      : "hover:bg-white/10 text-white/70 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                  {collapsed && (
                    <div className="absolute left-full ml-4 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {configNav.length > 0 && (
            <div className="space-y-1">
              {!collapsed && <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-2 mb-2">Configuration</p>}
              {configNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                      isActive
                        ? "bg-white text-black shadow-md shadow-white/10"
                        : "hover:bg-white/10 text-white/70 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : <><ChevronLeft className="w-5 h-5" /> <span className="font-medium text-sm">Collapse</span></>}
          </button>
          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative z-0">
        {/* Header */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-black/10 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-neutral-500 hover:text-black">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-black hidden sm:block" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
              Platform Administration
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search platform..."
                className="w-full pl-10 pr-4 py-2 bg-white/50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 transition-all backdrop-blur"
              />
            </div>
            <button className="relative text-neutral-500 hover:text-black transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-black rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-[1px] bg-black/10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-black">Super Admin</p>
                <p className="text-xs text-neutral-500">Platform Owner</p>
              </div>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                SA
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f8f7f4] p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
