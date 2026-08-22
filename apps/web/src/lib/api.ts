const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export interface Source {
  id: string;
  url: string;
  name: string;
  crawlFrequency: string | null;
  lastCrawledAt: string | null;
  visibility: string;
  createdAt: string;
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
      credentials: "include",
      ...fetchOptions,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) return undefined as T;
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

  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  async search(query: string, limit = 10, sourceId?: string) {
    return this.post<{
      results: Array<{
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
      }>;
    }>("/api/search", { query, limit, sourceId });
  }

  async getSources(params?: {
    limit?: number;
    offset?: number;
    visibility?: "public" | "private";
  }) {
    const query: Record<string, string> = {};
    if (params?.limit) query.limit = String(params.limit);
    if (params?.offset) query.offset = String(params.offset);
    if (params?.visibility) query.visibility = params.visibility;
    return this.get<{
      sources: Source[];
      total: number;
      limit: number;
      offset: number;
    }>("/api/sources", { params: query });
  }

  async getSourceStats() {
    return this.get<{
      total: number;
      public: number;
      private: number;
    }>("/api/sources/stats");
  }

  async getRecentSources(limit = 5) {
    return this.get<{ sources: Source[] }>("/api/sources/recent", {
      params: { limit: String(limit) },
    });
  }

  async createSource(data: {
    url: string;
    name: string;
    visibility?: "public" | "private";
  }) {
    return this.post<{ source: Source }>("/api/sources", data);
  }

  async updateSource(
    id: string,
    data: { visibility?: "public" | "private"; name?: string }
  ) {
    return this.patch<{ source: Source }>(`/api/sources/${id}`, data);
  }

  async deleteSource(id: string) {
    return this.delete<void>(`/api/sources/${id}`);
  }

  async getJobs() {
    return this.get<{
      jobs: Array<{
        id: string;
        sourceId: string;
        status: "queued" | "running" | "completed" | "failed";
        startedAt: string | null;
        completedAt: string | null;
        error: string | null;
        createdAt: string;
        source?: { name: string; url: string };
      }>;
    }>("/api/jobs");
  }

  async triggerCrawl(sourceId: string) {
    return this.post<{ jobId: string }>(`/api/jobs/crawl/${sourceId}`);
  }

  async getJob(id: string) {
    return this.get<{
      job: { id: string; status: string; error: string | null };
    }>(`/api/jobs/${id}`);
  }

  async getMe() {
    return this.get<{
      user: { id: string; email: string; name: string | null };
    }>("/api/auth/me");
  }

  async updateProfile(data: { name?: string }) {
    return this.post<{
      user: { id: string; email: string; name: string | null };
    }>("/api/auth/profile", data);
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.post<{ message: string }>("/api/auth/change-password", data);
  }

  async deleteAccount() {
    return this.delete<{ message: string }>("/api/auth/account");
  }

  async getApiKeys() {
    return this.get<{
      keys: Array<{
        id: string;
        name: string;
        lastUsedAt: string | null;
        createdAt: string;
      }>;
    }>("/api/auth/api-keys");
  }

  async createApiKey(data: { name: string }) {
    return this.post<{
      key: string;
      keyPreview: string;
      id: string;
    }>("/api/auth/api-keys", data);
  }

  async revokeApiKey(id: string) {
    return this.delete<void>(`/api/auth/api-keys/${id}`);
  }

  async healthCheck() {
    return this.get<{ status: string; timestamp: string }>("/health");
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
