'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign, FileText, TrendingUp, TrendingDown, CreditCard, Banknote, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/contexts/ToastContext';

interface CashRegister {
  id: string;
  openedAt: string;
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
  totalMovements: number;
}

interface CloseCashRegisterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseCashRegister: (actualCash: number, notes?: string) => Promise<void>;
  cashRegister: CashRegister | null;
  requestPin?: (action: () => void, options?: { title?: string; description?: string }) => void;
}

export default function CloseCashRegisterSidebar({ 
  isOpen, 
  onClose, 
  onCloseCashRegister, 
  cashRegister,
  requestPin
}: CloseCashRegisterSidebarProps) {
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen && cashRegister) {
      setActualCash(cashRegister.expectedCash.toString());
    }
  }, [isOpen, cashRegister]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(actualCash);
    if (isNaN(amount) || amount < 0) {
      setError('Ingrese un monto válido');
      return;
    }

    const executeClose = async () => {
      setLoading(true);
      setError(null);

      try {
        await onCloseCashRegister(amount, notes || undefined);
        setActualCash('');
        setNotes('');
        const diff = cashRegister ? amount - cashRegister.expectedCash : 0;
        const diffText = diff === 0 ? 'sin diferencia' : diff > 0 ? `+$${diff.toLocaleString('es-AR')} sobrante` : `-$${Math.abs(diff).toLocaleString('es-AR')} faltante`;
        showSuccess('Caja cerrada', `Total ventas: $${cashRegister?.totalSales.toLocaleString('es-AR') || 0} (${diffText})`);
        onClose();
      } catch (err: any) {
        const errorMsg = err.message || 'Error al cerrar la caja';
        setError(errorMsg);
        showError('Error al cerrar caja', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (requestPin) {
      requestPin(executeClose, { title: 'Cerrar caja', description: 'Ingresa tu PIN para confirmar' });
    } else {
      await executeClose();
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (openedAt: string) => {
    const start = new Date(openedAt);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const cashDifference = cashRegister ? parseFloat(actualCash || '0') - cashRegister.expectedCash : 0;

  if (!cashRegister) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={handleClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-900 border-l border-gray-700 z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Cerrar Caja</h2>
                  <p className="text-sm text-gray-400">
                    Abierta desde {formatDateTime(cashRegister.openedAt)} • {getDuration(cashRegister.openedAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Resumen de Caja */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Resumen de Caja</h3>
                  
                  {/* Ventas por método de pago */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Banknote className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-gray-400">Efectivo</span>
                      </div>
                      <p className="text-lg font-bold text-white">{formatCurrency(cashRegister.totalCash || 0)}</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-gray-400">Crédito</span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency((cashRegister.totalCreditCard || 0) + (cashRegister.totalCard || 0))}
                      </p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-gray-400">Débito</span>
                      </div>
                      <p className="text-lg font-bold text-white">{formatCurrency(cashRegister.totalDebitCard || 0)}</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-gray-400">Transferencia</span>
                      </div>
                      <p className="text-lg font-bold text-white">{formatCurrency(cashRegister.totalTransfer || 0)}</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-gray-400">MercadoPago</span>
                      </div>
                      <p className="text-lg font-bold text-white">{formatCurrency(cashRegister.totalMercadoPago || 0)}</p>
                    </div>
                  </div>

                  {/* Totales */}
                  <div className="space-y-2 pt-3 border-t border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        Total Ventas
                      </span>
                      <span className="text-green-400 font-bold">{formatCurrency(cashRegister.totalSales)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        Total Gastos
                      </span>
                      <span className="text-red-400 font-bold">{formatCurrency(cashRegister.totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                      <span className="text-gray-300">Caja Inicial</span>
                      <span className="text-white">{formatCurrency(cashRegister.initialCash)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Efectivo Esperado</span>
                      <span className="text-white font-bold">{formatCurrency(cashRegister.expectedCash)}</span>
                    </div>
                  </div>
                </div>

                {/* Efectivo Neto Card */}
                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                  <p className="text-sm text-blue-300 mb-1">Efectivo Neto</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatCurrency(cashRegister.expectedCash)}
                  </p>
                  <p className="text-xs text-blue-300/70 mt-1">
                    Inicial ({formatCurrency(cashRegister.initialCash)}) + Efectivo ({formatCurrency(cashRegister.totalCash)}) - Gastos en efectivo
                  </p>
                </div>

                {/* Conteo de efectivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Efectivo Real en Caja *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required
                      disabled={loading}
                      className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Diferencia */}
                {actualCash && (
                  <div className={`rounded-lg p-4 ${
                    Math.abs(cashDifference) < 0.01 
                      ? 'bg-green-900/30 border border-green-700/50' 
                      : cashDifference > 0 
                        ? 'bg-blue-900/30 border border-blue-700/50' 
                        : 'bg-red-900/30 border border-red-700/50'
                  }`}>
                    <p className="text-sm text-gray-300 mb-1">Diferencia de Caja</p>
                    <p className={`text-2xl font-bold ${
                      Math.abs(cashDifference) < 0.01 
                        ? 'text-green-400' 
                        : cashDifference > 0 
                          ? 'text-blue-400' 
                          : 'text-red-400'
                    }`}>
                      {cashDifference > 0 ? '+' : ''}{formatCurrency(cashDifference)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {Math.abs(cashDifference) < 0.01 
                        ? 'La caja cuadra perfectamente' 
                        : cashDifference > 0 
                          ? 'Sobrante de caja' 
                          : 'Faltante de caja'}
                    </p>
                  </div>
                )}

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Observaciones de Cierre (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Observaciones al cerrar la caja..."
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="p-4 border-t border-gray-700 bg-gray-900 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !actualCash}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Cerrando...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Cerrar Caja
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
