import { userAtom } from '@/modules/user';
import { reatomComponent } from '@reatom/react';

import type { DomainRole, SystemRole } from '@repo/api-types';

interface GuardProps {
  can: (sRole: SystemRole, dRole: DomainRole) => boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Guard component for conditional rendering based on user roles.
 *
 * Renders its children if the `can` function returns true for the current user's system and domain roles.
 * Otherwise, renders the optional `fallback` node.
 *
 * Example usage:
 *
 * ```tsx
 * <Guard
 *   can={(systemRole, domainRole) => systemRole === 'admin' || domainRole === 'student'}
 *   fallback={<div>Access denied</div>}
 * >
 *   <SecretComponent />
 * </Guard>
 * ```
 *
 * @param can - Function to check access based on system and domain roles
 * @param children - Content to render if access is granted
 * @param fallback - Content to render if access is denied (optional) (null by default)
 */
export const Guard = reatomComponent<GuardProps>(function Guard(props) {
  const { can, children, fallback = null } = props;

  const user = userAtom();
  const hasAccess = can(user.systemRole, user.domainRole);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}, 'Guard');
