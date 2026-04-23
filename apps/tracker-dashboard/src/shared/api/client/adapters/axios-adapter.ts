import type { AxiosInstance } from 'axios';
import axios from 'axios';

import type { BackendErrorResponse } from '@repo/api-types';

import type { ApiError, ApiRequestConfig, ApiResponse, IApiClient } from '../interfaces';

export class AxiosAdapter implements IApiClient {
  private client: AxiosInstance;
  private token: string = '';

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL });
  }

  setToken(token: string): void {
    this.token = token;
  }

  async request<T>(url: string, config: ApiRequestConfig): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {};
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }
      const response = await this.client.request<T>({
        url,
        method: config.method || 'GET',
        data: config.data,
        params: config.params,
        headers: {
          ...headers,
          ...config.headers,
        },
      });

      return { ok: true, data: response.data, error: null };
    } catch (e) {
      return { ok: false, data: null, error: this.handleError(e) };
    }
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error) && error.response) {
      const backendData = error.response.data as BackendErrorResponse;

      return {
        message: backendData.detail || 'Server Error',
        status: backendData.status_code || error.response.status,
        extra: backendData.extra || {},
      };
    }

    return {
      message: error instanceof Error ? error.message : 'Unknown Network Error',
      status: 0,
      extra: {},
    };
  }
}
