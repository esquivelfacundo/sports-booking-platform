'use client';

import AdminNavbar from '@/components/establishment/AdminNavbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* AdminNavbar handles all navigation and establishment data */}
      <AdminNavbar />
      
      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
