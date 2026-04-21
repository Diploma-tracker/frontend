type Env = {
  VITE_API_URL: string;
};

function getEnv(): Env {
  const env = import.meta.env;

  if (!env.VITE_API_URL) {
    throw new Error('VITE_API_URL is not defined');
  }

  return {
    VITE_API_URL: env.VITE_API_URL,
  };
}

const env = getEnv();

export const envConfig = {
  api: {
    baseUrl: env.VITE_API_URL,
  },
};
