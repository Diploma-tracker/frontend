import { ENV_CONFIG } from '@/app/config/env';

import { AxiosAdapter } from './adapters/axios-adapter';

const BASE_URL = ENV_CONFIG.api.baseUrl;

export const API = new AxiosAdapter(BASE_URL);
