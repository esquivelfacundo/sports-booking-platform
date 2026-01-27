'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  DollarSign,
  Package,
  User,
  Clock,
  ChevronDown,
  X,
  Loader2,
  Receipt,
  CreditCard,
  Banknote,
  Building2,
  Eye,
  MoreHorizontal,
  Download
} from 'lucide-react';
import UnifiedLoader from '@/components/ui/UnifiedLoader';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { apiClient } from '@/lib/api';
import DirectSaleSidebar from '@/components/admin/DirectSaleSidebar';
import OrderDetailSidebar from '@/components/admin/OrderDetailSidebar';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  orderType: 'direct_sale' | 'booking_consumption';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paymentMethod: string;
  invoiceId?: string | null;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  createdAt: string;
  client?: {
    id: string;
    name: string;
    phone?: string;
  };
  booking?: {
    id: string;
    date: string;
    time?: string;
    startTime: string;
    endTime?: string;
    totalAmount?: number;
    depositAmount?: number;
    initialDeposit?: number;
    clientName?: string;
    clientPhone?: string;
    court?: {
      id: string;
      name: string;
    };
  };
  items: OrderItem[];
  createdByUser?: {
    id: string;
    name: string;
  };
}

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  paidOrders: number;
  pendingPayment: number;
  totalRevenue: number;
  totalPaid: number;
  pendingAmount: number;
  directSales: number;
  bookingConsumptions: number;
}

