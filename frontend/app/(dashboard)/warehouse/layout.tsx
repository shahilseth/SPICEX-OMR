'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['WAREHOUSE_MANAGER', 'FACTORY_MANAGER']}>
      {children}
    </ProtectedRoute>
  );
}
