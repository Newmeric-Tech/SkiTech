"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div
      className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-6 relative overflow-hidden font-[Merriweather]"
    >
      {/* Dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.13)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,transparent_20%,#f8f7f4_100%)] pointer-events-none z-[1]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-black/60 hover:text-black mb-8 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>

        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-9 shadow-xl shadow-black/10 border border-black/10">
          {!sent ? (
            <>
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-[#f5f4f0] border border-black/10 flex items-center justify-center mb-7">
                <Mail className="w-5 h-5 text-black" />
              </div>

              {/* Heading */}
              <p className="text-black/60 uppercase tracking-[0.2em] text-[10px] mb-2 font-bold">
                Account recovery
              </p>
              <h1 className="text-black font-black text-2xl mb-2">
                Forgot your password?
              </h1>
              <p className="text-black/70 text-sm font-light mb-8">
                No worries — enter your email and we&apos;ll send you reset instructions right away.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-black/70 text-[10px] uppercase tracking-widest mb-2 font-bold">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl px-4 py-3.5 text-sm bg-black/[0.03] border border-black/20 text-black placeholder:text-black/40 focus:outline-none focus:border-black/60 focus:bg-white focus:ring-2 focus:ring-black/10 transition"
                    placeholder="you@company.com"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full bg-black text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-black/20 hover:bg-neutral-800 transition flex items-center justify-center gap-2"
                >
                  Send Reset Link
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Success icon */}
              <div className="w-12 h-12 rounded-2xl bg-[#f5f4f0] border border-black/10 flex items-center justify-center mb-7">
                <CheckCircle2 className="w-5 h-5 text-black" />
              </div>

              <p className="text-black/60 uppercase tracking-[0.2em] text-[10px] mb-2 font-bold">
                Email sent
              </p>
              <h1 className="text-black font-black text-2xl mb-2">
                Check your inbox
              </h1>
              <p className="text-black/70 text-sm mb-8">
                We sent password reset instructions to{" "}
                <span className="text-black font-bold">{email}</span>.
              </p>

              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-xl text-sm font-black shadow-lg shadow-black/20 hover:bg-neutral-800 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>

              <p className="text-black/60 text-xs mt-5">
                Didn&apos;t receive it?{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-black font-bold hover:text-black/70 transition"
                >
                  Try again
                </button>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}