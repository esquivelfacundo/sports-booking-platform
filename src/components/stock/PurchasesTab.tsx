'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, TrendingUp, ShoppingCart, ChevronDown, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

interface ProductPurchase {
  productId: string;
  productName: string;
  unit: string;
  totalQuantity: number;
  totalCost: number;
  purchases: {
    id: string;
    date: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    invoiceNumber?: string;
    notes?: string;
    user?: string;
  }[];
}

interface PurchasesResponse {
  success: boolean;
  period: { start: string; end: string; label: string };
  totals: {
    totalProducts: number;
    totalQuantity: number;
    totalCost: number;
    totalPurchases: number;
  };
  products: ProductPurchase[];
}

interface PurchasesTabProps {
  establishmentId: string;
}

const PurchasesTab: React.FC<PurchasesTabProps> = ({ establishmentId }) => {
  const [purchases, setPurchases] = useState<PurchasesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPurchasesByProduct(establishmentId, selectedPeriod);
      setPurchases(response as PurchasesResponse);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  }, [establishmentId, selectedPeriod]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <UnifiedLoader size="md" />
      </div>
    );
  }

  if (!purchases) return null;

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Compras por Producto</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {purchases.period.start} - {purchases.period.end}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 pr-8"
            >
              <option value="day">Último día</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último año</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={fetchPurchases}
            className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Compras</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{purchases.totals.totalPurchases}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Productos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{purchases.totals.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Unidades</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{purchases.totals.totalQuantity}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Costo Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(purchases.totals.totalCost)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Producto</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Cantidad</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Costo Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Costo Promedio</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Compras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {purchases.products.map((product) => (
                <>
                  <tr
                    key={product.productId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => setExpandedProduct(expandedProduct === product.productId ? null : product.productId)}
                  >
                    <td className="px-4 py-3">
                      <div className="text-gray-900 dark:text-white font-medium">{product.productName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{product.unit}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                      {product.totalQuantity}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                      {formatCurrency(product.totalCost)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                      {formatCurrency(product.totalCost / product.totalQuantity)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                      {product.purchases.length}
                    </td>
                  </tr>
                  {expandedProduct === product.productId && (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Detalle de compras</p>
                          <div className="space-y-1">
                            {product.purchases.map((purchase) => (
                              <div key={purchase.id} className="flex items-center justify-between text-sm p-2 bg-white dark:bg-gray-800 rounded">
                                <div className="flex-1">
                                  <span className="text-gray-600 dark:text-gray-300">{formatDate(purchase.date)}</span>
                                  {purchase.invoiceNumber && (
                                    <span className="ml-2 text-xs text-gray-500">#{purchase.invoiceNumber}</span>
                                  )}
                                  {purchase.user && (
                                    <span className="ml-2 text-xs text-gray-500">por {purchase.user}</span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4">
                                  <span className="text-gray-600 dark:text-gray-300">{purchase.quantity} {product.unit}</span>
                                  <span className="text-gray-500">@{formatCurrency(purchase.unitCost)}</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium min-w-[100px] text-right">
                                    {formatCurrency(purchase.totalCost)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {purchases.products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No hay compras en este período
                  </td>
                </tr>
              )}
              {purchases.products.length > 0 && (
                <tr className="bg-gray-50 dark:bg-gray-700/50 font-bold">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">TOTAL</td>
                  <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                    {purchases.totals.totalQuantity}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(purchases.totals.totalCost)}
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                    {purchases.totals.totalPurchases}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchasesTab;
