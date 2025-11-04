"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || "Login failed");
        }
        return data;
      })
      .then((data) => {
        setLoading(false);
        if (data?.token) {
          localStorage.setItem("token", data.token);
        }
        router.replace("/");
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message || "Login failed");
      });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-black">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-md border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold">Log in</h1>
        {error ? (
          <p className="text-sm text-red-600" role="alert">{error}</p>
        ) : null}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm">Email</label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white text-black placeholder:text-zinc-500"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm">Password</label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white text-black placeholder:text-zinc-500"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-center text-sm text-zinc-600">
          No account? <a href="/signup" className="underline">Sign up</a>
        </p>
      </form>
    </main>
  );
}
