'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingCart,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Banknote,
  CreditCard,
  Building2,
  Loader2,
  Package,
  Receipt,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Printer,
  Download
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { printTicket, isWebUSBSupported, TicketData } from '@/lib/ticketPrinter';
import ArcaInvoiceSidebar, { ArcaInvoiceItem } from '@/components/admin/ArcaInvoiceSidebar';

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
    unit?: string;
  };
}

interface OrderPayment {
  id: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  registeredByUser?: {
    id: string;
    name: string;
  };
}

interface Invoice {
  id: string;
  tipoComprobante?: number;
  tipoComprobanteNombre?: string;
  puntoVenta?: number;
  numeroComprobante?: number;
  cae?: string;
  caeVencimiento?: string;
  total?: number;
  fechaEmision?: string;
  importeTotal?: number;
  status?: string;
  comprobanteAsociadoId?: string;
  motivoNc?: string;
  createdAt?: string;
  isNotaCredito?: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  orderType: 'direct_sale' | 'booking_consumption';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paymentMethod: string;
  invoiceId?: string | null;
  invoice?: Invoice | null;
  invoiceHistory?: Invoice[];
  billingStatus?: 'invoiced' | 'credit_note' | null;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  subtotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  notes?: string;
  createdAt: string;
  client?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  booking?: {
    id: string;
    date: string;
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
  bookingPayments?: {
    id: string;
    amount: number;
    method: string;
    playerName?: string;
    createdAt: string;
  }[];
  bookingConsumptions?: {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product?: {
      id: string;
      name: string;
      image?: string;
    };
  }[];
  items: OrderItem[];
  payments?: OrderPayment[];
  createdByUser?: {
    id: string;
    name: string;
  };
  establishment?: {
    id: string;
    name: string;
    slug?: string;
  };
}

interface OrderDetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order;
  orderId?: string;
  onOrderUpdated?: () => void;
  onUpdate?: () => void;
}

