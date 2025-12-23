'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, RefreshCw, Package } from 'lucide-react';
import { apiClient } from '@/lib/api';
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
      {/* Movements List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <p className="text-gray-400 mt-4">Cargando movimientos...</p>
        </div>
      ) : movements.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No hay movimientos</h3>
          <p className="text-gray-400 mb-6">Comienza registrando tu primer movimiento de stock</p>
          <button
            onClick={() => setShowSidebar(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {movements.map((movement) => (
            <motion.div
              key={movement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getMovementIcon(movement.type)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{movement.product.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getMovementColor(movement.type)}`}>
                        {getMovementLabel(movement.type)}
                      </span>
                      {movement.product.category && (
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: `${movement.product.category.color}20`,
                            color: movement.product.category.color
                          }}
                        >
                          {movement.product.category.name}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-400">Cantidad</p>
                        <p className={`font-semibold ${
                          movement.quantity > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.product.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Stock Anterior</p>
                        <p className="text-white">{movement.previousStock} {movement.product.unit}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Stock Nuevo</p>
                        <p className="text-white font-semibold">{movement.newStock} {movement.product.unit}</p>
                      </div>
                      {movement.totalCost && (
                        <div>
                          <p className="text-gray-400">Costo Total</p>
                          <p className="text-white">${movement.totalCost}</p>
                        </div>
                      )}
                    </div>

                    {movement.reason && (
                      <p className="text-gray-400 text-sm mt-2">
                        <span className="font-medium">Motivo:</span> {movement.reason}
                      </p>
                    )}

                    {movement.notes && (
                      <p className="text-gray-400 text-sm mt-1">
                        <span className="font-medium">Notas:</span> {movement.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>{formatDate(movement.createdAt)}</span>
                      <span>•</span>
                      <span>Por: {movement.user.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
