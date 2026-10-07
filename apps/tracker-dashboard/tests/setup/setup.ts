import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { resetCookieStorage } from './cookie-storage';
import { server } from './msw/server';

vi.stubGlobal('matchMedia', (query: string): MediaQueryList => {
  return Object.assign(new EventTarget(), {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

beforeAll(() => {
  server.listen({
    onUnhandledFrame: 'error',
  });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetCookieStorage();
});

afterAll(() => {
  server.close();
});
