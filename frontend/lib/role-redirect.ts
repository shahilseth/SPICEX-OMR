import type { UserRole } from './auth-context';

/**
 * Maps each role to its default landing page after login.
 * ADMIN falls through to '/dashboard'.
 */
const ROLE_ROUTES: Partial<Record<UserRole, string>> = {
  SOURCING_MANAGER: '/procurement/po',
  FACTORY_MANAGER: '/factory/receiving',
  WAREHOUSE_MANAGER: '/warehouse/inventory',
  SALES_MANAGER: '/sales/b2b',
  DISTRIBUTION_MANAGER: '/distribution/partners',
  SALES_PERSON: '/sales/b2b',
};

/**
 * Returns the redirect path for a given role.
 * Falls back to '/dashboard' for ADMIN or unknown roles.
 */
export function getRedirectForRole(role: UserRole | null): string {
  if (!role) return '/dashboard';
  return ROLE_ROUTES[role] || '/dashboard';
}
