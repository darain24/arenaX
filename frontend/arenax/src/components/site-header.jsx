"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, LogOut } from "lucide-react";
import { getAccessToken, clearTokens, isAuthenticated } from "@/lib/token";
import { API_URL } from "@/lib/api";

const navLinks = ["Home", "Teams", "Matches", "Players", "News", "Contact"];

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

export function SiteHeader() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const token = getAccessToken();
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token invalid, clear it
          clearTokens();
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[95%] items-center justify-between gap-10 px-8 py-4 lg:px-12 lg:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0 text-xl font-semibold tracking-[0.25em] text-[#5da2ff] lg:text-2xl"
        >
          ARENAX
        </Link>

        {/* Center Navigation */}
        <nav className="md:flex hidden flex-1 items-center justify-center gap-8 text-sm text-zinc-300 lg:gap-10 lg:text-base">
          {navLinks.map((item) => {
            if (item === "Teams") {
              return (
                <Link
                  key={item}
                  href="/teams"
                  className="whitespace-nowrap font-medium transition-colors hover:text-white"
                >
                  {item}
                </Link>
              );
            }

            if (item === "Matches") {
              return (
                <Link
                  key={item}
                  href="/matches"
                  className="whitespace-nowrap font-medium transition-colors hover:text-white"
                >
                  {item}
                </Link>
              );
            }

            if (item === "Players") {
              return (
                <Link
                  key={item}
                  href="/players"
                  className="whitespace-nowrap font-medium transition-colors hover:text-white"
                >
                  {item}
                </Link>
              );
            }

            // Other items are non-functional for now
            return (
              <button
                key={item}
                type="button"
                className="whitespace-nowrap font-medium transition-colors hover:text-white"
              >
                {item}
              </button>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex flex-shrink-0 items-center gap-4 lg:gap-5">
          <div className="md:flex hidden w-[240px] items-center gap-2 rounded-full border border-white/10 bg-white/3 px-4 py-2 text-sm text-zinc-300 lg:w-[280px] lg:px-5 lg:py-2">
            <Search className="h-4 w-4 text-zinc-500 lg:h-5 lg:w-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none lg:text-base"
            />
          </div>

          {loading ? (
            <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="relative h-8 w-8 flex-shrink-0">
                  {user.avatarUrl ? (
                    <>
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="h-8 w-8 rounded-full object-cover"
                        onError={(e) => {
                          // Hide image on error, show initials instead
                          e.target.style.display = "none";
                          const initialsDiv = e.target.nextElementSibling;
                          if (initialsDiv) {
                            initialsDiv.style.display = "flex";
                          }
                        }}
                      />
                      <div
                        className={`h-8 w-8 rounded-full ${getAvatarColor(user.username)} hidden items-center justify-center text-sm font-semibold text-white`}
                      >
                        {getInitials(user.fullName || user.username)}
                      </div>
                    </>
                  ) : (
                    <div
                      className={`h-8 w-8 rounded-full ${getAvatarColor(user.username)} flex items-center justify-center text-sm font-semibold text-white`}
                    >
                      {getInitials(user.fullName || user.username)}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-white hidden sm:inline">
                  {user.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/2 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/6 lg:px-5 lg:py-2 lg:text-base"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/2 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/6 lg:px-5 lg:py-2 lg:text-base"
              >
                <User className="h-4 w-4 lg:h-5 lg:w-5" />
                <span>Login</span>
              </Link>

              <Link
                href="/signup"
                className="inline-flex items-center whitespace-nowrap rounded-full bg-[#5da2ff] px-5 py-2 text-sm font-semibold text-black hover:bg-[#78b4ff] lg:px-6 lg:py-2.5 lg:text-base"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


