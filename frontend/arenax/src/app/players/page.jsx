"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Target, Trophy, TrendingUp, Star, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

function PlayersContent() {
  const searchParams = useSearchParams();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Players");
  
  // Get search query and sport from URL
  const searchQuery = searchParams.get("q") || "";
  const sport = searchParams.get("sport") || "football";

  useEffect(() => {
    async function loadPlayers() {
      try {
        setLoading(true);
        setError("");
        
        const endpoint = sport === "f1"
          ? `${API_URL}/api/f1/drivers?sport=f1`
          : `${API_URL}/api/football/players?sport=football`;
        
        const res = await fetch(endpoint).catch((fetchErr) => {
          // Network error or CORS issue
          console.warn(`Failed to fetch ${sport === "f1" ? "drivers" : "players"} (backend may be offline):`, fetchErr.message);
          return null;
        });

        if (!res) {
          setError("Unable to connect to the server. Please check if the backend is running.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch ${sport === "f1" ? "drivers" : "players"} (${res.status})`);
        }
        
        const data = await res.json().catch(() => ({}));
        
        if (sport === "f1") {
          // Map F1 drivers to players format
          const drivers = Array.isArray(data.drivers) ? data.drivers : [];
          setPlayers(drivers.map(driver => ({
            player: {
              id: driver.id,
              name: driver.name,
              position: driver.code || driver.nationality,
              imageUrl: driver.imageUrl,
            },
            team: { name: driver.nationality },
            goals: driver.points || 0,
            assists: driver.wins || 0,
            rating: 8.5 + (driver.points || 0) / 100,
            mvps: driver.wins || 0,
            matches: 22,
          })));
        } else {
          const apiPlayers = Array.isArray(data.scorers) ? data.scorers : [];
          setPlayers(apiPlayers);
        }
      } catch (err) {
        console.warn(`Error fetching ${sport === "f1" ? "drivers" : "players"}:`, err.message);
        setError(err.message || `Failed to load ${sport === "f1" ? "drivers" : "players"} from the API.`);
      } finally {
        setLoading(false);
      }
    }

    loadPlayers();
  }, [sport]);

  // Filter players by position (only for football)
  const positionMap = {
    "Strikers": ["Forward", "Striker", "Attacker"],
    "Midfielders": ["Midfielder", "Central Midfielder", "Attacking Midfielder", "Defensive Midfielder"],
    "Defenders": ["Defender", "Centre-Back", "Full-Back", "Wing-Back"],
  };

  const filteredPlayers = useMemo(() => {
    let filtered = players;

    // Filter by position (only for football)
    if (sport !== "f1" && activeFilter !== "All Players") {
      const positions = positionMap[activeFilter] || [];
      filtered = filtered.filter((p) => {
        const playerPosition = p.player?.position || "";
        return positions.some((pos) =>
          playerPosition.toLowerCase().includes(pos.toLowerCase())
        );
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const name = p.player?.name || "";
        const team = p.team?.name || "";
        return (
          name.toLowerCase().includes(query) ||
          team.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [players, activeFilter, searchQuery, sport]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPlayers = players.length;
    const topScorer = players.reduce((max, p) => {
      const goals = p.goals || 0;
      return goals > (max.goals || 0) ? p : max;
    }, {});
    const mostMVPs = players.reduce((max, p) => {
      const mvps = p.mvps || 0;
      return mvps > (max.mvps || 0) ? p : max;
    }, {});
    const avgRating =
      players.length > 0
        ? (() => {
            const total = players.reduce((sum, p) => {
              // Normalise rating to a safe number (handles strings and missing values)
              const raw = typeof p.rating === "number" ? p.rating : parseFloat(p.rating);
              const rating = Number.isFinite(raw) ? raw : 8.5;
              return sum + rating;
            }, 0);
            return (total / players.length).toFixed(1);
          })()
        : "0.0";

    return {
      totalPlayers,
      topScorer: topScorer.player?.name || "—",
      mostMVPs: mostMVPs.player?.name || "—",
      avgRating,
    };
  }, [players]);

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteHeader />

      {/* Hero Section */}
      <section className="mx-auto max-w-[95%] px-8 pt-16 pb-10 lg:px-12 lg:pt-20">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl lg:text-6xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
              Elite
            </span>{" "}
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              {sport === "f1" ? "Drivers" : "Players"}
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            {sport === "f1"
              ? "Meet the world's fastest drivers competing in Formula 1."
              : "Meet the world's most talented athletes pushing the boundaries of sports."}
          </p>
        </div>

        {/* Search Bar - Hidden on desktop, shown on mobile as fallback */}
        {searchQuery && (
          <div className="max-w-md mx-auto mb-6 text-center">
            <p className="text-sm text-zinc-400">
              Showing results for: <span className="text-white font-medium">"{searchQuery}"</span>
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Users2 className="h-6 w-6 text-[#5da2ff]" />
              <p className="text-xs uppercase tracking-wide text-zinc-400">Total Players</p>
            </div>
            <p className="text-3xl font-bold">{stats.totalPlayers}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Target className="h-6 w-6 text-[#b96bff]" />
              <p className="text-xs uppercase tracking-wide text-zinc-400">Top Scorer</p>
            </div>
            <p className="text-2xl font-bold truncate">{stats.topScorer}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-green-400" />
              <p className="text-xs uppercase tracking-wide text-zinc-400">Most MVPs</p>
            </div>
            <p className="text-2xl font-bold truncate">{stats.mostMVPs}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-[#5ef0ff]" />
              <p className="text-xs uppercase tracking-wide text-zinc-400">Avg Rating</p>
            </div>
            <p className="text-3xl font-bold">{stats.avgRating}</p>
          </div>
        </div>

        {/* Position Filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          {["All Players", "Strikers", "Midfielders", "Defenders"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-6 py-2.5 transition-colors text-sm font-medium ${
                activeFilter === filter
                  ? "bg-[#5da2ff] text-black font-semibold"
                  : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Players Grid */}
      <section className="mx-auto max-w-[95%] px-8 pb-16 lg:px-12">
        {loading ? (
          <div className="py-16 text-center text-zinc-400">Loading players...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-400">{error}</div>
        ) : filteredPlayers.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">No players found.</div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPlayers.map((item, index) => {
              const player = item.player || {};
              const team = item.team || {};
              const goals = item.goals || 0;
              const assists = item.assists || 0;
              const mvps = item.mvps || Math.floor(Math.random() * 25) + 10; // Fallback MVPs
              const matches = item.matches || Math.floor(Math.random() * 50) + 120; // Fallback matches
              const winRate = item.winRate || Math.floor(Math.random() * 15) + 80; // Fallback win rate
              const rating = item.rating || (8.5 + Math.random() * 1.0).toFixed(1); // Fallback rating
              const position = player.position || "Player";

              // Determine position category for badge color
              const getPositionColor = () => {
                if (position.toLowerCase().includes("striker") || position.toLowerCase().includes("forward")) {
                  return "bg-purple-500/20 text-purple-300 border-purple-500/30";
                }
                if (position.toLowerCase().includes("midfielder")) {
                  return "bg-blue-500/20 text-blue-300 border-blue-500/30";
                }
                if (position.toLowerCase().includes("defender")) {
                  return "bg-green-500/20 text-green-300 border-green-500/30";
                }
                return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
              };

              return (
                <article
                  key={`${player.id || player.name}-${index}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-[#5da2ff]/50 transition-all"
                >
                  {/* Player Image */}
                  <div className="relative h-64 bg-gradient-to-t from-black via-black/40 to-transparent">
                    {player.imageUrl ? (
                      <img
                        src={player.imageUrl}
                        alt={player.name || "Player"}
                        className="h-full w-full object-cover"
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
                    {(!player.imageUrl || player.imageUrl === "") && (
                      <div className="flex h-full items-center justify-center text-zinc-500">
                        <Users2 className="h-16 w-16" />
                      </div>
                    )}
                    {/* Position Badge */}
                    <div className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-medium ${getPositionColor()}`}>
                      {position}
                    </div>
                    {/* Rating Badge */}
                    <div className="absolute right-4 top-4 rounded-lg bg-black/60 backdrop-blur-sm px-3 py-1.5 flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold">{rating}</span>
                    </div>
                    {/* Rank Number */}
                    <div className="absolute left-4 bottom-4 rounded-lg bg-white text-black w-12 h-12 flex items-center justify-center text-2xl font-bold">
                      {index + 1}
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="space-y-5 p-6">
                    <div>
                      <h2 className="text-xl font-semibold">{player.name || "Unknown Player"}</h2>
                      <p className="mt-1 text-sm text-zinc-400">{team.name || "No Team"}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-[#5da2ff]" />
                          <p className="text-xs text-zinc-400">Goals</p>
                        </div>
                        <p className="text-lg font-semibold text-[#5da2ff]">{goals}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-[#b96bff]" />
                          <p className="text-xs text-zinc-400">Assists</p>
                        </div>
                        <p className="text-lg font-semibold text-[#b96bff]">{assists}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="h-4 w-4 text-green-400" />
                          <p className="text-xs text-zinc-400">MVPs</p>
                        </div>
                        <p className="text-lg font-semibold text-green-400">{mvps}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Users2 className="h-4 w-4 text-zinc-400" />
                          <p className="text-xs text-zinc-400">Matches</p>
                        </div>
                        <p className="text-sm font-semibold text-white">{matches}</p>
                      </div>
                    </div>

                    {/* Win Rate */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-zinc-400">Win Rate</p>
                        <p className="text-sm font-semibold">{winRate}%</p>
                      </div>
                      <div className="relative h-2 bg-black/40 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#5da2ff] to-[#5ef0ff] rounded-full transition-all"
                          style={{ width: `${winRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}

export default function PlayersPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white">
          <SiteHeader />
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="text-zinc-400">Loading...</div>
          </div>
        </main>
      }
    >
      <PlayersContent />
    </Suspense>
  );
}

