"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, X, AlertCircle, ChevronRight, User,
  Users, CheckCircle2, Clock, Moon,
} from "lucide-react";
import { dashboardApi, UserRecord } from "@/lib/api";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  property: string;
  dept: string;
  shift: string;
  status: string;
  initials: string;
  color: string;
}

const AVATAR_COLORS = [
  "#3B82F6", "#10B981", "#6366F1", "#F59E0B",
  "#8B5CF6", "#EF4444", "#0EA5E9", "#14B8A6",
];


const depts = ["All", "Front Office", "Housekeeping", "F&B", "Engineering", "Security"];

const DEPT_OPTIONS = ["Front Office", "Housekeeping", "F&B", "Engineering", "Security", "Management", "Finance", "Spa & Wellness"];
const ROLE_OPTIONS: Record<string, string[]> = {
  "Front Office": ["Front Desk Agent", "Receptionist", "Concierge", "Night Auditor", "Bell Boy"],
  "Housekeeping": ["Room Attendant", "Housekeeping Supervisor", "Laundry Attendant", "Public Area Cleaner"],
  "F&B": ["F&B Attendant", "Waiter / Waitress", "Bartender", "Chef", "Kitchen Helper"],
  "Engineering": ["Maintenance Technician", "Electrician", "Plumber", "HVAC Technician"],
  "Security": ["Security Guard", "Security Supervisor", "CCTV Operator"],
  "Management": ["Property Manager", "Assistant Manager", "Department Head"],
  "Finance": ["Accountant", "Finance Officer", "Payroll Specialist"],
  "Spa & Wellness": ["Spa Therapist", "Fitness Instructor", "Wellness Coordinator"],
};
const PROPERTIES = ["Grand Horizon", "Skyline Suites", "Amiras"];
const SHIFTS = ["Morning", "Afternoon", "Night"];
const STATUSES = ["present", "off"];

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

interface AddStaffModalProps {
  onClose: () => void;
  onAdd: (member: StaffMember) => void;
}

function Overlay({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
      onClick={onClick}
    />
  );
}

