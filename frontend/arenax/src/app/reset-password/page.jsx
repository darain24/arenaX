"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setMessage("Password reset successfully. You can now sign in with your new password.");
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#04050b] text-white">
      <SiteHeader />
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[95%] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_160px_rgba(3,4,12,0.9)] backdrop-blur-2xl">
        <h1 className="text-2xl font-semibold">Create a new password</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Choose a strong password that you don't use elsewhere.
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
            <label htmlFor="password" className="text-sm text-zinc-300">
              New password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-[#7c5dff]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm text-zinc-300">
              Confirm password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-[#7c5dff]"
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-xl bg-linear-to-r from-[#71d1ff] via-[#7760ff] to-[#d76bff] text-base font-medium text-white shadow-lg shadow-[#4f44ff]/40 hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset password"}
          </Button>
        </form>
        </div>
      </div>
    </main>
  );
}

