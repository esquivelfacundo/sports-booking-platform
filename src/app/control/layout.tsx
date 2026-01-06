'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Building2,
  Settings, 
  Menu, 
  Bell, 
  LogOut, 
  X,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { ThemeToggle } from '@/components/admin/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

interface ControlLayoutProps {
  children: React.ReactNode;
}

export default function ControlLayout({ children }: ControlLayoutProps) {
  const { isAuthenticated, isLoading, superAdmin, logout } = useSuperAdmin();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/control/login';

  // Authentication guard - must be called unconditionally (React hooks rules)
  useEffect(() => {
    if (!isLoginPage && !isLoading && !isAuthenticated) {
      router.push('/control/login');
    }
  }, [isAuthenticated, isLoading, router, isLoginPage]);

  // Skip layout for login page - AFTER all hooks
  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('superadmin_token');
      localStorage.removeItem('superadmin_data');
    }
    logout();
    router.push('/control/login');
  };

  // Navigation groups
  const navigationGroups = [
    {
      items: [
        {
          name: 'Dashboard',
          href: '/control',
          icon: LayoutDashboard,
          current: pathname === '/control'
        }
      ]
    },
    {
      items: [
        {
          name: 'Establecimientos',
          href: '/control/establecimientos',
          icon: Building2,
          current: pathname.startsWith('/control/establecimientos')
        },
        {
          name: 'Usuarios',
          href: '/control/usuarios',
          icon: Users,
          current: pathname.startsWith('/control/usuarios')
        }
      ]
    },
    {
      items: [
        {
          name: 'Configuración',
          href: '/control/configuracion',
          icon: Settings,
          current: pathname.startsWith('/control/configuracion')
        }
      ]
    }
  ];

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <UnifiedLoader size="lg" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <img 
                src={theme === 'dark' ? '/assets/logos/logo-dark.svg' : '/assets/logos/logo-light.svg'}
                alt="Mis Canchas" 
                className="h-10 w-auto"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {navigationGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {groupIndex > 0 && (
                  <div className="mx-4 my-3 border-t border-gray-200 dark:border-gray-700" />
                )}
                
                <div className="px-2 space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        item.current
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          
          {/* User info at bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {superAdmin?.name || 'Super Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Administrador
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div 
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-[width] duration-200 ease-out z-40 ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-52'
        }`}
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}
      >
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 pt-4 pb-4 overflow-hidden shadow-lg dark:shadow-none">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-3 h-12">
            <div className="w-full flex items-center justify-start">
              <img 
                src={sidebarCollapsed 
                  ? (theme === 'dark' ? '/assets/logos/favicon-dark.svg' : '/assets/logos/favicon-light.svg')
                  : (theme === 'dark' ? '/assets/logos/logo-dark.svg' : '/assets/logos/logo-light.svg')
                }
                alt="Mis Canchas" 
                className="h-10 w-auto"
              />
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="mt-6 flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
            {navigationGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {groupIndex > 0 && (
                  <div className="mx-3 my-2 border-t border-gray-200 dark:border-gray-700" />
                )}
                
                <div className="px-2 space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                        item.current
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon className="flex-shrink-0 h-5 w-5" />
                      <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
                        sidebarCollapsed ? 'opacity-0' : 'opacity-100'
                      }`}>
                        {item.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          
          {/* User info at bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className={`flex-1 min-w-0 ml-3 transition-opacity duration-200 ${
                sidebarCollapsed ? 'opacity-0' : 'opacity-100'
              }`}>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {superAdmin?.name || 'Super Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Administrador
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex flex-col flex-1 transition-[padding] duration-200 ease-out ${
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-52'
      }`}>
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="w-full px-4">
            <div className="flex items-center h-12">
              {/* Mobile Menu Button */}
              <button
                type="button"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 lg:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Logo - Mobile only */}
              <div className="lg:hidden flex items-center mr-3">
                <img 
                  src={theme === 'dark' ? '/assets/logos/logo-dark.svg' : '/assets/logos/logo-light.svg'}
                  alt="Mis Canchas" 
                  className="h-10 w-auto"
                />
              </div>

              {/* Page controls slot */}
              <div id="header-page-controls" className="flex-1 flex items-center"></div>

              {/* Right side actions */}
              <div className="flex items-center space-x-1 ml-4">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200">
                  <Bell className="h-5 w-5" />
                </button>

                {/* Settings */}
                <Link
                  href="/control/configuracion"
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  <Settings className="h-5 w-5" />
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
