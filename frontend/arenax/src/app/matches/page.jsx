"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";

// Helper to calculate countdown until match
function calculateCountdown(dateString) {
  const matchDate = new Date(dateString);
  const now = new Date();
  const diff = matchDate - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_URL}/api/football/matches?sport=football`
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch matches (${res.status})`);
        }
        const data = await res.json().catch(() => ({}));
        const apiMatches = Array.isArray(data.matches) ? data.matches : [];

        setMatches(apiMatches);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError("Failed to load matches from the football API.");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  const competitions = useMemo(() => {
    const names = new Set(
      matches
        .map((m) => m.competition?.name)
        .filter((n) => typeof n === "string" && n.length > 0)
    );
    return Array.from(names);
  }, [matches]);

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteHeader />

      {/* Hero & stats */}
      <section className="mx-auto max-w-[95%] px-8 pt-16 pb-10 lg:px-12 lg:pt-20">
        <h1 className="mb-3 text-center text-4xl font-bold tracking-tight text-white lg:text-5xl">
          Upcoming{" "}
          <span className="bg-gradient-to-r from-[#5da2ff] to-[#5ef0ff] bg-clip-text text-transparent">
            Matches
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-center text-sm text-zinc-400 lg:text-base">
          Don&apos;t miss the action from the biggest football competitions
          around the world.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Total Matches
            </p>
            <p className="mt-3 text-3xl font-bold">{matches.length || 0}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Competitions
            </p>
            <p className="mt-3 text-3xl font-bold">
              {competitions.length || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-zinc-400">
              Highlighted
            </p>
            <p className="mt-3 text-3xl font-bold">
              {Math.min(matches.length, 6)}
            </p>
          </div>
        </div>
      </section>

      {/* Matches grid */}
      <section className="mx-auto max-w-[95%] px-8 pb-16 lg:px-12">
        {loading ? (
          <div className="py-16 text-center text-zinc-400">
            Loading matches...
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-400">{error}</div>
        ) : matches.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">
            No upcoming matches.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((match, idx) => {
              const countdown = calculateCountdown(match.utcDate);
              const teamColors = [
                "text-yellow-400",
                "text-orange-500",
                "text-blue-400",
                "text-green-400",
              ];
              const team1Color = teamColors[idx % teamColors.length];
              const team2Color = teamColors[(idx + 1) % teamColors.length];

              return (
                <article
                  key={match.id || `${match.homeTeam?.name}-${idx}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className={`h-6 w-6 ${team1Color}`} />
                      <span className="font-semibold text-white">
                        {match.homeTeam?.name || "Home Team"}
                      </span>
                    </div>
                    <span className="font-bold text-white">VS</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">
                        {match.awayTeam?.name || "Away Team"}
                      </span>
                      <Flame className={`h-6 w-6 ${team2Color}`} />
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
                      <span>
                        {match.venue ||
                          match.competition?.name ||
                          "Venue to be announced"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {match.competition?.name || ""}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500">Time until match:</p>
                    <div className="flex gap-3">
                      <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-center">
                        <p className="text-lg font-bold text-white">
                          {countdown.days}
                        </p>
                        <p className="text-xs text-zinc-400">Days</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-center">
                        <p className="text-lg font-bold text-white">
                          {countdown.hours}
                        </p>
                        <p className="text-xs text-zinc-400">Hours</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-center">
                        <p className="text-lg font-bold text-white">
                          {countdown.minutes}
                        </p>
                        <p className="text-xs text-zinc-400">Minutes</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <Button className="rounded-full bg-[#5da2ff] px-6 py-2 text-sm font-medium text-black hover:bg-[#78b4ff]">
                      View Match Details
                    </Button>
                    <p className="text-xs text-zinc-500">
                      Match ID:{" "}
                      <span className="font-mono text-zinc-300">
                        {match.id || "TBA"}
                      </span>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}


