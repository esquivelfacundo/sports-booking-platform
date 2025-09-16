'use client';

import { useEffect } from 'react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { useRouter } from 'next/navigation';
import SuperAdminDashboard from '@/components/control/SuperAdminDashboard';

export default function ControlPage() {
  const { isAuthenticated, isLoading } = useSuperAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/control/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <SuperAdminDashboard />;
}
