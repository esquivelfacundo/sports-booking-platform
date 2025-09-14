'use client';

import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ImmersiveAuthScreen from '@/components/auth/ImmersiveAuthScreen';
import DashboardContent from './components/DashboardContent';

const PlayerDashboard = () => {
  const { isAuthenticated } = useAuth();

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <ImmersiveAuthScreen defaultMode="login" />;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
};

export default PlayerDashboard;