const OrderDetailSidebar: React.FC<OrderDetailSidebarProps> = ({
  isOpen,
  onClose,
  order,
  orderId,
  onOrderUpdated,
  onUpdate
}) => {
  const [mounted, setMounted] = useState(false);
  const [fullOrder, setFullOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInvoiceSidebarOpen, setIsInvoiceSidebarOpen] = useState(false);
  
  // Payment form
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  
  // Print state
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Credit note state
  const [showCreditNoteSidebar, setShowCreditNoteSidebar] = useState(false);
  const [creditNoteType, setCreditNoteType] = useState<'total' | 'partial'>('total');
  const [creditNoteAmount, setCreditNoteAmount] = useState('');
  const [creditNoteMotivo, setCreditNoteMotivo] = useState('');
  const [isEmittingCreditNote, setIsEmittingCreditNote] = useState(false);
  
  // Get the ID from either prop
  const orderIdToLoad = orderId || order?.id;
  
  // Unified callback
  const handleOrderUpdated = () => {
    onOrderUpdated?.();
    onUpdate?.();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && orderIdToLoad) {
      loadFullOrder();
    }
  }, [isOpen, orderIdToLoad]);

  const loadFullOrder = async () => {
    if (!orderIdToLoad) return;
    setLoading(true);
    try {
      const response = await apiClient.getOrder(orderIdToLoad) as { order: Order };
      setFullOrder(response.order);
    } catch (error) {
      console.error('Error loading order:', error);
      if (order) setFullOrder(order);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || !fullOrder) return;
    
    setIsAddingPayment(true);
    try {
      await apiClient.addOrderPayment(fullOrder.id, {
        amount: parseFloat(paymentAmount),
        paymentMethod
      });
      
      setShowPaymentForm(false);
      setPaymentAmount('');
      loadFullOrder();
      handleOrderUpdated();
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Error al registrar el pago');
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleEmitCreditNote = async () => {
    if (!fullOrder?.invoice?.id || !establishmentId) return;
    
    const amount = creditNoteType === 'total' 
      ? fullOrder.total 
      : parseFloat(creditNoteAmount);
    
    if (!amount || amount <= 0) {
      alert('Debe especificar un monto válido');
      return;
    }
    
    if (!creditNoteMotivo.trim()) {
      alert('Debe especificar un motivo');
      return;
    }
    
    setIsEmittingCreditNote(true);
    try {
      await apiClient.emitirNotaCreditoArca(establishmentId, {
        facturaId: fullOrder.invoice.id,
        total: amount,
        motivo: creditNoteMotivo
      });
      
      alert('Nota de crédito emitida exitosamente');
      setShowCreditNoteSidebar(false);
      setCreditNoteMotivo('');
      setCreditNoteAmount('');
      setCreditNoteType('total');
      loadFullOrder();
      handleOrderUpdated();
    } catch (error: any) {
      console.error('Error emitting credit note:', error);
      alert(error.message || 'Error al emitir nota de crédito');
    } finally {
      setIsEmittingCreditNote(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: <AlertCircle className="w-4 h-4" />, label: 'Pendiente' },
      completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle className="w-4 h-4" />, label: 'Completado' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <XCircle className="w-4 h-4" />, label: 'Cancelado' },
      refunded: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: <XCircle className="w-4 h-4" />, label: 'Reembolsado' }
    };
    const c = config[status] || config.pending;
    return (
      <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.icon}
        <span>{c.label}</span>
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Sin pagar' },
      partial: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pago parcial' },
      paid: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Pagado' },
      refunded: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Reembolsado' }
    };
    const c = config[status] || config.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'transfer': return <Building2 className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      credit_card: 'Credito',
      debit_card: 'Debito',
      mixed: 'Mixto',
      pending: 'Pendiente',
      mercadopago: 'MercadoPago'
    };
    return labels[method] || method;
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

  const displayOrder = fullOrder || order;
  
  // Early return if no order data yet (loading state)
  if (!displayOrder) {
    if (!mounted) return null;
    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-xl bg-gray-900 shadow-2xl z-50 flex items-center justify-center"
            >
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    );
  }
  
  // Calculate totals including booking price and seña
  // Parse all values to numbers since they come as strings from Sequelize DECIMAL
  const bookingPrice = parseFloat(String(displayOrder.booking?.totalAmount || 0)) || 0;
  
  // Calculate seña: use initialDeposit if exists, otherwise depositAmount - bookingPayments
  const bookingPaymentsTotal = (displayOrder.bookingPayments || []).reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);
  const initialDeposit = parseFloat(String(displayOrder.booking?.initialDeposit || 0)) || 0;
  const depositAmount = parseFloat(String(displayOrder.booking?.depositAmount || 0)) || 0;
  const seña = initialDeposit > 0
    ? initialDeposit
    : Math.max(0, depositAmount - bookingPaymentsTotal);
  
  // Consumptions from booking
  const bookingConsumptionsTotal = (displayOrder.bookingConsumptions || []).reduce((sum, c) => sum + (parseFloat(String(c.totalPrice)) || 0), 0);
  
  // For direct sales, use order totals directly
  const isDirectSale = displayOrder.orderType === 'direct_sale';
  
  // Total general = precio cancha + consumos (for bookings) or order total (for direct sales)
  const totalGeneral = isDirectSale 
    ? parseFloat(String(displayOrder.total)) || 0
    : bookingPrice + bookingConsumptionsTotal;
  
  // Total pagado = seña + pagos declarados del booking (for bookings) or paidAmount (for direct sales)
  const totalPaid = isDirectSale
    ? parseFloat(String(displayOrder.paidAmount)) || 0
    : seña + bookingPaymentsTotal;
  
  // Pendiente
  const pendingAmount = Math.max(0, totalGeneral - totalPaid);

  const establishmentId = displayOrder.establishment?.id;

  const invoiceItems: ArcaInvoiceItem[] = (() => {
    if (isDirectSale) {
      const items = (displayOrder.items || []).map((it) => ({
        descripcion: it.product?.name || it.productName || 'Producto',
        cantidad: Number(it.quantity) || 1,
        precioUnitario: Number(it.unitPrice) || 0,
      }));
      if (items.length > 0) return items;
      return [{ descripcion: `Venta ${displayOrder.orderNumber}`, cantidad: 1, precioUnitario: totalGeneral }];
    }

    const items: ArcaInvoiceItem[] = [];
    if (bookingPrice > 0) {
      items.push({
        descripcion: displayOrder.booking?.court?.name ? `Cancha ${displayOrder.booking.court.name}` : 'Cancha',
        cantidad: 1,
        precioUnitario: bookingPrice,
      });
    }
    (displayOrder.bookingConsumptions || []).forEach((c) => {
      items.push({
        descripcion: c.product?.name || 'Consumo',
        cantidad: Number(c.quantity) || 1,
        precioUnitario: Number(c.unitPrice) || 0,
      });
    });
    if (items.length > 0) return items;
    return [{ descripcion: `Consumo ${displayOrder.orderNumber}`, cantidad: 1, precioUnitario: totalGeneral }];
  })();

  const defaultCustomerName = displayOrder.client?.name || displayOrder.customerName || undefined;

  const handlePrintTicket = async () => {
    if (!isWebUSBSupported()) {
      alert('WebUSB no está soportado en este navegador. Use Chrome o Edge.');
      return;
    }

    setIsPrinting(true);
    try {
      // Generate establishment URL for QR code
      const establishmentSlug = displayOrder.establishment?.slug;
      const establishmentUrl = establishmentSlug 
        ? `https://miscanchas.com/reservar/${establishmentSlug}` 
        : undefined;

      // Format date to Spanish format
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      };

      // For direct sales, use order items; for bookings, use bookingConsumptions
      const ticketItems = isDirectSale
        ? (displayOrder.items || []).map(item => ({
            name: item.product?.name || item.productName || 'Producto',
            quantity: item.quantity,
            unitPrice: parseFloat(String(item.unitPrice)) || 0,
            totalPrice: parseFloat(String(item.totalPrice)) || 0
          }))
        : (displayOrder.bookingConsumptions || []).map(c => ({
            name: c.product?.name || 'Producto',
            quantity: c.quantity,
            unitPrice: parseFloat(String(c.unitPrice)) || 0,
            totalPrice: parseFloat(String(c.totalPrice)) || 0
          }));

      // For direct sales, use order payments; for bookings, use bookingPayments
      const ticketPayments = isDirectSale
        ? (displayOrder.payments || []).map(p => ({
            playerName: undefined,
            method: p.paymentMethod,
            amount: parseFloat(String(p.amount)) || 0
          }))
        : (displayOrder.bookingPayments || []).map(p => ({
            playerName: p.playerName,
            method: p.method,
            amount: parseFloat(String(p.amount)) || 0
          }));

      const ticketData: TicketData = {
        establishmentName: displayOrder.establishment?.name || 'Sports Booking',
        orderNumber: displayOrder.orderNumber,
        courtName: isDirectSale ? undefined : displayOrder.booking?.court?.name,
        date: isDirectSale ? undefined : (displayOrder.booking?.date ? formatDate(displayOrder.booking.date) : undefined),
        time: isDirectSale ? undefined : (displayOrder.booking?.startTime ? `${displayOrder.booking.startTime}${displayOrder.booking.endTime ? ` - ${displayOrder.booking.endTime}` : ''}` : undefined),
        clientName: displayOrder.client?.name || displayOrder.customerName,
        courtPrice: isDirectSale ? undefined : (bookingPrice > 0 ? bookingPrice : undefined),
        consumptionsTotal: isDirectSale ? totalGeneral : (bookingConsumptionsTotal > 0 ? bookingConsumptionsTotal : undefined),
        depositPaid: isDirectSale ? undefined : (seña > 0 ? seña : undefined),
        paymentsDeclared: isDirectSale ? undefined : (bookingPaymentsTotal > 0 ? bookingPaymentsTotal : undefined),
        totalAmount: totalGeneral,
        paidAmount: totalPaid,
        pendingAmount: pendingAmount,
        items: ticketItems,
        payments: ticketPayments,
        establishmentUrl: establishmentUrl
      };

      await printTicket(ticketData);
      alert('✅ Ticket impreso correctamente');
    } catch (error) {
      console.error('Error printing ticket:', error);
      alert('❌ Error al imprimir: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setIsPrinting(false);
    }
  };

  if (!mounted) return null;

  const sidebarContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${displayOrder.orderType === 'direct_sale' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>
                  {displayOrder.orderType === 'direct_sale' ? (
                    <ShoppingCart className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Calendar className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{displayOrder.orderNumber}</h2>
                  <p className="text-xs text-gray-400">
                    {displayOrder.orderType === 'direct_sale' ? 'Venta directa' : 'Consumo en reserva'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(displayOrder.status)}
                {getPaymentStatusBadge(displayOrder.paymentStatus)}
                <button
                  onClick={() => setIsInvoiceSidebarOpen(true)}
                  disabled={!establishmentId || !!displayOrder.invoiceId}
                  className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  title={displayOrder.invoiceId ? 'Ya facturado' : 'Facturar'}
                >
                  <Receipt className="h-5 w-5" />
                </button>
                <button
                  onClick={handlePrintTicket}
                  disabled={isPrinting}
                  className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Imprimir ticket"
                >
                  {isPrinting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Printer className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <>
                  {/* Customer Info */}
                  <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Cliente</h3>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {displayOrder.client?.name || displayOrder.customerName || 'Cliente anónimo'}
                        </p>
                        {(displayOrder.client?.phone || displayOrder.customerPhone) && (
                          <p className="text-sm text-gray-400 flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{displayOrder.client?.phone || displayOrder.customerPhone}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods Summary for Direct Sales */}
                  {displayOrder.orderType === 'direct_sale' && displayOrder.payments && displayOrder.payments.length > 0 && (
                    <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Métodos de Pago</h3>
                      <div className="space-y-2">
                        {displayOrder.payments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-700 rounded-lg">
                                {getPaymentMethodIcon(payment.paymentMethod)}
                              </div>
                              <div>
                                <p className="text-white font-medium">{getPaymentMethodLabel(payment.paymentMethod)}</p>
                                <p className="text-xs text-gray-400">{formatDate(payment.createdAt)}</p>
                              </div>
                            </div>
                            <span className="text-emerald-400 font-semibold">
                              ${parseFloat(payment.amount.toString()).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detalle de pago - igual que en /reservas */}
                  {displayOrder.booking && (
                    <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Detalle de Pago</h3>
                      
                      {/* Precio cancha */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total cancha:</span>
                        <span className="text-white">${bookingPrice.toLocaleString()}</span>
                      </div>
                      
                      {/* Consumos realizados */}
                      {bookingConsumptionsTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Consumos realizados:</span>
                          <span className="text-white">${bookingConsumptionsTotal.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {/* Seña pagada */}
                      {seña > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Seña pagada</span>
                          <span className="text-emerald-400">-${seña.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {/* Pagos declarados */}
                      {bookingPaymentsTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Pagos declarados</span>
                          <span className="text-emerald-400">-${bookingPaymentsTotal.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {/* Pendiente a pagar */}
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-600">
                        <span className="text-gray-400 font-medium">Pendiente a pagar:</span>
                        <span className={`font-medium ${pendingAmount > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                          ${pendingAmount.toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Detalle de pagos realizados */}
                      {(displayOrder.bookingPayments || []).length > 0 && (
                        <div className="pt-3 border-t border-gray-600 space-y-2">
                          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pagos realizados</h5>
                          {displayOrder.bookingPayments?.map((payment) => (
                            <div key={payment.id} className="flex justify-between text-sm">
                              <span className="text-gray-300">
                                {payment.playerName || 'Pago'} ({getPaymentMethodLabel(payment.method)})
                              </span>
                              <span className="text-emerald-400">${(parseFloat(String(payment.amount)) || 0).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Reserva info */}
                  {displayOrder.booking && (
                    <div className="bg-blue-500/10 rounded-xl p-4 space-y-2 border border-blue-500/20">
                      <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wider">Reserva</h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span>{displayOrder.booking.date}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span>{displayOrder.booking.startTime}{displayOrder.booking.endTime ? ` - ${displayOrder.booking.endTime}` : ''}</span>
                        </div>
                      </div>
                      {displayOrder.booking.court && (
                        <p className="text-sm text-gray-400">{displayOrder.booking.court.name}</p>
                      )}
                    </div>
                  )}

                  {/* Order Items / Booking Consumptions */}
                  <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Productos ({(displayOrder.items?.length || 0) + (displayOrder.bookingConsumptions?.length || 0)})
                      </h3>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Direct order items */}
                      {displayOrder.items?.map((item) => (
                        <div key={item.id} className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-700 rounded-lg">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{item.productName}</p>
                                <p className="text-xs text-gray-400">
                                  ${parseFloat(item.unitPrice.toString()).toLocaleString()} x {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="text-emerald-400 font-semibold">
                              ${parseFloat(item.totalPrice.toString()).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      {/* Booking consumptions */}
                      {displayOrder.bookingConsumptions?.map((item) => (
                        <div key={item.id} className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-700 rounded-lg">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{item.product?.name || 'Producto'}</p>
                                <p className="text-xs text-gray-400">
                                  ${parseFloat(String(item.unitPrice)).toLocaleString()} x {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="text-emerald-400 font-semibold">
                              ${parseFloat(String(item.totalPrice)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="pt-3 border-t border-gray-600 space-y-2">
                      {parseFloat(displayOrder.discount.toString()) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Descuento</span>
                          <span className="text-red-400">-${parseFloat(displayOrder.discount.toString()).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-emerald-400">
                          ${(displayOrder.items?.reduce((sum, item) => sum + (parseFloat(item.totalPrice?.toString()) || 0), 0) || parseFloat(displayOrder.total.toString()) || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Pagos</h3>
                      {pendingAmount > 0 && (
                        <button
                          onClick={() => setShowPaymentForm(!showPaymentForm)}
                          className="flex items-center space-x-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Agregar</span>
                        </button>
                      )}
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                      {seña > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Seña pagada</span>
                          <span className="text-emerald-400 font-medium">
                            ${seña.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {parseFloat(displayOrder.paidAmount.toString()) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Pagos declarados</span>
                          <span className="text-emerald-400 font-medium">
                            ${parseFloat(displayOrder.paidAmount.toString()).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                        <span className="text-gray-400 font-medium">Total pagado</span>
                        <span className="text-emerald-400 font-medium">
                          ${totalPaid.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-medium">Pendiente</span>
                        <span className={`font-medium ${pendingAmount > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                          ${pendingAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Payment Form */}
                    {showPaymentForm && (
                      <div className="bg-gray-800 rounded-lg p-3 space-y-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Monto</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                            <input
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder={pendingAmount.toString()}
                              className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => setPaymentAmount(pendingAmount.toString())}
                              className="flex-1 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                            >
                              Total
                            </button>
                            <button
                              onClick={() => setPaymentAmount(Math.round(pendingAmount / 2).toString())}
                              className="flex-1 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                            >
                              Mitad
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${
                              paymentMethod === 'cash'
                                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                                : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            <Banknote className="w-4 h-4 mb-1" />
                            <span className="text-xs">Efectivo</span>
                          </button>
                          <button
                            onClick={() => setPaymentMethod('transfer')}
                            className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${
                              paymentMethod === 'transfer'
                                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                                : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            <Building2 className="w-4 h-4 mb-1" />
                            <span className="text-xs">Transfer</span>
                          </button>
                          <button
                            onClick={() => setPaymentMethod('card')}
                            className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${
                              paymentMethod === 'card'
                                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                                : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            <CreditCard className="w-4 h-4 mb-1" />
                            <span className="text-xs">Tarjeta</span>
                          </button>
                        </div>

                        <button
                          onClick={handleAddPayment}
                          disabled={isAddingPayment || !paymentAmount}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          {isAddingPayment ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4" />
                              <span>Registrar Pago</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Payment History */}
                    {displayOrder.payments && displayOrder.payments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 uppercase">Historial de pagos</p>
                        {displayOrder.payments.map((payment) => (
                          <div key={payment.id} className="bg-gray-800 rounded-lg p-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getPaymentMethodIcon(payment.paymentMethod)}
                              <div>
                                <p className="text-white text-sm">${parseFloat(payment.amount.toString()).toLocaleString()}</p>
                                <p className="text-xs text-gray-400">{formatDate(payment.createdAt)}</p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {payment.registeredByUser?.name || 'Sistema'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Invoice History Timeline */}
                  {displayOrder.invoiceHistory && displayOrder.invoiceHistory.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Historial de Facturación
                      </h3>
                      <div className="relative">
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-700" />
                        <div className="space-y-3">
                          {displayOrder.invoiceHistory.map((inv) => (
                            <div key={inv.id} className="relative pl-8">
                              <div className={`absolute left-1 top-3 w-4 h-4 rounded-full border-2 ${inv.isNotaCredito ? 'bg-red-500 border-red-400' : 'bg-emerald-500 border-emerald-400'}`} />
                              <div className={`rounded-lg p-3 border ${inv.isNotaCredito ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm font-medium ${inv.isNotaCredito ? 'text-red-400' : 'text-emerald-400'}`}>{inv.tipoComprobanteNombre}</span>
                                  <button onClick={async () => { if (!establishmentId) return; try { await apiClient.openArcaInvoicePdf(establishmentId, inv.id); } catch (e) { console.error('Error downloading PDF:', e); } }} className={`text-xs flex items-center gap-1 ${inv.isNotaCredito ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}><Download className="w-3 h-3" />PDF</button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div><p className="text-gray-400">Número</p><p className="text-white font-mono">{String(inv.puntoVenta).padStart(5, '0')}-{String(inv.numeroComprobante).padStart(8, '0')}</p></div>
                                  <div><p className="text-gray-400">Importe</p><p className={`font-semibold ${inv.isNotaCredito ? 'text-red-400' : 'text-emerald-400'}`}>{inv.isNotaCredito ? '-' : ''}${parseFloat(inv.importeTotal?.toString() || '0').toLocaleString()}</p></div>
                                  <div><p className="text-gray-400">CAE</p><p className="text-white font-mono truncate">{inv.cae}</p></div>
                                  <div><p className="text-gray-400">Fecha</p><p className="text-white">{inv.fechaEmision ? new Date(inv.fechaEmision + 'T12:00:00').toLocaleDateString('es-AR') : '-'}</p></div>
                                </div>
                                {inv.isNotaCredito && inv.motivoNc && (<div className="mt-2 pt-2 border-t border-red-500/20"><p className="text-gray-400 text-xs">Motivo:</p><p className="text-white text-xs">{inv.motivoNc}</p></div>)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {displayOrder.billingStatus === 'invoiced' && (<button onClick={() => setShowCreditNoteSidebar(true)} className="w-full py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"><XCircle className="w-4 h-4" />Emitir Nota de Crédito</button>)}
                      {displayOrder.billingStatus === 'credit_note' && (<button onClick={() => setIsInvoiceSidebarOpen(true)} className="w-full py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"><Receipt className="w-4 h-4" />Emitir Nueva Factura</button>)}
                    </div>
                  )}

                  {/* Order Info */}
                  <div className="text-xs text-gray-500 text-center space-y-1">
                    <p>Creado el {formatDate(displayOrder.createdAt)}</p>
                    {displayOrder.createdByUser && (
                      <p>por {displayOrder.createdByUser.name}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <ArcaInvoiceSidebar
              isOpen={isInvoiceSidebarOpen}
              onClose={() => setIsInvoiceSidebarOpen(false)}
              establishmentId={establishmentId || ''}
              orderId={displayOrder.id}
              bookingId={displayOrder.booking?.id}
              items={invoiceItems}
              total={totalGeneral}
              defaultCustomerName={defaultCustomerName}
              onInvoiced={() => {
                loadFullOrder();
                handleOrderUpdated();
              }}
            />

            {/* Credit Note Sidebar */}
            <AnimatePresence>
              {showCreditNoteSidebar && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowCreditNoteSidebar(false)}
                    className="fixed inset-0 bg-black/60 z-[70]"
                  />
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-800 shadow-2xl z-[80] flex flex-col"
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                      <h2 className="text-lg font-semibold text-white">Emitir Nota de Crédito</h2>
                      <button
                        onClick={() => setShowCreditNoteSidebar(false)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      {/* Original Invoice Info */}
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Factura Original</p>
                        <p className="text-white font-medium">
                          {displayOrder.invoice?.tipoComprobanteNombre} - {' '}
                          {String(displayOrder.invoice?.puntoVenta).padStart(5, '0')}-{String(displayOrder.invoice?.numeroComprobante).padStart(8, '0')}
                        </p>
                        <p className="text-emerald-400 font-semibold mt-1">
                          Total: ${displayOrder.total?.toLocaleString()}
                        </p>
                      </div>

                      {/* Credit Note Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Nota de Crédito</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCreditNoteType('total')}
                            className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                              creditNoteType === 'total'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            Total (Anular)
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreditNoteType('partial')}
                            className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                              creditNoteType === 'partial'
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            Parcial
                          </button>
                        </div>
                      </div>

                      {/* Amount (only for partial) */}
                      {creditNoteType === 'partial' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Monto a acreditar</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                            <input
                              type="number"
                              value={creditNoteAmount}
                              onChange={(e) => setCreditNoteAmount(e.target.value)}
                              max={displayOrder.total}
                              className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                              placeholder="0.00"
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Máximo: ${displayOrder.total?.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Motivo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Motivo *</label>
                        <textarea
                          value={creditNoteMotivo}
                          onChange={(e) => setCreditNoteMotivo(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                          placeholder="Ej: Devolución de producto, Error en facturación..."
                        />
                      </div>

                      {/* Summary */}
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <p className="text-sm text-gray-300 mb-2">Resumen de la Nota de Crédito:</p>
                        <p className="text-2xl font-bold text-red-400">
                          -${creditNoteType === 'total' 
                            ? displayOrder.total?.toLocaleString() 
                            : (parseFloat(creditNoteAmount) || 0).toLocaleString()}
                        </p>
                        {creditNoteType === 'total' && (
                          <p className="text-xs text-red-400 mt-2">
                            ⚠️ Esto anulará completamente la factura original
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-700">
                      <button
                        onClick={handleEmitCreditNote}
                        disabled={isEmittingCreditNote || !creditNoteMotivo.trim() || (creditNoteType === 'partial' && (!creditNoteAmount || parseFloat(creditNoteAmount) <= 0))}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        {isEmittingCreditNote ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Emitiendo...</span>
                          </>
                        ) : (
                          <>
                            <Receipt className="w-5 h-5" />
                            <span>Emitir Nota de Crédito</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(sidebarContent, document.body);
};

export default OrderDetailSidebar;
