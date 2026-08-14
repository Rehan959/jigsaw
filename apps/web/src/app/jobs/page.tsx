"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ListChecks, Clock, CheckCircle, XCircle, Loader, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CrawlJob {
  id: string;
  sourceId: string;
  status: "queued" | "running" | "completed" | "failed";
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  createdAt: string;
  source?: {
    name: string;
    url: string;
  };
}

const statusConfig = {
  queued: {
    variant: "warning" as const,
    label: "Queued",
    icon: <Clock className="h-4 w-4" />,
  },
  running: {
    variant: "default" as const,
    label: "Running",
    icon: <Loader className="h-4 w-4 animate-spin" />,
  },
  completed: {
    variant: "success" as const,
    label: "Completed",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  failed: {
    variant: "destructive" as const,
    label: "Failed",
    icon: <XCircle className="h-4 w-4" />,
  },
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<CrawlJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchJobs = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/jobs`
      );
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredJobs = filter === "all"
    ? jobs
    : jobs.filter((job) => job.status === filter);

  const stats = {
    total: jobs.length,
    running: jobs.filter((j) => j.status === "running").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    queued: jobs.filter((j) => j.status === "queued").length,
  };

  const formatDuration = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="gap-2 mb-3">
              <ListChecks className="h-3.5 w-3.5" />
              Job Monitor
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tighter">
              <span className="text-primary">Crawl Jobs</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-light">
              Monitor and manage your web crawling jobs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Jobs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{stats.running}</div>
                <div className="text-sm text-muted-foreground">Running</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-amber-500">{stats.queued}</div>
                <div className="text-sm text-muted-foreground">Queued</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-emerald-500">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Filter jobs by status">
            {[
              { key: "all", label: "All", count: stats.total },
              { key: "running", label: "Running", count: stats.running },
              { key: "queued", label: "Queued", count: stats.queued },
              { key: "completed", label: "Completed", count: stats.completed },
              { key: "failed", label: "Failed", count: stats.failed },
            ].map((f) => (
              <Button
                key={f.key}
                variant={filter === f.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(f.key)}
                className="whitespace-nowrap"
                role="tab"
                aria-selected={filter === f.key}
              >
                {f.label}
                <Badge
                  variant={filter === f.key ? "secondary" : "outline"}
                  className="ml-2 h-5 px-1.5 text-xs"
                >
                  {f.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted animate-pulse shrink-0" />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                        <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ListChecks className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {filter === "all"
                    ? "Start a crawl from the Sources page to see jobs here."
                    : `No ${filter} jobs at the moment.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job, index) => {
                const config = statusConfig[job.status];
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              {config.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant={config.variant}>
                                  {config.label}
                                </Badge>
                                {job.source && (
                                  <span className="text-sm text-muted-foreground font-medium">
                                    {job.source.name || job.source.url}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Code className="h-3 w-3" />
                                  {job.id.slice(0, 8)}...
                                </span>
                                <span aria-hidden="true">&bull;</span>
                                <span>{new Date(job.createdAt).toLocaleString()}</span>
                                {job.completedAt && job.startedAt && (
                                  <>
                                    <span aria-hidden="true">&bull;</span>
                                    <span className="text-emerald-500">
                                      Duration: {formatDuration(job.startedAt, job.completedAt)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {job.error && (
                            <div className="text-right">
                              <div className="text-destructive text-sm max-w-xs truncate" title={job.error}>
                                {job.error}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
