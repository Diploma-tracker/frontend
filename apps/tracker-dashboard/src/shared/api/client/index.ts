import { envConfig } from '@/app/config/env';

import { AxiosAdapter } from './adapters/axios-adapter';

const BASE_URL = envConfig.api.baseUrl;

export const API = new AxiosAdapter(BASE_URL);
