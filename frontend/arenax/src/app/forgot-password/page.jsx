"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to start password reset");
      }
      
      // If email exists, redirect to home page with alert
      if (data.exists) {
        // Store alert message in sessionStorage to show on home page
        sessionStorage.setItem("passwordResetAlert", "true");
        router.push("/");
      } else {
        // Email doesn't exist, show generic message
        setMessage(
          "If an account with that email exists, we've sent password reset instructions."
        );
      }
    } catch (err) {
      setError(err.message || "Failed to start password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#04050b] text-white">
      <SiteHeader />
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[95%] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_160px_rgba(3,4,12,0.9)] backdrop-blur-2xl">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Enter the email associated with your account and we'll send you a link to reset your
          password.
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-4 text-sm text-emerald-300" role="status">
            {message}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-zinc-300">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-[#7c5dff]"
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-xl bg-linear-to-r from-[#71d1ff] via-[#7760ff] to-[#d76bff] text-base font-medium text-white shadow-lg shadow-[#4f44ff]/40 hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send reset link"}
          </Button>
          <p className="pt-2 text-center text-sm text-zinc-400">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-cyan-300 hover:text-cyan-100"
            >
              Back to login
            </button>
          </p>
        </form>
        </div>
      </div>
    </main>
  );
}

