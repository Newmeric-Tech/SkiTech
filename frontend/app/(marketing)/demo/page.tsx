"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Calendar, Users, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const perks = [
  "30-minute personalized walkthrough",
  "See all 6 modules in action",
  "Ask questions specific to your properties",
  "No commitment required",
];

const sizes = ["1 property", "2–5 properties", "6–15 properties", "16+ properties"];
const roles = ["Owner", "Manager", "Operations Director", "IT/Tech", "Other"];

export default function DemoPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", size: "", role: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) setStep(step + 1);
    else setSubmitted(true);
  };

  return (
    <div className="min-h-screen pt-16 bg-[#f8f7f4] flex items-center justify-center relative overflow-hidden" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
      <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-black/[0.03] rounded-full blur-[130px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-black/[0.03] rounded-full blur-[120px]" />

      <div className="relative w-full max-w-5xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Left info */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center mb-6 shadow-lg shadow-black/10">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-black mb-4" style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em", fontFamily: "'Merriweather', Georgia, serif" }}>
              Request a{" "}
              <span className="italic font-light text-neutral-500">
                personalized demo
              </span>
            </h1>
            <p className="text-neutral-500 text-sm leading-relaxed mb-8">
              See how Skitec can transform your property operations. Our team will walk you through the platform tailored to your needs.
            </p>
            <ul className="space-y-3">
              {perks.map((p, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-2.5 text-neutral-600 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0" />
                  {p}
                </motion.li>
              ))}
            </ul>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { icon: Building2, val: "50+", label: "Properties" },
                { icon: Users, val: "1,200+", label: "Users" },
              ].map((s, i) => (
                <div key={i} className="bg-white/70 backdrop-blur rounded-xl p-4 border border-black/10">
                  <s.icon className="w-5 h-5 text-black mb-2" />
                  <div className="text-black" style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Merriweather', Georgia, serif" }}>{s.val}</div>
                  <div className="text-neutral-400 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/70 backdrop-blur rounded-2xl p-8 shadow-xl border border-black/10">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-black/[0.05] flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-black mb-2" style={{ fontWeight: 800, fontSize: "1.3rem", fontFamily: "'Merriweather', Georgia, serif" }}>Demo Requested!</h3>
                  <p className="text-neutral-500 text-sm max-w-xs mx-auto">
                    We&apos;ll reach out within 1 business day to schedule your personalized walkthrough.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex mt-6 items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-sm shadow-md"
                    style={{ fontWeight: 600 }}
                  >
                    Back to Home
                  </Link>
                </motion.div>
              ) : (
                <>
                  {/* Progress */}
                  <div className="flex items-center gap-2 mb-8">
                    {[1, 2].map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                            step >= s
                              ? "bg-black text-white shadow-md shadow-black/10"
                              : "bg-black/[0.04] text-neutral-400"
                          }`}
                          style={{ fontWeight: 700 }}
                        >
                          {s}
                        </div>
                        <span className={`text-xs ${step >= s ? "text-black" : "text-neutral-400"}`} style={{ fontWeight: step >= s ? 500 : 400 }}>
                          {s === 1 ? "Your Details" : "Property Info"}
                        </span>
                        {s < 2 && <div className="w-8 h-px bg-black/10 mx-1" />}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleNext} className="space-y-5">
                    {step === 1 && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Full Name *</label>
                            <input
                              required
                              value={form.name}
                              onChange={e => setForm({ ...form, name: e.target.value })}
                              className="w-full bg-white/80 border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all"
                              placeholder="John Smith"
                            />
                          </div>
                          <div>
                            <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Work Email *</label>
                            <input
                              type="email"
                              required
                              value={form.email}
                              onChange={e => setForm({ ...form, email: e.target.value })}
                              className="w-full bg-white/80 border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all"
                              placeholder="john@company.com"
                            />
                          </div>
                          <div>
                            <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Company Name</label>
                            <input
                              value={form.company}
                              onChange={e => setForm({ ...form, company: e.target.value })}
                              className="w-full bg-white/80 border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all"
                              placeholder="Grand Hotel"
                            />
                          </div>
                          <div>
                            <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Phone Number</label>
                            <input
                              type="tel"
                              value={form.phone}
                              onChange={e => setForm({ ...form, phone: e.target.value })}
                              className="w-full bg-white/80 border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    
                    {step === 2 && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Property Portfolio Size</label>
                            <select
                              value={form.size}
                              onChange={e => setForm({ ...form, size: e.target.value })}
                              className="w-full bg-white/80 border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all appearance-none"
                            >
                              <option value="">Select size...</option>
                              {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Your Role</label>
                            <select
                              value={form.role}
                              onChange={e => setForm({ ...form, role: e.target.value })}
                              className="w-full bg-white/80 border border-black/10 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all appearance-none"
                            >
                              <option value="">Select role...</option>
                              {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-neutral-700 text-sm mb-2" style={{ fontWeight: 500 }}>Anything specific you&apos;re looking for?</label>
                            <textarea
                              rows={3}
                              value={form.message}
                              onChange={e => setForm({ ...form, message: e.target.value })}
                              className="w-full bg-white/80 border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all resize-none"
                              placeholder="e.g. Better inventory tracking..."
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex pt-2">
                      {step > 1 && (
                        <button
                          type="button"
                          onClick={() => setStep(step - 1)}
                          className="mr-3 text-neutral-400 hover:text-black text-sm px-4 py-3 rounded-xl transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          Back
                        </button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        className="flex-1 bg-black text-white py-3.5 rounded-xl text-sm shadow-md shadow-black/10"
                        style={{ fontWeight: 600 }}
                      >
                        {step === 2 ? "Request Demo" : "Continue →"}
                      </motion.button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}