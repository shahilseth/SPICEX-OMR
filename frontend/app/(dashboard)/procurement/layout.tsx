'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProcurementLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['SOURCING_MANAGER']}>
      {children}
    </ProtectedRoute>
  );
}
