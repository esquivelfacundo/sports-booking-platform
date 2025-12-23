'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

interface ReportsTabProps {
  establishmentId: string;
  dateRange: { startDate: string; endDate: string };
  setDateRange: (value: { startDate: string; endDate: string }) => void;
}

interface StockSummary {
  movementsByType: Array<{
    type: string;
    count: number;
    totalValue: number;
  }>;
  inventoryValue: number;
  totalUnits: number;
  lowStockCount: number;
}

const ReportsTab = ({ establishmentId, dateRange, setDateRange }: ReportsTabProps) => {
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [establishmentId, dateRange]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getStockSummary({
        establishmentId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }) as any;
      setSummary(response);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      entrada: 'Entradas',
      salida: 'Salidas',
      ajuste: 'Ajustes',
      venta: 'Ventas',
      merma: 'Mermas'
    };
    return labels[type] || type;
  };

  const getMovementTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      entrada: 'text-emerald-400',
      salida: 'text-red-400',
      ajuste: 'text-blue-400',
      venta: 'text-purple-400',
      merma: 'text-orange-400'
    };
    return colors[type] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <UnifiedLoader size="sm" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Valor del Inventario</h3>
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${summary?.inventoryValue?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Valor total en stock</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Unidades Totales</h3>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {summary?.totalUnits || 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">En todos los productos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Productos con Stock Bajo</h3>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {summary?.lowStockCount || 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">Requieren atención</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm">Movimientos Totales</h3>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {summary?.movementsByType?.reduce((sum, m) => sum + (m.count || 0), 0) || 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">En el período</p>
        </motion.div>
      </div>

      {/* Movements by Type */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm dark:shadow-none">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Movimientos por Tipo</h3>
        
        {summary?.movementsByType && summary.movementsByType.length > 0 ? (
          <div className="space-y-4">
            {summary.movementsByType.map((movement) => (
              <div key={movement.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`text-2xl font-bold ${getMovementTypeColor(movement.type)}`}>
                    {movement.count || 0}
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{getMovementTypeLabel(movement.type)}</p>
                    {movement.totalValue && (
                      <p className="text-sm text-gray-400">
                        Valor: ${movement.totalValue.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      movement.type === 'entrada' ? 'bg-emerald-500' :
                      movement.type === 'salida' ? 'bg-red-500' :
                      movement.type === 'venta' ? 'bg-purple-500' :
                      movement.type === 'merma' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (movement.count / Math.max(...summary.movementsByType.map(m => m.count || 0))) * 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            No hay movimientos en el período seleccionado
          </p>
        )}
      </div>

      {/* Additional Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-blue-400 font-semibold">Análisis de Inventario</h3>
            <p className="text-gray-300 text-sm mt-1">
              Los reportes te ayudan a tomar decisiones informadas sobre compras, 
              identificar productos de alta rotación y optimizar tu inventario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
