"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, Building2, Users, UserCheck, BarChart3,
  Shield, Truck, FileText, Settings, LogOut, ChevronLeft, ChevronRight,
  Bell, Search, Briefcase, Menu, ClipboardList, Clock, Package,
  ShieldCheck, Layers, Lock, X
} from "lucide-react";

const ownerNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/owner" },
  { icon: Building2, label: "Properties", href: "/owner/properties" },
  { icon: Briefcase, label: "Managers", href: "/owner/managers" },
  { icon: Users, label: "Staff", href: "/owner/staff" },
  { icon: BarChart3, label: "Reports", href: "/owner/reports" },
  { icon: Shield, label: "KRA Monitoring", href: "/owner/kra" },
  { icon: Truck, label: "Inventory", href: "/owner/inventory" },
  { icon: FileText, label: "SOP Management", href: "/owner/sop" },
];

const ownerConfigNav = [
  { icon: Package, label: "Vendors", href: "/owner/vendors" },
  { icon: UserCheck, label: "Owners", href: "/owner/owners" },
  { icon: Layers, label: "Departments", href: "/owner/departments" },
  { icon: Lock, label: "Permissions", href: "/owner/permissions" },
  { icon: Settings, label: "Settings", href: "/owner/settings" },
];

const managerNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/manager" },
  { icon: ClipboardList, label: "Tasks", href: "/manager/tasks" },
  { icon: UserCheck, label: "Attendance", href: "/manager/attendance" },
  { icon: Truck, label: "Inventory", href: "/manager/inventory" },
  { icon: BarChart3, label: "Reports", href: "/manager/reports" },
  { icon: FileText, label: "SOP Management", href: "/manager/sop" },
];

const staffNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/staff" },
  { icon: Clock, label: "Punch In/Out", href: "/staff/punch" },
  { icon: ClipboardList, label: "My Tasks", href: "/staff/tasks" },
  { icon: FileText, label: "SOPs", href: "/staff/sop" },
];

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Determine which nav to show based on current path
  let navItems: typeof ownerNav = [];
  let configNavItems: typeof ownerNav = [];
  let roleLabel = "";

  if (pathname.startsWith("/owner")) {
    navItems = ownerNav;
    configNavItems = ownerConfigNav;
    roleLabel = "Access"; // Simplified
  } else if (pathname.startsWith("/manager")) {
    navItems = managerNav;
    configNavItems = []; // No config for managers as per example
    roleLabel = "Manager";
  } else if (pathname.startsWith("/staff")) {
    navItems = staffNav;
    configNavItems = [];
    roleLabel = "Staff";
  }

  // Handle logout -> navigate to home or login
  const handleLogout = () => {
     // Clear tokens logic here
     router.push("/auth/login");
  };

  return (
    <div className="flex h-screen bg-[#f8f7f4] overflow-hidden">
      {/* ── Mobile Sidebar Overlay ── */}
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

      {/* ── Sidebar ── */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 80 : 280,
          x: mobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768) ? -280 : 0
        }}
        transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
        className={`fixed md:relative z-50 h-full bg-white/80 backdrop-blur-xl text-neutral-700 flex flex-col border-r border-black/10 shadow-xl`}
      >
        {/* Logo Area */}
        <div className={`h-20 flex items-center ${collapsed ? "justify-center" : "px-6 justify-between"} border-b border-black/10`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-black/10">
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-black font-bold text-xl tracking-tight"
              >
                Skitec
              </motion.span>
            )}
          </div>
          {!collapsed && (
             <button onClick={() => setMobileOpen(false)} className="md:hidden text-neutral-500">
               <X />
             </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 space-y-8 px-4 custom-scrollbar">
          {/* Main Nav */}
          <div className="space-y-1">
             {!collapsed && <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-2">Main Menu</p>}
             {navItems.map((item) => {
               const isActive = pathname === item.href;
               return (
                 <Link
                   key={item.href}
                   href={item.href}
                   className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                     isActive
                       ? "bg-black text-white shadow-md shadow-black/10"
                       : "hover:bg-black/5 text-neutral-700"
                   }`}
                 >
                   <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-neutral-500 group-hover:text-black"}`} />
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

          {/* Configuration Nav (only owner) */}
          {configNavItems.length > 0 && (
            <div className="space-y-1">
               {!collapsed && <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-2">Configuration</p>}
               {configNavItems.map((item) => {
                 const isActive = pathname === item.href;
                 return (
                   <Link
                     key={item.href}
                     href={item.href}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                       isActive
                         ? "bg-black text-white shadow-md shadow-black/10"
                         : "hover:bg-black/5 text-neutral-700"
                     }`}
                   >
                     <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-neutral-500 group-hover:text-black"}`} />
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
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-black/10 space-y-2">
           <button
             onClick={() => setCollapsed(!collapsed)}
             className="hidden md:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-500 hover:bg-black/5 hover:text-black transition-colors"
           >
             {collapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : <><ChevronLeft className="w-5 h-5" /> <span className="font-medium text-sm">Collapse Sidebar</span></>}
           </button>
           <button
             onClick={handleLogout}
             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-black/5 hover:text-black transition-colors ${collapsed ? "justify-center" : ""}`}
           >
             <LogOut className="w-5 h-5" />
             {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
           </button>
        </div>
      </motion.aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col h-full relative z-0">
        {/* Header */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-black/10 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-neutral-500 hover:text-black">
               <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-black hidden sm:block">
              {roleLabel} Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search..."
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
                <p className="text-sm font-semibold text-black">Demo User</p>
                <p className="text-xs text-neutral-500">{roleLabel} Account</p>
              </div>
              <div className="w-10 h-10 bg-white/80 backdrop-blur rounded-full border border-black/10 flex items-center justify-center text-black font-bold shadow-sm">
                DU
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8f7f4] p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
