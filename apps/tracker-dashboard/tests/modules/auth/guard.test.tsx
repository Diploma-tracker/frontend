import { Guard } from '@/modules/auth';
import type { User } from '@/modules/user';
import { atom } from '@reatom/core';
import { act, render, screen } from '@testing-library/react';
import { createUser } from '@tests/fixtures/auth/user';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { userAtomMock } = vi.hoisted(() => ({
  userAtomMock: vi.fn<() => User>(),
}));

vi.mock('@/modules/user', () => ({
  userAtom: userAtomMock,
}));

vi.mock('@/app/config/router', () => ({
  router: {
    navigate: vi.fn(),
  },
}));

const currentUser = atom(createUser(), 'guardTestUser');
const canAccess = (user: User) => user.role === 'admin' && user.isActive;

describe('Guard', () => {
  beforeEach(() => {
    currentUser.set(createUser());
    userAtomMock.mockImplementation(() => currentUser());
  });

  it('renders children when the current user satisfies the access rule', () => {
    render(
      <Guard can={canAccess} fallback={<p>Access denied</p>}>
        <p>Protected content</p>
      </Guard>,
    );

    expect(screen.getByText('Protected content')).toBeVisible();
    expect(screen.queryByText('Access denied')).not.toBeInTheDocument();
  });

  it.each([
    { name: 'a student', user: createUser({ role: 'student' }) },
    { name: 'an inactive admin', user: createUser({ isActive: false }) },
  ])('renders the fallback for $name', ({ user }) => {
    currentUser.set(user);

    render(
      <Guard can={canAccess} fallback={<p>Access denied</p>}>
        <p>Protected content</p>
      </Guard>,
    );

    expect(screen.getByText('Access denied')).toBeVisible();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders nothing when access is denied and no fallback is provided', () => {
    currentUser.set(createUser({ role: 'student' }));

    const { container } = render(
      <Guard can={canAccess}>
        <p>Protected content</p>
      </Guard>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('updates visible content when the current user gains or loses access', async () => {
    currentUser.set(createUser({ role: 'student' }));

    render(
      <Guard can={canAccess} fallback={<p>Access denied</p>}>
        <p>Protected content</p>
      </Guard>,
    );

    expect(screen.getByText('Access denied')).toBeVisible();

    await act(async () => {
      currentUser.set(createUser());
    });

    expect(screen.getByText('Protected content')).toBeVisible();
    expect(screen.queryByText('Access denied')).not.toBeInTheDocument();

    await act(async () => {
      currentUser.set(createUser({ role: 'student' }));
    });

    expect(screen.getByText('Access denied')).toBeVisible();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
