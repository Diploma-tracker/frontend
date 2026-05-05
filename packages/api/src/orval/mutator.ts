import type { AxiosRequestConfig } from 'axios';
import _ from 'lodash';
import { API } from '../api';
import type { ApiRequestConfig, ApiResponse } from '../api/interface';

export const orvalCustomInstance = async <T>(
  config: AxiosRequestConfig,
): Promise<ApiResponse<T>> => {
  return await API.request<T>(config.url ?? '', {
    method: config.method as ApiRequestConfig['method'],
    headers: config.headers as ApiRequestConfig['headers'],
    params: config.params,
    data: config.data,
  });
};
