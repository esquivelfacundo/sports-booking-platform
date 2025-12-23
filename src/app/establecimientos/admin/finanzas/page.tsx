'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { apiClient } from '@/lib/api';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Receipt,
  PiggyBank,
  AlertCircle,
  CheckCircle,
  Calendar,
  RefreshCw,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Wallet,
  Clock,
  User,
  MapPin
} from 'lucide-react';

interface FinanceResponse {
  success: boolean;
  period: { start: string; end: string; label: string };
  summary: {
    totalRevenue: number;
    totalDeposits: number;
    pendingBalance: number;
    pendingPayments: number;
    totalBookings: number;
    averageTicket: number;
    growth: { revenue: number; trend: 'up' | 'down' | 'stable' };
  };
  breakdown: {
    byPaymentMethod: { method: string; count: number; amount: number; percentage: number }[];
    byCourt: { court: string; count: number; amount: number; percentage: number }[];
    byType: { type: string; count: number; amount: number; percentage: number }[];
  };
  charts: {
    dailyRevenue: { date: string; revenue: number; deposits: number; bookings: number }[];
    monthlyComparison: { month: string; revenue: number; deposits: number; bookings: number }[];
  };
  transactions: {
    id: string;
    type: string;
    category: string;
    description: string;
    amount: number;
    depositAmount: number;
    date: string;
    time: string;
    status: string;
    paymentMethod: string;
    reference: string;
    clientName: string;
    clientPhone: string;
    court: string;
  }[];
}

interface PendingPayment {
  id: string;
  clientName: string;
  clientPhone: string;
  court: string;
  date: string;
  time: string;
  totalAmount: number;
  depositAmount: number;
  pendingAmount: number;
  status: string;
}

