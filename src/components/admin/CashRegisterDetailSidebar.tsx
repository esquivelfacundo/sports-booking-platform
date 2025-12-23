'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign, TrendingUp, TrendingDown, Clock, User, Printer, Banknote, CreditCard, Building2, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { printCashRegisterTicket, CashRegisterTicketData } from '@/lib/ticketPrinter';
import { useToast } from '@/contexts/ToastContext';

interface CashRegisterHistory {
  id: string;
  openedAt: string;
  closedAt: string | null;
  initialCash: number;
  expectedCash: number;
  actualCash: number | null;
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
  status: string;
  cashDifference: number | null;
  user?: {
    name: string;
  };
}

interface CashRegisterMovement {
  id: string;
  type: 'sale' | 'expense';
  amount: number;
  paymentMethod: string;
  description?: string;
  registeredAt: string;
  order?: {
    id: string;
    orderNumber: number;
  };
  booking?: {
    guestName: string;
  };
  expenseCategory?: {
    name: string;
    color: string;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  icon: string | null;
}

interface CashRegisterDetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cashRegister: CashRegisterHistory | null;
  paymentMethods: PaymentMethod[];
}

const getPaymentMethodIcon = (code: string) => {
  switch (code) {
    case 'cash': return Banknote;
    case 'card':
    case 'credit_card':
    case 'debit_card': return CreditCard;
    case 'transfer': return Building2;
    case 'mercadopago': return Smartphone;
    default: return DollarSign;
  }
};

const getPaymentMethodColor = (code: string) => {
  switch (code) {
    case 'cash': return 'text-green-400';
    case 'card':
    case 'credit_card':
    case 'debit_card': return 'text-blue-400';
    case 'transfer': return 'text-purple-400';
    case 'mercadopago': return 'text-cyan-400';
    default: return 'text-gray-400';
  }
};

const getPaymentMethodTotal = (cr: CashRegisterHistory, code: string): number => {
  switch (code) {
    case 'cash': return cr.totalCash || 0;
    case 'card': return (cr.totalCard || 0) + (cr.totalCreditCard || 0) + (cr.totalDebitCard || 0);
    case 'credit_card': return cr.totalCreditCard || 0;
    case 'debit_card': return cr.totalDebitCard || 0;
    case 'transfer': return cr.totalTransfer || 0;
    case 'mercadopago': return cr.totalMercadoPago || 0;
    default: return cr.totalOther || 0;
  }
};

const getPaymentMethodLabel = (code: string) => {
  switch (code) {
    case 'cash': return 'Efectivo';
    case 'card': return 'Tarjeta';
    case 'credit_card': return 'Tarjeta Crédito';
    case 'debit_card': return 'Tarjeta Débito';
    case 'transfer': return 'Transferencia';
    case 'mercadopago': return 'MercadoPago';
    default: return 'Otro';
  }
};

