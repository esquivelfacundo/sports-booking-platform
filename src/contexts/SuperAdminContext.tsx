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
      // Validate against environment variables
      const validEmail = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL;
      const validPassword = process.env.NEXT_PUBLIC_SUPERADMIN_PASSWORD;
      const tokenSecret = process.env.NEXT_PUBLIC_SUPERADMIN_SECRET || 'default_secret';
      
      if (!validEmail || !validPassword) {
        console.error('Super admin credentials not configured');
        return false;
      }
      
      if (email === validEmail && password === validPassword) {
        const adminData: SuperAdmin = {
          id: 'super-admin-1',
          email: email,
          name: 'Super Administrador',
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

        // Generate token that backend will recognize
        const token = `superadmin_${tokenSecret}_${Date.now()}`;
        
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
