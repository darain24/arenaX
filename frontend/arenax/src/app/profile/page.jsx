"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { getAccessToken, isAuthenticated, clearTokens } from "@/lib/token";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { User, Mail, Lock, Save, X, Trash2 } from "lucide-react";

// Generate avatar initials from name
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Generate avatar color based on username
function getAvatarColor(username) {
  if (!username) return "bg-zinc-600";
  const colors = [
    "bg-[#5da2ff]",
    "bg-[#b96bff]",
    "bg-[#5ef0ff]",
    "bg-[#65ff6d]",
    "bg-[#ff6b9d]",
    "bg-[#ffa500]",
    "bg-[#9b59b6]",
    "bg-[#e74c3c]",
  ];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    async function fetchUser() {
      try {
        const token = getAccessToken();
        const res = await apiRequest("/auth/me", {
          method: "GET",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setUsername(data.user.username || "");
          setFullName(data.user.fullName || "");
          setEmail(data.user.email || "");
        } else if (res.status === 401) {
          clearTokens();
          router.push("/login");
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password if provided
    if (password) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setSaving(true);
    try {
      const updateData = {
        username: username.trim(),
        fullName: fullName.trim() || null,
        email: email.trim(),
      };

      // Only include password if it's provided
      if (password) {
        updateData.password = password;
      }

      const res = await apiRequest("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSuccess("Profile updated successfully!");
        setPassword("");
        setConfirmPassword("");
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your ArenaX account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const token = getAccessToken();
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      const res = await apiRequest("/auth/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete account.");
      }

      // Clear tokens and redirect to login
      clearTokens();
      router.push("/login");
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.message || "Failed to delete account.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#04050b] text-white">
        <SiteHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-zinc-400">Loading profile...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#04050b] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-[#5da2ff] to-[#b96bff] bg-clip-text text-transparent">
              Profile
            </span>
          </h1>
          <p className="text-zinc-400">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_160px_rgba(3,4,12,0.9)] backdrop-blur-2xl">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
            <div className="relative h-24 w-24 flex-shrink-0">
              {user.avatarUrl ? (
                <>
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-24 w-24 rounded-full object-cover border-2 border-white/20"
                    onError={(e) => {
                      e.target.style.display = "none";
                      const initialsDiv = e.target.nextElementSibling;
                      if (initialsDiv) {
                        initialsDiv.style.display = "flex";
                      }
                    }}
                  />
                  <div
                    className={`h-24 w-24 rounded-full ${getAvatarColor(user.username)} hidden items-center justify-center text-2xl font-semibold text-white border-2 border-white/20`}
                  >
                    {getInitials(user.fullName || user.username)}
                  </div>
                </>
              ) : (
                <div
                  className={`h-24 w-24 rounded-full ${getAvatarColor(user.username)} flex items-center justify-center text-2xl font-semibold text-white border-2 border-white/20`}
                >
                  {getInitials(user.fullName || user.username)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-1">
                {user.fullName || user.username}
              </h2>
              <p className="text-zinc-400">{user.email}</p>
              {user.githubId && (
                <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  GitHub Account
                </span>
              )}
              {user.googleId && (
                <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Google Account
                </span>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
                <X className="h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300 flex items-center gap-2">
                <Save className="h-4 w-4" />
                {success}
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <User className="h-4 w-4" />
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-[#7c5dff]"
                required
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-[#7c5dff]"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-[#7c5dff]"
                required
              />
            </div>

            {/* Password Section */}
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                Leave blank to keep your current password
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                    New Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-[#7c5dff]"
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                    Confirm New Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-[#7c5dff]"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4 justify-between">
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-[#71d1ff] via-[#7760ff] to-[#d76bff] text-base font-medium text-white shadow-lg shadow-[#4f44ff]/40 hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                Cancel
              </Button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-500/20 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

