"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Users, Calendar, Clock, MapPin, ShoppingCart, Star, Eye, Trophy, TrendingUp, BarChart3, Users2, Glasses, Zap, Flame, ArrowRight, Mail } from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const navLinks = ["Home", "Teams", "Matches", "Players", "News", "Contact"];

// Hero Section Data
const heroStats = [
  { value: "150+", label: "Active Teams", color: "text-[#5da2ff]" },
  { value: "2.5M", label: "Fans Worldwide", color: "text-[#b96bff]" },
  { value: "1000+", label: "Live Matches", color: "text-[#65ff6d]" },
];

// Feature Cards Data – real ArenaX features
const features = [
  {
    icon: TrendingUp,
    title: "Live Football Insights",
    description:
      "See upcoming fixtures, key stats, and form for the biggest football leagues in one dashboard.",
    iconColor: "text-[#5da2ff]",
  },
  {
    icon: BarChart3,
    title: "Teams & Players Explorer",
    description:
      "Browse real squads, club details, and elite players with photos and performance metrics.",
    iconColor: "text-[#b96bff]",
  },
  {
    icon: Users2,
    title: "Secure Accounts & Profiles",
    description:
      "Sign up with email or OAuth, manage your profile, and update credentials safely from one place.",
    iconColor: "text-[#65ff6d]",
  },
  {
    icon: Glasses,
    title: "Smart News & Highlights",
    description:
      "Stay on top of football stories with curated news, headlines, and visual match highlights.",
    iconColor: "text-[#5ef0ff]",
  },
];

// Optional fallback images for players/news (used if API doesn't send images)
const playerFallbackImages = [
  "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518091043644-c1f4c3c61217?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1510741861188-417d4aey7y4?auto=format&fit=crop&w=800&q=80",
];

const newsFallbackImages = [
  "https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1515523110800-9415d13b84a0?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1000&q=80",
];

// Helper function to calculate countdown
function calculateCountdown(dateString) {
  const matchDate = new Date(dateString);
  const now = new Date();
  const diff = matchDate - now;
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes };
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Helper function to format time
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
}

// Products Data
const products = [
  {
    name: "Velocity Pro Jersey",
    rating: 4.8,
    price: 89.99,
    image: "/api/placeholder/300/300",
  },
  {
    name: "Neon Performance Shoes",
    rating: 4.9,
    price: 149.99,
    image: "/api/placeholder/300/300",
  },
  {
    name: "Thunder Cap",
    rating: 4.7,
    price: 34.99,
    image: "/api/placeholder/300/300",
  },
  {
    name: "Elite Training Pack",
    rating: 5.0,
    price: 199.99,
    image: "/api/placeholder/300/300",
  },
];

// Helper function to get category color
function getCategoryColor(category) {
  const colors = {
    Highlights: "bg-blue-500/20 text-blue-400",
    Interviews: "bg-purple-500/20 text-purple-400",
    Insights: "bg-green-500/20 text-green-400",
  };
  return colors[category] || "bg-gray-500/20 text-gray-400";
}

const heroImages = [
  "/images/basketball-hero-section.jpg",
  "/images/cricket-hero-section.jpg",
  "/images/f1-hero-section.jpg",
  "/images/football-hero-section.jpg",
  "/images/max-verstappen-hero-section.jpg",
];

