"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";
import { setAccessToken, setRefreshToken } from "@/lib/token";
import { Lock, Zap, Globe } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";

const socialProviders = [
  { name: "Google", icon: FaGoogle },
  { name: "GitHub", icon: FaGithub },
];

const featureHighlights = [
  { name: "Secure", icon: Lock },
  { name: "Fast", icon: Zap },
  { name: "24/7", icon: Globe },
];

const engagementStats = [
  { value: null, label: "Active Users", accent: "from-[#5ef0ff] to-[#1ecfcb]" },
  { value: "500+", label: "Live Matches", accent: "from-[#b96bff] to-[#8448ff]" },
  { value: "24/7", label: "Live Support", accent: "from-[#65ff6d] to-[#1fbf35]" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/stats/users-count`)
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (typeof data.count === "number") {
          setUserCount(data.count);
        }
      })
      .catch(() => {});
  }, []);

  const formatUserCount = (count) => {
    if (count == null) return "0";
    if (count === 0) return "0";
    if (count >= 1_000_000) {
      const v = (count / 1_000_000).toFixed(1).replace(/\.0$/, "");
      return `${v}M+`;
    }
    if (count >= 1_000) {
      const v = (count / 1_000).toFixed(1).replace(/\.0$/, "");
      return `${v}K+`;
    }
    return `${count}+`;
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/auth/google`);
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to get Google OAuth URL");
      }

      window.location.href = data.url;
    } catch (err) {
      setGoogleLoading(false);
      setError(err.message || "Google Sign In failed");
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      setGithubLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/auth/github`);
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to get GitHub OAuth URL");
      }

      window.location.href = data.url;
    } catch (err) {
      setGithubLoading(false);
      setError(err.message || "GitHub Sign In failed");
    }
  };

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
          const errorMsg = data?.message || data?.error || "Login failed";
          console.error("Login error:", errorMsg, data);
          throw new Error(errorMsg);
        }
        return data;
      })
      .then((data) => {
        setLoading(false);
        if (data?.accessToken && data?.refreshToken) {
          setAccessToken(data.accessToken, rememberMe);
          setRefreshToken(data.refreshToken, rememberMe);
        }
        router.replace("/");
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message || "Login failed");
      });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04050b] text-white">
      <Image
        src="/images/athletes-collage.jpg"
        alt="Creative collage of different athletes"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#03040a] via-[#03040a]/85 to-transparent" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-8 px-4 py-8 sm:py-10 lg:flex-row lg:gap-16 lg:py-12">
        <section className="w-full lg:max-w-lg">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-9 shadow-[0_40px_160px_rgba(3,4,12,0.9)] backdrop-blur-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-cyan-200">
              <span className="bg-gradient-to-r from-[#63a7ff] to-[#c373ff] bg-clip-text text-transparent">
                ArenaX
              </span>
              <span className="h-1 w-1 rounded-full bg-cyan-200" />
              Sports
            </div>
            <div className="mt-5 space-y-2">
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                Welcome Back
              </h1>
              <p className="text-sm text-zinc-300">
                Sign in to continue to your account
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {socialProviders.map(({ name, icon: Icon }) => (
                <Button
                  key={name}
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-2xl border-white/15 bg-white/5 p-3 text-white hover:bg-white/15"
                  onClick={name === "Google" ? handleGoogleSignIn : handleGitHubSignIn}
                  disabled={googleLoading || githubLoading}
                  aria-label={`Continue with ${name}`}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              ))}
            </div>

            <p className="pt-6 text-center text-xs uppercase tracking-[0.3em] text-zinc-500">
              Or continue with email
            </p>

        {error ? (
              <p className="mt-3 text-sm text-red-400" role="alert">
                {error}
              </p>
        ) : null}

            <form onSubmit={onSubmit} className="mt-4 space-y-4">
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
        <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-zinc-300">
                  Password
                </label>
          <Input
            id="password"
            type="password"
                  placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-[#7c5dff]"
          />
        </div>
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border border-white/30 bg-transparent accent-[#7c5dff] focus-visible:ring-2 focus-visible:ring-[#7c5dff] focus-visible:ring-offset-0"
                  />
                  Remember me
                </label>
                <a href="/forgot-password" className="text-cyan-300 hover:text-cyan-200">
                  Forgot password?
                </a>
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-[#71d1ff] via-[#7760ff] to-[#d76bff] text-base font-medium text-white shadow-lg shadow-[#4f44ff]/40 hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
        </Button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-400">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="text-cyan-300 hover:text-cyan-100">
                Sign up
              </a>
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {featureHighlights.map(({ name, icon: Icon }) => (
              <div
                key={name}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/80 shadow-inner shadow-black/30"
              >
                <Icon className="mx-auto mb-2 h-5 w-5 text-white" />
                {name}
              </div>
            ))}
          </div>
        </section>

        <section className="hidden flex-1 lg:block">
          <div className="space-y-4">
            <h2 className="text-4xl font-semibold leading-snug">
              <span className="bg-gradient-to-r from-[#5ef0ff] via-[#8a4dff] to-[#f078ff] bg-clip-text text-transparent">
                The Future of Sports
              </span>{" "}
              Starts Here
            </h2>
            <p className="text-lg text-zinc-300">
              Join millions of fans experiencing sports like never before with
              real-time analytics, immersive VR highlights, and exclusive
              content.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-6">
            {engagementStats.map(({ value, label, accent }) => (
              <div
                key={label}
                className="min-w-[140px] rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p
                  className={`bg-gradient-to-r ${accent} bg-clip-text text-2xl font-semibold text-transparent`}
                >
                  {label === "Active Users" ? formatUserCount(userCount) : value}
                </p>
                <p className="text-sm text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
