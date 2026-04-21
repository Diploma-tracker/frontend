export interface BackendErrorResponse {
  status_code: number;
  detail: string;
  extra: Record<string, unknown>;
}