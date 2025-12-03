"use client";

import { useState } from "react";
import { Mail, Send, MessageSquare, Headphones, Camera, Clock } from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { API_URL } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState(null); // { type: "success" | "error", message: string }
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus(null);

    if (!form.email || !form.message) {
      setStatus({
        type: "error",
        message: "Please provide at least your email and a short message.",
      });
      return;
    }

    setSubmitting(true);
    fetch(`${API_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.ok === false) {
          throw new Error(data.error || "Failed to send your message. Please try again.");
        }
        setStatus({
          type: "success",
          message:
            "Thanks for reaching out! Your message has been sent and I'll get back to you soon.",
        });
        // Clear only the message/subject to allow quick follow‑ups
        setForm((prev) => ({ ...prev, subject: "", message: "" }));
      })
      .catch((err) => {
        setStatus({
          type: "error",
          message: err.message || "Something went wrong while sending your message.",
        });
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteHeader />

      <section className="mx-auto max-w-[95%] px-8 pt-16 pb-10 lg:px-12 lg:pt-20">
        {/* Hero */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl lg:text-6xl font-bold">
            <span className="text-white">Get in </span>
            <span className="bg-gradient-to-r from-[#5da2ff] via-[#5ef0ff] to-[#65ff6d] bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-sm lg:text-base text-zinc-400 max-w-2xl mx-auto">
            Have questions about ArenaX? Send us a message and we&apos;ll get back to you as soon as
            possible.
          </p>
        </div>

        {/* Top contact methods */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">Email Us</h3>
            <p className="mb-3 text-xs text-zinc-400">I typically respond within a day.</p>
            <a
              href="mailto:darainqamar10@gmail.com"
              className="text-sm font-medium text-[#5da2ff] hover:text-[#78b4ff]"
            >
              darainqamar10@gmail.com
            </a>
          </div>

          {/* Since this is a hobby project, use online-only contact options */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">Join the Community</h3>
            <p className="mb-3 text-xs text-zinc-400">
              Chat with other ArenaX fans, share feedback, and see what&apos;s coming next.
            </p>
            <p className="text-sm font-medium text-zinc-200">Discord server coming soon.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Headphones className="h-5 w-5" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">Feature Requests</h3>
            <p className="mb-3 text-xs text-zinc-400">
              Have an idea for ArenaX? Use the form below to suggest new features or improvements.
            </p>
            <p className="text-sm text-zinc-200">
              Select a clear subject and describe what you&apos;d love to see in the app.
            </p>
          </div>
        </div>

        {/* Main layout: form + sidebar */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] pb-16">
          {/* Contact form */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8 backdrop-blur-sm">
            <h2 className="mb-2 text-2xl font-semibold">Send us a message</h2>
            <p className="mb-6 text-sm text-zinc-400">
              Fill out the form below and we&apos;ll get back to you soon.
            </p>

            {status && (
              <div
                className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                    : "border-red-500/40 bg-red-500/10 text-red-200"
                }`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#5da2ff]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#5da2ff]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#5da2ff]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#5da2ff]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#5da2ff]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#5da2ff] via-[#b96bff] to-[#5ef0ff] px-6 py-3 text-sm font-semibold text-black shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                disabled={submitting}
              >
                <Send className="h-4 w-4" />
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

        {/* Sidebar: project info (hobby‑friendly) */}
        <div className="space-y-6">
          {/* About the project */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-3">
            <h3 className="text-lg font-semibold">About ArenaX</h3>
            <p className="text-sm text-zinc-300">
              ArenaX is a personal hobby project that explores live football data, modern UI
              patterns, and authentication flows.
            </p>
            <p className="text-xs text-zinc-500">
              It&apos;s not a real company or product—just a playground to learn and experiment with
              web technologies.
            </p>
          </div>

          {/* Tech stack */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-3">
            <h3 className="text-lg font-semibold">Tech Stack</h3>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>• Next.js 16 (App Router) &amp; React</li>
              <li>• Tailwind CSS for styling</li>
              <li>• Node.js / Express backend with JWT auth</li>
              <li>• PostgreSQL &amp; Prisma ORM</li>
            </ul>
            <p className="text-xs text-zinc-500">
              Perfect for experimenting with full‑stack patterns and real‑world API integration.
            </p>
          </div>

          {/* How to give feedback */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-3">
            <h3 className="text-lg font-semibold">Feedback &amp; Ideas</h3>
            <p className="text-sm text-zinc-300">
              Found a bug or have an idea for a new feature? Use the form to send feedback and
              suggestions.
            </p>
            <p className="text-xs text-zinc-500">
              Every message helps improve the project—feature requests, design thoughts, or even
              just saying hi are all welcome.
            </p>
          </div>
        </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}


