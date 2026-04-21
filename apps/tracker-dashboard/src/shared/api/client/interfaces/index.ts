export interface ApiError {
  message: string;
  status: number;
  extra: Record<string, unknown>;
}

export type ApiResponse<T> = { ok: true; data: T; error: null } | { ok: false; data: null; error: ApiError };

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

export interface IApiClient {
  request<T>(url: string, config: ApiRequestConfig): Promise<ApiResponse<T>>;
}
