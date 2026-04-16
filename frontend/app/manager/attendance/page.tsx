"use client";

import { motion } from "framer-motion";
import { Users, UserCheck, UserX, Clock, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const todayStaff = [
  { name: "Ahmed K.", dept: "Front Desk", in: "08:00", out: "—", status: "in", initials: "AK", color: "#3B82F6", hours: "4h 30m" },
  { name: "Fatima A.", dept: "Housekeeping", in: "07:45", out: "—", status: "in", initials: "FA", color: "#10B981", hours: "4h 45m" },
  { name: "Raj P.", dept: "Maintenance", in: "09:00", out: "—", status: "in", initials: "RP", color: "#6366F1", hours: "3h 30m" },
  { name: "Maria S.", dept: "F&B", in: "—", out: "—", status: "absent", initials: "MS", color: "#EF4444", hours: "—" },
  { name: "Yusuf I.", dept: "Security", in: "08:30", out: "—", status: "in", initials: "YI", color: "#8B5CF6", hours: "4h" },
  { name: "Sarah M.", dept: "Front Desk", in: "08:00", out: "—", status: "in", initials: "SM", color: "#0EA5E9", hours: "4h 30m" },
  { name: "James L.", dept: "Concierge", in: "08:15", out: "—", status: "in", initials: "JL", color: "#F59E0B", hours: "4h 15m" },
  { name: "Lisa Chen", dept: "Housekeeping", in: "07:30", out: "—", status: "in", initials: "LC", color: "#10B981", hours: "5h" },
  { name: "Omar F.", dept: "F&B", in: "—", out: "—", status: "absent", initials: "OF", color: "#EF4444", hours: "—" },
  { name: "Nina P.", dept: "Spa", in: "09:30", out: "—", status: "in", initials: "NP", color: "#EC4899", hours: "3h" },
];

const weeklyAttendance = [
  { day: "Mon", present: 14, absent: 1 },
  { day: "Tue", present: 13, absent: 2 },
  { day: "Wed", present: 15, absent: 0 },
  { day: "Thu", present: 12, absent: 3 },
  { day: "Fri", present: 14, absent: 1 },
  { day: "Sat", present: 13, absent: 2 },
  { day: "Sun", present: 15, absent: 0 },
];

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300 text-xs">{entry.name}:</span>
            <span className="text-white font-semibold text-sm">{entry.value} staff</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AttendancePage() {
  const totalStaff = todayStaff.length;
  const presentStaff = todayStaff.filter(s => s.status === "in").length;
  const absentStaff = totalStaff - presentStaff;
  const attendanceRate = Math.round((presentStaff / totalStaff) * 100);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Attendance Monitoring</h1>
          <p className="text-slate-500 text-sm mt-1">Track staff attendance and working hours — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <Download className="w-4 h-4" /> Export Report
        </motion.button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Users, label: "Total Staff", value: totalStaff, color: "#3B82F6" },
          { icon: UserCheck, label: "Present Today", value: presentStaff, color: "#10B981" },
          { icon: UserX, label: "Absent", value: absentStaff, color: "#EF4444" },
          { icon: Clock, label: "Attendance Rate", value: `${attendanceRate}%`, color: "#6366F1" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group overflow-hidden"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: stat.color + '15' }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold text-slate-950 tracking-tight">{stat.value}</div>
            <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }}
            />
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-950 text-lg">Weekly Attendance Trend</h3>
            <p className="text-slate-500 text-sm mt-0.5">Staff attendance over the past week</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-slate-600 text-sm font-medium">Present</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded bg-rose-500" />
              <span className="text-slate-600 text-sm font-medium">Absent</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeklyAttendance} barGap={8}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} dy={12} />
            <YAxis tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F8FAFC' }} />
            <Bar dataKey="present" name="Present" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-950 text-lg">Today's Staff</h3>
              <p className="text-slate-500 text-sm mt-0.5">{todayStaff.length} staff members</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full">{presentStaff} Present</span>
              <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200/60 px-3 py-1.5 rounded-full">{absentStaff} Absent</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Staff Member</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayStaff.map((s, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}CC)` }}
                      >
                        {s.initials}
                      </div>
                      <span className="text-slate-950 text-sm font-semibold">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 text-sm font-medium">{s.dept}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${s.status === "in" ? "text-slate-700" : "text-slate-400"}`}>
                      {s.in}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-400 text-sm">{s.out}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-700 text-sm font-medium">{s.hours}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                        s.status === "in" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" 
                          : "bg-red-50 text-red-700 border border-red-200/60"
                      }`}
                    >
                      {s.status === "in" ? "Present" : "Absent"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}