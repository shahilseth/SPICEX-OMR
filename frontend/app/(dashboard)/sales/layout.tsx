'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['SALES_MANAGER']}>
      {children}
    </ProtectedRoute>
  );
}
