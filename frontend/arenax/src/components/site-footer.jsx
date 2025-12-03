"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-black py-12">
      <div className="mx-auto max-w-[95%] px-8 lg:px-12">
        {/* Upper Section - Three Columns */}
        <div className="grid gap-8 md:grid-cols-3 mb-8">
          {/* Brand / About */}
          <div>
            <h3 className="mb-4 bg-gradient-to-r from-[#5da2ff] to-[#b96bff] bg-clip-text text-xl font-bold text-transparent uppercase tracking-wide">
              ARENAX
            </h3>
            <p className="mb-6 text-sm text-white leading-relaxed">
              ArenaX is a personal hobby project that explores live football data, modern UI
              patterns, and full-stack web development.
            </p>
            <p className="text-xs text-zinc-400">
              Built for learning and experimentation—data, UI, and authentication flows may change
              frequently.
            </p>
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
                <Link href="/teams" className="transition-colors hover:text-zinc-400">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/matches" className="transition-colors hover:text-zinc-400">
                  Matches
                </Link>
              </li>
              <li>
                <Link href="/players" className="transition-colors hover:text-zinc-400">
                  Players
                </Link>
              </li>
              <li>
                <Link href="/news" className="transition-colors hover:text-zinc-400">
                  News
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack / Project info */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Built With</h4>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>Next.js &amp; React (App Router)</li>
              <li>Tailwind CSS</li>
              <li>Node.js, Express &amp; JWT auth</li>
              <li>PostgreSQL &amp; Prisma</li>
            </ul>
            <p className="mt-3 text-xs text-zinc-500">
              Want to share feedback? Use the contact page to send ideas or suggestions.
            </p>
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
  );
}


