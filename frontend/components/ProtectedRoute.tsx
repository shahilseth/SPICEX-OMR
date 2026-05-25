'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/lib/auth-context';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** List of roles allowed to access this route. Admin always has access. */
  allowedRoles?: UserRole[];
}

/**
 * ProtectedRoute — wraps page content to enforce auth + RBAC.
 *
 * Usage in a page:
 * ```tsx
 * <ProtectedRoute allowedRoles={['SOURCING_MANAGER']}>
 *   <SourcingPageContent />
 * </ProtectedRoute>
 * ```
 *
 * - If not logged in → redirects to /login
 * - If logged in but wrong role → shows "Access Denied" card
 * - If loading → shows spinner
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, role, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to initialize
    if (loading) return;

    // Not authenticated → redirect to login
    if (!user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Still loading auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-slate-300 mx-auto mb-4" />
          <p className="text-sm text-slate-400 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated (will redirect in useEffect)
  if (!user) {
    return null;
  }

  // Profile not loaded yet (edge case — wait for it)
  if (!profile || !role) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-slate-300 mx-auto mb-4" />
          <p className="text-sm text-slate-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm mb-4">
            Hi <strong>{profile.full_name}</strong>, your role ({role.replace('_', ' ')}) doesn't have access to this page.
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Required role{allowedRoles.length > 1 ? 's' : ''}: {allowedRoles.map(r => r.replace('_', ' ')).join(', ')}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // All checks passed — render the page
  return <>{children}</>;
}
