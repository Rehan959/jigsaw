"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Search, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { isSafeUrl } from "@/lib/utils";

interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: {
    sourceId: string;
    url: string;
    title: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

const suggestedQueries = [
  "How does web scraping work?",
  "What are vector embeddings?",
  "Explain semantic search",
  "Benefits of MCP integration",
];

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const words = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  if (words.length === 0) return text;

  const pattern = new RegExp(`(${words.map(escapeRegex).join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const isMatch = words.some(
      (w) => part.toLowerCase() === w.toLowerCase()
    );
    return isMatch ? (
      <mark
        key={i}
        className="bg-primary/20 text-foreground rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    );
  });
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-6 lg:p-8">
          <div className="max-w-4xl mx-auto text-center py-16">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mx-auto mb-4" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mx-auto" />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const prefersReducedMotion = useReducedMotion();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = useCallback(async (e: React.FormEvent, searchQuery?: string) => {
    e.preventDefault();
    const q = searchQuery ?? query;
    if (!q.trim()) return;

    setLoading(true);
    setSearched(true);
    const startTime = Date.now();

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: q, limit: 10 }),
      });
      const data = await res.json();
      setResults(data.results || []);
      setSearchTime(Date.now() - startTime);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(
        new Event("submit") as unknown as React.FormEvent,
        initialQuery
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    const syntheticEvent = new Event("submit") as unknown as React.FormEvent;
    handleSearch(syntheticEvent, suggestion);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Badge variant="secondary" className="gap-2 mb-4">
            <Search className="h-3.5 w-3.5" />
            Semantic Search
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter mb-4">
            <span className="text-primary">Search</span> Knowledge Base
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-light">
            Find relevant content across all your crawled sources using
            AI-powered semantic search
          </p>
        </motion.div>

        <form
          onSubmit={(e) => handleSearch(e)}
          className="relative max-w-2xl mx-auto"
          role="search"
        >
          <div className="flex items-center gap-2 border border-border rounded-xl bg-card p-2 shadow-sm">
            <div className="flex-1 flex items-center px-3">
              <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for anything..."
                className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground outline-none py-3"
                aria-label="Search query"
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    setSearched(false);
                  }}
                  className="h-8 w-8"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </form>

        {!searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-muted-foreground text-sm">Try:</span>
            {suggestedQueries.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-sm"
              >
                {suggestion}
              </Button>
            ))}
          </motion.div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-5 w-3/4 bg-muted animate-pulse rounded mb-3" />
                  <div className="h-4 w-1/2 bg-muted animate-pulse rounded mb-4" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try different keywords or make sure you have indexed sources.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">
                  <span className="text-primary">{results.length}</span>{" "}
                  results found
                </h2>
                {searchTime > 0 && (
                  <span className="text-sm text-muted-foreground">
                    in {(searchTime / 1000).toFixed(2)}s
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                for &ldquo;{query}&rdquo;
              </span>
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : index * 0.04 }}
                >
                  <Card className="group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <a
                            href={isSafeUrl(result.metadata.url) ? result.metadata.url : "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-foreground hover:text-primary transition-colors duration-200 line-clamp-1 group-hover:underline"
                          >
                            {highlightText(
                              result.metadata.title,
                              query
                            )}
                          </a>
                          <a
                            href={isSafeUrl(result.metadata.url) ? result.metadata.url : "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 line-clamp-1 block mt-1"
                          >
                            {result.metadata.url}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={
                              result.score >= 0.8
                                ? "success"
                                : result.score >= 0.6
                                ? "default"
                                : "warning"
                            }
                          >
                            {(result.score * 100).toFixed(1)}% match
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-4 text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {highlightText(result.content, query)}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5" />
                          Section {result.metadata.chunkIndex + 1} of{" "}
                          {result.metadata.totalChunks}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Search className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start searching</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a query above to search through your knowledge base.
              JigSaw uses AI to understand the meaning behind your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
