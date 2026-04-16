'use client';

import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [show, setShow] = useState({ p: false, c: false });
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password === form.confirm) setDone(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-black/5 rounded-full blur-[130px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white rounded-2xl p-8 shadow-2xl shadow-black/10">
          <div className="w-12 h-12 rounded-xl bg-[#f8f7f4] flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-black" />
          </div>

          {!done ? (
            <>
              <h1 className="text-black mb-1 font-extrabold text-[1.4rem]">Set new password</h1>
              <p className="text-neutral-500 text-sm mb-7">Choose a strong password for your Skitec account.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  { key: "password", label: "New Password", showKey: "p" as const },
                  { key: "confirm", label: "Confirm Password", showKey: "c" as const },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-neutral-700 text-sm mb-2 font-medium">{field.label}</label>
                    <div className="relative">
                      <input
                        type={show[field.showKey === 'p' ? 'p' : 'c'] ? "text" : "password"}
                        required
                        value={form[field.key as keyof typeof form]}
                        // @ts-ignore
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        className="w-full bg-[#f8f7f4] border border-neutral-200 rounded-xl px-4 py-3 pr-12 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShow({ ...show, [field.showKey]: !show[field.showKey === 'p' ? 'p' : 'c'] })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                      >
                         {show[field.showKey === 'p' ? 'p' : 'c'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                {form.password && form.confirm && form.password !== form.confirm && (
                  <p className="text-red-500 text-xs">Passwords do not match.</p>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full bg-black text-white py-3.5 rounded-xl shadow-md font-semibold"
                >
                  Reset Password
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#f8f7f4] flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-black mb-2 font-extrabold text-[1.3rem]">Password reset!</h2>
              <p className="text-neutral-500 text-sm mb-6">Your password has been updated. Sign in to continue.</p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-sm shadow-md font-semibold"
              >
                Sign In →
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}