export default function Home() {
  const [userCount, setUserCount] = useState(null);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [news, setNews] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);
  
  // Get selected sport from sessionStorage or URL params
  const [selectedSport, setSelectedSport] = useState(() => {
    if (typeof window === "undefined") return null;
    const urlParams = new URLSearchParams(window.location.search);
    const urlSport = urlParams.get("sport");
    if (urlSport) return urlSport;
    const storedSport = sessionStorage.getItem("selectedSport");
    return storedSport || null;
  });
  
  // Sync selectedSport with sessionStorage and URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSport = urlParams.get("sport");
      if (urlSport) {
        setSelectedSport(urlSport);
        sessionStorage.setItem("selectedSport", urlSport);
      } else {
        const storedSport = sessionStorage.getItem("selectedSport");
        if (storedSport) {
          setSelectedSport(storedSport);
        } else {
          // Default to null if no sport is selected
          setSelectedSport(null);
        }
      }
    }
  }, []);

  // Listen for URL changes to update selectedSport
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleLocationChange = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlSport = urlParams.get("sport");
        setSelectedSport(urlSport || null);
      };
      
      // Listen to popstate for browser back/forward
      window.addEventListener("popstate", handleLocationChange);
      
      // Check URL on mount and when pathname changes
      handleLocationChange();
      
      return () => {
        window.removeEventListener("popstate", handleLocationChange);
      };
    }
  }, []);

  // Check for password reset alert
  useEffect(() => {
    const showPasswordResetAlert = sessionStorage.getItem("passwordResetAlert");
    if (showPasswordResetAlert === "true") {
      setShowPasswordAlert(true);
      sessionStorage.removeItem("passwordResetAlert");
      // Auto-hide after 8 seconds
      setTimeout(() => setShowPasswordAlert(false), 8000);
    }
  }, []);

  useEffect(() => {
    // Fetch user count
    fetch(`${API_URL}/stats/users-count`)
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (typeof data.count === "number") {
          setUserCount(data.count);
        }
      })
      .catch(() => {});

    // Fetch matches/races
    setLoadingMatches(true);
    const sportParam = selectedSport ? `?sport=${selectedSport}` : "";
    const matchesEndpoint = selectedSport === "f1" 
      ? `${API_URL}/api/f1/races${sportParam}`
      : `${API_URL}/api/football/matches${sportParam}`;
    fetch(matchesEndpoint)
      .catch((fetchErr) => {
        // Network error - backend may be offline
        console.warn("Failed to fetch matches (backend may be offline):", fetchErr.message);
        return null;
      })
      .then((res) => {
        if (!res) return {};
        return res.json().catch(() => ({}));
      })
      .then((data) => {
        if (selectedSport === "f1") {
          if (data.races && Array.isArray(data.races)) {
            setMatches(data.races.slice(0, 8)); // Show first 8 races
          }
        } else {
          if (data.matches && Array.isArray(data.matches)) {
            setMatches(data.matches.slice(0, 8)); // Show first 8 matches
          }
        }
      })
      .catch((err) => {
        console.warn("Error fetching matches:", err.message);
      })
      .finally(() => {
        setLoadingMatches(false);
      });

    // Fetch top players/drivers
    setLoadingPlayers(true);
    const playersEndpoint = selectedSport === "f1"
      ? `${API_URL}/api/f1/drivers${sportParam}`
      : `${API_URL}/api/football/players${sportParam}`;
    fetch(playersEndpoint)
      .catch((fetchErr) => {
        // Network error - backend may be offline
        console.warn("Failed to fetch players (backend may be offline):", fetchErr.message);
        return null;
      })
      .then((res) => {
        if (!res) return {};
        return res.json().catch(() => ({}));
      })
      .then((data) => {
        if (selectedSport === "f1") {
          if (data.drivers && Array.isArray(data.drivers)) {
            // Map drivers to players format for compatibility
            setPlayers(data.drivers.slice(0, 4).map(driver => ({
              player: {
                id: driver.id,
                name: driver.name,
                position: driver.code,
                imageUrl: driver.imageUrl,
              },
              team: { name: driver.nationality },
              goals: driver.points,
              assists: driver.wins,
            })));
          }
        } else {
          if (data.scorers && Array.isArray(data.scorers)) {
            setPlayers(data.scorers.slice(0, 4)); // Show top 4 players
          }
        }
      })
      .catch((err) => {
        console.warn("Error fetching players:", err.message);
      })
      .finally(() => {
        setLoadingPlayers(false);
      });

    // Fetch news
    setLoadingNews(true);
    const newsEndpoint = selectedSport === "f1"
      ? `${API_URL}/api/f1/news${sportParam}`
      : `${API_URL}/api/football/news${sportParam}`;
    fetch(newsEndpoint)
      .catch((fetchErr) => {
        // Network error - backend may be offline
        console.warn("Failed to fetch news (backend may be offline):", fetchErr.message);
        return null;
      })
      .then((res) => {
        if (!res) return {};
        return res.json().catch(() => ({}));
      })
      .then((data) => {
        if (data.articles && Array.isArray(data.articles)) {
          setNews(data.articles.slice(0, 6)); // Show 6 news items
        }
      })
      .catch((err) => {
        console.warn("Error fetching news:", err.message);
      })
      .finally(() => {
        setLoadingNews(false);
      });
  }, [selectedSport]);

  // Hero image slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [selectedSport]);

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

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteHeader />
      
      {/* Password Reset Alert */}
      {showPasswordAlert && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <div className="rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md px-6 py-4 shadow-lg shadow-cyan-500/20 max-w-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 rounded-full bg-cyan-400 flex items-center justify-center">
                  <span className="text-xs font-bold text-black">!</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white mb-1">Password Reset</p>
                <p className="text-xs text-cyan-200">
                  Your email was found in our system. Please change your password via the profile page.
                </p>
              </div>
              <button
                onClick={() => setShowPasswordAlert(false)}
                className="flex-shrink-0 text-cyan-300 hover:text-white transition-colors"
                aria-label="Close alert"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative mx-auto max-w-[95%] px-8 py-16 lg:px-12 lg:py-24 overflow-hidden rounded-2xl min-h-[600px] lg:min-h-[700px] bg-black">
        {/* Background Images Slideshow */}
        <div className="absolute inset-0 rounded-2xl">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 rounded-2xl transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <img
                src={image}
                alt={`Hero image ${index + 1}`}
                className="w-full h-full object-cover rounded-2xl"
                onError={(e) => {
                  console.error(`Failed to load image: ${image}`, e);
                }}
              />
              {/* Gradient fade to the right */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            </div>
          ))}
        </div>
        {/* Fading border / vignette around hero images */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_55%,rgba(0,0,0,0.9)_100%)]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-start justify-start text-left space-y-12 lg:space-y-16">
          {/* Badges */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-semibold text-orange-500">LIVE</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5">
              <Zap className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-semibold text-white">24/7</span>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-6 lg:space-y-8">
            <h1 className="text-5xl font-bold leading-tight lg:text-6xl">
              <span className="text-white">The Future of</span>
              <br />
              <span className="bg-gradient-to-r from-[#5da2ff] to-[#b96bff] bg-clip-text text-transparent">
                Sports Starts
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#5da2ff] to-[#b96bff] bg-clip-text text-transparent">
                Here
              </span>
            </h1>
            <p className="max-w-2xl text-lg lg:text-xl text-zinc-300">
              Experience the next generation of sports entertainment with real-time analytics, immersive VR highlights, and a global community of fans.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 lg:gap-12 pt-4">
            {heroStats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className={`text-3xl lg:text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm lg:text-base text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="mx-auto max-w-[95%] px-8 py-16 lg:px-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className={`mb-4 ${feature.iconColor}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Upcoming Matches/Races Section */}
      <section className="mx-auto max-w-[95%] px-8 py-16 lg:px-12">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl font-bold text-white">
            {selectedSport === "f1" ? "Upcoming Races" : "Upcoming Matches"}
          </h2>
          <p className="text-zinc-400">Don't miss the action</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {loadingMatches ? (
            <div className="col-span-full text-center text-zinc-400">Loading matches...</div>
          ) : matches.length === 0 ? (
            <div className="col-span-full text-center text-zinc-400">
              {selectedSport === "f1" ? "No upcoming races" : "No upcoming matches"}
            </div>
          ) : (
            matches.map((match, idx) => {
              const countdown = calculateCountdown(match.utcDate);
              
              // F1 race display
              if (selectedSport === "f1") {
                return (
                  <div
                    key={match.id || idx}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                  >
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">{match.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Trophy className="h-4 w-4 text-red-500" />
                        <span>Round {match.round}</span>
                      </div>
                    </div>

                    <div className="mb-6 space-y-2 text-sm text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(match.utcDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(match.utcDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{match.circuit || match.location || "TBD"}</span>
                      </div>
                      <div className="text-xs text-zinc-500">{match.location}</div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-zinc-500">Time until race:</p>
                      <div className="flex gap-3">
                        <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-center">
                          <p className="text-lg font-bold text-white">{countdown.days}</p>
                          <p className="text-xs text-zinc-400">Days</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-center">
                          <p className="text-lg font-bold text-white">{countdown.hours}</p>
                          <p className="text-xs text-zinc-400">Hours</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-center">
                          <p className="text-lg font-bold text-white">{countdown.minutes}</p>
                          <p className="text-xs text-zinc-400">Minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Football match display
              const teamColors = ["text-yellow-400", "text-orange-500", "text-blue-400", "text-green-400"];
              const team1Color = teamColors[idx % teamColors.length];
              const team2Color = teamColors[(idx + 1) % teamColors.length];
              
              return (
                <div
                  key={match.id || idx}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {match.homeTeam?.crest && (
                        <img
                          src={match.homeTeam.crest}
                          alt={`${match.homeTeam.name} logo`}
                          className="h-10 w-10 rounded-full border border-white/20 bg-black/40 object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <span className="font-semibold text-white">
                        {match.homeTeam?.name || "Team 1"}
                      </span>
                    </div>
                    <span className="font-bold text-white text-sm">VS</span>
                    <div className="flex items-center gap-3">
                      {match.awayTeam?.crest && (
                        <img
                          src={match.awayTeam.crest}
                          alt={`${match.awayTeam.name} logo`}
                          className="h-10 w-10 rounded-full border border-white/20 bg-black/40 object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <span className="font-semibold text-white">
                        {match.awayTeam?.name || "Team 2"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6 space-y-2 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(match.utcDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(match.utcDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{match.venue || match.competition?.name || "TBD"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500">Time until match:</p>
                    <div className="flex gap-3">
                      <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-center">
                        <p className="text-lg font-bold text-white">{countdown.days}</p>
                        <p className="text-xs text-zinc-400">Days</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-center">
                        <p className="text-lg font-bold text-white">{countdown.hours}</p>
                        <p className="text-xs text-zinc-400">Hours</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-center">
                        <p className="text-lg font-bold text-white">{countdown.minutes}</p>
                        <p className="text-xs text-zinc-400">Minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Top Players/Drivers Section */}
      <section className="mx-auto max-w-[95%] px-8 py-16 lg:px-12">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl font-bold">
            <span className="text-white">Top</span>{" "}
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              {selectedSport === "f1" ? "Drivers" : "Players"}
            </span>
          </h2>
          <p className="text-zinc-400">
            {selectedSport === "f1" ? "World's fastest drivers" : "League's finest athletes"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loadingPlayers ? (
            <div className="col-span-4 text-center text-zinc-400">Loading players...</div>
          ) : players.length === 0 ? (
            <div className="col-span-4 text-center text-zinc-400">No player data available</div>
          ) : (
            players.map((scorer, idx) => {
              const player = scorer.player || {};
              const team = scorer.team || {};
              const goals = scorer.goals || 0;
              const assists = scorer.assists || 0;
              const winRate = Math.min(95, 70 + Math.floor(goals / 2)); // Calculate win rate from goals
              const playerImage = player.imageUrl;
              
              return (
                <div
                  key={player.id || idx}
                  className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm"
                >
                  <div className="relative h-64 overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
                    {playerImage ? (
                      <img
                        src={playerImage}
                        alt={player.name || "Top player"}
                        className="h-full w-full object-cover opacity-90"
                        style={{ objectPosition: 'center 25%' }}
                        onError={(e) => {
                          // Hide image and show placeholder on error
                          e.target.style.display = "none";
                          const placeholder = e.target.nextElementSibling;
                          if (placeholder) {
                            placeholder.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    {(!playerImage || playerImage === "") && (
                      <div className="flex h-full items-center justify-center">
                        <Users className="h-24 w-24 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute right-3 top-3 rounded-full border border-blue-500/30 bg-blue-500/40 px-3 py-1 backdrop-blur-sm">
                      <span className="text-xs font-semibold text-blue-200">
                        {player.position || "Player"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 text-lg font-semibold text-white">{player.name || "Unknown Player"}</h3>
                    <p className="mb-4 text-sm text-zinc-400">{team.name || "Unknown Team"}</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-[#5da2ff]" />
                          <span className="text-sm text-zinc-300">
                            {selectedSport === "f1" ? "Points" : "Goals"}
                          </span>
                        </div>
                        <span className="font-semibold text-white">{goals}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-[#b96bff]" />
                          <span className="text-sm text-zinc-300">
                            {selectedSport === "f1" ? "Wins" : "Assists"}
                          </span>
                        </div>
                        <span className="font-semibold text-white">{assists}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">Performance</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-[#5da2ff]"
                              style={{ width: `${winRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-white">{winRate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Latest News Section (text-focused, no images) */}
      <section className="mx-auto max-w-[95%] px-8 py-16 lg:px-12">
        <div className="mb-8 text-center space-y-2">
          <h2 className="mb-1 text-4xl font-bold text-white">Latest News</h2>
          <p className="text-sm text-zinc-400">
            Headlines and quick bites from around the football world.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loadingNews ? (
            <div className="col-span-3 text-center text-zinc-400">Loading news...</div>
          ) : news.length === 0 ? (
            <div className="col-span-3 text-center text-zinc-400">No news available</div>
          ) : (
            news.map((article, idx) => (
              <article
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#050815] via-[#050811] to-[#050810] p-6 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1 hover:border-[#5da2ff]/60"
              >
                {/* Pill + timestamp row */}
                <div className="mb-4 flex items-center justify-between text-xs">
                  <span
                    className={`rounded-full px-3 py-1 font-semibold ${getCategoryColor(
                      article.category
                    )}`}
                  >
                    {article.category || "Highlights"}
                  </span>
                  <span className="text-zinc-500">
                    {article.timestamp || article.publishedAt || "Recently"}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-white line-clamp-2 group-hover:text-[#5da2ff]">
                  {article.title || "Football News"}
                </h3>

                {/* Body + meta */}
                <p className="mb-4 text-sm text-zinc-400 line-clamp-3">
                  {article.description || "Latest updates from the world of football."}
                </p>

                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-[#5da2ff]" />
                    {article.source || "ArenaX Wire"}
                  </span>
                  <button className="flex items-center gap-1 text-[#5da2ff] hover:text-[#78b4ff]">
                    Read more
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
