import { ENV_CONFIG } from '@/app/config/env';

import { API } from '@repo/api';

const BASE_URL = ENV_CONFIG.api.baseUrl;
API.setBaseURL(BASE_URL);

export { API };
