"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, ArrowRight, Newspaper } from "lucide-react";
import { API_URL } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Helper to style category pills
function getCategoryColor(category) {
  const colors = {
    Highlights: "bg-blue-500/20 text-blue-400",
    Interviews: "bg-purple-500/20 text-purple-400",
    Insights: "bg-green-500/20 text-green-400",
  };
  return colors[category] || "bg-gray-500/20 text-gray-400";
}

function NewsContent() {
  const searchParams = useSearchParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Get search query from URL
  const searchQuery = searchParams.get("q") || "";

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        setError("");
        
        const res = await fetch(`${API_URL}/api/football/news?sport=football`).catch((fetchErr) => {
          // Network error or CORS issue
          console.warn("Failed to fetch news (backend may be offline):", fetchErr.message);
          return null;
        });

        if (!res) {
          setError("Unable to connect to the server. Please check if the backend is running.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch news (${res.status})`);
        }
        
        const data = await res.json().catch(() => ({}));
        const apiNews = Array.isArray(data.articles) ? data.articles : [];

        setNews(apiNews);
      } catch (err) {
        console.warn("Error fetching news:", err.message);
        setError(err.message || "Failed to load news from the API.");
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  // Filter news by search query
  const filteredNews = useMemo(() => {
    if (!searchQuery.trim()) {
      return news;
    }
    
    const query = searchQuery.toLowerCase();
    return news.filter((article) => {
      const title = article.title || "";
      const description = article.description || "";
      const category = article.category || "";
      
      return (
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query)
      );
    });
  }, [news, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteHeader />

      {/* Hero Section */}
      <section className="mx-auto max-w-[95%] px-8 pt-16 pb-10 lg:px-12 lg:pt-20">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl lg:text-6xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
              Latest
            </span>{" "}
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              News
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Stay updated with the latest happenings in the world of sports.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Newspaper className="h-6 w-6 text-[#5da2ff]" />
              <p className="text-xs uppercase tracking-wide text-zinc-400">Total Articles</p>
            </div>
            <p className="text-3xl font-bold">{news.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-[#b96bff]" />
              <p className="text-xs uppercase tracking-wide text-zinc-400">Today</p>
            </div>
            <p className="text-3xl font-bold">{news.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <ArrowRight className="h-6 w-6 text-[#5ef0ff]" />
              <p className="text-xs uppercase tracking-wide text-zinc-400">Featured</p>
            </div>
            <p className="text-3xl font-bold">{Math.min(news.length, 3)}</p>
          </div>
        </div>

        {/* Search indicator */}
        {searchQuery && (
          <div className="max-w-md mx-auto mb-6 text-center">
            <p className="text-sm text-zinc-400">
              Showing results for: <span className="text-white font-medium">"{searchQuery}"</span>
            </p>
          </div>
        )}
      </section>

      {/* News grid - text focused, no images (matches home page style) */}
      <section className="mx-auto max-w-[95%] px-8 pb-16 lg:px-12">
        {loading ? (
          <div className="py-16 text-center text-zinc-400">Loading news...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-400">{error}</div>
        ) : filteredNews.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">
            {searchQuery ? `No news found for "${searchQuery}"` : "No news available."}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredNews.map((article, idx) => (
              <article
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#050815] via-[#050811] to-[#050810] p-6 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1 hover:border-[#5da2ff]/60"
              >
                {/* Category + timestamp */}
                <div className="mb-4 flex items-center justify-between text-xs">
                  <span
                    className={`rounded-full px-3 py-1 font-semibold ${getCategoryColor(
                      article.category
                    )}`}
                  >
                    {article.category || "Highlights"}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(article.publishedAt)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-white line-clamp-2 group-hover:text-[#5da2ff]">
                  {article.title || "Football News"}
                </h3>

                {/* Description */}
                <p className="mb-4 text-sm text-zinc-400 line-clamp-3">
                  {article.description || "Latest updates from the world of football."}
                </p>

                {/* Footer meta */}
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
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}

export default function NewsPage() {
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
      <NewsContent />
    </Suspense>
  );
}


