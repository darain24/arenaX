"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, User, LogOut, Menu, X } from "lucide-react";
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
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Pages where search should be enabled
  const searchEnabledPages = ["/teams", "/matches", "/players", "/news"];
  const showSearch = searchEnabledPages.includes(pathname);

  // Sync search query with URL params
  useEffect(() => {
    if (showSearch && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("q") || "";
      setSearchQuery(query);
    }
  }, [showSearch, pathname]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Update URL search params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (value.trim()) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      const newUrl = params.toString() 
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(newUrl, { scroll: false });
    }
  };

  useEffect(() => {
    async function fetchUser() {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const token = getAccessToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch((fetchErr) => {
          // Network error or CORS issue
          console.warn("Failed to fetch user profile (backend may be offline):", fetchErr.message);
          return null;
        });

        if (!res) {
          // Fetch failed, likely backend is offline
          setLoading(false);
          return;
        }

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.user) {
            setUser(data.user);
          }
        } else {
          // Token invalid, clear it
          clearTokens();
        }
      } catch (err) {
        // Silently handle errors - backend might be offline
        console.warn("Error fetching user:", err.message);
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
      <div className="mx-auto flex max-w-[95%] items-center justify-between gap-6 px-6 py-4 lg:px-12 lg:py-4">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger (left side) */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-2 text-white hover:bg-white/10 transition-colors"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 text-xl font-semibold tracking-[0.25em] text-[#5da2ff] lg:text-2xl"
          >
            ARENAX
          </Link>
        </div>

        {/* Center Navigation (desktop) */}
        <nav className="md:flex hidden flex-1 items-center justify-center gap-8 text-sm text-zinc-300 lg:gap-10 lg:text-base">
          {navLinks.map((item) => {
            if (item === "Home") {
              return (
                <Link
                  key={item}
                  href="/"
                  className="whitespace-nowrap font-medium transition-colors hover:text-white"
                >
                  {item}
                </Link>
              );
            }

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

            if (item === "News") {
              return (
                <Link
                  key={item}
                  href="/news"
                  className="whitespace-nowrap font-medium transition-colors hover:text-white"
                >
                  {item}
                </Link>
              );
            }

            if (item === "Contact") {
              return (
                <Link
                  key={item}
                  href="/contact"
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
        <div className="flex flex-shrink-0 items-center gap-3 lg:gap-5">
          {showSearch && (
            <div className="md:flex hidden w-[220px] items-center gap-2 rounded-full border border-white/10 bg-white/3 px-4 py-2 text-sm text-zinc-300 lg:w-[260px] lg:px-5 lg:py-2">
              <Search className="h-4 w-4 text-zinc-500 lg:h-5 lg:w-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none lg:text-base"
              />
            </div>
          )}

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

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-md">
          <div className="mx-auto max-w-[95%] px-6 py-4 space-y-4">
            {showSearch && (
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-4 py-2 text-sm text-zinc-300">
                <Search className="h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                />
              </div>
            )}

            <nav className="flex flex-col gap-3 text-sm text-zinc-200">
              {navLinks.map((item) => {
                let href = "/";
                if (item === "Teams") href = "/teams";
                else if (item === "Matches") href = "/matches";
                else if (item === "Players") href = "/players";
                else if (item === "News") href = "/news";
                else if (item === "Contact") href = "/contact";

                return (
                  <Link
                    key={item}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-2 py-2 font-medium hover:bg-white/5"
                  >
                    {item}
                  </Link>
                );
              })}
            </nav>

            <div className="h-px bg-white/10" />

            {/* Auth actions in mobile menu */}
            <div className="flex flex-col gap-3">
              {loading ? (
                <div className="h-10 w-full rounded-full bg-white/5 animate-pulse" />
              ) : user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                  >
                    <div className="relative h-8 w-8 flex-shrink-0">
                      <div
                        className={`h-8 w-8 rounded-full ${getAvatarColor(
                          user.username
                        )} flex items-center justify-center text-sm font-semibold text-white`}
                      >
                        {getInitials(user.fullName || user.username)}
                      </div>
                    </div>
                    <span>{user.username}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/2 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/6"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/2 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/6"
                  >
                    <User className="h-4 w-4" />
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center rounded-full bg-[#5da2ff] px-5 py-2 text-sm font-semibold text-black hover:bg-[#78b4ff]"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


