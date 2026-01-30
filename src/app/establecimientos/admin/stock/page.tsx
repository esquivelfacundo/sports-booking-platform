'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Package, TrendingUp, DollarSign, Plus, Search, Filter, FileText, Truck, Download, Upload } from 'lucide-react';
import UnifiedLoader from '@/components/ui/UnifiedLoader';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductsTab from '@/components/stock/ProductsTab';
import MovementsTab from '@/components/stock/MovementsTab';
import ReportsTab from '@/components/stock/ReportsTab';
import SuppliersTab from '@/components/stock/SuppliersTab';
import PurchasesTab from '@/components/stock/PurchasesTab';
import ImportProductsSidebar from '@/components/stock/ImportProductsSidebar';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { apiClient } from '@/lib/api';

type Tab = 'products' | 'movements' | 'suppliers' | 'reports' | 'purchases';

interface Category {
  id: string;
  name: string;
  color: string;
}

const StockPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const { establishment } = useEstablishment();
  const [headerPortalContainer, setHeaderPortalContainer] = useState<HTMLElement | null>(null);
  
  // Read tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['products', 'movements', 'suppliers', 'reports', 'purchases'].includes(tabParam)) {
      setActiveTab(tabParam as Tab);
    }
  }, [searchParams]);
  
  // Update URL when tab changes
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.push(`/establecimientos/admin/stock?tab=${tab}`, { scroll: false });
  };
  
  // Products tab state
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showProductSidebar, setShowProductSidebar] = useState(false);
  const [showCategorySidebar, setShowCategorySidebar] = useState(false);
  
  // Movements tab state
  const [movementType, setMovementType] = useState('all');
  const [showMovementSidebar, setShowMovementSidebar] = useState(false);
  
  // Suppliers tab state
  const [showSupplierSidebar, setShowSupplierSidebar] = useState(false);
  
  // Import sidebar state
  const [showImportSidebar, setShowImportSidebar] = useState(false);
  const [refreshProducts, setRefreshProducts] = useState(0);
  
  // Reports tab state
  const [reportDateRange, setReportDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [isExporting, setIsExporting] = useState(false);

  // Get the header portal container on mount
  useEffect(() => {
    const container = document.getElementById('header-page-controls');
    if (container) {
      setHeaderPortalContainer(container);
    }
  }, []);

  // Fetch categories for products tab
  const fetchCategories = useCallback(async () => {
    if (!establishment?.id) return;
    try {
      const response = await apiClient.getProductCategories(establishment.id) as any;
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [establishment?.id]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleExport = async (type: 'inventory' | 'purchases' | 'movements' | 'low-stock' | 'waste') => {
    if (!establishment?.id) return;
    setIsExporting(true);
    try {
      if (type === 'purchases') {
        await apiClient.exportPurchasesToCSV({ establishmentId: establishment.id });
      } else if (type === 'movements') {
        await apiClient.exportStockMovementsToCSV({ establishmentId: establishment.id });
      } else if (type === 'low-stock') {
        await apiClient.exportLowStockProductsToCSV({ establishmentId: establishment.id });
      } else if (type === 'waste') {
        await apiClient.exportWasteToCSV({ establishmentId: establishment.id });
      } else {
        await apiClient.exportInventoryToCSV({
          establishmentId: establishment.id,
          categoryId: productCategory !== 'all' ? productCategory : undefined
        });
      }
    } catch (error: any) {
      console.error('Error exporting:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const tabs = [
    { id: 'products' as Tab, name: 'Productos', icon: Package },
    { id: 'movements' as Tab, name: 'Movimientos', icon: TrendingUp },
    { id: 'purchases' as Tab, name: 'Compras', icon: DollarSign },
    { id: 'suppliers' as Tab, name: 'Proveedores', icon: Truck }
  ];

  // Header controls based on active tab
  const headerControls = (
    <div className="flex items-center w-full space-x-2 overflow-x-auto">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex-shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Products Tab Controls */}
      {activeTab === 'products' && (
        <>
          {/* Search */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 w-32"
            />
          </div>

          {/* Category Filter */}
          <select
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 flex-shrink-0"
          >
            <option value="all">Categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Categories Button */}
          <button
            onClick={() => setShowCategorySidebar(true)}
            className="p-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-lg transition-colors flex-shrink-0"
            title="Categorías"
          >
            <Filter className="h-4 w-4" />
          </button>

          {/* Export Dropdown */}
          <div className="relative flex-shrink-0">
            <select
              onChange={(e) => {
                if (e.target.value) handleExport(e.target.value as 'inventory' | 'purchases' | 'movements' | 'low-stock' | 'waste');
                e.target.value = '';
              }}
              disabled={isExporting}
              className="p-1.5 w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 appearance-none cursor-pointer opacity-0 absolute inset-0 z-10"
              title="Exportar"
            >
              <option value=""></option>
              <option value="inventory">Inventario</option>
              <option value="purchases">Compras</option>
              <option value="movements">Movimientos</option>
              <option value="low-stock">Stock Bajo</option>
              <option value="waste">Mermas</option>
            </select>
            <div className={`p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors ${isExporting ? 'opacity-50' : ''}`}>
              <Download className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
            </div>
          </div>

          {/* Import Button */}
          <button
            onClick={() => setShowImportSidebar(true)}
            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-shrink-0"
            title="Importar Productos"
          >
            <Upload className="h-4 w-4" />
          </button>

          {/* New Product Button */}
          <button
            onClick={() => setShowProductSidebar(true)}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Producto</span>
          </button>
        </>
      )}

      {/* Movements Tab Controls */}
      {activeTab === 'movements' && (
        <>
          {/* Movement Type Filter */}
          <select
            value={movementType}
            onChange={(e) => setMovementType(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 flex-shrink-0"
          >
            <option value="all">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
            <option value="ajuste">Ajustes</option>
            <option value="venta">Ventas</option>
            <option value="merma">Mermas</option>
          </select>

          {/* OCR Invoice Button */}
          <button
            onClick={() => router.push('/establecimientos/admin/stock/ingreso')}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex-shrink-0"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline"></span>
          </button>

          {/* Register Movement Button */}
          <button
            onClick={() => setShowMovementSidebar(true)}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Registrar Movimiento</span>
          </button>
        </>
      )}

      {/* Suppliers Tab Controls */}
      {activeTab === 'suppliers' && (
        <button
          onClick={() => setShowSupplierSidebar(true)}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Proveedor</span>
        </button>
      )}

      {/* Reports Tab Controls */}
      {activeTab === 'reports' && (
        <div className="flex items-center space-x-1 flex-shrink-0">
          <input
            type="date"
            value={reportDateRange.startDate}
            onChange={(e) => setReportDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 w-32"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={reportDateRange.endDate}
            onChange={(e) => setReportDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 w-32"
          />
        </div>
      )}
    </div>
  );

  if (!establishment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <UnifiedLoader size="lg" />
      </div>
    );
  }

  return (
    <>
      {/* Render controls in header via portal */}
      {headerPortalContainer && createPortal(headerControls, headerPortalContainer)}
      
      <div className="p-6">
          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'products' && (
              <ProductsTab 
                establishmentId={establishment.id}
                searchTerm={productSearch}
                setSearchTerm={setProductSearch}
                selectedCategory={productCategory}
                setSelectedCategory={setProductCategory}
                showProductSidebar={showProductSidebar}
                setShowProductSidebar={setShowProductSidebar}
                showCategorySidebar={showCategorySidebar}
                setShowCategorySidebar={setShowCategorySidebar}
                onCategoriesChange={fetchCategories}
              />
            )}
            {activeTab === 'movements' && (
              <MovementsTab 
                establishmentId={establishment.id}
                filterType={movementType}
                setFilterType={setMovementType}
                showSidebar={showMovementSidebar}
                setShowSidebar={setShowMovementSidebar}
              />
            )}
            {activeTab === 'suppliers' && (
              <SuppliersTab 
                establishmentId={establishment.id}
                showSidebar={showSupplierSidebar}
                setShowSidebar={setShowSupplierSidebar}
              />
            )}
            {activeTab === 'purchases' && (
              <PurchasesTab 
                establishmentId={establishment.id}
              />
            )}
            {activeTab === 'reports' && (
              <ReportsTab 
                establishmentId={establishment.id}
                dateRange={reportDateRange}
                setDateRange={setReportDateRange}
              />
            )}
          </motion.div>
        </div>

      {/* Import Products Sidebar */}
      <ImportProductsSidebar
        isOpen={showImportSidebar}
        onClose={() => setShowImportSidebar(false)}
        establishmentId={establishment.id}
        onImportComplete={() => setRefreshProducts(prev => prev + 1)}
      />
    </>
  );
};

export default StockPage;
