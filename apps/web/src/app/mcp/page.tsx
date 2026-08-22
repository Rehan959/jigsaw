"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plug,
  Key,
  Copy,
  Check,
  Trash2,
  Plus,
  Eye,
  EyeOff,
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
import { api } from "@/lib/api";

interface ApiKey {
  id: string;
  name: string;
  lastUsedAt: string | null;
  createdAt: string;
}

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

export default function McpPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      const data = await api.getApiKeys();
      setKeys(data.keys);
    } catch {
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const result = await api.createApiKey({ name: newKeyName });
      setNewKeyValue(result.key);
      setNewKeyName("");
      fetchKeys();
    } catch (err) {
      console.error("Failed to create API key:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    try {
      await api.revokeApiKey(id);
      fetchKeys();
    } catch (err) {
      console.error("Failed to revoke key:", err);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(id === "key" ? true : false);
    if (id !== "key") setCopiedSnippet(id);
    setTimeout(() => {
      setCopiedKey(false);
      setCopiedSnippet(null);
    }, 2000);
  };

  const claudeConfig = `{
  "mcpServers": {
    "jigsaw": {
      "command": "npx",
      "args": ["-y", "@jigsaw/mcp-server"],
      "env": {
        "JIGSAW_API_URL": "http://localhost:3001",
        "JIGSAW_API_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}`;

  const cursorConfig = `{
  "mcpServers": {
    "jigsaw": {
      "command": "npx",
      "args": ["-y", "@jigsaw/mcp-server"],
      "env": {
        "JIGSAW_API_URL": "http://localhost:3001",
        "JIGSAW_API_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}`;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Badge variant="secondary" className="gap-2 mb-3">
            <Plug className="h-3.5 w-3.5" />
            MCP Integration
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            <span className="text-primary">MCP</span> Integration
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect AI assistants to your knowledge base via Model Context
            Protocol
          </p>
        </motion.div>

        {/* API Key Management */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">API Keys</h2>
            <Button
              size="sm"
              onClick={() => {
                setShowCreateModal(true);
                setNewKeyValue(null);
              }}
            >
              <Plus className="h-4 w-4" />
              Generate Key
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted animate-pulse shrink-0" />
                      <div className="flex-1">
                        <div className="h-4 w-1/3 bg-muted animate-pulse rounded mb-2" />
                        <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : keys.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Key className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  No API keys yet. Generate one to get started.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(true);
                    setNewKeyValue(null);
                  }}
                >
                  Generate Your First Key
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <Card key={key.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Key className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{key.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Created{" "}
                            {new Date(key.createdAt).toLocaleDateString()}
                            {key.lastUsedAt &&
                              ` · Last used ${new Date(
                                key.lastUsedAt
                              ).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Revoke
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Setup Instructions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold mb-4">Setup Instructions</h2>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-medium">
                  1. Install the MCP server
                </h3>
                <div className="relative">
                  <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto font-mono">
                    npm install -g @jigsaw/mcp-server
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() =>
                      copyToClipboard(
                        "npm install -g @jigsaw/mcp-server",
                        "install"
                      )
                    }
                  >
                    {copiedSnippet === "install" ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <h3 className="font-medium">
                  2. Add to your AI assistant&apos;s config
                </h3>
                <p className="text-sm text-muted-foreground">
                  Copy the appropriate config below and replace{" "}
                  <code className="bg-muted px-1 rounded">
                    &lt;YOUR_API_KEY&gt;
                  </code>{" "}
                  with your generated key.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      Claude Desktop
                    </p>
                    <div className="relative">
                      <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto font-mono max-h-64">
                        {claudeConfig}
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() =>
                          copyToClipboard(claudeConfig, "claude")
                        }
                      >
                        {copiedSnippet === "claude" ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      Cursor
                    </p>
                    <div className="relative">
                      <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto font-mono max-h-64">
                        {cursorConfig}
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() =>
                          copyToClipboard(cursorConfig, "cursor")
                        }
                      >
                        {copiedSnippet === "cursor" ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <h3 className="font-medium">
                  3. Available MCP Tools
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      name: "search_knowledge_base",
                      desc: "Semantic search across your indexed sources",
                    },
                    {
                      name: "list_sources",
                      desc: "List all sources in your knowledge base",
                    },
                    {
                      name: "add_source",
                      desc: "Add a new URL to crawl and index",
                    },
                    {
                      name: "crawl_status",
                      desc: "Check the status of crawl jobs",
                    },
                  ].map((tool) => (
                    <div
                      key={tool.name}
                      className="bg-muted rounded-lg p-3"
                    >
                      <p className="font-mono text-sm font-medium text-primary">
                        {tool.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tool.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateModal} onOpenChange={(open) => { setShowCreateModal(open); if (!open) setNewKeyValue(null); }}>
        <DialogContent>
          {newKeyValue ? (
            <>
              <DialogHeader>
                <DialogTitle>API Key Created</DialogTitle>
                <DialogDescription>
                  Copy this key now. You won&apos;t be able to see it again.
                </DialogDescription>
              </DialogHeader>
              <div className="relative">
                <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto font-mono break-all">
                  {newKeyValue}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => copyToClipboard(newKeyValue, "key")}
                >
                  {copiedKey ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={() => { setShowCreateModal(false); setNewKeyValue(null); }}>
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Generate API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key for MCP server access
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Claude Desktop"
                    required
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating || !newKeyName.trim()}
                  >
                    {creating ? "Creating..." : "Generate"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