const VentasPage = () => {
  const { establishment } = useEstablishment();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDirectSale, setShowDirectSale] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [headerPortalContainer, setHeaderPortalContainer] = useState<HTMLElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Get the header portal container on mount
  useEffect(() => {
    const container = document.getElementById('header-page-controls');
    if (container) {
      setHeaderPortalContainer(container);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    if (!establishment?.id) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getOrders({
        establishmentId: establishment.id,
        status: statusFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        orderType: orderTypeFilter || undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
        search: searchTerm || undefined,
        page,
        limit: 20
      }) as { orders: Order[]; pagination: { total: number; totalPages: number } };
      
      setOrders(response.orders || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotal(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }, [establishment?.id, statusFilter, paymentStatusFilter, orderTypeFilter, dateRange, searchTerm, page]);

  const loadStats = useCallback(async () => {
    if (!establishment?.id) return;
    
    try {
      const response = await apiClient.getOrderStats({
        establishmentId: establishment.id,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined
      }) as { stats: OrderStats };
      
      setStats(response.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [establishment?.id, dateRange]);

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [loadOrders, loadStats]);

  const handleOrderCreated = () => {
    setShowDirectSale(false);
    loadOrders();
    loadStats();
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleExportOrders = async () => {
    if (!establishment?.id) return;
    setIsExporting(true);
    try {
      await apiClient.exportOrdersToCSV({
        establishmentId: establishment.id,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
        orderType: orderTypeFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined
      });
    } catch (error: any) {
      console.error('Error exporting orders:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportByProduct = async () => {
    if (!establishment?.id) return;
    setIsExporting(true);
    try {
      await apiClient.exportSalesByProductToCSV({
        establishmentId: establishment.id,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined
      });
    } catch (error: any) {
      console.error('Error exporting by product:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportByPaymentMethod = async () => {
    if (!establishment?.id) return;
    setIsExporting(true);
    try {
      await apiClient.exportSalesByPaymentMethodToCSV({
        establishmentId: establishment.id,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined
      });
    } catch (error: any) {
      console.error('Error exporting by payment method:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      refunded: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      completed: 'Completado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-red-500/20 text-red-400 border border-red-500/30',
      partial: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      paid: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      refunded: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    };
    const labels: Record<string, string> = {
      pending: 'Sin pagar',
      partial: 'Pago parcial',
      paid: 'Pagado',
      refunded: 'Reembolsado'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getOrderTypeLabel = (type: string) => {
    return type === 'direct_sale' ? 'Venta directa' : 'Consumo en reserva';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Header controls to be rendered via portal
  const headerControls = (
    <div className="flex items-center w-full space-x-2 overflow-x-auto">
      {/* Search */}
      <div className="relative flex-shrink-0">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar..."
          className="pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 w-36"
        />
      </div>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 flex-shrink-0"
      >
        <option value="">Estados</option>
        <option value="pending">Pendiente</option>
        <option value="completed">Completado</option>
        <option value="cancelled">Cancelado</option>
      </select>

      {/* Payment Status Filter */}
      <select
        value={paymentStatusFilter}
        onChange={(e) => setPaymentStatusFilter(e.target.value)}
        className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 flex-shrink-0"
      >
        <option value="">Pagos</option>
        <option value="pending">Sin pagar</option>
        <option value="partial">Parcial</option>
        <option value="paid">Pagado</option>
      </select>

      {/* Order Type Filter */}
      <select
        value={orderTypeFilter}
        onChange={(e) => setOrderTypeFilter(e.target.value)}
        className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 flex-shrink-0"
      >
        <option value="">Tipos</option>
        <option value="direct_sale">Directa</option>
        <option value="booking_consumption">En reserva</option>
      </select>

      {/* Date Range */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          className="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 w-32"
        />
        <span className="text-gray-500">-</span>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          className="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 w-32"
        />
      </div>

      {/* Export Dropdown */}
      <div className="relative flex-shrink-0">
        <select
          onChange={(e) => {
            if (e.target.value === 'orders') handleExportOrders();
            if (e.target.value === 'products') handleExportByProduct();
            if (e.target.value === 'payment-method') handleExportByPaymentMethod();
            e.target.value = '';
          }}
          disabled={isExporting}
          className="p-1.5 w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 appearance-none cursor-pointer opacity-0 absolute inset-0 z-10"
          title="Exportar"
        >
          <option value=""></option>
          <option value="orders">Ventas</option>
          <option value="products">Por Producto</option>
          <option value="payment-method">Por Método de Pago</option>
        </select>
        <div className={`p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors ${isExporting ? 'opacity-50' : ''}`}>
          <Download className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
        </div>
      </div>

      {/* New Sale Button */}
      <button
        onClick={() => setShowDirectSale(true)}
        className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex-shrink-0"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nueva Venta</span>
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
      {/* Render controls in header via portal */}
      {headerPortalContainer && createPortal(headerControls, headerPortalContainer)}
      
      <div className="p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Receipt className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-2 flex items-center space-x-4 text-xs">
                <span className="text-gray-400">
                  <span className="text-emerald-400">{stats.directSales}</span> directas
                </span>
                <span className="text-gray-400">
                  <span className="text-blue-400">{stats.bookingConsumptions}</span> en reservas
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Cobrado</p>
                  <p className="text-2xl font-bold text-emerald-400">${stats.totalPaid.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <CreditCard className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Pendiente</p>
                  <p className="text-2xl font-bold text-yellow-400">${stats.pendingAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {stats.pendingPayment} pedidos sin pagar
              </p>
            </motion.div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-none">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No hay pedidos que mostrar</p>
              <button
                onClick={() => setShowDirectSale(true)}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Crear primera venta
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Pedido
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Pago
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        ARCA
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                        onClick={() => handleViewOrder(order)}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${order.orderType === 'direct_sale' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>
                              {order.orderType === 'direct_sale' ? (
                                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Calendar className="w-4 h-4 text-blue-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-gray-900 dark:text-white font-medium">{order.orderNumber}</p>
                              <p className="text-xs text-gray-400">
                                {order.createdByUser?.name || 'Sistema'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">
                              {order.client?.name || order.customerName || 'Cliente anónimo'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-sm ${order.orderType === 'direct_sale' ? 'text-emerald-400' : 'text-blue-400'}`}>
                            {getOrderTypeLabel(order.orderType)}
                          </span>
                          {order.booking && (
                            <p className="text-xs text-gray-400 mt-1">
                              {order.booking.date} {order.booking.startTime || order.booking.time}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">{order.items?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-gray-900 dark:text-white font-medium">${parseFloat(order.total.toString()).toLocaleString()}</p>
                          {order.discount > 0 && (
                            <p className="text-xs text-gray-400">-${parseFloat(order.discount.toString()).toLocaleString()} desc.</p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-4 py-4">
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <div 
                              className={`w-3 h-3 rounded-full ${order.invoiceId ? 'bg-emerald-500' : 'bg-red-500'}`}
                              title={order.invoiceId ? 'Facturado' : 'Sin facturar'}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{formatDate(order.createdAt)}</p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrder(order);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    Mostrando {orders.length} de {total} pedidos
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-gray-400">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      {/* Direct Sale Sidebar */}
      <DirectSaleSidebar
        isOpen={showDirectSale}
        onClose={() => setShowDirectSale(false)}
        establishmentId={establishment.id}
        establishmentName={establishment.name}
        establishmentSlug={establishment.slug}
        onOrderCreated={handleOrderCreated}
      />

      {/* Order Detail Sidebar */}
      {selectedOrder && (
        <OrderDetailSidebar
          isOpen={showOrderDetail}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onOrderUpdated={() => {
            loadOrders();
            loadStats();
          }}
        />
      )}
    </div>
    </>
  );
};

export default VentasPage;
