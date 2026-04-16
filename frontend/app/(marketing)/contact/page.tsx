"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="bg-[#060D1A] py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-[#3B82F6]/10 rounded-full blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[#60A5FA] text-xs uppercase tracking-widest mb-4" style={{ fontWeight: 700 }}>Contact</p>
            <h1 className="text-white" style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              We&apos;d love to{" "}
              <span className="bg-gradient-to-r from-[#60A5FA] to-[#818CF8] bg-clip-text text-transparent">
                hear from you
              </span>
            </h1>
            <p className="text-slate-400 mt-5 text-sm max-w-md mx-auto">
              Our team is ready to help you with any questions about Skitec.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-24 bg-[#F8F9FB]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
                <h3 className="text-slate-900 mb-6" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Get in touch</h3>
                <div className="space-y-5">
                  {[
                    { icon: Mail, label: "Email", value: "hello@skitec.io" },
                    { icon: Phone, label: "Phone", value: "+1 (555) 000-0000" },
                    { icon: MapPin, label: "Address", value: "Dubai, UAE & Remote" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-[#3B82F6]" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-0.5">{item.label}</p>
                        <p className="text-slate-800 text-sm" style={{ fontWeight: 500 }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#1E3A5F] to-[#1E1B4B] rounded-2xl p-7 border border-[#3B82F6]/20">
                <h3 className="text-white mb-3" style={{ fontWeight: 700 }}>Want a product walkthrough?</h3>
                <p className="text-slate-400 text-sm mb-5">Book a personalized demo and see the platform in action for your specific use case.</p>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#4F46E5] text-white px-5 py-2.5 rounded-lg text-sm shadow-md"
                  style={{ fontWeight: 600 }}
                >
                  Request Demo →
                </Link>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-16 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#EFF6FF] flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="w-8 h-8 text-[#3B82F6]" />
                    </div>
                    <h3 className="text-slate-900 mb-2" style={{ fontWeight: 700, fontSize: "1.2rem" }}>Message sent!</h3>
                    <p className="text-slate-500 text-sm">We&apos;ll get back to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="text-slate-900 mb-6" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Send us a message</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-slate-700 text-sm mb-2" style={{ fontWeight: 500 }}>Full Name</label>
                          <input
                            type="text"
                            required
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-[#F8F9FB] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
                            placeholder="John Smith"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-700 text-sm mb-2" style={{ fontWeight: 500 }}>Email Address</label>
                          <input
                            type="email"
                            required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full bg-[#F8F9FB] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-700 text-sm mb-2" style={{ fontWeight: 500 }}>Company / Property Name</label>
                        <input
                          type="text"
                          value={form.company}
                          onChange={e => setForm({ ...form, company: e.target.value })}
                          className="w-full bg-[#F8F9FB] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition-all"
                          placeholder="Grand Horizon property"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 text-sm mb-2" style={{ fontWeight: 500 }}>Message</label>
                        <textarea
                          rows={5}
                          required
                          value={form.message}
                          onChange={e => setForm({ ...form, message: e.target.value })}
                          className="w-full bg-[#F8F9FB] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition-all resize-none"
                          placeholder="Tell us about your property and what you're looking for..."
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#3B82F6] to-[#4F46E5] text-white py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                        style={{ fontWeight: 600 }}
                      >
                        Send Message <Send className="w-3.5 h-3.5" />
                      </motion.button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}