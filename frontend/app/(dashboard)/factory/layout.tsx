'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function FactoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['FACTORY_MANAGER']}>
      {children}
    </ProtectedRoute>
  );
}
