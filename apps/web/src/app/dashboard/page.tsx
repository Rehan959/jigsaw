"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Globe,
  Search,
  ArrowRight,
  Lock,
  Unlock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, type Source } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    public: 0,
    private: 0,
  });
  const [recentSources, setRecentSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([
      api.getSourceStats().catch(() => ({ total: 0, public: 0, private: 0 })),
      api.getRecentSources(5).catch(() => ({ sources: [] })),
    ]).then(([statsData, recentData]) => {
      setStats(statsData);
      setRecentSources(recentData.sources);
      setLoading(false);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your knowledge base
          </p>
        </motion.div>

        {/* Quick Search */}
        <motion.div variants={itemVariants}>
          <form onSubmit={handleSearch} className="max-w-xl">
            <div className="flex items-center gap-2 border border-border rounded-xl bg-card p-2">
              <Search className="h-5 w-5 text-muted-foreground ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick search..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none py-2"
              />
              <Button type="submit" size="sm" disabled={!searchQuery.trim()}>
                Search
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Sources
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {loading ? "—" : stats.total}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Public Sources
                  </p>
                  <p className="text-3xl font-bold mt-1 text-emerald-500">
                    {loading ? "—" : stats.public}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Unlock className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Private Sources
                  </p>
                  <p className="text-3xl font-bold mt-1 text-amber-500">
                    {loading ? "—" : stats.private}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Sources + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Sources */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Sources</h2>
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link href="/sources">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted animate-pulse shrink-0" />
                        <div className="flex-1">
                          <div className="h-4 w-1/3 bg-muted animate-pulse rounded mb-2" />
                          <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentSources.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Globe className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No sources yet. Add your first one.
                  </p>
                  <Button asChild className="mt-4" size="sm">
                    <Link href="/sources">Add Source</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentSources.map((source) => (
                  <Card key={source.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Globe className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {source.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {source.url}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            source.visibility === "public"
                              ? "success"
                              : "secondary"
                          }
                          className="shrink-0"
                        >
                          {source.visibility === "public" ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Card className="group cursor-pointer transition-colors hover:bg-accent/50">
                <Link href="/sources">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Add Source</p>
                      <p className="text-xs text-muted-foreground">
                        Crawl a new website
                      </p>
                    </div>
                  </CardContent>
                </Link>
              </Card>

              <Card className="group cursor-pointer transition-colors hover:bg-accent/50">
                <Link href="/search">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Search className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Search Knowledge</p>
                      <p className="text-xs text-muted-foreground">
                        Find content with AI
                      </p>
                    </div>
                  </CardContent>
                </Link>
              </Card>

              <Card className="group cursor-pointer transition-colors hover:bg-accent/50">
                <Link href="/mcp">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">MCP Setup</p>
                      <p className="text-xs text-muted-foreground">
                        Connect AI assistants
                      </p>
                    </div>
                  </CardContent>
                </Link>
              </Card>

              <Card className="group cursor-pointer transition-colors hover:bg-accent/50">
                <Link href="/settings">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Settings</p>
                      <p className="text-xs text-muted-foreground">
                        Manage your account
                      </p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
