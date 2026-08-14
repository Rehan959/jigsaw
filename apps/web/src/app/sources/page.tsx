"use client";

import { useState, useEffect } from "react";

interface Source {
  id: string;
  url: string;
  name: string;
  crawlFrequency: string | null;
  lastCrawledAt: string | null;
  createdAt: string;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSource, setNewSource] = useState({ url: "", name: "" });
  const [adding, setAdding] = useState(false);
  const [crawling, setCrawling] = useState<string | null>(null);

  const fetchSources = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/sources`
      );
      const data = await res.json();
      setSources(data.sources || []);
    } catch (error) {
      console.error("Failed to fetch sources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.url.trim()) return;

    setAdding(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/sources`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSource),
        }
      );
      if (res.ok) {
        setShowAddModal(false);
        setNewSource({ url: "", name: "" });
        fetchSources();
      }
    } catch (error) {
      console.error("Failed to add source:", error);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this source?")) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/sources/${id}`,
        { method: "DELETE" }
      );
      fetchSources();
    } catch (error) {
      console.error("Failed to delete source:", error);
    }
  };

  const handleCrawl = async (sourceId: string) => {
    setCrawling(sourceId);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/jobs/crawl/${sourceId}`,
        { method: "POST" }
      );
    } catch (error) {
      console.error("Failed to start crawl:", error);
    } finally {
      setCrawling(null);
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary-light text-sm font-medium mb-3">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Sources
              </div>
              <h1 className="text-3xl font-bold">
                <span className="gradient-text">Sources</span>
              </h1>
              <p className="text-text-secondary mt-2">
                Manage your web sources and crawling schedule
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Source
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      {!loading && sources.length > 0 && (
        <section className="py-6 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-4">
                <div className="text-2xl font-bold">{sources.length}</div>
                <div className="text-sm text-text-muted">Total Sources</div>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="text-2xl font-bold text-primary-light">
                  {sources.filter((s) => s.lastCrawledAt).length}
                </div>
                <div className="text-sm text-text-muted">Crawled</div>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="text-2xl font-bold text-warning">
                  {sources.filter((s) => !s.lastCrawledAt).length}
                </div>
                <div className="text-sm text-text-muted">Pending</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sources List */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-secondary rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              </div>
              <p className="text-text-secondary mt-4">Loading sources...</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No sources yet</h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                Add your first website source to start building your knowledge base.
                JigSaw will crawl and index the content automatically.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Add Your First Source
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="glass-card rounded-xl p-6 hover:border-primary/40 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary-light transition-colors">
                            {source.name || getDomainFromUrl(source.url)}
                          </h3>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-text-muted hover:text-primary-light transition-colors"
                          >
                            {source.url}
                          </a>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-text-muted">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {source.crawlFrequency || "Manual"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {source.lastCrawledAt
                            ? `Last crawled ${new Date(source.lastCrawledAt).toLocaleDateString()}`
                            : "Never crawled"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCrawl(source.id)}
                        disabled={crawling === source.id}
                        className="btn-success disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {crawling === source.id ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Crawling...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Crawl Now
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(source.id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-card-static rounded-2xl p-8 w-full max-w-md mx-4 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Add New Source</h2>
                <p className="text-text-muted text-sm mt-1">Enter the URL of the website to crawl</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={newSource.url}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  placeholder="https://example.com"
                  className="input-base"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Name <span className="text-text-muted">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  placeholder="My Website"
                  className="input-base"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || !newSource.url.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    "Add Source"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
