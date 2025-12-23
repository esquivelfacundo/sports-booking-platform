'use client';

import { useState } from 'react';
import { X, DollarSign, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/contexts/ToastContext';

interface OpenCashRegisterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: (initialCash: number, notes?: string) => Promise<void>;
  requestPin?: (action: () => void, options?: { title?: string; description?: string }) => void;
}

export default function OpenCashRegisterSidebar({ isOpen, onClose, onOpen, requestPin }: OpenCashRegisterSidebarProps) {
  const [initialCash, setInitialCash] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(initialCash);
    if (isNaN(amount) || amount < 0) {
      setError('Ingrese un monto válido');
      return;
    }

    const executeOpen = async () => {
      setLoading(true);
      setError(null);

      try {
        await onOpen(amount, notes || undefined);
        setInitialCash('');
        setNotes('');
        showSuccess('Caja abierta', `Caja iniciada con $${amount.toLocaleString('es-AR')}`);
        onClose();
      } catch (err: any) {
        const errorMsg = err.message || 'Error al abrir la caja';
        setError(errorMsg);
        showError('Error al abrir caja', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (requestPin) {
      requestPin(executeOpen, { title: 'Abrir caja', description: 'Ingresa tu PIN para confirmar' });
    } else {
      await executeOpen();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setInitialCash('');
      setNotes('');
      setError(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Abrir Caja</h2>
                  <p className="text-sm text-gray-400">Iniciar nueva sesión de caja</p>
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
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 overflow-y-auto">
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Efectivo Inicial *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={initialCash}
                      onChange={(e) => setInitialCash(e.target.value)}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required
                      disabled={loading}
                      className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Monto de efectivo con el que inicia la caja
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Notas de Apertura (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Observaciones al abrir la caja..."
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-gray-700 flex gap-3">
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
                  disabled={loading || !initialCash}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Abriendo...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Abrir Caja
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
