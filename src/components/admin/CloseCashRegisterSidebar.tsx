'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign, FileText, TrendingUp, TrendingDown, CreditCard, Banknote, ArrowRightLeft, Printer } from 'lucide-react';
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

interface CashRegisterMovement {
  id: string;
  type: 'sale' | 'expense' | 'withdrawal' | 'deposit' | 'adjustment';
  amount: number;
  paymentMethod: string;
  description: string | null;
  notes: string | null;
  registeredAt: string;
  order?: { id: string; orderNumber: string } | null;
  booking?: { id: string; guestName: string } | null;
  expenseCategory?: { id: string; name: string; color: string } | null;
  registeredByUser?: { id: string; name: string } | null;
}

interface CloseCashRegisterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseCashRegister: (actualCash: number, notes?: string) => Promise<void>;
  cashRegister: CashRegister | null;
  movements?: CashRegisterMovement[];
  requestPin?: (action: () => void, options?: { title?: string; description?: string }) => void;
}

export default function CloseCashRegisterSidebar({ 
  isOpen, 
  onClose, 
  onCloseCashRegister, 
  cashRegister,
  movements = [],
  requestPin
}: CloseCashRegisterSidebarProps) {
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();
  
  // Bill counting state
  const [billCounts, setBillCounts] = useState<Record<number, number>>({
    20000: 0,
    10000: 0,
    2000: 0,
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0
  });
  
  // Print confirmation state
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [pendingCloseData, setPendingCloseData] = useState<{ amount: number; notes?: string } | null>(null);
  
  const billDenominations = [20000, 10000, 2000, 1000, 500, 200, 100, 50, 20, 10];
  
  const calculateTotalFromBills = () => {
    return Object.entries(billCounts).reduce((sum, [denom, count]) => sum + (parseInt(denom) * count), 0);
  };
  
  const handleBillCountChange = (denomination: number, count: number) => {
    const newCounts = { ...billCounts, [denomination]: Math.max(0, count) };
    setBillCounts(newCounts);
    const total = Object.entries(newCounts).reduce((sum, [denom, c]) => sum + (parseInt(denom) * c), 0);
    setActualCash(total.toString());
  };

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

    // Store data and show print confirmation
    setPendingCloseData({ amount, notes: notes || undefined });
    setShowPrintConfirm(true);
  };

  const executeCloseWithPrint = async (shouldPrint: boolean) => {
    if (!pendingCloseData) return;
    
    const executeClose = async () => {
      setLoading(true);
      setError(null);
      setShowPrintConfirm(false);

      try {
        // Print ticket if requested
        if (shouldPrint && cashRegister) {
          printClosingTicket();
        }
        
        await onCloseCashRegister(pendingCloseData.amount, pendingCloseData.notes);
        setActualCash('');
        setNotes('');
        setBillCounts({20000: 0, 10000: 0, 2000: 0, 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0});
        setPendingCloseData(null);
        const diff = cashRegister ? pendingCloseData.amount - cashRegister.expectedCash : 0;
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

  const printClosingTicket = () => {
    if (!cashRegister) return;
    
    const actualAmount = pendingCloseData?.amount || 0;
    const difference = actualAmount - (cashRegister.expectedCash || 0);
    
    // Build bill counts string
    const billCountsStr = billDenominations
      .filter(denom => billCounts[denom] > 0)
      .map(denom => `$${denom.toLocaleString()} x ${billCounts[denom]} = $${(denom * billCounts[denom]).toLocaleString()}`)
      .join('\n');
    
    // Build products sold section from movements
    const salesMovements = movements.filter(m => m.type === 'sale');
    const expenseMovements = movements.filter(m => m.type === 'expense');
    
    // Group sales by description for summary
    const productSales: Record<string, { qty: number; total: number }> = {};
    salesMovements.forEach(m => {
      const desc = m.description || m.order?.orderNumber || m.booking?.guestName || 'Venta';
      if (!productSales[desc]) {
        productSales[desc] = { qty: 0, total: 0 };
      }
      productSales[desc].qty += 1;
      productSales[desc].total += m.amount;
    });
    
    const salesStr = Object.entries(productSales)
      .map(([desc, data]) => `${desc.substring(0, 20).padEnd(20)} x${data.qty} ${formatCurrency(data.total)}`)
      .join('\n');
    
    const expensesStr = expenseMovements
      .map(m => `${(m.expenseCategory?.name || m.description || 'Gasto').substring(0, 25).padEnd(25)} ${formatCurrency(m.amount)}`)
      .join('\n');
    
    const ticketContent = `
================================
      CIERRE DE CAJA
================================
Fecha: ${new Date().toLocaleDateString('es-AR')}
Hora: ${new Date().toLocaleTimeString('es-AR')}
Abierta: ${formatDateTime(cashRegister.openedAt)}
Duración: ${getDuration(cashRegister.openedAt)}
--------------------------------
VENTAS POR MÉTODO DE PAGO
--------------------------------
Efectivo:      ${formatCurrency(cashRegister.totalCash)}
Transferencia: ${formatCurrency(cashRegister.totalTransfer)}
Crédito:       ${formatCurrency((parseFloat(String(cashRegister.totalCreditCard)) || 0) + (parseFloat(String(cashRegister.totalCard)) || 0))}
Débito:        ${formatCurrency(cashRegister.totalDebitCard)}
--------------------------------
TOTALES
--------------------------------
Total Ventas:    ${formatCurrency(cashRegister.totalSales)}
Total Gastos:    ${formatCurrency(cashRegister.totalExpenses)}
Movimientos:     ${cashRegister.totalMovements}
${salesStr ? `
--------------------------------
DETALLE DE VENTAS (${salesMovements.length})
--------------------------------
${salesStr}` : ''}
${expensesStr ? `
--------------------------------
DETALLE DE GASTOS (${expenseMovements.length})
--------------------------------
${expensesStr}` : ''}
--------------------------------
EFECTIVO
--------------------------------
Caja Inicial:    ${formatCurrency(cashRegister.initialCash)}
Efectivo Esperado: ${formatCurrency(cashRegister.expectedCash)}
Efectivo Real:   ${formatCurrency(actualAmount)}
Diferencia:      ${difference >= 0 ? '+' : ''}${formatCurrency(difference)}
${billCountsStr ? `
--------------------------------
CONTEO DE BILLETES
--------------------------------
${billCountsStr}
Total Contado:   ${formatCurrency(calculateTotalFromBills())}` : ''}
${notes ? `
--------------------------------
OBSERVACIONES
--------------------------------
${notes}` : ''}
================================
    `;
    
    // Create print window
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket de Cierre de Caja</title>
            <style>
              body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; }
              pre { white-space: pre-wrap; word-wrap: break-word; }
            </style>
          </head>
          <body>
            <pre>${ticketContent}</pre>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
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

  const formatCurrency = (amount: number | string | null | undefined) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
    if (isNaN(numAmount)) return '$0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
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
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Banknote className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-gray-400">Efectivo</span>
                      </div>
                      <p className="text-lg font-bold text-white">{formatCurrency(cashRegister.totalCash || 0)}</p>
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

                {/* Conteo de billetes - Siempre visible */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-300 mb-3 block">
                    Conteo de Billetes
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {billDenominations.map((denom) => (
                      <div key={denom} className="flex items-center justify-between bg-gray-700/50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-300 font-medium">${denom.toLocaleString()}</span>
                        <input
                          type="number"
                          min="0"
                          value={billCounts[denom] || 0}
                          onChange={(e) => handleBillCountChange(denom, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-center text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total contado:</span>
                    <span className="text-xl font-bold text-emerald-400">{formatCurrency(calculateTotalFromBills())}</span>
                  </div>
                </div>

                {/* Efectivo Real en Caja */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Efectivo Real en Caja *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={actualCash}
                      onChange={(e) => {
                        setActualCash(e.target.value);
                        // Reset bill counts when manually editing
                        setBillCounts({20000: 0, 10000: 0, 2000: 0, 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0});
                      }}
                      step="1"
                      min="0"
                      placeholder="0"
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
      
      {/* Print Confirmation Modal */}
      {showPrintConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-xl p-6 max-w-sm mx-4 shadow-2xl border border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Printer className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">¿Imprimir ticket?</h3>
                <p className="text-sm text-gray-400">Ticket de cierre de caja</p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-6">
              ¿Deseas imprimir el ticket de cierre con el resumen de ventas, métodos de pago y conteo de billetes?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => executeCloseWithPrint(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                No imprimir
              </button>
              <button
                onClick={() => executeCloseWithPrint(true)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
