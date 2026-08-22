"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Globe,
  Clock,
  Calendar,
  RefreshCw,
  Plus,
  Trash,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, type Source } from "@/lib/api";
import { isSafeUrl } from "@/lib/utils";

const PAGE_SIZE = 10;

export default function SourcesPage() {
  const prefersReducedMotion = useReducedMotion();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSource, setNewSource] = useState({
    url: "",
    name: "",
    visibility: "private" as "public" | "private",
  });
  const [adding, setAdding] = useState(false);
  const [crawling, setCrawling] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [visibilityFilter, setVisibilityFilter] = useState<
    "all" | "public" | "private"
  >("all");

  const fetchSources = useCallback(async () => {
    try {
      setLoading(true);
      const params: { limit: number; offset: number; visibility?: "public" | "private" } = {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      };
      if (visibilityFilter !== "all") {
        params.visibility = visibilityFilter;
      }
      const data = await api.getSources(params);
      setSources(data.sources);
      setTotal(data.total);
      setError(null);
    } catch {
      setError(
        "Unable to connect to the backend. Make sure the API server is running on port 3001."
      );
    } finally {
      setLoading(false);
    }
  }, [page, visibilityFilter]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.url.trim()) return;

    setAdding(true);
    try {
      await api.createSource({
        url: newSource.url,
        name: newSource.name || newSource.url,
        visibility: newSource.visibility,
      });
      setShowAddModal(false);
      setNewSource({ url: "", name: "", visibility: "private" });
      setPage(0);
      fetchSources();
    } catch (err) {
      console.error("Failed to add source:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this source?")) return;

    try {
      await api.deleteSource(id);
      fetchSources();
    } catch (err) {
      console.error("Failed to delete source:", err);
    }
  };

  const handleCrawl = async (sourceId: string) => {
    setCrawling(sourceId);
    try {
      await api.triggerCrawl(sourceId);
    } catch (err) {
      console.error("Failed to start crawl:", err);
    } finally {
      setCrawling(null);
    }
  };

  const handleToggleVisibility = async (source: Source) => {
    const newVisibility = source.visibility === "public" ? "private" : "public";
    try {
      await api.updateSource(source.id, { visibility: newVisibility });
      fetchSources();
    } catch (err) {
      console.error("Failed to update visibility:", err);
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
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Sources
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your web sources and crawling schedule
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Add Source
          </Button>
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {(["all", "public", "private"] as const).map((f) => (
            <Button
              key={f}
              variant={visibilityFilter === f ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setVisibilityFilter(f);
                setPage(0);
              }}
              className="capitalize"
            >
              {f} ({total})
            </Button>
          ))}
        </div>

        {/* Sources List */}
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
              <Button
                onClick={() => {
                  setLoading(true);
                  fetchSources();
                }}
              >
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
                Add your first website source to start building your knowledge
                base.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                Add Your First Source
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {sources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : index * 0.04 }}
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
                                href={isSafeUrl(source.url) ? source.url : "#"}
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
                                ? `Last crawled ${new Date(
                                    source.lastCrawledAt
                                  ).toLocaleDateString()}`
                                : "Never crawled"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleVisibility(source)}
                            className="gap-1.5"
                            title={`Toggle visibility (currently ${source.visibility})`}
                          >
                            {source.visibility === "public" ? (
                              <Eye className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="hidden sm:inline capitalize">
                              {source.visibility}
                            </span>
                          </Button>
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
                                Crawl
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(source.id)}
                            className="gap-1.5"
                            aria-label={`Delete ${
                              source.name || getDomainFromUrl(source.url)
                            }`}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
                onChange={(e) =>
                  setNewSource({ ...newSource, url: e.target.value })
                }
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
                onChange={(e) =>
                  setNewSource({ ...newSource, name: e.target.value })
                }
                placeholder="My Website"
              />
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={
                    newSource.visibility === "private" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setNewSource({ ...newSource, visibility: "private" })
                  }
                  className="gap-1.5"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  Private
                </Button>
                <Button
                  type="button"
                  variant={
                    newSource.visibility === "public" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setNewSource({ ...newSource, visibility: "public" })
                  }
                  className="gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Public
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {newSource.visibility === "public"
                  ? "Anyone can find and search this source"
                  : "Only you can access this source"}
              </p>
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
                {adding ? "Adding..." : "Add Source"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
