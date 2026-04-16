"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, CheckCircle2, Clock, AlertCircle, User,
  Calendar, X, ChevronDown, AlignLeft, Tag, Users, Repeat,
  Paperclip, Trash2, GripVertical, Bell, Flag, Building2, ChevronRight
} from "lucide-react";
import { dashboardApi, TaskItem, ManagerStats } from "@/lib/api";

const staffList = [
  { id: 1, name: "Fatima Al-Hassan", role: "Housekeeping Lead", dept: "Housekeeping", initials: "FA", color: "#6366F1" },
  { id: 2, name: "Ahmed Khalid", role: "F&B Supervisor", dept: "F&B", initials: "AK", color: "#3B82F6" },
  { id: 3, name: "Raj Patel", role: "Maintenance Tech", dept: "Maintenance", initials: "RP", color: "#10B981" },
  { id: 4, name: "Sarah Mitchell", role: "Front Desk Sr.", dept: "Front Desk", initials: "SM", color: "#F59E0B" },
  { id: 5, name: "James Lee", role: "Concierge", dept: "Front Desk", initials: "JL", color: "#8B5CF6" },
  { id: 6, name: "Maria Santos", role: "Housekeeper", dept: "Housekeeping", initials: "MS", color: "#EC4899" },
  { id: 7, name: "Carlos Rivera", role: "Head Chef", dept: "Kitchen", initials: "CR", color: "#14B8A6" },
  { id: 8, name: "Nina Patel", role: "Spa Therapist", dept: "Wellness", initials: "NP", color: "#0EA5E9" },
];

const departments = ["All Departments", "Housekeeping", "F&B", "Maintenance", "Front Desk", "Kitchen", "Wellness", "Security"];
const categories = ["Inspection", "Cleaning", "Maintenance", "F&B Service", "Guest Service", "Admin", "Safety", "Inventory"];

const statusConfig = {
  done: { color: "#10B981", bg: "bg-black/[0.04] text-black", label: "Done", icon: CheckCircle2 },
  pending: { color: "#F59E0B", bg: "bg-black/[0.04] text-neutral-600", label: "In Progress", icon: Clock },
  upcoming: { color: "#3B82F6", bg: "bg-black/[0.04] text-black", label: "Upcoming", icon: Calendar },
  overdue: { color: "#EF4444", bg: "bg-black/[0.04] text-black", label: "Overdue", icon: AlertCircle },
};

const priorityConfig = {
  high: { color: "#EF4444", bg: "bg-black/[0.04] text-black" },
  medium: { color: "#F59E0B", bg: "bg-black/[0.04] text-neutral-600" },
  low: { color: "#10B981", bg: "bg-black/[0.04] text-black" },
};

