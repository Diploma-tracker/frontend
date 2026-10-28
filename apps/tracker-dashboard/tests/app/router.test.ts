import { routeTree } from '@/app/routeTree.gen';
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { createUser } from '@tests/fixtures/auth/user';
import { describe, expect, it } from 'vitest';

function createTestRouter(path: string, isAuth: boolean) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { auth: { isAuth, user: createUser() } },
  });
}

describe('application routing', () => {
  it('redirects unauthenticated visitors from a protected route to login', async () => {
    const router = createTestRouter('/schedule', false);

    await router.load();

    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.matches.at(-1)?.status).toBe('success');
  });

  it('redirects authenticated visitors from login to home', async () => {
    const router = createTestRouter('/login', true);

    await router.load();

    expect(router.state.location.pathname).toBe('/');
    expect(router.state.matches.at(-1)?.status).toBe('success');
  });

  it.each([
    { path: '/defense/round-123', params: { roundId: 'round-123' } },
    { path: '/project-enrollment/round-123', params: { roundId: 'round-123' } },
    {
      path: '/thesis-process/process-123',
      params: { processId: 'process-123' },
    },
  ])('loads $path with its route parameters', async ({ path, params }) => {
    const router = createTestRouter(path, true);

    await router.load();

    expect(router.state.location.pathname).toBe(path);
    expect(router.state.matches.at(-1)).toMatchObject({
      status: 'success',
      params,
    });
  });
});
