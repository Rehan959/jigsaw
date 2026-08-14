const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(path, params);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  // Search endpoints
  async search(query: string, limit = 10, sourceId?: string) {
    return this.post<{ results: Array<{ id: string; score: number; content: string; metadata: { sourceId: string; url: string; title: string; chunkIndex: number; totalChunks: number } }> }>("/api/search", {
      query,
      limit,
      sourceId,
    });
  }

  // Sources endpoints
  async getSources() {
    return this.get<{ sources: Array<{ id: string; url: string; name: string; crawlFrequency: string | null; lastCrawledAt: string | null; createdAt: string }> }>("/api/sources");
  }

  async createSource(data: { url: string; name?: string }) {
    return this.post<{ source: { id: string; url: string; name: string } }>("/api/sources", data);
  }

  async deleteSource(id: string) {
    return this.delete<{ success: boolean }>(`/api/sources/${id}`);
  }

  // Jobs endpoints
  async getJobs() {
    return this.get<{ jobs: Array<{ id: string; sourceId: string; status: "queued" | "running" | "completed" | "failed"; startedAt: string | null; completedAt: string | null; error: string | null; createdAt: string; source?: { name: string; url: string } }> }>("/api/jobs");
  }

  async triggerCrawl(sourceId: string) {
    return this.post<{ jobId: string }>(`/api/jobs/crawl/${sourceId}`);
  }

  async getJob(id: string) {
    return this.get<{ job: { id: string; status: string; error: string | null } }>(`/api/jobs/${id}`);
  }

  // Health check
  async healthCheck() {
    return this.get<{ status: string; timestamp: string }>("/health");
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
