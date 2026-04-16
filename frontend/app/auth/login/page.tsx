"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Zap, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { jwtDecode } from "jwt-js-decode";

export default function LoginPage() {
  const [role, setRole] = useState<"owner" | "manager" | "staff" | "superadmin" | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !email || !password) return;

    try {
      const { data } =
        role === "superadmin"
          ? await authApi.superadminLogin(email, password)
          : await authApi.login(email, password, role);
      localStorage.setItem("skitech_access_token", data.access_token);
      localStorage.setItem("skitech_refresh_token", data.refresh_token);

      const decoded = jwtDecode(data.access_token) as { payload: { role: string } };
      const userRole = decoded.payload.role;

      localStorage.setItem("skitech_role", userRole);

      if (userRole === "Super Admin") router.push("/superadmin");
      else if (userRole === "Tenant Admin") router.push("/owner");
      else if (userRole === "Manager") router.push("/manager");
      else router.push("/staff");
    } catch {
      alert("Login failed. Please check your credentials.");
    }
  };

  const roleConfig = [
    { id: "owner" as const, label: "Owner", desc: "Full property control" },
    { id: "manager" as const, label: "Manager", desc: "Daily operations" },
    { id: "staff" as const, label: "Staff", desc: "Assigned tasks" },
  ];

  return (
    <div
      className="min-h-screen bg-[#f5f4f0] flex relative overflow-hidden"
      style={{ fontFamily: "'Merriweather', serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&display=swap');

        .dot-grid {
          background-image: radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .dot-grid::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 75% 75% at 50% 50%, transparent 25%, #f5f4f0 100%);
          pointer-events: none;
          z-index: 1;
        }

        .input-field {
          background: rgba(0,0,0,0.03);
          border: 1.5px solid rgba(0,0,0,0.15);
          color: #111;
          transition: all 0.2s ease;
        }
        .input-field:focus {
          outline: none;
          border-color: rgba(0,0,0,0.5);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
        }
        .input-field::placeholder {
          color: rgba(0,0,0,0.35);
        }

        .role-btn {
          border: 1.5px solid rgba(0,0,0,0.12);
          background: rgba(255,255,255,0.6);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .role-btn:hover {
          border-color: rgba(0,0,0,0.3);
          background: rgba(255,255,255,0.9);
        }
        .role-btn.selected {
          border-color: #111;
          background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
      `}</style>

      {/* Dot grid */}
      <div className="dot-grid absolute inset-0" />

      {/* Ambient glow */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-black/[0.025] rounded-full blur-[120px] pointer-events-none z-0" />

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-14 relative z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-md shadow-black/15">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-black font-black text-lg tracking-tight">Skitec</span>
        </Link>

        <div>
          <p className="text-black/50 uppercase tracking-[0.2em] text-[10px] mb-5 font-bold">
            Property OS
          </p>
          <h2
            className="text-black mb-5 font-black leading-[1.1] tracking-tight"
            style={{ fontSize: "2.6rem" }}
          >
            Operations
            <br />
            <span className="text-black/40 font-light italic">at your fingertips.</span>
          </h2>
          <p className="text-black/60 text-sm leading-relaxed max-w-xs font-light">
            Manage properties, staff, SOPs, KRAs, and inventory — all from one command center.
          </p>
        </div>

        {/* Stats card */}
        <div className="rounded-2xl p-6 border border-black/10 bg-white/70 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <p className="text-black text-sm font-bold">Grand Horizon Hotel</p>
              <p className="text-black/55 text-xs font-light">3 properties · 47 staff</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRole("superadmin")}
                  className="mt-2 text-[9px] text-black/20 hover:text-black/40 uppercase tracking-widest text-center transition-colors"
                >
                  Admin access
                </button>
              </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "KRA Score", v: "94%" },
              { l: "Occupancy", v: "87%" },
              { l: "Tasks", v: "42/50" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center border border-black/8 bg-[#f5f4f0]">
                <div className="text-black font-black text-lg">{s.v}</div>
                <div className="text-black/55 text-[10px] mt-0.5 font-light leading-tight">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block w-px bg-black/10 my-12 relative z-10" />

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[560px]"
        >
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-black font-black">Skitec</span>
          </Link>

          {/* Card */}
          <div className="rounded-3xl p-10 border border-black/10 bg-white/85 backdrop-blur-xl shadow-xl shadow-black/8">

            {/* Header */}
            <div className="mb-9">
              <p className="text-black/50 uppercase tracking-[0.2em] text-[10px] mb-2 font-bold">
                Sign in
              </p>
              <h1 className="text-black font-black text-3xl leading-tight tracking-tight">
                Welcome back
              </h1>
              <p className="text-black/55 text-sm mt-1.5 font-light italic">
                Select your role and sign in to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">

              {/* Role selection — text only with radio */}
              <div>
                <label className="block text-black/55 text-[10px] uppercase tracking-widest mb-3 font-bold">
                  I am a
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {roleConfig.map(({ id, label, desc }) => (
                    <motion.button
                      key={id}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setRole(id)}
                      className={`role-btn rounded-xl px-4 py-4 flex flex-col gap-2.5 text-left ${
                        role === id ? "selected" : ""
                      }`}
                    >
                      {/* Radio dot */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                          role === id
                            ? "border-black bg-black"
                            : "border-black/30 bg-transparent"
                        }`}
                      >
                        {role === id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>

                      <div>
                        <p
                          className={`font-bold text-sm leading-tight transition-colors duration-200 ${
                            role === id ? "text-black" : "text-black/60"
                          }`}
                        >
                          {label}
                        </p>
                        <p className="text-black/45 text-[11px] font-light leading-tight mt-0.5">
                          {desc}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-black/8" />

              {/* Email */}
              <div>
                <label className="block text-black/55 text-[10px] uppercase tracking-widest mb-2 font-bold">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full rounded-xl px-4 py-3.5 text-sm"
                  placeholder="you@company.com"
                  style={{ fontFamily: "'Merriweather', serif" }}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-black/55 text-[10px] uppercase tracking-widest font-bold">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-black/50 text-xs hover:text-black transition-colors font-light italic"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field w-full rounded-xl px-4 py-3.5 pr-12 text-sm"
                    placeholder="Enter your password"
                    style={{ fontFamily: "'Merriweather', serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={!role || !email || !password}
                className="w-full bg-black text-white py-4 rounded-xl flex items-center justify-center gap-2 font-black text-sm shadow-lg shadow-black/15 hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
              >
                Sign In <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>

            <p className="text-center text-black/50 text-xs mt-7 font-light">
              Don&apos;t have an account?{" "}
              <Link
                href="/demo"
                className="text-black font-bold hover:text-black/70 transition-colors"
              >
                Request Demo
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
