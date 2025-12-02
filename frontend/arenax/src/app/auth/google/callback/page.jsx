"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/api";
import { setAccessToken, setRefreshToken } from "@/lib/token";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setError("No authorization code received");
      return;
    }

    // Send code to backend
    fetch(`${API_URL}/auth/google/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Failed to authenticate with Google");
        }
        return data;
      })
      .then((data) => {
        if (data.accessToken && data.refreshToken) {
          // Store tokens (use localStorage for OAuth logins by default)
          setAccessToken(data.accessToken, true);
          setRefreshToken(data.refreshToken, true);
          router.replace("/");
        } else {
          throw new Error("No tokens received");
        }
      })
      .catch((err) => {
        console.error("Google OAuth error:", err);
        setError(err.message || "Failed to authenticate with Google");
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#04050b] text-white">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-semibold text-red-400">Authentication Failed</h1>
          <p className="text-zinc-400">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-6 rounded-lg bg-[#5da2ff] px-6 py-2 text-white hover:bg-[#78b4ff]"
          >
            Return to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#04050b] text-white">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#5da2ff] border-t-transparent mx-auto" />
        <p className="text-zinc-400">Completing Google authentication...</p>
      </div>
    </main>
  );
}

