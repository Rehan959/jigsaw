"use client";

import { useState, useRef, useEffect } from "react";

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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    const startTime = Date.now();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, limit: 10 }),
        }
      );
      const data = await res.json();
      setResults(data.results || []);
      setSearchTime(Date.now() - startTime);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary-light text-sm font-medium mb-4">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Semantic Search
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Search</span> Knowledge Base
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Find relevant content across all your crawled sources using AI-powered semantic search
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <div className="glass-card rounded-2xl p-2 flex items-center gap-2 hover:border-primary/30 transition-all duration-300">
              <div className="flex-1 flex items-center px-4">
                <svg className="w-5 h-5 text-text-muted mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for anything..."
                  className="flex-1 bg-transparent text-lg text-text-primary placeholder-text-muted outline-none py-4"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
                    className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="btn-primary !px-8 !py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Searching...
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </form>

          {/* Suggested Queries */}
          {!searched && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-text-muted text-sm">Try:</span>
              {suggestedQueries.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 rounded-lg bg-bg-elevated/50 hover:bg-bg-elevated text-text-secondary hover:text-text-primary text-sm transition-all duration-200 border border-transparent hover:border-border"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-secondary rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              </div>
              <p className="text-text-secondary mt-4">Searching your knowledge base...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && searched && results.length === 0 && (
            <div className="text-center py-16 glass-card rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-elevated flex items-center justify-center">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-text-secondary max-w-md mx-auto">
                Try different keywords or make sure you have indexed sources. You can also try rephrasing your query.
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    <span className="text-primary-light">{results.length}</span> results found
                  </h2>
                  {searchTime > 0 && (
                    <span className="text-sm text-text-muted">
                      in {(searchTime / 1000).toFixed(2)}s
                    </span>
                  )}
                </div>
                <span className="text-sm text-text-muted">
                  for &ldquo;{query}&rdquo;
                </span>
              </div>

              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className="glass-card rounded-xl p-6 hover:border-primary/40 transition-all duration-300 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <a
                          href={result.metadata.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-text-primary hover:text-primary-light transition-colors line-clamp-1 group-hover:underline"
                        >
                          {result.metadata.title}
                        </a>
                        <a
                          href={result.metadata.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-text-muted hover:text-primary-light transition-colors line-clamp-1 block mt-1"
                        >
                          {result.metadata.url}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          result.score >= 0.8
                            ? "bg-success/10 text-success"
                            : result.score >= 0.6
                            ? "bg-primary/10 text-primary-light"
                            : "bg-warning/10 text-warning"
                        }`}>
                          {(result.score * 100).toFixed(1)}% match
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-text-secondary text-sm leading-relaxed line-clamp-3">
                      {result.content}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Chunk {result.metadata.chunkIndex + 1} of {result.metadata.totalChunks}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !searched && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <svg className="w-12 h-12 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start searching</h3>
              <p className="text-text-secondary max-w-md mx-auto">
                Enter a query above to search through your knowledge base.
                JigSaw uses AI to understand the meaning behind your search.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
