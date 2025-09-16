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
      // For now, use hardcoded credentials - in production this would be a secure API call
      if (email === 'fesquivel@lidius.co' && password === 'Lidius@2001-mc') {
        const adminData: SuperAdmin = {
          id: 'super-admin-1',
          email: 'fesquivel@lidius.co',
          name: 'Facundo Esquivel',
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

        // Generate a mock token
        const token = `super_admin_token_${Date.now()}`;
        
        localStorage.setItem('superAdminToken', token);
        localStorage.setItem('superAdminData', JSON.stringify(adminData));
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
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminData');
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
