'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Plus, 
  ChevronDown, 
  RefreshCw, 
  TrendingDown,
  Receipt,
  Calendar,
  User as UserIcon,
  Edit2,
  Trash2,
  X,
  Loader2,
  Download
} from 'lucide-react';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { apiClient } from '@/lib/api';
import UnifiedLoader from '@/components/ui/UnifiedLoader';
import { useToast } from '@/contexts/ToastContext';

interface Expense {
  id: string;
  establishmentId: string;
  cashRegisterId?: string;
  userId: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod?: string;
  invoiceNumber?: string;
  supplier?: string;
  notes?: string;
  expenseDate: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    name: string;
  };
  cashRegister?: {
    id: string;
    openedAt: string;
    closedAt?: string;
  };
}

interface ExpensesResponse {
  success: boolean;
  expenses: Expense[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
  summary: {
    totalExpenses: number;
    totalAmount: number;
  };
}

interface User {
  id: string;
  name: string;
}

interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  icon: string | null;
}

interface CashRegister {
  id: string;
  openedAt: string;
  closedAt: string | null;
  user?: {
    name: string;
  };
}

const GastosPage = () => {
  const { establishment } = useEstablishment();
  const { showSuccess, showError } = useToast();
  const [expenses, setExpenses] = useState<ExpensesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [headerPortalContainer, setHeaderPortalContainer] = useState<HTMLElement | null>(null);
  
  // Sidebar state
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    origin: 'administration' as 'administration' | 'cash_register',
    cashRegisterId: '',
    category: '',
    description: '',
    amount: '',
    paymentMethod: '',
    invoiceNumber: '',
    supplier: '',
    notes: '',
    expenseDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const container = document.getElementById('header-page-controls');
    if (container) {
      setHeaderPortalContainer(container);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    if (!establishment?.id) return;
    
    setLoading(true);
    try {
      const params: any = { period: selectedPeriod };
      if (selectedUser) params.userId = selectedUser;
      
      const response = await apiClient.getExpenses(establishment.id, params);
      setExpenses(response as ExpensesResponse);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      showError('Error al cargar gastos', 'No se pudieron cargar los gastos');
    } finally {
      setLoading(false);
    }
  }, [establishment?.id, selectedPeriod, selectedUser, showError]);

  const fetchUsers = useCallback(async () => {
    if (!establishment?.id) return;
    
    try {
      const response = await apiClient.getStaff(establishment.id) as any;
      const staffUsers = (response.staff || []).map((s: any) => ({
        id: s.userId,
        name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim()
      }));
      setUsers(staffUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [establishment?.id]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.request('/api/expenses/categories') as any;
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['Servicios', 'Mantenimiento', 'Suministros', 'Salarios', 'Impuestos', 'Alquiler', 'Marketing', 'Transporte', 'Equipamiento', 'Otros']);
    }
  }, []);

  const fetchPaymentMethods = useCallback(async () => {
    if (!establishment?.id) return;
    
    try {
      const response = await apiClient.getPaymentMethods(establishment.id) as any;
      setPaymentMethods(response.paymentMethods || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  }, [establishment?.id]);

  const fetchCashRegisters = useCallback(async () => {
    if (!establishment?.id) return;
    
    try {
      const response = await apiClient.request(`/api/cash-registers?establishmentId=${establishment.id}&limit=50`) as any;
      const registers = (response.cashRegisters || []).map((cr: any) => ({
        id: cr.id,
        openedAt: cr.openedAt,
        closedAt: cr.closedAt,
        user: cr.user ? {
          name: `${cr.user.firstName || ''} ${cr.user.lastName || ''}`.trim()
        } : undefined
      }));
      setCashRegisters(registers);
    } catch (error) {
      console.error('Error fetching cash registers:', error);
    }
  }, [establishment?.id]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchUsers();
    fetchCategories();
    fetchPaymentMethods();
    fetchCashRegisters();
  }, [fetchUsers, fetchCategories, fetchPaymentMethods, fetchCashRegisters]);

  const handleOpenSidebar = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        origin: expense.cashRegisterId ? 'cash_register' : 'administration',
        cashRegisterId: expense.cashRegisterId || '',
        category: expense.category,
        description: expense.description,
        amount: expense.amount.toString(),
        paymentMethod: expense.paymentMethod || '',
        invoiceNumber: expense.invoiceNumber || '',
        supplier: expense.supplier || '',
        notes: expense.notes || '',
        expenseDate: expense.expenseDate
      });
    } else {
      setEditingExpense(null);
      setFormData({
        origin: 'administration',
        cashRegisterId: '',
        category: '',
        description: '',
        amount: '',
        paymentMethod: '',
        invoiceNumber: '',
        supplier: '',
        notes: '',
        expenseDate: new Date().toISOString().split('T')[0]
      });
    }
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishment?.id) return;

    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await apiClient.updateExpense(editingExpense.id, {
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod || undefined,
          invoiceNumber: formData.invoiceNumber || undefined,
          supplier: formData.supplier || undefined,
          notes: formData.notes || undefined,
          expenseDate: formData.expenseDate
        });
        showSuccess('Gasto actualizado', 'El gasto se actualizó correctamente');
      } else {
        await apiClient.createExpense({
          establishmentId: establishment.id,
          cashRegisterId: formData.origin === 'cash_register' ? formData.cashRegisterId : undefined,
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod || undefined,
          invoiceNumber: formData.invoiceNumber || undefined,
          supplier: formData.supplier || undefined,
          notes: formData.notes || undefined,
          expenseDate: formData.expenseDate
        });
        showSuccess('Gasto registrado', 'El gasto se registró correctamente');
      }
      
      handleCloseSidebar();
      fetchExpenses();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      showError('Error', error.message || 'No se pudo guardar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;

    try {
      await apiClient.deleteExpense(id);
      showSuccess('Gasto eliminado', 'El gasto se eliminó correctamente');
      fetchExpenses();
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      showError('Error', error.message || 'No se pudo eliminar el gasto');
    }
  };

  const handleExportExpenses = async () => {
    if (!establishment?.id) return;
    setIsExporting(true);
    try {
      await apiClient.exportExpensesToCSV({
        establishmentId: establishment.id,
        userId: selectedUser || undefined
      });
      showSuccess('Exportación exitosa', 'Los gastos se han exportado correctamente');
    } catch (error: any) {
      console.error('Error exporting expenses:', error);
      showError('Error al exportar', error.message || 'No se pudieron exportar los gastos');
    } finally {
      setIsExporting(false);
    }
  };

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
      year: 'numeric'
    });
  };

  const headerControls = (
    <div className="flex items-center w-full space-x-3">
      <div className="relative flex-shrink-0">
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

      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 flex-shrink-0"
      >
        <option value="">Todos los usuarios</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>{user.name}</option>
        ))}
      </select>

      <div className="flex-1" />

      <button
        onClick={fetchExpenses}
        className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Actualizar</span>
      </button>

      <button
        onClick={handleExportExpenses}
        disabled={isExporting}
        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        <Download className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
        <span>{isExporting ? 'Exportando...' : 'Exportar'}</span>
      </button>

      <button
        onClick={() => handleOpenSidebar()}
        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>Nuevo Gasto</span>
      </button>
    </div>
  );

  if (!establishment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <UnifiedLoader size="lg" />
      </div>
    );
  }

  return (
    <>
      {headerPortalContainer && createPortal(headerControls, headerPortalContainer)}
      
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        {expenses && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total Gastos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{expenses.summary.totalExpenses}</p>
                </div>
                <Receipt className="h-8 w-8 text-blue-400" />
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
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Monto Total</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(expenses.summary.totalAmount)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-400" />
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
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Promedio por Gasto</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {expenses.summary.totalExpenses > 0 
                      ? formatCurrency(expenses.summary.totalAmount / expenses.summary.totalExpenses)
                      : formatCurrency(0)
                    }
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-400" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Expenses Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <UnifiedLoader size="md" />
            </div>
          ) : expenses && expenses.expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Origen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Descripción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Proveedor</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Monto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Usuario</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {expenses.expenses.map((expense) => {
                    const formatCashRegisterDate = (dateString: string) => {
                      const date = new Date(dateString);
                      // Convert to UTC-3
                      date.setHours(date.getHours() - 3);
                      return date.toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      });
                    };

                    return (
                      <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-gray-900 dark:text-white text-sm">
                          {formatDate(expense.expenseDate)}
                        </td>
                        <td className="px-4 py-3">
                          {expense.cashRegisterId ? (
                            <div className="flex flex-col">
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">
                                Caja
                              </span>
                              {expense.cashRegister?.openedAt && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {formatCashRegisterDate(expense.cashRegister.openedAt)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">
                              Administración
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white text-sm max-w-xs truncate">
                          {expense.description}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">
                          {expense.supplier || '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">
                          {expense.user?.name || 'Usuario'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenSidebar(expense)}
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No hay gastos registrados en este período</p>
              <button
                onClick={() => handleOpenSidebar()}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Registrar primer gasto
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseSidebar}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-800 shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">
                  {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
                </h2>
                <button
                  onClick={handleCloseSidebar}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Origen *</label>
                  <select
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value as 'administration' | 'cash_register', cashRegisterId: '' })}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="administration">Administración</option>
                    <option value="cash_register">Caja</option>
                  </select>
                </div>

                {formData.origin === 'cash_register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Caja *</label>
                    <select
                      value={formData.cashRegisterId}
                      onChange={(e) => setFormData({ ...formData, cashRegisterId: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Seleccionar caja</option>
                      {cashRegisters.map((cr) => {
                        const openDate = new Date(cr.openedAt);
                        openDate.setHours(openDate.getHours() - 3); // UTC-3
                        const dateStr = openDate.toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        });
                        const status = cr.closedAt ? '(Cerrada)' : '(Abierta)';
                        return (
                          <option key={cr.id} value={cr.id}>
                            {dateStr} - {cr.user?.name || 'Usuario'} {status}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Descripción *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Ej: Pago de luz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Monto *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Proveedor</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Nombre del proveedor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Método de Pago</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Seleccionar método</option>
                    {paymentMethods.map((pm) => (
                      <option key={pm.id} value={pm.code}>{pm.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Número de Factura</label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Número de comprobante"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Notas adicionales..."
                  />
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <span>{editingExpense ? 'Actualizar Gasto' : 'Registrar Gasto'}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default GastosPage;