// ─── New Task Panel ───────────────────────────────────────────────────────────
function NewTaskPanel({ onClose, onSubmit }: { onClose: () => void; onSubmit: (task: any) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [dueDate, setDueDate] = useState("2026-03-16");
  const [dueTime, setDueTime] = useState("10:00");
  const [category, setCategory] = useState("Inspection");
  const [dept, setDept] = useState("All Departments");
  const [checklist, setChecklist] = useState<{ id: number; text: string; done: boolean }[]>([
    { id: 1, text: "Verify room condition", done: false },
    { id: 2, text: "Document findings", done: false },
  ]);
  const [newCheckItem, setNewCheckItem] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [notify, setNotify] = useState(true);
  const [staffSearch, setStaffSearch] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const filteredStaff = staffList.filter(s =>
    s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
    s.dept.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const toggleStaff = (id: number) => {
    setSelectedStaff(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    setChecklist(prev => [...prev, { id: Date.now(), text: newCheckItem.trim(), done: false }]);
    setNewCheckItem("");
  };

  const removeCheckItem = (id: number) => setChecklist(prev => prev.filter(c => c.id !== id));

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title, description, selectedStaff, priority, dueDate, dueTime, category, dept, checklist, recurrence });
    onClose();
  };

  const priorityOptions: { key: "high" | "medium" | "low"; label: string; color: string; bg: string; icon: string }[] = [
    { key: "high", label: "High", color: "#EF4444", bg: "bg-black/[0.04]", icon: "🔴" },
    { key: "medium", label: "Medium", color: "#F59E0B", bg: "bg-black/[0.04]", icon: "🟡" },
    { key: "low", label: "Low", color: "#10B981", bg: "bg-black/[0.04]", icon: "🟢" },
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-white z-50 flex flex-col shadow-2xl"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 bg-white/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-black to-neutral-700 flex items-center justify-center shadow-md">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-black" style={{ fontWeight: 700, fontSize: "1rem" }}>New Task</h2>
              <p className="text-neutral-400 text-xs">Assign to staff at Skyline Suites</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Step tabs ── */}
        <div className="flex border-b border-black/10 bg-white/50">
          {[{ n: 1 as const, label: "Task Details" }, { n: 2 as const, label: "Assign Staff" }].map(({ n, label }) => (
            <button
              key={n}
              onClick={() => setStep(n)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm transition-all relative ${
                step === n ? "text-black" : "text-neutral-400 hover:text-neutral-600"
              }`}
              style={{ fontWeight: step === n ? 600 : 400 }}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  step === n ? "bg-[#3B82F6] text-white" : "bg-black/[0.06] text-neutral-500"
                }`}
                style={{ fontWeight: 700 }}
              >
                {n}
              </span>
              {label}
              {step === n && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />
              )}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="p-6 space-y-5"
              >
                {/* Title */}
                <div>
                  <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 600 }}>
                    Task Title <span className="text-black">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Housekeeping inspection — Floor 1-3"
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-1.5 text-neutral-700 text-sm mb-2" style={{ fontWeight: 600 }}>
                    <AlignLeft className="w-3.5 h-3.5 text-neutral-400" /> Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Add task details, notes, or special instructions..."
                    rows={3}
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all resize-none"
                  />
                </div>

                {/* Category & Department row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-neutral-700 text-sm mb-2" style={{ fontWeight: 600 }}>
                      <Tag className="w-3.5 h-3.5 text-neutral-400" /> Category
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full appearance-none bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all pr-8"
                      >
                        {categories.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-neutral-700 text-sm mb-2" style={{ fontWeight: 600 }}>
                      <Building2 className="w-3.5 h-3.5 text-neutral-400" /> Department
                    </label>
                    <div className="relative">
                      <select
                        value={dept}
                        onChange={e => setDept(e.target.value)}
                        className="w-full appearance-none bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all pr-8"
                      >
                        {departments.map(d => <option key={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="flex items-center gap-1.5 text-neutral-700 text-sm mb-2.5" style={{ fontWeight: 600 }}>
                    <Flag className="w-3.5 h-3.5 text-neutral-400" /> Priority
                  </label>
                  <div className="flex gap-2.5">
                    {priorityOptions.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setPriority(opt.key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm transition-all ${
                          priority === opt.key
                            ? "border-current shadow-sm"
                            : "border-black/10 text-neutral-500 hover:border-black/20"
                        }`}
                        style={{
                          color: priority === opt.key ? opt.color : undefined,
                          backgroundColor: priority === opt.key ? opt.bg : "bg-black/[0.03]",
                          fontWeight: priority === opt.key ? 700 : 400,
                        }}
                      >
                        <span className="text-base">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due date & time */}
                <div>
                  <label className="flex items-center gap-1.5 text-neutral-700 text-sm mb-2" style={{ fontWeight: 600 }}>
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Due Date & Time
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
                    />
                    <input
                      type="time"
                      value={dueTime}
                      onChange={e => setDueTime(e.target.value)}
                      className="bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
                    />
                  </div>
                </div>

                {/* Recurrence */}
                <div>
                  <label className="flex items-center gap-1.5 text-neutral-700 text-sm mb-2" style={{ fontWeight: 600 }}>
                    <Repeat className="w-3.5 h-3.5 text-neutral-400" /> Recurrence
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {["none", "daily", "weekly", "monthly"].map(r => (
                      <button
                        key={r}
                        onClick={() => setRecurrence(r)}
                        className={`px-4 py-1.5 rounded-lg border text-xs transition-all capitalize ${
                          recurrence === r
                            ? "bg-black/[0.04] border-[#3B82F6] text-black"
                            : "bg-black/[0.03] border-black/10 text-neutral-500 hover:border-black/20"
                        }`}
                        style={{ fontWeight: recurrence === r ? 600 : 400 }}
                      >
                        {r === "none" ? "No repeat" : r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <label className="flex items-center gap-1.5 text-neutral-700 text-sm mb-2.5" style={{ fontWeight: 600 }}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" /> Checklist
                    <span className="ml-auto text-xs text-neutral-400" style={{ fontWeight: 400 }}>
                      {checklist.filter(c => c.done).length}/{checklist.length} done
                    </span>
                  </label>

                  {/* Progress bar */}
                  {checklist.length > 0 && (
                    <div className="h-1 bg-black/[0.04] rounded-full mb-3">
                      <div
                        className="h-1 rounded-full bg-black transition-all duration-500"
                        style={{ width: `${checklist.length ? (checklist.filter(c => c.done).length / checklist.length) * 100 : 0}%` }}
                      />
                    </div>
                  )}

                  <div className="space-y-2 mb-3">
                    <AnimatePresence>
                      {checklist.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3 bg-black/[0.03] border border-black/10 rounded-xl px-3 py-2.5 group"
                        >
                          <GripVertical className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0 cursor-grab" />
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, done: !c.done } : c))}
                            className="w-4 h-4 rounded border-slate-300 accent-[#3B82F6] cursor-pointer flex-shrink-0"
                          />
                          <span className={`flex-1 text-sm ${item.done ? "line-through text-neutral-400" : "text-neutral-700"}`}>
                            {item.text}
                          </span>
                          <button
                            onClick={() => removeCheckItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={newCheckItem}
                      onChange={e => setNewCheckItem(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addCheckItem()}
                      placeholder="Add checklist item..."
                      className="flex-1 bg-black/[0.03] border border-black/10 rounded-xl px-3 py-2 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black/20 transition-colors"
                    />
                    <button
                      onClick={addCheckItem}
                      className="px-3 py-2 rounded-xl bg-black/[0.04] text-black hover:bg-[#DBEAFE] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notify toggle */}
                <div className="flex items-center justify-between p-4 bg-black/[0.03] border border-black/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black/[0.04] flex items-center justify-center">
                      <Bell className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <p className="text-black text-sm" style={{ fontWeight: 500 }}>Send notification</p>
                      <p className="text-neutral-400 text-xs">Notify assigned staff via app</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotify(!notify)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${notify ? "bg-[#3B82F6]" : "bg-black/[0.06]"}`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white/70 backdrop-blur rounded-full shadow-sm transition-all ${notify ? "left-5.5 translate-x-0.5" : "left-0.5"}`}
                      style={{ left: notify ? "calc(100% - 22px)" : "2px" }}
                    />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="p-6 space-y-5"
              >
                {/* Selected staff preview */}
                {selectedStaff.length > 0 && (
                  <div className="bg-black/[0.04] border border-[#BFDBFE] rounded-xl p-4">
                    <p className="text-[#1D4ED8] text-xs mb-3" style={{ fontWeight: 600 }}>
                      {selectedStaff.length} staff member{selectedStaff.length > 1 ? "s" : ""} selected
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStaff.map(id => {
                        const s = staffList.find(x => x.id === id)!;
                        return (
                          <div key={id} className="flex items-center gap-2 bg-white border border-[#BFDBFE] rounded-lg px-2.5 py-1.5">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px]" style={{ backgroundColor: s.color, fontWeight: 700 }}>
                              {s.initials}
                            </div>
                            <span className="text-neutral-700 text-xs" style={{ fontWeight: 500 }}>{s.name.split(" ")[0]}</span>
                            <button onClick={() => toggleStaff(id)} className="text-neutral-400 hover:text-red-400 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    value={staffSearch}
                    onChange={e => setStaffSearch(e.target.value)}
                    placeholder="Search by name or department..."
                    className="w-full bg-black/[0.03] border border-black/10 rounded-xl pl-10 pr-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
                  />
                </div>

                {/* Department filter chips */}
                <div className="flex gap-2 flex-wrap">
                  {["All", "Housekeeping", "F&B", "Maintenance", "Front Desk", "Kitchen"].map(d => (
                    <button
                      key={d}
                      onClick={() => setStaffSearch(d === "All" ? "" : d)}
                      className={`px-3 py-1 rounded-lg border text-xs transition-all ${
                        (d === "All" && !staffSearch) || staffSearch === d
                          ? "bg-black/[0.04] border-[#3B82F6] text-black"
                          : "bg-black/[0.03] border-black/10 text-neutral-500 hover:border-black/20"
                      }`}
                      style={{ fontWeight: (d === "All" && !staffSearch) || staffSearch === d ? 600 : 400 }}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Staff list */}
                <div className="space-y-2">
                  <p className="text-neutral-500 text-xs" style={{ fontWeight: 500 }}>
                    {filteredStaff.length} staff member{filteredStaff.length !== 1 ? "s" : ""} available
                  </p>
                  <AnimatePresence>
                    {filteredStaff.map((s, i) => {
                      const isSelected = selectedStaff.includes(s.id);
                      return (
                        <motion.button
                          key={s.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => toggleStaff(s.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? "border-[#3B82F6] bg-black/[0.04]"
                              : "border-black/10 bg-black/[0.03] hover:border-black/20 hover:bg-white/50"
                          }`}
                        >
                          {/* Avatar */}
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0"
                            style={{ backgroundColor: s.color, fontWeight: 700 }}
                          >
                            {s.initials}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-black text-sm" style={{ fontWeight: isSelected ? 700 : 500 }}>{s.name}</p>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                              <span>{s.role}</span>
                              <span>·</span>
                              <span className="px-1.5 py-0.5 rounded bg-black/[0.06] text-neutral-600">{s.dept}</span>
                            </div>
                          </div>

                          {/* Check */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected ? "bg-[#3B82F6] border-[#3B82F6]" : "border-slate-300"
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-white fill-white" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-black/10 bg-white/50">
          {step === 1 ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-sm shadow-md hover:opacity-90 transition-opacity"
                style={{ fontWeight: 600 }}
              >
                Next: Assign Staff <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-black/10 text-neutral-600 text-sm hover:bg-black/[0.04] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || selectedStaff.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontWeight: 600 }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Create Task {selectedStaff.length > 0 && `& Assign to ${selectedStaff.length}`}
              </button>
            </div>
          )}

          {/* Hint */}
          <p className="text-center text-neutral-400 text-xs mt-2.5">
            {step === 1
              ? `${title.trim() ? "✓ Title set" : "⚠ Title required"} · ${checklist.length} checklist item${checklist.length !== 1 ? "s" : ""}`
              : `${selectedStaff.length === 0 ? "⚠ Select at least one staff member" : `✓ ${selectedStaff.length} assigned`}`}
          </p>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main TasksPage ───────────────────────────────────────────────────────────
export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showNewTask, setShowNewTask] = useState(false);
  const [taskList, setTaskList] = useState<Array<TaskItem & { priority?: string; dept?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get first property
        const propertiesRes = await dashboardApi.listProperties();
        const properties = propertiesRes.data;

        if (!properties || properties.length === 0) {
          // No properties found - show empty state
          setTaskList([]);
          setPropertyId(null);
          setLoading(false);
          return;
        }

        const firstPropertyId = properties[0].id;
        setPropertyId(firstPropertyId);

        // Step 2: Get manager stats for property (includes todays_tasks)
        const statsRes = await dashboardApi.getManagerStats(firstPropertyId);
        const stats: ManagerStats = statsRes.data;

        // Map TaskItem to include optional fields for display
        const mappedTasks = (stats.todays_tasks || []).map(task => ({
          ...task,
          priority: "medium", // Default priority (not in API response)
          dept: "Ops", // Default dept (not in API response)
        }));

        setTaskList(mappedTasks);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError("Failed to load tasks");
        setTaskList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = taskList.filter(t => {
    const matchesSearch = t.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleNewTask = (data: any) => {
    const assigneeNames = data.selectedStaff
      .map((id: number) => staffList.find(s => s.id === id)?.name.split(" ")[0])
      .join(", ");
    const newTask = {
      id: String(Date.now()),
      task: data.title,
      assignee: assigneeNames || "Unassigned",
      dept: data.dept === "All Departments" ? "All" : data.dept,
      due: data.dueTime,
      priority: data.priority,
      status: "upcoming",
    };
    setTaskList(prev => [newTask, ...prev]);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Task Management</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Assign and track daily operational tasks</p>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur rounded-xl p-12 border border-black/10 shadow-sm flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin mx-auto mb-3" />
            <p className="text-neutral-600">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black" style={{ fontSize: "1.4rem", fontWeight: 800 }}>Task Management</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Assign and track daily operational tasks</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm shadow-md"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" /> New Task
        </motion.button>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-900 text-sm font-semibold">{error}</p>
            <p className="text-red-700 text-xs mt-0.5">Please try refreshing the page</p>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: taskList.length, color: "#3B82F6" },
          { label: "Completed", value: taskList.filter(t => t.status === "done").length, color: "#10B981" },
          { label: "In Progress", value: taskList.filter(t => t.status === "pending").length, color: "#F59E0B" },
          { label: "Overdue", value: taskList.filter(t => t.status === "overdue").length, color: "#EF4444" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/70 backdrop-blur rounded-xl p-5 border border-black/10 shadow-sm"
          >
            <div className="text-neutral-500 text-sm mb-1">{stat.label}</div>
            <div className="text-black" style={{ fontSize: "1.8rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur rounded-xl p-5 border border-black/10 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks or assignees..."
              className="w-full bg-white/50 border border-black/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-white/50 border border-black/10 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black/20 focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
            >
              <option value="all">All Status</option>
              <option value="done">Done</option>
              <option value="pending">In Progress</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10">
          <h3 className="text-black" style={{ fontWeight: 700 }}>All Tasks ({filteredTasks.length})</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {filteredTasks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-black/[0.04] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-neutral-300" />
              </div>
              <p className="text-neutral-600 text-sm font-medium">No tasks found</p>
              <p className="text-neutral-400 text-xs mt-1">
                {searchQuery || filterStatus !== "all" ? "Try adjusting your filters" : "No tasks assigned yet"}
              </p>
            </div>
          ) : (
            filteredTasks.map((t, i) => {
              const statusCfg = statusConfig[t.status as keyof typeof statusConfig];
              const priorityCfg = priorityConfig[(t.priority || "medium") as keyof typeof priorityConfig];
              const StatusIcon = statusCfg.icon;

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/50/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: statusCfg.color + "15" }}>
                    <StatusIcon className="w-5 h-5" style={{ color: statusCfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-black text-sm mb-1" style={{ fontWeight: 600 }}>{t.task}</p>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {t.assignee}</span>
                      <span>·</span>
                      <span>{t.dept || "Ops"}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due {t.due}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${priorityCfg.bg}`} style={{ fontWeight: 600, textTransform: "capitalize" }}>
                      {t.priority || "medium"}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${statusCfg.bg}`} style={{ fontWeight: 600 }}>
                      {statusCfg.label}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* New Task Panel */}
      <AnimatePresence>
        {showNewTask && (
          <NewTaskPanel onClose={() => setShowNewTask(false)} onSubmit={handleNewTask} />
        )}
      </AnimatePresence>
    </div>
  );
}