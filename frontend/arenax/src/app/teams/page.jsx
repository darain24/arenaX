"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy, Users2, Activity, Flame, CloudRain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";

// Icons to visually differentiate leagues/divisions
const leagueIcons = [Zap, Flame, CloudRain];

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDivision, setActiveDivision] = useState("All Teams");

  useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_URL}/api/football/teams?sport=football`);
        if (!res.ok) {
          throw new Error(`Failed to fetch teams (${res.status})`);
        }
        const data = await res.json().catch(() => ({}));
        const apiTeams = Array.isArray(data.teams) ? data.teams : [];

        setTeams(apiTeams);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Failed to load teams from the football API.");
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, []);

  const divisions = useMemo(() => {
    const leagueNames = new Set(
      teams
        .map((t) => t.leagueName)
        .filter((name) => typeof name === "string" && name.length > 0)
    );
    return ["All Teams", ...Array.from(leagueNames)];
  }, [teams]);

  const filteredTeams =
    activeDivision === "All Teams"
      ? teams
      : teams.filter((team) => team.leagueName === activeDivision);

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteHeader />
      {/* Hero */}
      <section className="mx-auto max-w-[95%] px-8 pt-16 pb-10 lg:px-12 lg:pt-20">
        <h1 className="mb-3 text-center text-4xl font-bold tracking-tight text-white lg:text-5xl">
          All <span className="bg-gradient-to-r from-[#5da2ff] to-[#5ef0ff] bg-clip-text text-transparent">Teams</span>
        </h1>
        <p className="mx-auto max-w-2xl text-center text-sm text-zinc-400 lg:text-base">
          Explore the most elite teams competing in the future of sports.
        </p>

        {/* Stats row (basic counts derived from API) */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Users2 className="h-6 w-6 text-[#5da2ff]" />
              <p className="text-xs uppercase tracking-wide text-zinc-400">Total Teams</p>
            </div>
            <p className="text-3xl font-bold">{teams.length || 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Activity className="h-6 w-6 text-[#5ef0ff]" />
              <p className="text-xs uppercase tracking-wide text-zinc-400">Active Players</p>
            </div>
            <p className="text-3xl font-bold">—</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-[#b96bff]" />
              <p className="text-xs uppercase tracking-wide text-zinc-400">Championships</p>
            </div>
            <p className="text-3xl font-bold">—</p>
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
          <div className="py-16 text-center text-zinc-400">No teams available.</div>
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

      {/* Simple footer reuse from home page */}
      <footer className="border-t border-white/5 bg-black py-10">
        <div className="mx-auto flex max-w-[95%] flex-col items-center justify-between gap-4 px-8 text-xs text-white/70 lg:flex-row lg:px-12">
          <p>© 2025 ArenaX Sports. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button type="button" className="hover:text-zinc-300">
              Privacy Policy
            </button>
            <button type="button" className="hover:text-zinc-300">
              Terms of Service
            </button>
            <button type="button" className="hover:text-zinc-300">
              Cookie Policy
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}


