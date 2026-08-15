"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Clock, Calendar, RefreshCw, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSource, setNewSource] = useState({ url: "", name: "" });
  const [adding, setAdding] = useState(false);
  const [crawling, setCrawling] = useState<string | null>(null);

  const fetchSources = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/sources`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSources(data.sources || []);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch sources:", error);
      setError("Unable to connect to the backend. Make sure the API server is running on port 3001.");
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="gap-2 mb-3">
                <Globe className="h-3.5 w-3.5" />
                Sources
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tighter">
                <span className="text-primary">Sources</span>
              </h1>
              <p className="text-muted-foreground mt-2 font-light">
                Manage your web sources and crawling schedule
              </p>
            </motion.div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4" />
              Add Source
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      {!loading && sources.length > 0 && (
        <section className="py-6 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{sources.length}</div>
                  <div className="text-sm text-muted-foreground">Total Sources</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary">
                    {sources.filter((s) => s.lastCrawledAt).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Crawled</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-500">
                    {sources.filter((s) => !s.lastCrawledAt).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Sources List */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted animate-pulse shrink-0" />
                      <div className="flex-1">
                        <div className="h-5 w-1/3 bg-muted animate-pulse rounded mb-2" />
                        <div className="h-4 w-1/2 bg-muted animate-pulse rounded mb-4" />
                        <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <Globe className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Connection Error</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {error}
                </p>
                <Button onClick={() => { setLoading(true); fetchSources(); }}>
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : sources.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Globe className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No sources yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Add your first website source to start building your knowledge base.
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  Add Your First Source
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                              <Globe className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-200">
                                {source.name || getDomainFromUrl(source.url)}
                              </h3>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                              >
                                {source.url}
                              </a>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {source.crawlFrequency || "Manual"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {source.lastCrawledAt
                                ? `Last crawled ${new Date(source.lastCrawledAt).toLocaleDateString()}`
                                : "Never crawled"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCrawl(source.id)}
                            disabled={crawling === source.id}
                            className="gap-1.5"
                          >
                            {crawling === source.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Crawling...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4" />
                                Crawl Now
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(source.id)}
                            className="gap-1.5"
                            aria-label={`Delete ${source.name || getDomainFromUrl(source.url)}`}
                          >
                            <Trash className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add Source Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Source</DialogTitle>
            <DialogDescription>
              Enter the URL of the website to crawl
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSource} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source-url">Website URL</Label>
              <Input
                id="source-url"
                type="url"
                value={newSource.url}
                onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                placeholder="https://example.com"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source-name">
                Name <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="source-name"
                type="text"
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                placeholder="My Website"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={adding || !newSource.url.trim()}
              >
                {adding ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  "Add Source"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
