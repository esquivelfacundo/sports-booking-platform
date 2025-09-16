'use client';

import { EstablishmentProvider } from '@/contexts/EstablishmentContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <EstablishmentProvider>
      {children}
    </EstablishmentProvider>
  );
};

export default DashboardLayout;
