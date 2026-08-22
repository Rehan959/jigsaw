const API_BASE_URL = process.env.JIGSAW_API_URL || "http://localhost:3001";
const API_KEY = process.env.JIGSAW_API_KEY || "";

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class HttpClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || API_BASE_URL;
    this.apiKey = apiKey || API_KEY;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value);
        }
      }
    }

    return this.request<T>("GET", url.toString());
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const url = new URL(path, this.baseUrl);
    return this.request<T>("POST", url.toString(), body);
  }

  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["X-API-Key"] = this.apiKey;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseBody = await response.json();

    if (!response.ok) {
      const error = new Error(
        responseBody.error || `API request failed: ${response.status}`,
      ) as unknown as ApiError;
      error.status = response.status;
      error.code = responseBody.code;
      throw error;
    }

    return { data: responseBody as T, status: response.status };
  }
}

let defaultClient: HttpClient | null = null;

export function getApiClient(): HttpClient {
  if (!defaultClient) {
    defaultClient = new HttpClient();
  }
  return defaultClient;
}
