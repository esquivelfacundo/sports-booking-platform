'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  User,
  ChevronRight,
  X,
  Plus,
  Minus,
  Banknote,
  CreditCard,
  Building2,
  Smartphone,
  Eye,
  Printer
} from 'lucide-react';
import { useCashRegisterContext } from '@/contexts/CashRegisterContext';
import OpenCashRegisterSidebar from '@/components/admin/OpenCashRegisterSidebar';
import CloseCashRegisterSidebar from '@/components/admin/CloseCashRegisterSidebar';
import OrderDetailSidebar from '@/components/admin/OrderDetailSidebar';
import CashRegisterDetailSidebar from '@/components/admin/CashRegisterDetailSidebar';
import { printCashRegisterTicket, isWebUSBSupported, CashRegisterTicketData } from '@/lib/ticketPrinter';
import { useToast } from '@/contexts/ToastContext';
import { usePinConfirmation } from '@/components/admin/PinConfirmation';

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  icon: string | null;
}

// Map payment method codes to their totals in cash register
const getPaymentMethodTotal = (cr: any, code: string): number => {
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

// Get icon component for payment method
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

// Get color for payment method
const getPaymentMethodColor = (code: string): string => {
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

interface CashRegisterHistory {
  id: string;
  userId: string;
  openedAt: string;
  closedAt: string | null;
  status: 'open' | 'closed';
  initialCash: number;
  expectedCash: number;
  actualCash: number | null;
  cashDifference: number | null;
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
  openingNotes: string | null;
  closingNotes: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
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

export default function CashRegisterPage() {
  const { establishment } = useEstablishment();
  const { user } = useAuth();
  const { cashRegister, isOpen, loading: cashRegisterLoading, openCashRegister, closeCashRegister, refreshCashRegister } = useCashRegisterContext();
  const { requestPin, PinModal } = usePinConfirmation();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  
  // Read tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['current', 'history'].includes(tabParam)) {
      setActiveTab(tabParam as 'current' | 'history');
    }
  }, [searchParams]);
  
  // Update URL when tab changes
  const handleTabChange = (tab: 'current' | 'history') => {
    setActiveTab(tab);
    router.push(`/establecimientos/admin/caja?tab=${tab}`, { scroll: false });
  };
  const [history, setHistory] = useState<CashRegisterHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegisterHistory | null>(null);
  const [movements, setMovements] = useState<CashRegisterMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  
  const [showOpenSidebar, setShowOpenSidebar] = useState(false);
  const [showCloseSidebar, setShowCloseSidebar] = useState(false);
  const [showExpenseSidebar, setShowExpenseSidebar] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);
  
  const [expenseCategories, setExpenseCategories] = useState<{ id: string; name: string; color: string }[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    paymentMethod: 'cash',
    expenseCategoryId: '',
    description: '',
    notes: ''
  });
  const [savingExpense, setSavingExpense] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [headerPortalContainer, setHeaderPortalContainer] = useState<HTMLElement | null>(null);
  
  // Toast notifications
  const { showSuccess, showError, showWarning } = useToast();

  // Get the header portal container on mount
  useEffect(() => {
    const container = document.getElementById('header-page-controls');
    if (container) {
      setHeaderPortalContainer(container);
    }
  }, []);

  // Load history
  useEffect(() => {
    const loadHistory = async () => {
      if (!establishment?.id) return;
      
      setHistoryLoading(true);
      try {
        const response: any = await apiClient.getCashRegisterHistory({
          establishmentId: establishment.id,
          limit: 50
        });
        setHistory(response.cashRegisters || []);
      } catch (error) {
        console.error('Error loading cash register history:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [establishment?.id]);

  // Load expense categories and payment methods
  useEffect(() => {
    const loadCategories = async () => {
      if (!establishment?.id) return;
      
      try {
        const response: any = await apiClient.getExpenseCategories(establishment.id);
        setExpenseCategories(response.categories || []);
      } catch (error) {
        console.error('Error loading expense categories:', error);
      }
    };

    const loadPaymentMethods = async () => {
      if (!establishment?.id) return;
      
      try {
        const response: any = await apiClient.getPaymentMethods(establishment.id);
        setPaymentMethods(response.paymentMethods || []);
      } catch (error) {
        console.error('Error loading payment methods:', error);
        // Fallback to default methods
        setPaymentMethods([
          { id: '1', name: 'Efectivo', code: 'cash', icon: 'Banknote' },
          { id: '2', name: 'Transferencia', code: 'transfer', icon: 'Building2' },
          { id: '3', name: 'Tarjeta', code: 'card', icon: 'CreditCard' },
          { id: '4', name: 'MercadoPago', code: 'mercadopago', icon: 'Smartphone' }
        ]);
      }
    };

    loadCategories();
    loadPaymentMethods();
  }, [establishment?.id]);

  // Load movements function
  const loadMovements = useCallback(async (cashRegisterId: string) => {
    setMovementsLoading(true);
    try {
      const response: any = await apiClient.getCashRegisterMovements({
        cashRegisterId,
        limit: 100
      });
      setMovements(response.movements || []);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setMovementsLoading(false);
    }
  }, []);

  const handleSelectCashRegister = (cr: CashRegisterHistory) => {
    setSelectedCashRegister(cr);
    setShowDetailSidebar(true);
  };

  // Load movements when cash register is open (for current tab)
  useEffect(() => {
    if (cashRegister?.id && activeTab === 'current') {
      loadMovements(cashRegister.id);
    }
  }, [cashRegister?.id, activeTab, loadMovements]);

  const handleCreateExpense = async () => {
    if (!cashRegister || !newExpense.amount) return;
    
    setSavingExpense(true);
    const amount = parseFloat(newExpense.amount);
    const description = newExpense.description;
    const categoryName = expenseCategories.find(c => c.id === newExpense.expenseCategoryId)?.name || 'Gasto';
    const cashRegisterId = cashRegister.id;
    
    try {
      await apiClient.createExpenseMovement({
        cashRegisterId,
        amount,
        paymentMethod: newExpense.paymentMethod,
        expenseCategoryId: newExpense.expenseCategoryId || undefined,
        description: description || undefined,
        notes: newExpense.notes || undefined
      });
      
      // Reset form and close sidebar immediately
      setNewExpense({
        amount: '',
        paymentMethod: 'cash',
        expenseCategoryId: '',
        description: '',
        notes: ''
      });
      setSavingExpense(false);
      setShowExpenseSidebar(false);
      
      // Show toast
      showSuccess('Gasto registrado', `$${amount.toLocaleString('es-AR')} - ${description || categoryName}`);
      
      // Refresh data in background
      refreshCashRegister();
      loadMovements(cashRegisterId);
    } catch (error: any) {
      console.error('Error creating expense:', error);
      showError('Error al registrar gasto', error.message || 'No se pudo registrar el gasto');
      setSavingExpense(false);
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

  // Print cash register closure ticket
  const handlePrintTicket = async (cr: CashRegisterHistory) => {
    if (!isWebUSBSupported()) {
      alert('Tu navegador no soporta impresión USB. Usa Chrome o Edge.');
      return;
    }

    setIsPrinting(true);
    try {
      // Get expenses from movements
      const expenseMovements = movements.filter(m => m.type === 'expense');
      
      const ticketData: CashRegisterTicketData = {
        establishmentName: establishment?.name || 'Establecimiento',
        cashierName: cr.user?.name || user?.name || 'Cajero',
        cashRegisterId: cr.id,
        openedAt: formatDateTime(cr.openedAt),
        closedAt: cr.closedAt ? formatDateTime(cr.closedAt) : formatDateTime(new Date().toISOString()),
        initialCash: cr.initialCash,
        totalSales: cr.totalSales,
        totalExpenses: cr.totalExpenses,
        expectedCash: cr.expectedCash,
        actualCash: cr.actualCash || cr.expectedCash,
        cashDifference: cr.cashDifference || 0,
        totalOrders: cr.totalOrders,
        paymentMethods: paymentMethods.map(pm => ({
          name: pm.name,
          code: pm.code,
          amount: getPaymentMethodTotal(cr, pm.code),
          count: 0 // TODO: count from movements
        })),
        expenses: expenseMovements.map(e => ({
          description: e.description || 'Gasto',
          category: e.expenseCategory?.name,
          method: e.paymentMethod,
          amount: e.amount
        }))
      };

      await printCashRegisterTicket(ticketData);
    } catch (error: any) {
      console.error('Error printing ticket:', error);
      alert('Error al imprimir: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsPrinting(false);
    }
  };

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sale: 'Venta',
      expense: 'Gasto',
      withdrawal: 'Retiro',
      deposit: 'Depósito',
      adjustment: 'Ajuste'
    };
    return labels[type] || type;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      credit_card: 'Crédito',
      debit_card: 'Débito',
      mercadopago: 'MercadoPago'
    };
    return labels[method] || method;
  };

  const getDuration = (openedAt: string) => {
    const start = new Date(openedAt);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Separate movements into ingresos and egresos
  const ingresos = movements.filter(m => m.type === 'sale' || m.type === 'deposit');
  const egresos = movements.filter(m => m.type === 'expense' || m.type === 'withdrawal');

  // Header controls to be rendered via portal
  const headerControls = (
    <div className="flex items-center w-full space-x-2 overflow-x-auto">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex-shrink-0">
        <button
          onClick={() => handleTabChange('current')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'current'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Caja Actual
        </button>
        <button
          onClick={() => handleTabChange('history')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Historial
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action Buttons */}
      {isOpen && cashRegister && (
        <button
          onClick={() => setShowExpenseSidebar(true)}
          className="flex items-center space-x-1.5 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Gasto</span>
        </button>
      )}
      
      {isOpen ? (
        <button
          onClick={() => setShowCloseSidebar(true)}
          className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex-shrink-0"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Cerrar Caja</span>
        </button>
      ) : (
        <button
          onClick={() => setShowOpenSidebar(true)}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex-shrink-0"
        >
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Abrir Caja</span>
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Render controls in header via portal */}
      {headerPortalContainer && createPortal(headerControls, headerPortalContainer)}
      
      <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sistema de Caja</h1>
        <p className="text-gray-500 dark:text-gray-400">Gestiona la caja y visualiza el historial</p>
      </div>

      {/* Tab Content */}
      {activeTab === 'current' ? (
        /* CAJA ACTUAL TAB */
        cashRegisterLoading ? (
          /* Loading State - Animación de carga */
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 shadow-sm dark:shadow-none">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
                <DollarSign className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">Verificando estado de caja...</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Por favor espera mientras verificamos si hay una caja abierta</p>
            </div>
          </div>
        ) : isOpen && cashRegister ? (
          <div className="space-y-6">
            {/* Header con estado y acciones rápidas */}
            <div className="bg-gradient-to-r from-emerald-100 dark:from-emerald-900/50 to-white dark:to-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-700/50 p-6 shadow-sm dark:shadow-none">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Caja Abierta</h2>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full animate-pulse">
                        ● Activa
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {user?.name || 'Usuario'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {getDuration(cashRegister.openedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateTime(cashRegister.openedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Métricas rápidas */}
                <div className="flex items-center gap-3">
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg px-4 py-2 text-center min-w-[100px] shadow-sm dark:shadow-none">
                    <p className="text-xs text-gray-500">Pedidos</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{cashRegister.totalOrders}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg px-4 py-2 text-center min-w-[100px] shadow-sm dark:shadow-none">
                    <p className="text-xs text-gray-500">Movimientos</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{cashRegister.totalMovements}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards de resumen principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Caja Inicial */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Caja Inicial</span>
                  <Banknote className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(cashRegister.initialCash)}</p>
              </div>
              
              {/* Total Ventas */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-700/50 p-4 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 text-sm">Total Ingresos</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(cashRegister.totalSales)}</p>
              </div>
              
              {/* Total Gastos */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-700/50 p-4 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-400 text-sm">Total Egresos</span>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(cashRegister.totalExpenses)}</p>
              </div>
              
              {/* Efectivo Esperado */}
              <div className="bg-gradient-to-br from-blue-100 dark:from-blue-900/50 to-white dark:to-gray-800 rounded-xl border border-blue-200 dark:border-blue-700/50 p-4 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 text-sm">Efectivo en Caja</span>
                  <DollarSign className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(cashRegister.expectedCash)}</p>
              </div>
            </div>

            {/* Desglose por método de pago y gastos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ingresos por método de pago */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm dark:shadow-none">
                <h3 className="text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Ingresos por método de pago
                </h3>
                <div className="space-y-3">
                  {paymentMethods.map((pm) => {
                    const Icon = getPaymentMethodIcon(pm.code);
                    const colorClass = getPaymentMethodColor(pm.code);
                    const total = getPaymentMethodTotal(cashRegister, pm.code);
                    const percentage = cashRegister.totalSales > 0 ? (total / cashRegister.totalSales) * 100 : 0;
                    return (
                      <div key={pm.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm">
                            <Icon className={`w-4 h-4 ${colorClass}`} />
                            {pm.name}
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(total)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              pm.code === 'cash' ? 'bg-green-500' :
                              pm.code === 'transfer' ? 'bg-purple-500' :
                              pm.code === 'mercadopago' ? 'bg-cyan-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gastos */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    Gastos del turno
                  </h3>
                  <button
                    onClick={() => setShowExpenseSidebar(true)}
                    className="text-xs px-3 py-1.5 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Nuevo Gasto
                  </button>
                </div>
                {egresos.length === 0 ? (
                  <div className="text-center py-8">
                    <Minus className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                    <p className="text-gray-500 text-sm">No hay gastos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {egresos.map((mov) => (
                      <div key={mov.id} className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-gray-300 text-sm">{mov.description || 'Gasto'}</span>
                          <span className="text-gray-500 text-xs">({getPaymentMethodLabel(mov.paymentMethod)})</span>
                        </div>
                        <span className="text-red-400 font-medium">-{formatCurrency(mov.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {egresos.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Total gastos:</span>
                      <span className="text-red-400 font-bold">{formatCurrency(cashRegister.totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-500 text-xs">Gastos en efectivo:</span>
                      <span className="text-gray-400 text-xs">{formatCurrency(egresos.filter(e => e.paymentMethod === 'cash').reduce((sum, e) => sum + (Number(e.amount) || 0), 0))}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Últimos movimientos */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm dark:shadow-none">
              <h3 className="text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                Últimos movimientos
              </h3>
              {movementsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                </div>
              ) : ingresos.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-500 text-sm">No hay movimientos registrados todavía</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-3 font-medium"># Pedido</th>
                        <th className="pb-3 font-medium">Cliente</th>
                        <th className="pb-3 font-medium">Método</th>
                        <th className="pb-3 font-medium">Monto</th>
                        <th className="pb-3 font-medium">Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {ingresos.slice(0, 10).map((mov) => (
                        <tr 
                          key={mov.id} 
                          onClick={() => {
                            if (mov.order?.id) {
                              setSelectedOrderId(mov.order.id);
                              setShowOrderDetail(true);
                            }
                          }}
                          className={`text-gray-700 dark:text-gray-300 transition-colors ${mov.order?.id ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                        >
                          <td className="py-3 text-emerald-600 dark:text-emerald-400 font-medium">
                            {mov.order?.orderNumber ? `#${mov.order.orderNumber}` : '-'}
                          </td>
                          <td className="py-3">{mov.booking?.clientName || mov.description || '-'}</td>
                          <td className="py-3">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{getPaymentMethodLabel(mov.paymentMethod)}</span>
                          </td>
                          <td className="py-3 font-medium text-green-600 dark:text-green-400">+{formatCurrency(mov.amount)}</td>
                          <td className="py-3 text-gray-500 text-xs">
                            {new Date(mov.registeredAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ingresos.length > 10 && (
                    <p className="text-center text-gray-500 text-xs mt-3">
                      Mostrando 10 de {ingresos.length} movimientos
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Acción de cerrar caja */}
            <div className="bg-gradient-to-r from-red-50 dark:from-red-900/30 to-white dark:to-gray-800 rounded-xl border border-red-200 dark:border-red-700/30 p-5 shadow-sm dark:shadow-none">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-gray-900 dark:text-white font-semibold mb-1">¿Finalizar turno?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Al cerrar la caja se registrará el efectivo real y se generará el resumen del turno.
                  </p>
                </div>
                <button
                  onClick={() => setShowCloseSidebar(true)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
                >
                  <X className="w-4 h-4" />
                  Cerrar Caja
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* No hay caja abierta */
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm dark:shadow-none">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center">
              <DollarSign className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hay caja abierta</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Abre una caja para comenzar a registrar ventas, pagos y gastos del turno.
            </p>
            <button
              onClick={() => setShowOpenSidebar(true)}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium inline-flex items-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              Abrir Caja
            </button>
          </div>
        )
      ) : (
        /* HISTORIAL TAB */
        <div className="space-y-6">
          {/* Historial de Cierres - Tabla */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Historial de Cierres
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mostrando {history.length} cierres</p>
            </div>
            
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay historial de cajas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700/50">
                    <tr className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="p-4 font-medium">Cajero</th>
                      <th className="p-4 font-medium">Apertura</th>
                      <th className="p-4 font-medium">Cierre</th>
                      <th className="p-4 font-medium">Total Ventas</th>
                      <th className="p-4 font-medium">Total Gastos</th>
                      <th className="p-4 font-medium">Efectivo Neto</th>
                      <th className="p-4 font-medium">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {history.map((cr) => (
                      <tr key={cr.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="p-4 text-gray-900 dark:text-white">{cr.user?.name || 'Usuario'}</td>
                        <td className="p-4 text-gray-500 dark:text-gray-400">{formatDateTime(cr.openedAt)}</td>
                        <td className="p-4 text-gray-500 dark:text-gray-400">{cr.closedAt ? formatDateTime(cr.closedAt) : '-'}</td>
                        <td className="p-4 font-medium text-green-400">{formatCurrency(cr.totalSales)}</td>
                        <td className="p-4 font-medium text-red-400">{formatCurrency(cr.totalExpenses)}</td>
                        <td className="p-4 font-medium text-white">{formatCurrency(cr.expectedCash)}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleSelectCashRegister(cr)}
                            className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30 transition-colors text-xs"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebars */}
      <OpenCashRegisterSidebar
        isOpen={showOpenSidebar}
        onClose={() => setShowOpenSidebar(false)}
        onOpen={async (initialCash: number, notes?: string) => {
          await openCashRegister(initialCash, notes);
          await refreshCashRegister();
          if (establishment?.id) {
            const response: any = await apiClient.getCashRegisterHistory({
              establishmentId: establishment.id,
              limit: 50
            });
            setHistory(response.cashRegisters || []);
          }
        }}
        requestPin={requestPin}
      />

      <CloseCashRegisterSidebar
        isOpen={showCloseSidebar}
        onClose={() => setShowCloseSidebar(false)}
        onCloseCashRegister={async (actualCash: number, notes?: string) => {
          await closeCashRegister(actualCash, notes);
          await refreshCashRegister();
          if (establishment?.id) {
            const response: any = await apiClient.getCashRegisterHistory({
              establishmentId: establishment.id,
              limit: 50
            });
            setHistory(response.cashRegisters || []);
          }
        }}
        cashRegister={cashRegister}
        requestPin={requestPin}
      />

      {/* Expense Sidebar */}
      {showExpenseSidebar && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowExpenseSidebar(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Minus className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Registrar Gasto</h2>
                  <p className="text-sm text-gray-400">Nuevo egreso de caja</p>
                </div>
              </div>
              <button
                onClick={() => setShowExpenseSidebar(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Monto *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Método de Pago</label>
                <select
                  value={newExpense.paymentMethod}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
                <select
                  value={newExpense.expenseCategoryId}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, expenseCategoryId: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Sin categoría</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ej: Compra de insumos..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notas (opcional)</label>
                <textarea
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Notas adicionales..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => setShowExpenseSidebar(false)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateExpense}
                disabled={savingExpense || !newExpense.amount}
                className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingExpense ? 'Guardando...' : 'Registrar Gasto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Sidebar */}
      {selectedOrderId && (
        <OrderDetailSidebar
          isOpen={showOrderDetail}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
          onUpdate={() => {
            refreshCashRegister();
            if (cashRegister?.id) {
              loadMovements(cashRegister.id);
            }
          }}
        />
      )}

      {/* Cash Register Detail Sidebar */}
      <CashRegisterDetailSidebar
        isOpen={showDetailSidebar}
        onClose={() => {
          setShowDetailSidebar(false);
          setSelectedCashRegister(null);
        }}
        cashRegister={selectedCashRegister}
        paymentMethods={paymentMethods}
      />

      {/* PIN Confirmation Modal */}
      <PinModal />
    </div>
    </>
  );
}
