import type { AxiosInstance } from 'axios';
import _ from 'lodash';
import axios from 'axios';

import type { BackendErrorResponse } from '../types/error';
import { mapKeys } from '../utils/map-keys';

import type {
  ApiError,
  ApiRequestConfig,
  ApiResponse,
  IApiClient,
} from './interface';

export interface AxiosAdapterConfig {
  baseURL?: string;
  mapKeys?: {
    from: (name: string) => string;
    to: (name: string) => string;
  };
}

const DEFAULT_CONFIG: AxiosAdapterConfig = {};

export class AxiosAdapter implements IApiClient {
  private client: AxiosInstance;
  private config?: AxiosAdapterConfig;

  constructor(config?: AxiosAdapterConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = axios.create();

    const baseURL = this.config.baseURL;
    if (baseURL) {
      this.setBaseURL(baseURL);
    }

    this.setupInterceptors();
  }

  setBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }

  setToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  async request<T>(
    url: string,
    config: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request({
        url,
        method: config.method || 'GET',
        data: config.data,
        params: config.params,
        headers: config.headers,
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

  private setupInterceptors() {
    this.setupKeyMappingInterceptors();
  }

  private setupKeyMappingInterceptors() {
    const mapKeysConfig = this.config?.mapKeys;
    if (mapKeysConfig) {
      const remapKeysTo = (obj: Record<string, unknown>) =>
        mapKeys(obj, (key) => mapKeysConfig.to(key));
      const remapKeysFrom = (obj: Record<string, unknown>) =>
        mapKeys(obj, (key) => mapKeysConfig.from(key));

      // Request interceptor: map keys
      this.client.interceptors.request.use((config) => {
        if (config.data !== undefined && config.data !== null) {
          config.data = remapKeysTo(config.data);
        }
        if (config.params !== undefined && config.params !== null) {
          config.params = remapKeysTo(config.params);
        }
        return config;
      });

      // Response interceptor: map keys
      this.client.interceptors.response.use((response) => {
        if (response.data !== undefined && response.data !== null) {
          response.data = remapKeysFrom(response.data);
        }
        return response;
      });
    }
  }
}
