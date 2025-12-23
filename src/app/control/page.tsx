'use client';

import { useEffect } from 'react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { useRouter } from 'next/navigation';
import SuperAdminDashboard from '@/components/control/SuperAdminDashboard';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <UnifiedLoader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <SuperAdminDashboard />;
}
