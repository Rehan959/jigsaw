"use client";

import { useState, useEffect } from "react";

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
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    label: "Queued",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  running: {
    color: "text-primary-light",
    bg: "bg-primary/10",
    border: "border-primary/20",
    label: "Running",
    icon: (
      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),
  },
  completed: {
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    label: "Completed",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  failed: {
    color: "text-error",
    bg: "bg-error/10",
    border: "border-error/20",
    label: "Failed",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
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
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary-light text-sm font-medium mb-3">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Job Monitor
          </div>
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Crawl Jobs</span>
          </h1>
          <p className="text-text-secondary mt-2">
            Monitor and manage your web crawling jobs
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-card rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-text-muted">Total Jobs</div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-2xl font-bold text-primary-light">{stats.running}</div>
              <div className="text-sm text-text-muted">Running</div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-2xl font-bold text-warning">{stats.queued}</div>
              <div className="text-sm text-text-muted">Queued</div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
              <div className="text-sm text-text-muted">Completed</div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-2xl font-bold text-error">{stats.failed}</div>
              <div className="text-sm text-text-muted">Failed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { key: "all", label: "All", count: stats.total },
              { key: "running", label: "Running", count: stats.running },
              { key: "queued", label: "Queued", count: stats.queued },
              { key: "completed", label: "Completed", count: stats.completed },
              { key: "failed", label: "Failed", count: stats.failed },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  filter === f.key
                    ? "bg-primary/20 text-primary-light"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50"
                }`}
              >
                {f.label}
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  filter === f.key
                    ? "bg-primary/30 text-primary-light"
                    : "bg-bg-elevated text-text-muted"
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-secondary rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              </div>
              <p className="text-text-secondary mt-4">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
              <p className="text-text-secondary max-w-md mx-auto">
                {filter === "all"
                  ? "Start a crawl from the Sources page to see jobs here."
                  : `No ${filter} jobs at the moment.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => {
                const config = statusConfig[job.status];
                return (
                  <div
                    key={job.id}
                    className="glass-card rounded-xl p-5 hover:border-primary/40 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center ${config.color}`}>
                          {config.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} ${config.border} border`}>
                              {config.label}
                            </span>
                            {job.source && (
                              <span className="text-sm text-text-secondary font-medium">
                                {job.source.name || job.source.url}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                              {job.id.slice(0, 8)}...
                            </span>
                            <span>•</span>
                            <span>{new Date(job.createdAt).toLocaleString()}</span>
                            {job.completedAt && job.startedAt && (
                              <>
                                <span>•</span>
                                <span className="text-success">
                                  Duration: {formatDuration(job.startedAt, job.completedAt)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {job.error && (
                        <div className="text-right">
                          <div className="text-error text-sm max-w-xs truncate" title={job.error}>
                            {job.error}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
