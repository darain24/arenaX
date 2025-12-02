"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Users, Calendar, Clock, MapPin, ShoppingCart, Star, Eye, Trophy, TrendingUp, BarChart3, Users2, Glasses, Zap, Flame, ArrowRight, Mail } from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaFootballBall, FaBasketballBall, FaCar } from "react-icons/fa";
import { GiCricketBat } from "react-icons/gi";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";

const navLinks = ["Home", "Teams", "Matches", "Players", "News", "Contact"];

// Hero Section Data
const heroStats = [
  { value: "150+", label: "Active Teams", color: "text-[#5da2ff]" },
  { value: "2.5M", label: "Fans Worldwide", color: "text-[#b96bff]" },
  { value: "1000+", label: "Live Matches", color: "text-[#65ff6d]" },
];

// Feature Cards Data
const features = [
  {
    icon: TrendingUp,
    title: "Live Match Tracking",
    description: "Real-time updates and comprehensive match analytics at your fingertips.",
    iconColor: "text-[#5da2ff]",
  },
  {
    icon: BarChart3,
    title: "Player Performance Analytics",
    description: "Deep dive into player statistics with AI-powered insights and predictions.",
    iconColor: "text-[#b96bff]",
  },
  {
    icon: Users2,
    title: "Fan Community Hub",
    description: "Connect with millions of fans worldwide in our interactive community.",
    iconColor: "text-[#65ff6d]",
  },
  {
    icon: Glasses,
    title: "VR/AR Match Highlights",
    description: "Experience matches like never before with immersive VR and AR technology.",
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
  const [selectedSport, setSelectedSport] = useState(null); // null = all sports, "football" = football only
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);

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

    // Fetch matches
    setLoadingMatches(true);
    const sportParam = selectedSport ? `?sport=${selectedSport}` : "";
    fetch(`${API_URL}/api/football/matches${sportParam}`)
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (data.matches && Array.isArray(data.matches)) {
          setMatches(data.matches.slice(0, 8)); // Show first 8 matches
        }
      })
      .catch((err) => {
        console.error("Error fetching matches:", err);
      })
      .finally(() => {
        setLoadingMatches(false);
      });

    // Fetch top players
    setLoadingPlayers(true);
    fetch(`${API_URL}/api/football/players${sportParam}`)
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (data.scorers && Array.isArray(data.scorers)) {
          setPlayers(data.scorers.slice(0, 4)); // Show top 4 players
        }
      })
      .catch((err) => {
        console.error("Error fetching players:", err);
      })
      .finally(() => {
        setLoadingPlayers(false);
      });

    // Fetch news
    setLoadingNews(true);
    fetch(`${API_URL}/api/football/news${sportParam}`)
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (data.articles && Array.isArray(data.articles)) {
          setNews(data.articles.slice(0, 6)); // Show 6 news items
        }
      })
      .catch((err) => {
        console.error("Error fetching news:", err);
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

          {/* Sport Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => setSelectedSport(selectedSport === "football" ? null : "football")}
              className={`flex items-center gap-3 rounded-full border px-6 py-4 text-white font-semibold text-base transition-colors duration-200 backdrop-blur-sm ${
                selectedSport === "football" 
                  ? "border-green-500/60 bg-green-500/30" 
                  : "border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
              }`}
            >
              <FaFootballBall className="h-5 w-5 text-green-400" />
              <span>Football</span>
            </button>
            <button 
              onClick={() => setSelectedSport(selectedSport === "f1" ? null : "f1")}
              className={`flex items-center gap-3 rounded-full border px-6 py-4 text-white font-semibold text-base transition-colors duration-200 backdrop-blur-sm ${
                selectedSport === "f1" 
                  ? "border-red-500/60 bg-red-500/30" 
                  : "border-red-500/30 bg-red-500/10 hover:bg-red-500/20"
              }`}
            >
              <FaCar className="h-5 w-5 text-red-400" />
              <span>F1</span>
            </button>
            <button 
              onClick={() => setSelectedSport(selectedSport === "cricket" ? null : "cricket")}
              className={`flex items-center gap-3 rounded-full border px-6 py-4 text-white font-semibold text-base transition-colors duration-200 backdrop-blur-sm ${
                selectedSport === "cricket" 
                  ? "border-yellow-500/60 bg-yellow-500/30" 
                  : "border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20"
              }`}
            >
              <GiCricketBat className="h-5 w-5 text-yellow-400" />
              <span>Cricket</span>
            </button>
            <button 
              onClick={() => setSelectedSport(selectedSport === "basketball" ? null : "basketball")}
              className={`flex items-center gap-3 rounded-full border px-6 py-4 text-white font-semibold text-base transition-colors duration-200 backdrop-blur-sm ${
                selectedSport === "basketball" 
                  ? "border-orange-500/60 bg-orange-500/30" 
                  : "border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20"
              }`}
            >
              <FaBasketballBall className="h-5 w-5 text-orange-400" />
              <span>Basketball</span>
            </button>
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

      {/* Upcoming Matches Section */}
      <section className="mx-auto max-w-[95%] px-8 py-16 lg:px-12">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl font-bold text-white">Upcoming Matches</h2>
          <p className="text-zinc-400">Don't miss the action</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {loadingMatches ? (
            <div className="col-span-full text-center text-zinc-400">Loading matches...</div>
          ) : matches.length === 0 ? (
            <div className="col-span-full text-center text-zinc-400">No upcoming matches</div>
          ) : (
            matches.map((match, idx) => {
              const countdown = calculateCountdown(match.utcDate);
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

      {/* Top Players Section */}
      <section className="mx-auto max-w-[95%] px-8 py-16 lg:px-12">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl font-bold">
            <span className="text-white">Top</span>{" "}
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Players
            </span>
          </h2>
          <p className="text-zinc-400">League's finest athletes</p>
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
                          <span className="text-sm text-zinc-300">Goals</span>
                        </div>
                        <span className="font-semibold text-white">{goals}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-[#b96bff]" />
                          <span className="text-sm text-zinc-300">Assists</span>
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

      {/* Latest News Section */}
      <section className="mx-auto max-w-[95%] px-8 py-16 lg:px-12">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl font-bold text-white">Latest News</h2>
          <p className="text-zinc-400">Stay updated with the latest happenings</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loadingNews ? (
            <div className="col-span-3 text-center text-zinc-400">Loading news...</div>
          ) : news.length === 0 ? (
            <div className="col-span-3 text-center text-zinc-400">No news available</div>
          ) : (
            news.map((article, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCategoryColor(article.category)}`}>
                    {article.category || "News"}
                  </span>
                  <span className="text-xs text-zinc-500">{article.timestamp || "Recently"}</span>
                </div>
                
                <div className="mb-4 h-48 overflow-hidden rounded-lg bg-black/40">
                  <img
                    src={article.imageUrl || newsFallbackImages[idx % newsFallbackImages.length]}
                    alt={article.title || "Football news"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-white">{article.title || "Football News"}</h3>
                <p className="mb-4 text-sm text-zinc-400 line-clamp-2">{article.description || "Latest updates from the world of football."}</p>
                
                <button className="flex items-center gap-2 text-sm font-medium text-[#5da2ff] hover:text-[#78b4ff]">
                  Read more <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black py-12">
        <div className="mx-auto max-w-[95%] px-8 lg:px-12">
          {/* Upper Section - Four Columns */}
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            {/* Brand Information */}
            <div>
              <h3 className="mb-4 bg-gradient-to-r from-[#5da2ff] to-[#b96bff] bg-clip-text text-xl font-bold text-transparent uppercase tracking-wide">
                ARENAX
              </h3>
              <p className="mb-6 text-sm text-white leading-relaxed">
                The future of sports starts here. Join millions of fans worldwide in the most advanced sports platform.
              </p>
              {/* Social Media Links */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-transparent text-white transition-colors hover:bg-white/10"
                  aria-label="Facebook"
                >
                  <FaFacebook className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-transparent text-white transition-colors hover:bg-white/10"
                  aria-label="Twitter"
                >
                  <FaTwitter className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-transparent text-white transition-colors hover:bg-white/10"
                  aria-label="Instagram"
                >
                  <FaInstagram className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-transparent text-white transition-colors hover:bg-white/10"
                  aria-label="YouTube"
                >
                  <FaYoutube className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white">
                <li>
                  <Link href="/" className="transition-colors hover:text-zinc-400">
                    Home
                  </Link>
                </li>
                <li>
                  <button type="button" className="transition-colors hover:text-zinc-400">
                    Teams
                  </button>
                </li>
                <li>
                  <button type="button" className="transition-colors hover:text-zinc-400">
                    Matches
                  </button>
                </li>
                <li>
                  <button type="button" className="transition-colors hover:text-zinc-400">
                    Players
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">Resources</h4>
              <ul className="space-y-2 text-sm text-white">
                <li>
                  <button type="button" className="transition-colors hover:text-zinc-400">
                    News
                  </button>
                </li>
                <li>
                  <button type="button" className="transition-colors hover:text-zinc-400">
                    Merchandise
                  </button>
                </li>
                <li>
                  <button type="button" className="transition-colors hover:text-zinc-400">
                    About Us
                  </button>
                </li>
                <li>
                  <button type="button" className="transition-colors hover:text-zinc-400">
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Stay Updated */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">Stay Updated</h4>
              <p className="mb-4 text-sm text-white leading-relaxed">
                Subscribe to get the latest news and updates delivered to your inbox.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#5da2ff]"
                />
                <Button className="rounded-lg bg-gradient-to-r from-[#5da2ff] to-[#b96bff] px-4 py-2.5 text-sm text-white hover:opacity-90">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Lower Section - Copyright and Policy Links */}
          <div className="border-t border-zinc-700/50 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-white">
                © 2025 ArenaX Sports. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-white">
                <button type="button" className="transition-colors hover:text-zinc-400">
                  Privacy Policy
                </button>
                <button type="button" className="transition-colors hover:text-zinc-400">
                  Terms of Service
                </button>
                <button type="button" className="transition-colors hover:text-zinc-400">
                  Cookie Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
