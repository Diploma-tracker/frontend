import { roleBasedComponent } from '@/modules/auth';
import type { User } from '@/modules/user';
import { atom } from '@reatom/core';
import { act, render, screen } from '@testing-library/react';
import { createUser } from '@tests/fixtures/auth/user';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserRole } from '@repo/api/types';

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

const currentUser = atom(createUser(), 'roleBasedComponentTestUser');
const roleComponents = {
  admin: () => <p>Admin content</p>,
  staff: () => <p>Staff content</p>,
  student: () => <p>Student content</p>,
  default: () => <p>Default content</p>,
};

describe('roleBasedComponent', () => {
  beforeEach(() => {
    currentUser.set(createUser());
    userAtomMock.mockImplementation(() => currentUser());
  });

  it.each([
    { role: UserRole.ADMIN, content: 'Admin content' },
    { role: UserRole.STAFF, content: 'Staff content' },
    { role: UserRole.STUDENT, content: 'Student content' },
  ])(
    'renders the component for $role instead of the default',
    ({ role, content }) => {
      currentUser.set(createUser({ role }));
      const RoleBasedComponent = roleBasedComponent(roleComponents);

      render(<RoleBasedComponent />);

      expect(screen.getByText(content)).toBeVisible();
      expect(screen.getAllByRole('paragraph')).toHaveLength(1);
      expect(screen.queryByText('Default content')).not.toBeInTheDocument();
    },
  );

  it('renders the default when the current role has no component', () => {
    currentUser.set(createUser({ role: UserRole.STUDENT }));
    const RoleBasedComponent = roleBasedComponent({
      admin: roleComponents.admin,
      default: roleComponents.default,
    });

    render(<RoleBasedComponent />);

    expect(screen.getByText('Default content')).toBeVisible();
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });

  it('renders nothing when neither a role component nor a default is provided', () => {
    currentUser.set(createUser({ role: UserRole.STUDENT }));
    const RoleBasedComponent = roleBasedComponent({
      admin: roleComponents.admin,
    });

    const { container } = render(<RoleBasedComponent />);

    expect(container).toBeEmptyDOMElement();
  });

  it('switches components when the current user role changes', async () => {
    const RoleBasedComponent = roleBasedComponent({
      admin: roleComponents.admin,
      staff: roleComponents.staff,
      default: roleComponents.default,
    });

    render(<RoleBasedComponent />);

    expect(screen.getByText('Admin content')).toBeVisible();

    await act(async () => {
      currentUser.set(createUser({ role: UserRole.STAFF }));
    });

    expect(screen.getByText('Staff content')).toBeVisible();
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();

    await act(async () => {
      currentUser.set(createUser({ role: UserRole.STUDENT }));
    });

    expect(screen.getByText('Default content')).toBeVisible();
    expect(screen.queryByText('Staff content')).not.toBeInTheDocument();
  });
});
