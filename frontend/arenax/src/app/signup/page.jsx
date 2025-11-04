"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || "Signup failed");
        }
        return data;
      })
      .then(() => {
        setLoading(false);
        alert("Account created. You can log in now.");
        window.location.href = "/login";
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message || "Signup failed");
      });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-black">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-md border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold">Create account</h1>
        {error ? (
          <p className="text-sm text-red-600" role="alert">{error}</p>
        ) : null}
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm">Username</label>
          <Input
            id="username"
            type="text"
            placeholder="yourname"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white text-black placeholder:text-zinc-500"
          />
        </div>
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
          {loading ? "Signing up..." : "Sign up"}
        </Button>
        <p className="text-center text-sm text-zinc-600">
          Have an account? <a href="/login" className="underline">Log in</a>
        </p>
      </form>
    </main>
  );
}
