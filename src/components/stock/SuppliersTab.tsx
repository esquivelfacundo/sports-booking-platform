'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Truck, Search, Plus, Edit2, Trash2, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';
import UnifiedLoader from '@/components/ui/UnifiedLoader';
import SupplierSidebar from './SupplierSidebar';

interface Supplier {
  id: string;
  name: string;
  businessName: string | null;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SuppliersTabProps {
  establishmentId: string;
  showSidebar?: boolean;
  setShowSidebar?: (show: boolean) => void;
}

export default function SuppliersTab({ establishmentId, showSidebar, setShowSidebar }: SuppliersTabProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [localSidebarOpen, setLocalSidebarOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  // Use external state if provided, otherwise use local state
  const sidebarOpen = showSidebar !== undefined ? showSidebar : localSidebarOpen;
  const setSidebarOpen = setShowSidebar || setLocalSidebarOpen;

  useEffect(() => {
    loadSuppliers();
  }, [establishmentId]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getSuppliers({
        establishmentId,
        isActive: true
      }) as any;
      setSuppliers(response.suppliers || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.businessName && s.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.taxId && s.taxId.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <UnifiedLoader size="sm" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar proveedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            {searchTerm ? 'No se encontraron proveedores' : 'No hay proveedores'}
          </h3>
          <p className="text-gray-500 text-sm">
            {searchTerm ? 'Intenta con otra búsqueda' : 'Crea tu primer proveedor para comenzar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm dark:shadow-none"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{supplier.name}</h3>
                    {supplier.businessName && (
                      <p className="text-xs text-gray-500">{supplier.businessName}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {supplier.taxId && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span className="font-mono">{supplier.taxId}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{supplier.address}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setEditingSupplier(supplier);
                    setSidebarOpen(true);
                  }}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Supplier Button (floating) */}
      <button
        onClick={() => {
          setEditingSupplier(null);
          setSidebarOpen(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Supplier Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <SupplierSidebar
            isOpen={sidebarOpen}
            onClose={() => {
              setSidebarOpen(false);
              setEditingSupplier(null);
            }}
            establishmentId={establishmentId}
            supplier={editingSupplier}
            onSave={loadSuppliers}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
