'use client';

import { useState } from 'react';
import { X, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface CashRegister {
  id: string;
  initialCash: number;
  expectedCash: number;
  totalCash: number;
  totalCard: number;
  totalTransfer: number;
  totalCreditCard: number;
  totalDebitCard: number;
  totalMercadoPago: number;
  totalOther: number;
  totalSales: number;
  totalExpenses: number;
  totalOrders: number;
}

interface CloseCashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseCashRegister: (actualCash: number, notes?: string) => Promise<void>;
  cashRegister: CashRegister | null;
}

export default function CloseCashRegisterModal({
  isOpen,
  onClose,
  onCloseCashRegister,
  cashRegister,
}: CloseCashRegisterModalProps) {
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !cashRegister) return null;

  const difference = actualCash ? parseFloat(actualCash) - cashRegister.expectedCash : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(actualCash);
    if (isNaN(amount) || amount < 0) {
      setError('Ingresa un monto válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onCloseCashRegister(amount, notes || undefined);
      setActualCash('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al cerrar la caja');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setActualCash('');
      setNotes('');
      setError(null);
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Cerrar Caja</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Resumen de Ventas */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Resumen de Ventas</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-500 mb-1">Total Ventas</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(cashRegister.totalSales)}</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-500 mb-1">Total Gastos</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(cashRegister.totalExpenses)}</p>
              </div>
            </div>

            <div className="bg-white rounded p-3">
              <p className="text-xs text-gray-500 mb-1">Cantidad de Pedidos</p>
              <p className="text-lg font-bold text-gray-900">{cashRegister.totalOrders}</p>
            </div>
          </div>

          {/* Desglose por Método de Pago */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Desglose por Método de Pago</h3>
            <div className="space-y-2">
              {cashRegister.totalCash > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-700">Efectivo</span>
                  <span className="font-semibold">{formatCurrency(cashRegister.totalCash)}</span>
                </div>
              )}
              {cashRegister.totalCard > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-700">Tarjeta</span>
                  <span className="font-semibold">{formatCurrency(cashRegister.totalCard)}</span>
                </div>
              )}
              {cashRegister.totalCreditCard > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-700">Crédito</span>
                  <span className="font-semibold">{formatCurrency(cashRegister.totalCreditCard)}</span>
                </div>
              )}
              {cashRegister.totalDebitCard > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-700">Débito</span>
                  <span className="font-semibold">{formatCurrency(cashRegister.totalDebitCard)}</span>
                </div>
              )}
              {cashRegister.totalTransfer > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-700">Transferencia</span>
                  <span className="font-semibold">{formatCurrency(cashRegister.totalTransfer)}</span>
                </div>
              )}
              {cashRegister.totalMercadoPago > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-700">MercadoPago</span>
                  <span className="font-semibold">{formatCurrency(cashRegister.totalMercadoPago)}</span>
                </div>
              )}
              {cashRegister.totalOther > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-700">Otros</span>
                  <span className="font-semibold">{formatCurrency(cashRegister.totalOther)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Efectivo */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Efectivo</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Efectivo inicial:</span>
                <span className="font-semibold">{formatCurrency(cashRegister.initialCash)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Efectivo esperado:</span>
                <span className="font-semibold text-blue-600">{formatCurrency(cashRegister.expectedCash)}</span>
              </div>
            </div>
          </div>

          {/* Conteo de Efectivo */}
          <div>
            <label htmlFor="actualCash" className="block text-sm font-medium text-gray-700 mb-2">
              Efectivo real contado *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="actualCash"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                disabled={loading}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Diferencia */}
          {actualCash && (
            <div className={`rounded-lg p-4 ${
              Math.abs(difference) < 0.01 ? 'bg-green-50 border border-green-200' :
              difference > 0 ? 'bg-blue-50 border border-blue-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {Math.abs(difference) < 0.01 ? (
                  <AlertCircle className="w-5 h-5 text-green-600" />
                ) : difference > 0 ? (
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold text-gray-900">Diferencia</span>
              </div>
              <p className={`text-2xl font-bold ${
                Math.abs(difference) < 0.01 ? 'text-green-600' :
                difference > 0 ? 'text-blue-600' :
                'text-red-600'
              }`}>
                {difference > 0 ? '+' : ''}{formatCurrency(difference)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {Math.abs(difference) < 0.01 ? 'Caja cuadrada ✓' :
                 difference > 0 ? 'Sobrante de efectivo' :
                 'Faltante de efectivo'}
              </p>
            </div>
          )}

          {/* Notas */}
          <div>
            <label htmlFor="closingNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Notas de cierre (opcional)
            </label>
            <textarea
              id="closingNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Observaciones sobre el cierre de caja..."
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Cerrando...' : 'Cerrar Caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
