import { type User, userAtom } from '@/modules/user';
import { reatomComponent } from '@reatom/react';

interface GuardProps {
  can: (user: User) => boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Guard component for conditional rendering based on rules connected with user.
 *
 * Renders its children if the `can` function returns true for the current user's role.
 * Otherwise, renders the optional `fallback` node.
 *
 * Example usage:
 *
 * ```tsx
 * <Guard
 *   can={(user) => user.role === 'admin'}
 *   fallback={<div>Access denied</div>}
 * >
 *   <SecretComponent />
 * </Guard>
 * ```
 *
 * @param can - Function to check access based on user data
 * @param children - Content to render if access is granted
 * @param fallback - Content to render if access is denied (optional) (null by default)
 */
export const Guard = reatomComponent<GuardProps>(function Guard(props) {
  const { can, children, fallback = null } = props;

  const user = userAtom();
  const hasAccess = can(user);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}, 'Guard');