function AddStaffModal({ onClose, onAdd }: AddStaffModalProps) {
  const [name, setName] = useState("");
  const [dept, setDept] = useState(DEPT_OPTIONS[0]);
  const [role, setRole] = useState(ROLE_OPTIONS[DEPT_OPTIONS[0]][0]);
  const [property, setProperty] = useState(PROPERTIES[0]);
  const [shift, setShift] = useState(SHIFTS[0]);
  const [status, setStatus] = useState("present");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDeptChange = (d: string) => {
    setDept(d);
    setRole(ROLE_OPTIONS[d][0]);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (name.trim().split(" ").length < 2) e.name = "Please enter first and last name";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const colorIdx = Math.floor(Math.random() * AVATAR_COLORS.length);
    onAdd({
      id: Date.now(),
      name: name.trim(),
      role,
      property,
      dept,
      shift,
      status,
      initials: getInitials(name.trim()),
      color: AVATAR_COLORS[colorIdx],
    });
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-slate-950 font-bold text-lg">Add Staff Member</h2>
              <p className="text-slate-500 text-sm mt-0.5">Register a new team member</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex items-center justify-center py-2">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, #3B82F6, #4F46E5)", fontSize: "1.4rem", fontWeight: 800 }}
            >
              {name ? getInitials(name) : <User className="w-7 h-7 opacity-70" />}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Ahmed Khalid"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors ${errors.name ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-slate-400"}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
            <select value={dept} onChange={e => handleDeptChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white">
              {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white">
              {(ROLE_OPTIONS[dept] || []).map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assigned Property</label>
            <select value={property} onChange={e => setProperty(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 bg-white">
              {PROPERTIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Shift</label>
            <div className="grid grid-cols-3 gap-2">
              {SHIFTS.map(s => (
                <button
                  key={s}
                  onClick={() => setShift(s)}
                  className={`py-2.5 rounded-xl text-sm transition-all border ${shift === s ? "bg-slate-950 text-white border-transparent shadow-sm" : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"}`}
                  style={{ fontWeight: 600 }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-2.5 rounded-xl text-sm capitalize transition-all border ${status === s ? "bg-slate-950 text-white border-transparent shadow-sm" : "border-slate-200 text-slate-600 hover:border-slate-400 bg-white"}`}
                  style={{ fontWeight: 600 }}
                >
                  {s === "present" ? "Present" : "Day Off"}
                </button>
              ))}
            </div>
          </div>

          {name.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 rounded-xl p-4 border border-slate-200"
            >
              <p className="text-xs text-slate-500 mb-2 font-semibold">Preview</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #3B82F6, #4F46E5)", fontWeight: 700 }}
                >
                  {getInitials(name.trim())}
                </div>
                <div>
                  <p className="text-slate-950 text-sm font-semibold">{name.trim()}</p>
                  <p className="text-slate-500 text-xs">{role} · {dept}</p>
                </div>
                <div className="ml-auto">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                    shift === "Morning" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    shift === "Afternoon" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                    "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  }`}>
                    {shift}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors font-semibold">
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            className="flex-1 py-2.5 rounded-xl bg-slate-950 text-white text-sm shadow-md flex items-center justify-center gap-2 font-semibold hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" /> Add Staff Member
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardApi.listUsers();
        const users = response.data;

        // Transform UserRecord to StaffMember
        const transformedStaff = users.map((user: UserRecord) => {
          const firstName = user.first_name ?? "";
          const lastName = user.last_name ?? "";
          const name = `${firstName} ${lastName}`.trim() || user.email;
          const initials = getInitials(name);
          const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length;

          return {
            id: user.id,
            name,
            role: "—", // TODO: resolve role name from /roles or join
            property: "—", // TODO: resolve property name from property_id
            dept: "—", // TODO: resolve department from role_id or join
            shift: "—", // TODO: resolve shift from backend if available
            status: user.is_active ? "present" : "off",
            initials,
            color: AVATAR_COLORS[colorIdx],
          };
        });

        setStaff(transformedStaff);
      } catch (err) {
        console.error("Error fetching staff:", err);
        setError("Failed to load staff data");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const filtered = staff.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === "All" || s.dept === dept;
    return matchSearch && matchDept;
  });

  const handleAdd = (member: StaffMember) => {
    setStaff(prev => [member, ...prev]);
    setShowAdd(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 text-sm mt-1">{staff.length} staff members across all properties</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-slate-950 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-slate-950/20 hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </motion.button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search staff by name or role..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {depts.map(d => (
            <button
              key={d} onClick={() => setDept(d)}
              className={`px-4 py-2 rounded-xl text-sm transition-all font-medium ${dept === d ? "bg-slate-950 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {[
          { label: "Present Today", value: staff.filter(s => s.status === "present").length, icon: CheckCircle2, color: "#10B981", bg: "bg-emerald-50 border-emerald-100" },
          { label: "On Leave / Off", value: staff.filter(s => s.status === "off").length, icon: Clock, color: "#F59E0B", bg: "bg-amber-50 border-amber-100" },
          { label: "Night Shift", value: staff.filter(s => s.shift === "Night").length, icon: Moon, color: "#6366F1", bg: "bg-indigo-50 border-indigo-100" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`rounded-2xl p-5 border text-center ${s.bg}`}
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3">
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-slate-600 text-sm mt-1 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-950 rounded-full mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-semibold">Loading staff...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-semibold">{error}</p>
            <p className="text-slate-400 text-xs mt-1">Please try again later</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {["Staff Member", "Role", "Property", "Department", "Shift", "Status"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}CC)`, fontWeight: 700 }}
                        >
                          {s.initials}
                        </div>
                        <span className="text-slate-950 text-sm font-semibold">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-sm">{s.role}</td>
                    <td className="px-5 py-4 text-slate-600 text-sm">{s.property}</td>
                    <td className="px-5 py-4 text-slate-600 text-sm">{s.dept}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                        s.shift === "Morning" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        s.shift === "Afternoon" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      }`}>
                        {s.shift}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                        s.status === "present"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {s.status === "present" ? "Present" : "Off"}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-semibold">No staff found</p>
                <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showAdd && <AddStaffModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  );
}