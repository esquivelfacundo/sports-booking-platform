'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
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
  MapPin,
  FileCheck,
  FileX,
  ShoppingBag
} from 'lucide-react';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

interface FinanceResponse {
  success: boolean;
  period: { start: string; end: string; label: string };
  summary: {
    totalRevenue: number;
    bookingRevenue: number;
    orderRevenue: number;
    totalDeposits: number;
    pendingBalance: number;
    pendingPayments: number;
    totalInvoiced: number;
    totalNotInvoiced: number;
    totalBookings: number;
    totalOrders: number;
    averageTicket: number;
    growth: { revenue: number; trend: 'up' | 'down' | 'stable' };
  };
  breakdown: {
    byPaymentMethod: { method: string; count: number; amount: number; percentage: number }[];
    byCourt: { court: string; count: number; amount: number; percentage: number }[];
    byType: { type: string; count: number; amount: number; percentage: number }[];
  };
  charts: {
    dailyRevenue: { date: string; revenue: number; deposits: number; bookings: number; orders?: number; byPaymentMethod?: { [key: string]: number }; isWeekly?: boolean }[];
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

interface ProductSales {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalAmount: number;
  paymentMethods: {
    [key: string]: {
      name: string;
      amount: number;
    };
  };
}

interface SalesByProductResponse {
  success: boolean;
  period: { start: string; end: string; label: string };
  paymentMethods: { code: string; name: string; icon: string | null }[];
  products: ProductSales[];
}

const FinancePage = () => {
  const { establishment, loading: establishmentLoading } = useEstablishment();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [finance, setFinance] = useState<FinanceResponse | null>(null);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'pending' | 'products'>('overview');
  const [headerPortalContainer, setHeaderPortalContainer] = useState<HTMLElement | null>(null);
  const [productSales, setProductSales] = useState<SalesByProductResponse | null>(null);

  // Get header portal container on mount
  useEffect(() => {
    const container = document.getElementById('header-page-controls');
    if (container) {
      setHeaderPortalContainer(container);
    }
  }, []);
  
  // Read tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'transactions', 'pending', 'products'].includes(tabParam)) {
      setActiveTab(tabParam as 'overview' | 'transactions' | 'pending' | 'products');
    }
  }, [searchParams]);
  
  // Update URL when tab changes
  const handleTabChange = (tab: 'overview' | 'transactions' | 'pending' | 'products') => {
    setActiveTab(tab);
    router.push(`/establecimientos/admin/finanzas?tab=${tab}`, { scroll: false });
  };

  const fetchFinance = useCallback(async () => {
    if (!establishment?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [financeRes, pendingRes, productSalesRes] = await Promise.all([
        apiClient.getFinancialSummary(establishment.id, selectedPeriod, customStartDate || undefined, customEndDate || undefined),
        apiClient.getPendingPayments(establishment.id),
        apiClient.getSalesByProductAndPaymentMethod(establishment.id, selectedPeriod, customStartDate || undefined, customEndDate || undefined)
      ]);
      
      setFinance(financeRes as FinanceResponse);
      setPendingPayments((pendingRes as any).payments || []);
      setProductSales(productSalesRes as SalesByProductResponse);
    } catch (err: any) {
      console.error('Error fetching finance:', err);
      setError(err.message || 'Error al cargar datos financieros');
    } finally {
      setLoading(false);
    }
  }, [establishment?.id, selectedPeriod, customStartDate, customEndDate]);

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
    // Parse date string manually to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
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
        <UnifiedLoader size="md" />
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

  // Header controls for topbar
  const headerControls = (
    <div className="flex items-center w-full space-x-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex-shrink-0">
        <button
          onClick={() => handleTabChange('overview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => handleTabChange('products')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'products'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Por Producto ({productSales?.products.length || 0})
        </button>
        <button
          onClick={() => handleTabChange('transactions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'transactions'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Transacciones ({transactions.length})
        </button>
        <button
          onClick={() => handleTabChange('pending')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Pendientes ({pendingPayments.length})
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Filters */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        <div className="relative">
          <select
            value={selectedPeriod}
            onChange={(e) => {
              const value = e.target.value as any;
              setSelectedPeriod(value);
              if (value !== 'custom') {
                setCustomStartDate('');
                setCustomEndDate('');
              }
            }}
            className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 pr-8"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último año</option>
            <option value="custom">Personalizado</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        
        {/* Custom date inputs */}
        <input
          type="date"
          value={customStartDate}
          onChange={(e) => {
            setCustomStartDate(e.target.value);
            if (e.target.value) setSelectedPeriod('custom');
          }}
          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          title="Fecha desde"
        />
        <span className="text-gray-400">-</span>
        <input
          type="date"
          value={customEndDate}
          onChange={(e) => {
            setCustomEndDate(e.target.value);
            if (e.target.value) setSelectedPeriod('custom');
          }}
          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          title="Fecha hasta"
        />
        
        <button 
          onClick={fetchFinance}
          className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          title="Actualizar"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Render controls in header via portal */}
      {headerPortalContainer && createPortal(headerControls, headerPortalContainer)}
      
      <div className="p-6 space-y-6">
      {/* Key Metrics - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Reservas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.totalBookings}</p>
              <p className="text-xs text-gray-500 mt-1">
                En el período
              </p>
            </div>
            <Calendar className="h-7 w-7 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ingresos Totales</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalRevenue)}</p>
              <div className="flex items-center space-x-1 mt-1">
                {getTrendIcon(summary.growth.trend)}
                <span className={`text-xs font-medium ${getTrendColor(summary.growth.trend)}`}>
                  {Math.abs(summary.growth.revenue)}%
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">vs anterior</span>
              </div>
            </div>
            <DollarSign className="h-7 w-7 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Facturado</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.totalInvoiced || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.totalRevenue > 0 ? Math.round(((summary.totalInvoiced || 0) / summary.totalRevenue) * 100) : 0}% del total
              </p>
            </div>
            <FileCheck className="h-7 w-7 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total No Facturado</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.totalNotInvoiced || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.totalRevenue > 0 ? Math.round(((summary.totalNotInvoiced || 0) / summary.totalRevenue) * 100) : 0}% del total
              </p>
            </div>
            <FileX className="h-7 w-7 text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Key Metrics - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Señas Cobradas</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.totalDeposits)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(summary.bookingRevenue || summary.totalRevenue) > 0 ? Math.round((summary.totalDeposits / (summary.bookingRevenue || summary.totalRevenue)) * 100) : 0}% de reservas
              </p>
            </div>
            <PiggyBank className="h-7 w-7 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pendiente a Cobrar</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(summary.pendingBalance)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Reservas - Señas
              </p>
            </div>
            <Wallet className="h-7 w-7 text-orange-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ingresos Kiosco</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(summary.orderRevenue || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.totalOrders || 0} ventas
              </p>
            </div>
            <ShoppingBag className="h-7 w-7 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ticket Promedio</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.averageTicket)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Por reserva
              </p>
            </div>
            <Receipt className="h-7 w-7 text-blue-400" />
          </div>
        </motion.div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Revenue Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {charts.dailyRevenue[0]?.isWeekly ? 'Ingresos Semanales' : 'Ingresos Diarios'}
              </h3>
              {charts.dailyRevenue.length > 0 ? (
                <div>
                  <div className="flex items-end justify-between space-x-1" style={{ height: '200px' }}>
                    {charts.dailyRevenue.map((day, index) => {
                      const maxRevenue = Math.max(...charts.dailyRevenue.map(d => d.revenue));
                      const heightPx = maxRevenue > 0 ? Math.max(4, (day.revenue / maxRevenue) * 180) : 4;
                      
                      const handleBarClick = () => {
                        if (day.isWeekly) {
                          // For weekly data, set range for the whole week
                          const weekStart = new Date(day.date);
                          const weekEnd = new Date(weekStart);
                          weekEnd.setDate(weekEnd.getDate() + 6);
                          setCustomStartDate(day.date);
                          setCustomEndDate(weekEnd.toISOString().split('T')[0]);
                        } else {
                          // For daily data, set both dates to the same day
                          setCustomStartDate(day.date);
                          setCustomEndDate(day.date);
                        }
                        setSelectedPeriod('custom');
                      };
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative" style={{ minWidth: '4px' }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: heightPx }}
                            transition={{ delay: index * 0.02, duration: 0.4 }}
                            onClick={handleBarClick}
                            className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t cursor-pointer hover:from-emerald-500 hover:to-emerald-300"
                          />
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-10 min-w-[140px]">
                            <div className="font-medium border-b border-gray-700 pb-1 mb-1">
                              {day.isWeekly ? `Semana del ${formatDate(day.date)}` : formatDate(day.date)}
                            </div>
                            <div className="font-bold text-emerald-400 mb-1">
                              Total: {formatCurrency(day.revenue)}
                            </div>
                            {day.byPaymentMethod && Object.entries(day.byPaymentMethod).length > 0 && (
                              <div className="space-y-0.5 text-gray-300">
                                {Object.entries(day.byPaymentMethod).map(([method, amount]) => (
                                  <div key={method} className="flex justify-between gap-2">
                                    <span>{method}:</span>
                                    <span>{formatCurrency(amount as number)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-gray-400">
                    {(() => {
                      const days = charts.dailyRevenue;
                      const showEvery = Math.max(1, Math.floor(days.length / 5));
                      return days.filter((_, i) => i % showEvery === 0 || i === days.length - 1).map((day, index) => (
                        <span key={index}>{formatDate(day.date)}</span>
                      ));
                    })()}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">
                  No hay datos para mostrar
                </div>
              )}
            </div>

            {/* Monthly Comparison */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comparativa Mensual</h3>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Por Método de Pago</h3>
              <div className="space-y-3">
                {breakdown.byPaymentMethod.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{item.method}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(item.amount)}</p>
                      <p className="text-xs text-gray-500">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
                {breakdown.byPaymentMethod.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">Sin datos</p>
                )}
              </div>
            </div>

            {/* By Court */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Por Cancha</h3>
              <div className="space-y-3">
                {breakdown.byCourt.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-900 dark:text-white">{item.court}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">Sin datos</p>
                )}
              </div>
            </div>

            {/* By Type */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Por Tipo de Reserva</h3>
              <div className="space-y-3">
                {breakdown.byType.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">{item.type}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.count} reservas</p>
                    </div>
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(item.amount)}</p>
                  </div>
                ))}
                {breakdown.byType.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">Sin datos</p>
                )}
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-none">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ventas del Período</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Cancha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Método</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Seña</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="text-gray-900 dark:text-white text-sm">{formatDate(tx.date)}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">{tx.time?.substring(0, 5)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 dark:text-white text-sm">{tx.clientName || 'Cliente'}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">{tx.clientPhone}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white text-sm">{tx.court}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">{tx.paymentMethod}</td>
                      <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 text-sm font-medium">
                        {tx.depositAmount > 0 ? formatCurrency(tx.depositAmount) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'completed' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : tx.status === 'confirmed'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {tx.status === 'completed' ? 'Completado' : tx.status === 'confirmed' ? 'Confirmado' : tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        No hay ventas en este período
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Cancha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Método</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Seña</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="text-gray-900 dark:text-white text-sm">{formatDate(tx.date)}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{tx.time?.substring(0, 5)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 dark:text-white text-sm">{tx.clientName || 'Cliente'}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{tx.clientPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">{tx.court}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm capitalize">{tx.paymentMethod}</td>
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

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Cancha</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Total</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Seña</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Pendiente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {pendingPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="text-gray-900 dark:text-white text-sm">{formatDate(payment.date)}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">{payment.time?.substring(0, 5)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 dark:text-white text-sm">{payment.clientName}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">{payment.clientPhone}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">{payment.court}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatCurrency(payment.totalAmount)}</td>
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

      {activeTab === 'products' && productSales && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Producto</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Cantidad</th>
                  {productSales.paymentMethods.map((pm) => (
                    <th key={pm.code} className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                      {pm.name}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {productSales.products.map((product) => (
                  <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="text-gray-900 dark:text-white font-medium">{product.productName}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                      {product.totalQuantity}
                    </td>
                    {productSales.paymentMethods.map((pm) => {
                      const amount = product.paymentMethods[pm.code]?.amount || 0;
                      return (
                        <td key={pm.code} className="px-4 py-3 text-right">
                          <span className={amount > 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-400'}>
                            {amount > 0 ? formatCurrency(amount) : '-'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-bold">
                      {formatCurrency(product.totalAmount)}
                    </td>
                  </tr>
                ))}
                {productSales.products.length === 0 && (
                  <tr>
                    <td colSpan={productSales.paymentMethods.length + 3} className="px-4 py-8 text-center text-gray-400">
                      No hay ventas de productos en este período
                    </td>
                  </tr>
                )}
                {productSales.products.length > 0 && (
                  <tr className="bg-gray-50 dark:bg-gray-700/50 font-bold">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">TOTAL</td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white">
                      {productSales.products.reduce((sum, p) => sum + p.totalQuantity, 0)}
                    </td>
                    {productSales.paymentMethods.map((pm) => {
                      const total = productSales.products.reduce((sum, p) => sum + (p.paymentMethods[pm.code]?.amount || 0), 0);
                      return (
                        <td key={pm.code} className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(total)}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                      {formatCurrency(productSales.products.reduce((sum, p) => sum + p.totalAmount, 0))}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default FinancePage;