export default function CashRegisterDetailSidebar({
  isOpen,
  onClose,
  cashRegister,
  paymentMethods
}: CashRegisterDetailSidebarProps) {
  const [movements, setMovements] = useState<CashRegisterMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen && cashRegister?.id) {
      loadMovements();
    }
  }, [isOpen, cashRegister?.id]);

  const loadMovements = async () => {
    if (!cashRegister?.id) return;
    
    setMovementsLoading(true);
    try {
      const response: any = await apiClient.getCashRegisterMovements({
        cashRegisterId: cashRegister.id
      });
      setMovements(response.movements || []);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setMovementsLoading(false);
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

  const handlePrintTicket = async () => {
    if (!cashRegister) return;

    setIsPrinting(true);
    try {
      const ticketData: CashRegisterTicketData = {
        establishmentName: 'Establecimiento',
        cashRegisterId: cashRegister.id,
        openedAt: cashRegister.openedAt,
        closedAt: cashRegister.closedAt || new Date().toISOString(),
        cashierName: cashRegister.user?.name || 'Usuario',
        initialCash: cashRegister.initialCash,
        totalSales: cashRegister.totalSales,
        totalExpenses: cashRegister.totalExpenses,
        expectedCash: cashRegister.expectedCash,
        actualCash: cashRegister.actualCash || cashRegister.expectedCash,
        cashDifference: cashRegister.cashDifference || 0,
        totalOrders: cashRegister.totalOrders,
        paymentMethods: paymentMethods.map(pm => ({
          name: pm.name,
          amount: getPaymentMethodTotal(cashRegister, pm.code),
          count: 0
        })),
        expenses: egresos.map(e => ({
          description: e.description || 'Gasto',
          category: e.expenseCategory?.name,
          method: getPaymentMethodLabel(e.paymentMethod),
          amount: e.amount
        }))
      };

      await printCashRegisterTicket(ticketData);
      showSuccess('Ticket impreso', 'El ticket se ha enviado a la impresora');
    } catch (error: any) {
      showError('Error al imprimir', error.message || 'No se pudo imprimir el ticket');
    } finally {
      setIsPrinting(false);
    }
  };

  if (!cashRegister) return null;

  const ingresos = movements.filter(m => m.type === 'sale');
  const egresos = movements.filter(m => m.type === 'expense');

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
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full bg-gray-900 border-l border-gray-700 z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Detalle de Caja</h2>
                  <p className="text-sm text-gray-400">
                    {cashRegister.user?.name || 'Usuario'} • {formatDateTime(cashRegister.openedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cashRegister.status === 'closed' && (
                  <button
                    onClick={handlePrintTicket}
                    disabled={isPrinting}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    <Printer className="w-4 h-4" />
                    {isPrinting ? 'Imprimiendo...' : 'Imprimir'}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Resumen por método de pago */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Resumen por método de pago</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {paymentMethods.map((pm) => {
                    const Icon = getPaymentMethodIcon(pm.code);
                    const colorClass = getPaymentMethodColor(pm.code);
                    const total = getPaymentMethodTotal(cashRegister, pm.code);
                    return (
                      <div key={pm.id} className="bg-gray-700/30 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Icon className={`w-3 h-3 ${colorClass}`} />
                          <p className="text-xs text-gray-400">{pm.name}</p>
                        </div>
                        <p className={`text-lg font-bold ${colorClass}`}>{formatCurrency(total)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen Final */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Resumen final</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Total Facturado</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(cashRegister.totalSales)}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Total Gastos</p>
                    <p className="text-lg font-bold text-red-400">{formatCurrency(cashRegister.totalExpenses)}</p>
                  </div>
                  <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
                    <p className="text-xs text-blue-300 mb-1">Efectivo Neto en Caja</p>
                    <p className="text-lg font-bold text-blue-400">{formatCurrency(cashRegister.expectedCash)}</p>
                  </div>
                  {cashRegister.status === 'closed' && cashRegister.cashDifference !== null && (
                    <div className={`rounded-lg p-3 ${
                      Math.abs(cashRegister.cashDifference) < 0.01 
                        ? 'bg-green-900/30 border border-green-700/50' 
                        : cashRegister.cashDifference > 0 
                          ? 'bg-blue-900/30 border border-blue-700/50' 
                          : 'bg-red-900/30 border border-red-700/50'
                    }`}>
                      <p className="text-xs text-gray-400 mb-1">Diferencia</p>
                      <p className={`text-lg font-bold ${
                        Math.abs(cashRegister.cashDifference) < 0.01 
                          ? 'text-green-400' 
                          : cashRegister.cashDifference > 0 
                            ? 'text-blue-400' 
                            : 'text-red-400'
                      }`}>
                        {cashRegister.cashDifference > 0 ? '+' : ''}
                        {formatCurrency(cashRegister.cashDifference)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pedidos registrados */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Pedidos registrados ({ingresos.length})
                </h4>
                {movementsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                  </div>
                ) : ingresos.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay pedidos registrados en esta caja.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-700">
                          <th className="pb-3 font-medium"># Pedido</th>
                          <th className="pb-3 font-medium">Cliente</th>
                          <th className="pb-3 font-medium">Método</th>
                          <th className="pb-3 font-medium">Monto</th>
                          <th className="pb-3 font-medium">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {ingresos.map((mov) => (
                          <tr key={mov.id} className="text-gray-300">
                            <td className="py-3 text-emerald-400">#{mov.order?.orderNumber || '-'}</td>
                            <td className="py-3">{mov.booking?.guestName || mov.description || '-'}</td>
                            <td className="py-3">{getPaymentMethodLabel(mov.paymentMethod)}</td>
                            <td className="py-3 font-medium text-green-400">+{formatCurrency(mov.amount)}</td>
                            <td className="py-3 text-gray-500">{formatDateTime(mov.registeredAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Gastos registrados */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  Gastos registrados ({egresos.length})
                </h4>
                {egresos.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay gastos registrados en esta caja.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-700">
                          <th className="pb-3 font-medium">Descripción</th>
                          <th className="pb-3 font-medium">Categoría</th>
                          <th className="pb-3 font-medium">Método</th>
                          <th className="pb-3 font-medium">Monto</th>
                          <th className="pb-3 font-medium">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {egresos.map((mov) => (
                          <tr key={mov.id} className="text-gray-300">
                            <td className="py-3">{mov.description || 'Gasto'}</td>
                            <td className="py-3">
                              {mov.expenseCategory ? (
                                <span 
                                  className="px-2 py-1 rounded text-xs"
                                  style={{ backgroundColor: `${mov.expenseCategory.color}20`, color: mov.expenseCategory.color }}
                                >
                                  {mov.expenseCategory.name}
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            <td className="py-3">{getPaymentMethodLabel(mov.paymentMethod)}</td>
                            <td className="py-3 font-medium text-red-400">-{formatCurrency(mov.amount)}</td>
                            <td className="py-3 text-gray-500">{formatDateTime(mov.registeredAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
