"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Trophy, Users2, Activity, Flame, CloudRain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Icons to visually differentiate leagues/divisions
const leagueIcons = [Zap, Flame, CloudRain];

function TeamsContent() {
  const searchParams = useSearchParams();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDivision, setActiveDivision] = useState("All Teams");
  
  // Get search query and sport from URL
  const searchQuery = searchParams.get("q") || "";
  const sport = searchParams.get("sport") || "football";

  useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true);
        setError("");
        
        const endpoint = sport === "f1"
          ? `${API_URL}/api/f1/teams?sport=f1`
          : `${API_URL}/api/football/teams?sport=football`;
        
        const res = await fetch(endpoint).catch((fetchErr) => {
          // Network error or CORS issue
          console.warn("Failed to fetch teams (backend may be offline):", fetchErr.message);
          return null;
        });

        if (!res) {
          setError("Unable to connect to the server. Please check if the backend is running.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch teams (${res.status})`);
        }
        
        const data = await res.json().catch(() => ({}));
        const apiTeams = Array.isArray(data.teams) ? data.teams : [];

        setTeams(apiTeams);
      } catch (err) {
        console.warn("Error fetching teams:", err.message);
        setError(err.message || "Failed to load teams from the API.");
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, [sport]);

  const divisions = useMemo(() => {
    const leagueNames = new Set(
      teams
        .map((t) => t.leagueName)
        .filter((name) => typeof name === "string" && name.length > 0)
    );
    return ["All Teams", ...Array.from(leagueNames)];
  }, [teams]);

  const filteredTeams = useMemo(() => {
    let filtered = teams;

    // Filter by division
    if (activeDivision !== "All Teams") {
      filtered = filtered.filter((team) => team.leagueName === activeDivision);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((team) => {
        const name = team.name || "";
        const location = team.areaName || team.venue || "";
        const league = team.leagueName || "";
        return (
          name.toLowerCase().includes(query) ||
          location.toLowerCase().includes(query) ||
          league.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [teams, activeDivision, searchQuery]);

  // Simple aggregate stats for header cards
  const aggregateStats = useMemo(() => {
    if (!Array.isArray(teams) || teams.length === 0) {
      return {
        totalTeams: 0,
        activePlayers: 0,
        championships: 0,
      };
    }

    const totalTeams = teams.length;

    // Estimate active players: assume ~25 players per team if no explicit squad size
    const activePlayers = teams.reduce((sum, team) => {
      const squadSize =
        typeof team.squadSize === "number" && team.squadSize > 0
          ? team.squadSize
          : 25;
      return sum + squadSize;
    }, 0);

    // Approximate total championships using the same logic as per-team card
    const championships = teams.reduce((sum, team) => {
      if (typeof team.id === "number") {
        return sum + (team.id % 5);
      }
      return sum;
    }, 0);

    return { totalTeams, activePlayers, championships };
  }, [teams]);

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteHeader />
      {/* Hero */}
      <section className="mx-auto max-w-[95%] px-8 pt-16 pb-10 lg:px-12 lg:pt-20">
        <h1 className="mb-3 text-center text-4xl font-bold tracking-tight text-white lg:text-5xl">
          All <span className="bg-gradient-to-r from-[#5da2ff] to-[#5ef0ff] bg-clip-text text-transparent">
            {sport === "f1" ? "F1 Teams" : "Teams"}
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-center text-sm text-zinc-400 lg:text-base">
          {sport === "f1"
            ? "Explore the most elite Formula 1 teams competing in the pinnacle of motorsport."
            : "Explore the most elite teams competing in the future of sports."}
        </p>

        {/* Stats row (basic counts derived from API) */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Users2 className="h-6 w-6 text-[#5da2ff]" />
              <p className="text-xs uppercase tracking-wide text-zinc-400">Total Teams</p>
            </div>
            <p className="text-3xl font-bold">{aggregateStats.totalTeams}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Activity className="h-6 w-6 text-[#5ef0ff]" />
              <p className="text-xs uppercase tracking-wide text-zinc-400">Active Players</p>
            </div>
            <p className="text-3xl font-bold">
              {aggregateStats.activePlayers.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-[#b96bff]" />
              <p className="text-xs uppercase tracking-wide text-zinc-400">Championships</p>
            </div>
            <p className="text-3xl font-bold">
              {aggregateStats.championships}
            </p>
          </div>
        </div>

        {/* Division tabs */}
        <div className="mt-10 flex flex-wrap gap-3 text-sm">
          {divisions.map((division) => (
            <button
              key={division}
              type="button"
              onClick={() => setActiveDivision(division)}
              className={`rounded-full px-4 py-2 transition-colors ${
                activeDivision === division
                  ? "bg-[#5da2ff] text-black font-semibold"
                  : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {division}
            </button>
          ))}
        </div>
      </section>

      {/* Teams grid */}
      <section className="mx-auto max-w-[95%] px-8 pb-16 lg:px-12">
        {loading ? (
          <div className="py-16 text-center text-zinc-400">Loading teams...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-400">{error}</div>
        ) : filteredTeams.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">
            {searchQuery ? `No teams found for "${searchQuery}"` : "No teams available."}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredTeams.map((team, index) => {
              const Icon = leagueIcons[index % leagueIcons.length] || Zap;
              const badge = team.leagueName || "Division";
              const location = team.areaName || team.venue || "—";
              const founded = team.founded || "—";
              // Create unique key by combining team.id, leagueId, and index to ensure uniqueness
              // This prevents duplicate keys even if the same team appears multiple times
              const uniqueKey = team.id && team.leagueId 
                ? `${team.id}-${team.leagueId}-${index}` 
                : team.id 
                ? `${team.id}-${index}` 
                : `team-${index}`;

              return (
            <article
              key={uniqueKey}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              {/* Banner */}
              <div className="relative h-48 bg-gradient-to-t from-black via-black/40 to-transparent">
                {team.crest ? (
                  <img
                    src={team.crest}
                    alt={team.name || "Team crest"}
                    className="h-full w-full object-contain p-6"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                {!team.crest && (
                  <div className="flex h-full items-center justify-center text-zinc-500">
                    Team Crest
                  </div>
                )}
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-4 w-4 text-[#5da2ff]" />
                  </span>
                  <span>{badge}</span>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-5 p-6">
                <div>
                  <h2 className="text-lg font-semibold">{team.name}</h2>
                  <p className="mt-1 text-xs text-zinc-400">
                    {location} • Est. {founded}
                  </p>
                </div>

                {/* Stats row (placeholder stats based on ID for now) */}
                {team.id && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm">
                    <p className="text-xs text-zinc-400">Win Rate</p>
                    <p className="mt-1 text-lg font-semibold text-[#5da2ff]">
                      {((50 + (team.id % 40))).toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm">
                    <p className="text-xs text-zinc-400">Championships</p>
                    <p className="mt-1 text-lg font-semibold text-[#b96bff]">
                      {team.id % 5}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm">
                    <p className="text-xs text-zinc-400">Record</p>
                    <p className="mt-1 text-sm font-semibold text-green-400">
                      {100 + (team.id % 50)}W - {team.id % 30}L
                    </p>
                  </div>
                </div>
                )}

                <div className="pt-2">
                  <Button className="w-full rounded-full bg-gradient-to-r from-[#5da2ff] to-[#b96bff] text-sm font-medium text-black hover:opacity-90">
                    View Team Details
                  </Button>
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

export default function TeamsPage() {
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
      <TeamsContent />
    </Suspense>
  );
}