const FinancePage = () => {
  const { establishment, loading: establishmentLoading } = useEstablishment();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [finance, setFinance] = useState<FinanceResponse | null>(null);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'pending'>('overview');

  const fetchFinance = useCallback(async () => {
    if (!establishment?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [financeRes, pendingRes] = await Promise.all([
        apiClient.getFinancialSummary(establishment.id, selectedPeriod),
        apiClient.getPendingPayments(establishment.id)
      ]);
      
      setFinance(financeRes);
      setPendingPayments(pendingRes.payments || []);
    } catch (err: any) {
      console.error('Error fetching finance:', err);
      setError(err.message || 'Error al cargar datos financieros');
    } finally {
      setLoading(false);
    }
  }, [establishment?.id, selectedPeriod]);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-emerald-400" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-400" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-emerald-400';
      case 'down': return 'text-red-400';
      case 'stable': return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10';
      case 'confirmed': return 'text-emerald-400 bg-emerald-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (establishmentLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
          <span className="text-white text-xl">Cargando finanzas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={fetchFinance}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!finance) return null;

  const { summary, breakdown, charts, transactions } = finance;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión Financiera</h1>
          <p className="text-gray-400 mt-1">
            {finance.period.start} - {finance.period.end}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="appearance-none bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 pr-8"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último año</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          
          <button 
            onClick={fetchFinance}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ingresos Totales</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalRevenue)}</p>
              <div className="flex items-center space-x-1 mt-2">
                {getTrendIcon(summary.growth.trend)}
                <span className={`text-sm font-medium ${getTrendColor(summary.growth.trend)}`}>
                  {Math.abs(summary.growth.revenue)}%
                </span>
                <span className="text-gray-400 text-sm">vs anterior</span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-400" />
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
              <p className="text-gray-400 text-sm">Señas Cobradas</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalDeposits)}</p>
              <p className="text-sm text-gray-500 mt-2">
                {summary.totalRevenue > 0 ? Math.round((summary.totalDeposits / summary.totalRevenue) * 100) : 0}% del total
              </p>
            </div>
            <PiggyBank className="h-8 w-8 text-yellow-400" />
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
              <p className="text-gray-400 text-sm">Por Cobrar</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.pendingBalance)}</p>
              <p className="text-sm text-gray-500 mt-2">Saldo pendiente</p>
            </div>
            <Wallet className="h-8 w-8 text-orange-400" />
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
              <p className="text-gray-400 text-sm">Ticket Promedio</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.averageTicket)}</p>
              <p className="text-sm text-gray-500 mt-2">{summary.totalBookings} reservas</p>
            </div>
            <Receipt className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'transactions'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Transacciones ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'pending'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Pagos Pendientes ({pendingPayments.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Revenue Chart */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Ingresos Diarios</h3>
              {charts.dailyRevenue.length > 0 ? (
                <div>
                  <div className="flex items-end justify-between space-x-1" style={{ height: '200px' }}>
                    {charts.dailyRevenue.slice(-14).map((day, index) => {
                      const maxRevenue = Math.max(...charts.dailyRevenue.slice(-14).map(d => d.revenue));
                      const heightPx = maxRevenue > 0 ? Math.max(4, (day.revenue / maxRevenue) * 180) : 4;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: heightPx }}
                            transition={{ delay: index * 0.03, duration: 0.5 }}
                            className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t cursor-pointer hover:from-emerald-500 hover:to-emerald-300"
                          />
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                            {formatDate(day.date)}: {formatCurrency(day.revenue)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-gray-400">
                    {charts.dailyRevenue.slice(-14).filter((_, i) => i % 3 === 0).map((day, index) => (
                      <span key={index}>{formatDate(day.date)}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  No hay datos para mostrar
                </div>
              )}
            </div>

            {/* Monthly Comparison */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Comparativa Mensual</h3>
              {charts.monthlyComparison.length > 0 ? (
                <div>
                  <div className="flex items-end justify-between space-x-2" style={{ height: '200px' }}>
                    {charts.monthlyComparison.map((month, index) => {
                      const maxRevenue = Math.max(...charts.monthlyComparison.map(m => m.revenue));
                      const heightPx = maxRevenue > 0 ? Math.max(4, (month.revenue / maxRevenue) * 180) : 4;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: heightPx }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t cursor-pointer hover:from-blue-500 hover:to-blue-300"
                          />
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                            {month.month}: {formatCurrency(month.revenue)}
                            <br />{month.bookings} reservas
                          </div>
                          <span className="text-xs text-gray-400 mt-2">{month.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  No hay datos para mostrar
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* By Payment Method */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Por Método de Pago</h3>
              <div className="space-y-3">
                {breakdown.byPaymentMethod.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{item.method}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-medium">{formatCurrency(item.amount)}</p>
                      <p className="text-xs text-gray-500">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
                {breakdown.byPaymentMethod.length === 0 && (
                  <p className="text-gray-400 text-center py-4">Sin datos</p>
                )}
              </div>
            </div>

            {/* By Court */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Por Cancha</h3>
              <div className="space-y-3">
                {breakdown.byCourt.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">{item.court}</span>
                      <span className="text-emerald-400">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                      />
                    </div>
                  </div>
                ))}
                {breakdown.byCourt.length === 0 && (
                  <p className="text-gray-400 text-center py-4">Sin datos</p>
                )}
              </div>
            </div>

            {/* By Type */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Por Tipo de Reserva</h3>
              <div className="space-y-3">
                {breakdown.byType.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{item.type}</p>
                      <p className="text-xs text-gray-400">{item.count} reservas</p>
                    </div>
                    <p className="text-emerald-400 font-semibold">{formatCurrency(item.amount)}</p>
                  </div>
                ))}
                {breakdown.byType.length === 0 && (
                  <p className="text-gray-400 text-center py-4">Sin datos</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cancha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Método</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Seña</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="text-white text-sm">{formatDate(tx.date)}</div>
                      <div className="text-gray-400 text-xs">{tx.time?.substring(0, 5)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white text-sm">{tx.clientName || 'Cliente'}</div>
                      <div className="text-gray-400 text-xs">{tx.clientPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{tx.court}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm capitalize">{tx.paymentMethod}</td>
                    <td className="px-4 py-3 text-right text-yellow-400 text-sm">
                      {tx.depositAmount > 0 ? formatCurrency(tx.depositAmount) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-medium">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(tx.status)}`}>
                        {tx.status === 'completed' || tx.status === 'confirmed' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {tx.status === 'completed' || tx.status === 'confirmed' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No hay transacciones en este período
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-orange-400" />
            <div>
              <p className="text-orange-400 font-medium">
                {pendingPayments.length} reservas con saldo pendiente
              </p>
              <p className="text-orange-300/70 text-sm">
                Total por cobrar: {formatCurrency(pendingPayments.reduce((sum, p) => sum + p.pendingAmount, 0))}
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cancha</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Total</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Seña</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Pendiente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {pendingPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="text-white text-sm">{formatDate(payment.date)}</div>
                        <div className="text-gray-400 text-xs">{payment.time?.substring(0, 5)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white text-sm">{payment.clientName}</div>
                        <div className="text-gray-400 text-xs">{payment.clientPhone}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{payment.court}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{formatCurrency(payment.totalAmount)}</td>
                      <td className="px-4 py-3 text-right text-yellow-400">{formatCurrency(payment.depositAmount)}</td>
                      <td className="px-4 py-3 text-right text-orange-400 font-bold">
                        {formatCurrency(payment.pendingAmount)}
                      </td>
                    </tr>
                  ))}
                  {pendingPayments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        No hay pagos pendientes 🎉
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;
