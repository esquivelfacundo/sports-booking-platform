'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SuperAdmin {
  id: string;
  email: string;
  name: string;
  role: 'super_admin';
  permissions: string[];
}

interface SuperAdminContextType {
  superAdmin: SuperAdmin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};

export const SuperAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('superAdminToken');
      const adminData = localStorage.getItem('superAdminData');
      
      if (token && adminData) {
        try {
          const admin = JSON.parse(adminData);
          setSuperAdmin(admin);
        } catch (error) {
          console.error('Error parsing super admin data:', error);
          localStorage.removeItem('superAdminToken');
          localStorage.removeItem('superAdminData');
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      
      const response = await fetch(`${apiUrl}/api/auth/superadmin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const adminData: SuperAdmin = {
          id: data.user.id,
          email: data.user.email,
          name: `${data.user.firstName} ${data.user.lastName}`,
          role: 'super_admin',
          permissions: [
            'manage_establishments',
            'manage_users',
            'view_analytics',
            'manage_platform',
            'approve_establishments',
            'delete_establishments',
            'view_financials'
          ]
        };

        // Store JWT tokens
        localStorage.setItem('auth_token', data.tokens.accessToken);
        localStorage.setItem('refresh_token', data.tokens.refreshToken);
        localStorage.setItem('superAdminToken', data.tokens.accessToken);
        localStorage.setItem('superAdminData', JSON.stringify(adminData));
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem('user_type', 'superadmin');
        
        setSuperAdmin(adminData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Super admin login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminData');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_type');
    setSuperAdmin(null);
  };

  const value: SuperAdminContextType = {
    superAdmin,
    isAuthenticated: !!superAdmin,
    isLoading,
    login,
    logout
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
};
