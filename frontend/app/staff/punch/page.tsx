"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Sun, Moon, Coffee, TrendingUp, TrendingDown, UserCheck, UserX, Download, LogIn, LogOut } from "lucide-react";

const shifts = [
  { id: 1, label: "Morning Shift", time: "06:00 AM – 02:00 PM", icon: Sun, color: "#F59E0B" },
  { id: 2, label: "Evening Shift", time: "02:00 PM – 10:00 PM", icon: Moon, color: "#6366F1" },
  { id: 3, label: "Night Shift", time: "10:00 PM – 06:00 AM", icon: Moon, color: "#3B82F6" },
];

const recentPunches = [
  { date: "Thu, Mar 26", punchIn: "08:57 AM", punchOut: "05:02 PM", hours: "8h 05m", status: "complete" },
  { date: "Wed, Mar 25", punchIn: "08:45 AM", punchOut: "05:30 PM", hours: "8h 45m", status: "complete" },
  { date: "Tue, Mar 24", punchIn: "09:10 AM", punchOut: "—", hours: "Incomplete", status: "incomplete" },
  { date: "Mon, Mar 23", punchIn: "08:30 AM", punchOut: "04:55 PM", hours: "8h 25m", status: "complete" },
  { date: "Fri, Mar 20", punchIn: "08:55 AM", punchOut: "05:10 PM", hours: "8h 15m", status: "complete" },
];

export default function PunchPage() {
  const [selectedShift, setSelectedShift] = useState(1);
  const [punchedIn, setPunchedIn] = useState(true);
  const [punchTime, setPunchTime] = useState("08:32 AM");
  const [breakActive, setBreakActive] = useState(false);
  const [breakTime, setBreakTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentShift = shifts.find(s => s.id === selectedShift);
  const ShiftIcon = currentShift?.icon || Sun;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePunch = () => {
    if (breakActive) {
      setBreakActive(false);
      setPunchTime(currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    } else if (!punchedIn) {
      setPunchedIn(true);
      setPunchTime(currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    } else {
      setPunchedIn(false);
    }
  };

  const handleBreak = () => {
    if (!breakActive) {
      setBreakActive(true);
      setBreakTime(currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    }
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const stats = [
    { icon: Clock, label: "Shift Start", value: punchTime, color: "#3B82F6", trend: punchedIn && !breakActive ? "up" : "neutral" },
    { icon: Clock, label: "Hours Worked", value: "4h 28m", color: "#10B981", trend: "up" },
    { icon: Coffee, label: "Break Time", value: breakActive ? "On break" : "0m", color: "#F59E0B", trend: breakActive ? "down" : "neutral" },
    { icon: UserCheck, label: "Status", value: punchedIn ? (breakActive ? "Break" : "Working") : "Off", color: punchedIn ? (breakActive ? "#F59E0B" : "#10B981") : "#EF4444", trend: "neutral" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Time Clock</h1>
          <p className="text-slate-500 text-sm mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-white border border-slate-200/60 px-4 py-2 rounded-xl">
            <div className={`w-2 h-2 rounded-full ${punchedIn && !breakActive ? "bg-emerald-500 animate-pulse" : breakActive ? "bg-amber-500 animate-pulse" : "bg-slate-400"}`} />
            {punchedIn ? breakActive ? "On Break" : "On Shift" : "Off Shift"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group overflow-hidden"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              {stat.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : stat.trend === "down" ? (
                <TrendingDown className="w-4 h-4 text-amber-500" />
              ) : null}
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-950 text-lg">Current Shift</h3>
              <p className="text-slate-500 text-sm mt-0.5">Punch in / out for {currentShift?.label}</p>
            </div>
            <div className="flex items-center gap-2">
              {shifts.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedShift(s.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    selectedShift === s.id
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <s.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-slate-950 tracking-tight mb-2">
                {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
              <p className="text-slate-500 text-sm">{currentShift?.time}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePunch}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-semibold text-lg transition-all shadow-lg hover:opacity-90 ${
                  punchedIn && !breakActive
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {punchedIn && !breakActive ? (
                  <>
                    <LogOut className="w-5 h-5" /> Punch Out
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" /> Punch In
                  </>
                )}
              </button>

              {punchedIn && !breakActive && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={handleBreak}
                  className="px-6 py-4 rounded-2xl bg-amber-50 text-amber-700 font-semibold text-lg hover:bg-amber-100 transition-all border border-amber-200/60"
                >
                  <Coffee className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {breakActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-4 bg-amber-50 border border-amber-200/60 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-amber-800 text-sm font-semibold">Break in progress</p>
                    <p className="text-amber-600 text-xs">Started at {breakTime}</p>
                  </div>
                </div>
                <button
                  onClick={handlePunch}
                  className="text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  End Break
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-950 text-lg">This Week</h3>
                <p className="text-slate-500 text-sm mt-0.5">Shift summary</p>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full">40h 30m total</span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPunches.slice(0, 4).map((shift, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${shift.status === "complete" ? "#10B981" : "#F59E0B"}15` }}>
                  {shift.status === "complete" ? (
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <UserX className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-950 text-sm font-medium">{shift.date}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {shift.punchIn} → {shift.punchOut}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-950">{shift.hours}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    shift.status === "complete"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-amber-50 text-amber-700 border border-amber-200/60"
                  }`}>
                    {shift.status === "complete" ? "Complete" : "Partial"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-950 text-lg">Punch History</h3>
              <p className="text-slate-500 text-sm mt-0.5">Recent attendance records</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Hours</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPunches.map((shift, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-slate-950 text-sm font-medium">{shift.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-700">{shift.punchIn}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">{shift.punchOut}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-950">{shift.hours}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                      shift.status === "complete"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-amber-50 text-amber-700 border border-amber-200/60"
                    }`}>
                      {shift.status === "complete" ? "Complete" : "Partial"}
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
