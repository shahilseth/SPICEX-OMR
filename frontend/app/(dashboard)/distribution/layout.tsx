'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function DistributionLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['DISTRIBUTION_MANAGER']}>
      {children}
    </ProtectedRoute>
  );
}
