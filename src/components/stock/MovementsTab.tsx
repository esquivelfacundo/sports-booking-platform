'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, RefreshCw, Package } from 'lucide-react';
import { apiClient } from '@/lib/api';
import UnifiedLoader from '@/components/ui/UnifiedLoader';
import { StockMovementSidebar } from './StockMovementSidebar';

interface StockMovement {
  id: string;
  type: 'entrada' | 'salida' | 'ajuste' | 'venta' | 'merma';
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  notes?: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    unit: string;
    category?: {
      name: string;
      color: string;
    };
  };
  user: {
    name: string;
    email: string;
  };
}

interface MovementsTabProps {
  establishmentId: string;
  filterType: string;
  setFilterType: (value: string) => void;
  showSidebar: boolean;
  setShowSidebar: (value: boolean) => void;
}

const MovementsTab = ({ 
  establishmentId,
  filterType,
  setFilterType,
  showSidebar,
  setShowSidebar
}: MovementsTabProps) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovements();
  }, [establishmentId, filterType]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params: any = { establishmentId, limit: 100 };
      if (filterType !== 'all') {
        params.type = filterType;
      }
      
      const response = await apiClient.getStockMovements(params) as any;
      setMovements(response.movements || []);
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMovementSaved = () => {
    fetchMovements();
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entrada':
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'salida':
      case 'venta':
      case 'merma':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'ajuste':
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'entrada':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'salida':
      case 'venta':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'merma':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'ajuste':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getMovementLabel = (type: string) => {
    const labels: Record<string, string> = {
      entrada: 'Entrada',
      salida: 'Salida',
      ajuste: 'Ajuste',
      venta: 'Venta',
      merma: 'Merma'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Movements Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-none">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <UnifiedLoader size="sm" />
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hay movimientos</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Comienza registrando tu primer movimiento de stock</p>
            <button
              onClick={() => setShowSidebar(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Movimiento</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Stock Anterior</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Stock Nuevo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Costo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {movements.map((movement, index) => (
                  <motion.tr
                    key={movement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getMovementIcon(movement.type)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{movement.product.name}</div>
                          {movement.product.category && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{movement.product.category.name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMovementColor(movement.type)}`}>
                        {getMovementLabel(movement.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${movement.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {movement.previousStock} {movement.product.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {movement.newStock} {movement.product.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {movement.totalCost ? `$${movement.totalCost.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(movement.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {movement.user.name}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <StockMovementSidebar
        isOpen={showSidebar}
        establishmentId={establishmentId}
        onClose={() => setShowSidebar(false)}
        onSave={handleMovementSaved}
      />
    </div>
  );
};

export default MovementsTab;
