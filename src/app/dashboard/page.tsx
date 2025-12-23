'use client';

import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ImmersiveAuthScreen from '@/components/auth/ImmersiveAuthScreen';
import DashboardContent from './components/DashboardContent';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

const PlayerDashboard = () => {
  const { isAuthenticated } = useAuth();

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <ImmersiveAuthScreen defaultMode="login" />;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <UnifiedLoader size="lg" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
};

export default PlayerDashboard;
