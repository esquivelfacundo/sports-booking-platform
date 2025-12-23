'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (!token || !isAuthenticated) {
        // No token or not authenticated, redirect to login
        console.log('AdminRouteGuard: No auth, redirecting to login');
        router.replace('/establecimientos/login');
        return;
      }

      // Check if user is admin type
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.userType !== 'admin' && parsedUser.userType !== 'establishment') {
            console.log('AdminRouteGuard: User is not admin, redirecting');
            router.replace('/establecimientos/login');
            return;
          }
        } catch (e) {
          console.error('AdminRouteGuard: Error parsing user data');
          router.replace('/establecimientos/login');
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading while checking auth
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-gray-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading, don't render children
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
