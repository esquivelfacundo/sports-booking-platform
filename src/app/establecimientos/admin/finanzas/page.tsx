'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEstablishment } from '../../../../contexts/EstablishmentContext';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Receipt,
  PiggyBank,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Wallet,
  Building,
  Users,
  Clock
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  reference?: string;
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayments: number;
  monthlyGrowth: number;
}

const FinancePage = () => {
  const { establishment, loading } = useEstablishment();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showEditTransaction, setShowEditTransaction] = useState(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Initialize financial data based on demo or real data
  useEffect(() => {
    // Use real financial data from establishment
      // Demo data
      setFinancialSummary({
        totalRevenue: 125000,
        totalExpenses: 45000,
        netProfit: 80000,
        pendingPayments: 12500,
        monthlyGrowth: 15.8
      });

      setTransactions([
        {
          id: '1',
          type: 'income',
          category: 'Reservas',
          description: 'Reserva Cancha 1 - Juan Pérez',
          amount: 8000,
          date: '2024-01-15',
          status: 'completed',
          paymentMethod: 'Tarjeta de Crédito',
          reference: 'RES-001'
        },
        {
          id: '2',
          type: 'expense',
          category: 'Mantenimiento',
          description: 'Reparación iluminación Cancha 2',
          amount: 15000,
          date: '2024-01-14',
          status: 'completed',
          paymentMethod: 'Transferencia',
          reference: 'EXP-001'
        },
        {
          id: '3',
          type: 'income',
          category: 'Reservas',
          description: 'Reserva Cancha 3 - María González',
          amount: 6000,
          date: '2024-01-14',
          status: 'pending',
          paymentMethod: 'Efectivo'
        },
    {
      id: '4',
      type: 'expense',
      category: 'Servicios',
      description: 'Factura de electricidad',
      amount: 25000,
      date: '2024-01-13',
      status: 'completed',
      paymentMethod: 'Débito Automático'
    },
    {
      id: '5',
      type: 'income',
      category: 'Membresías',
      description: 'Membresía mensual - Carlos López',
      amount: 12000,
      date: '2024-01-12',
      status: 'completed',
      paymentMethod: 'Tarjeta de Débito'
    }
      ]);
    // Real data from API
      // Real establishment - no financial data yet
      setFinancialSummary({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        pendingPayments: 0,
        monthlyGrowth: 0
      });
      setTransactions([]);
  }, [establishment]);

  const expenseCategories: Array<{name: string, amount: number, percentage: number}> = [];

  const revenueCategories: Array<{name: string, amount: number, percentage: number}> = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading || !financialSummary) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Cargando finanzas...</div>
      </div>
    );
  }

  // Transaction handlers
  const handleCreateTransaction = (transactionData: Partial<Transaction>) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionData.type || 'income',
      category: transactionData.category || '',
      description: transactionData.description || '',
      amount: transactionData.amount || 0,
      date: transactionData.date || new Date().toISOString().split('T')[0],
      status: transactionData.status || 'pending',
      paymentMethod: transactionData.paymentMethod || '',
      reference: transactionData.reference
    };
    setTransactions([...transactions, newTransaction]);
    setShowAddTransaction(false);
    alert('Transacción creada exitosamente');
  };

  const handleEditTransaction = (transactionData: Partial<Transaction>) => {
    if (selectedTransaction) {
      setTransactions(transactions.map(transaction => 
        transaction.id === selectedTransaction.id 
          ? { ...transaction, ...transactionData }
          : transaction
      ));
      setShowEditTransaction(false);
      setSelectedTransaction(null);
      alert('Transacción actualizada exitosamente');
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.')) {
      setTransactions(transactions.filter(transaction => transaction.id !== transactionId));
      alert('Transacción eliminada exitosamente');
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const handleOpenEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditTransaction(true);
  };

  const handleGenerateInvoice = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowInvoiceModal(true);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'income') return transaction.type === 'income';
    if (selectedCategory === 'expense') return transaction.type === 'expense';
    return transaction.category === selectedCategory;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión Financiera</h1>
          <p className="text-gray-400 mt-1">Control completo de ingresos, gastos y reportes</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
          <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          <button 
            onClick={() => setShowAddTransaction(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Transacción</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ingresos Totales</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(financialSummary.totalRevenue)}</p>
              <div className="flex items-center space-x-1 mt-2">
                <ArrowUp className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">+{financialSummary.monthlyGrowth}%</span>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gastos Totales</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(financialSummary.totalExpenses)}</p>
              <div className="flex items-center space-x-1 mt-2">
                <ArrowDown className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">-8.2%</span>
              </div>
            </div>
            <TrendingDown className="h-8 w-8 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ganancia Neta</p>
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(financialSummary.netProfit)}</p>
              <div className="flex items-center space-x-1 mt-2">
                <ArrowUp className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">+22.5%</span>
              </div>
            </div>
            <PiggyBank className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pagos Pendientes</p>
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(financialSummary.pendingPayments)}</p>
              <div className="flex items-center space-x-1 mt-2">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">3 pendientes</span>
              </div>
            </div>
            <Wallet className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Revenue vs Expenses Chart and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Ingresos por Categoría</h3>
              <p className="text-gray-400 text-sm">Distribución de fuentes de ingresos</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="space-y-4">
            {revenueCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{category.name}</span>
                    <span className="text-emerald-400 font-medium">{formatCurrency(category.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 1 }}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2 rounded-full"
                    />
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-xs text-gray-400">{category.percentage}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Expense Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Gastos por Categoría</h3>
              <p className="text-gray-400 text-sm">Distribución de gastos operativos</p>
            </div>
            <TrendingDown className="h-5 w-5 text-red-400" />
          </div>
          <div className="space-y-4">
            {expenseCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{category.name}</span>
                    <span className="text-red-400 font-medium">{formatCurrency(category.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 1 }}
                      className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full"
                    />
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-xs text-gray-400">{category.percentage}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Transacciones Recientes</h3>
              <p className="text-gray-400 text-sm">Historial de ingresos y gastos</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Todas las categorías</option>
                <option value="income">Solo ingresos</option>
                <option value="expense">Solo gastos</option>
                <option value="Reservas">Reservas</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Servicios">Servicios</option>
              </select>
              <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm">
                <Filter className="h-4 w-4" />
                <span>Filtrar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Método</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {transaction.type === 'income' ? (
                        <div className="p-2 bg-emerald-600 rounded-lg">
                          <ArrowUp className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-600 rounded-lg">
                          <ArrowDown className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <span className={`ml-3 font-medium ${transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{transaction.description}</div>
                    {transaction.reference && (
                      <div className="text-sm text-gray-400">Ref: {transaction.reference}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-white">{transaction.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {new Date(transaction.date).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1 capitalize">
                        {transaction.status === 'completed' ? 'Completado' : 
                         transaction.status === 'pending' ? 'Pendiente' : 'Fallido'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {transaction.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewTransaction(transaction)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenEditTransaction(transaction)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {transaction.type === 'income' && (
                        <button 
                          onClick={() => handleGenerateInvoice(transaction)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                          title="Generar factura"
                        >
                          <Receipt className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Nueva Transacción</h3>
              <button
                onClick={() => setShowAddTransaction(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const transactionData = {
                type: formData.get('type') as Transaction['type'],
                category: formData.get('category') as string,
                description: formData.get('description') as string,
                amount: Number(formData.get('amount')),
                date: formData.get('date') as string,
                status: formData.get('status') as Transaction['status'],
                paymentMethod: formData.get('paymentMethod') as string,
                reference: formData.get('reference') as string
              };
              handleCreateTransaction(transactionData);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo *
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="income">Ingreso</option>
                    <option value="expense">Gasto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Reservas">Reservas</option>
                    <option value="Membresías">Membresías</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Personal">Personal</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Equipamiento">Equipamiento</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción *
                  </label>
                  <input
                    type="text"
                    name="description"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ej: Pago de reserva cancha 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monto (ARS) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado *
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue="pending"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completado</option>
                    <option value="failed">Fallido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Método de Pago *
                  </label>
                  <select
                    name="paymentMethod"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Seleccionar método</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                    <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Débito Automático">Débito Automático</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Referencia
                  </label>
                  <input
                    type="text"
                    name="reference"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ej: RES-001, FAC-123"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTransaction(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                >
                  Crear Transacción
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditTransaction && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Editar Transacción</h3>
              <button
                onClick={() => setShowEditTransaction(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const transactionData = {
                type: formData.get('type') as Transaction['type'],
                category: formData.get('category') as string,
                description: formData.get('description') as string,
                amount: Number(formData.get('amount')),
                date: formData.get('date') as string,
                status: formData.get('status') as Transaction['status'],
                paymentMethod: formData.get('paymentMethod') as string,
                reference: formData.get('reference') as string
              };
              handleEditTransaction(transactionData);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo *
                  </label>
                  <select
                    name="type"
                    required
                    defaultValue={selectedTransaction.type}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="income">Ingreso</option>
                    <option value="expense">Gasto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    required
                    defaultValue={selectedTransaction.category}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Reservas">Reservas</option>
                    <option value="Membresías">Membresías</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Personal">Personal</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Equipamiento">Equipamiento</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción *
                  </label>
                  <input
                    type="text"
                    name="description"
                    required
                    defaultValue={selectedTransaction.description}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monto (ARS) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="0"
                    step="0.01"
                    defaultValue={selectedTransaction.amount}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={selectedTransaction.date}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado *
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={selectedTransaction.status}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completado</option>
                    <option value="failed">Fallido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Método de Pago *
                  </label>
                  <select
                    name="paymentMethod"
                    required
                    defaultValue={selectedTransaction.paymentMethod}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                    <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Débito Automático">Débito Automático</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Referencia
                  </label>
                  <input
                    type="text"
                    name="reference"
                    defaultValue={selectedTransaction.reference || ''}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditTransaction(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showTransactionDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Detalles de Transacción</h3>
              <button
                onClick={() => setShowTransactionDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  {selectedTransaction.type === 'income' ? (
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <ArrowUp className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <div className="p-2 bg-red-600 rounded-lg">
                      <ArrowDown className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">{selectedTransaction.type === 'income' ? 'Ingreso' : 'Gasto'}</p>
                    <p className="text-sm text-gray-400">{selectedTransaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${selectedTransaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedTransaction.type === 'income' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="ml-1 capitalize">
                      {selectedTransaction.status === 'completed' ? 'Completado' : 
                       selectedTransaction.status === 'pending' ? 'Pendiente' : 'Fallido'}
                    </span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Descripción</p>
                  <p className="text-white font-medium">{selectedTransaction.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Fecha</p>
                  <p className="text-white font-medium">{new Date(selectedTransaction.date).toLocaleDateString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Método de Pago</p>
                  <p className="text-white font-medium">{selectedTransaction.paymentMethod}</p>
                </div>
                {selectedTransaction.reference && (
                  <div>
                    <p className="text-sm text-gray-400">Referencia</p>
                    <p className="text-white font-medium">{selectedTransaction.reference}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowTransactionDetails(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                Cerrar
              </button>
              {selectedTransaction.type === 'income' && (
                <button
                  onClick={() => {
                    setShowTransactionDetails(false);
                    handleGenerateInvoice(selectedTransaction);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                >
                  Generar Factura
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Invoice Generation Modal */}
      {showInvoiceModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Generar Factura</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Invoice Preview */}
            <div className="bg-white rounded-xl p-8 text-gray-900 mb-6">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">FACTURA</h2>
                  <p className="text-gray-600">#{selectedTransaction.reference || selectedTransaction.id}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold text-gray-900">SportCenter Pro</h3>
                  <p className="text-gray-600">Av. Corrientes 1234</p>
                  <p className="text-gray-600">Buenos Aires, Argentina</p>
                  <p className="text-gray-600">Tel: +54 11 1234-5678</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Facturar a:</h4>
                  <p className="text-gray-700">Cliente</p>
                  <p className="text-gray-600">Email: cliente@email.com</p>
                  <p className="text-gray-600">Tel: +54 11 0000-0000</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">Fecha: {new Date(selectedTransaction.date).toLocaleDateString('es-AR')}</p>
                  <p className="text-gray-600">Vencimiento: {new Date(new Date(selectedTransaction.date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR')}</p>
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden mb-8">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Descripción</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">Cantidad</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">Precio Unit.</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200">
                      <td className="px-4 py-3 text-gray-900">{selectedTransaction.description}</td>
                      <td className="px-4 py-3 text-right text-gray-900">1</td>
                      <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(selectedTransaction.amount)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(selectedTransaction.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatCurrency(selectedTransaction.amount)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">IVA (21%):</span>
                    <span className="text-gray-900">{formatCurrency(selectedTransaction.amount * 0.21)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-300 font-bold text-lg">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">{formatCurrency(selectedTransaction.amount * 1.21)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-300">
                <p className="text-sm text-gray-600">
                  <strong>Términos y Condiciones:</strong> El pago debe realizarse dentro de los 30 días de la fecha de facturación.
                  Los pagos tardíos pueden estar sujetos a cargos por intereses.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert('Factura generada y enviada por email');
                  setShowInvoiceModal(false);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
              >
                Generar y Enviar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;
