'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign,
  Calendar,
  FileText,
  MapPin,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Copy,
  MessageSquare,
  Plus,
  Banknote,
  CreditCard,
  Building2,
  ShoppingCart,
  Minus,
  Package,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Printer
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { TicketData, printTicket, isWebUSBSupported } from '@/lib/ticketPrinter';
import { useToast } from '@/contexts/ToastContext';
import { useCashRegisterContext } from '@/contexts/CashRegisterContext';
import ArcaInvoiceModal, { ArcaInvoiceItem } from '@/components/admin/ArcaInvoiceModal';

interface BookingPaymentRecord {
  id: string;
  amount: number;
  method: string;
  playerName?: string;
  paidAt: string;
  mpPaymentId?: string;
  paymentType?: 'deposit' | 'declared';
}

interface BookingConsumption {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    unit: string;
    salePrice: number;
    image?: string;
    category?: {
      name: string;
      color: string;
    };
  };
  addedByUser: {
    name: string;
    email: string;
  };
}

interface Reservation {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  court: string;
  courtId?: string;
  sportName?: string;
  date: string;
  time: string;
  endTime?: string;
  duration: number;
  price: number;
  invoiceId?: string | null;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  createdAt: string;
  notes?: string;
  isRecurring?: boolean;
  recurringGroupId?: string;
  recurringSequence?: number;
  recurringPaymentStatus?: string;
  depositAmount?: number;
  initialDeposit?: number;
  depositPercent?: number;
  depositMethod?: string;
  serviceFee?: number;
  mpPaymentId?: string;
  paidAt?: string;
  establishmentId?: string;
  establishment?: {
    id: string;
    name: string;
    slug?: string;
  };
  orders?: Array<{
    id: string;
    orderNumber: string;
  }>;
  reviewToken?: string;
  reviewedAt?: string;
}

interface ReservationDetailsSidebarProps {
  isOpen: boolean;
  reservation: Reservation | null;
  onClose: () => void;
  onEdit: (reservation: Reservation) => void;
  onCancel: (reservationId: string) => Promise<void>;
  onConfirm: (reservationId: string) => Promise<void>;
  onComplete: (reservationId: string) => Promise<void>;
  onNoShow?: (reservationId: string) => Promise<void>;
  onFinalize?: (reservationId: string) => Promise<void>;
  onPaymentRegistered?: (bookingId: string, newDepositAmount: number) => void;
  onStatusChanged?: (reservationId: string, newStatus: string) => void;
  onConsumptionChanged?: (bookingId: string) => void;
  establishmentName?: string;
  establishmentSlug?: string;
  onOpenCashRegister?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'confirmed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'no_show': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'cancelled': return 'bg-red-800/20 text-red-600 border-red-800/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'confirmed': return 'Pendiente';
    case 'in_progress': return 'En Curso';
    case 'completed': return 'Completada';
    case 'no_show': return 'No asistió';
    case 'cancelled': return 'Cancelada';
    default: return status;
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    case 'partial': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'pending': return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case 'unpaid': return 'bg-red-500/20 text-red-400 border border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
};

const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case 'paid': return 'Pagado';
    case 'partial': return 'Pago parcial';
    case 'pending': return 'Sin pagar';
    case 'unpaid': return 'Sin pagar';
    default: return status;
  }
};

export const ReservationDetailsSidebar: React.FC<ReservationDetailsSidebarProps> = ({
  isOpen,
  reservation,
  onClose,
  onEdit,
  onCancel,
  onConfirm,
  onComplete,
  onNoShow,
  onFinalize,
  onPaymentRegistered,
  onStatusChanged,
  onConsumptionChanged,
  establishmentName,
  establishmentSlug,
  onOpenCashRegister
}) => {
  const { isOpen: isCashRegisterOpen } = useCashRegisterContext();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  
  // Payment state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [playerName, setPlayerName] = useState('');
  const [isRegisteringPayment, setIsRegisteringPayment] = useState(false);
  const [localDepositAmount, setLocalDepositAmount] = useState<number | null>(null);
  const [payments, setPayments] = useState<BookingPaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; name: string; code: string; icon: string | null }[]>([]);
  
  // Consumptions state
  const [consumptions, setConsumptions] = useState<BookingConsumption[]>([]);
  const [loadingConsumptions, setLoadingConsumptions] = useState(false);
  const [consumptionsTotal, setConsumptionsTotal] = useState(0);
  
  // Product search state (integrated in sidebar)
  const [showProductSearch, setShowProductSearch] = useState(false);
  
  // Payment form state (integrated in sidebar)
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());
  const [addingConsumptions, setAddingConsumptions] = useState(false);
  
  // Status change state
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  
  // Print ticket state
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPrintSection, setShowPrintSection] = useState(false);
  const [showPendingWarning, setShowPendingWarning] = useState(false);
  
  // Recurring booking group state
  const [recurringGroup, setRecurringGroup] = useState<any>(null);
  const [recurringBookings, setRecurringBookings] = useState<any[]>([]);
  const [loadingRecurringGroup, setLoadingRecurringGroup] = useState(false);
  const [showRecurringDetails, setShowRecurringDetails] = useState(false);
  const [showCancelRecurringModal, setShowCancelRecurringModal] = useState(false);
  const [cancelRecurringType, setCancelRecurringType] = useState<'single' | 'all_pending'>('single');
  const [cancelRecurringReason, setCancelRecurringReason] = useState('');
  const [isCancellingRecurring, setIsCancellingRecurring] = useState(false);
  const [pendingBookingsForCancel, setPendingBookingsForCancel] = useState<any[]>([]);
  
  // Toast notifications
  const { showSuccess, showError, showWarning, showPaymentNotification } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // State for order number
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Load payments, consumptions, and order when reservation changes
  useEffect(() => {
    setLocalDepositAmount(null);
    setPayments([]);
    setConsumptions([]);
    setConsumptionsTotal(0);
    setOrderNumber(null);
    setRecurringGroup(null);
    setRecurringBookings([]);
    setShowRecurringDetails(false);
    
    if (reservation?.id && isOpen) {
      loadPayments(reservation.id);
      loadConsumptions(reservation.id);
      loadOrderNumber(reservation.id);
      // Load payment methods for the establishment
      const estId = reservation.establishmentId || reservation.establishment?.id;
      if (estId) {
        loadPaymentMethods(estId);
      }
      // Load recurring group if this is a recurring booking
      if (reservation.recurringGroupId) {
        loadRecurringGroup(reservation.recurringGroupId);
      }
    }
  }, [reservation?.id, isOpen]);

  // Load recurring booking group details
  const loadRecurringGroup = async (groupId: string) => {
    setLoadingRecurringGroup(true);
    try {
      const response = await apiClient.getRecurringBookingGroup(groupId) as any;
      if (response.success) {
        setRecurringGroup(response.group);
        setRecurringBookings(response.bookings || []);
      }
    } catch (error) {
      console.error('Error loading recurring group:', error);
    } finally {
      setLoadingRecurringGroup(false);
    }
  };

  const loadOrderNumber = async (bookingId: string) => {
    // Only try to load order number if reservation has orders
    if (reservation?.orders && reservation.orders.length > 0) {
      setOrderNumber(reservation.orders[0].orderNumber);
      return;
    }
    // Otherwise, don't make the API call - order doesn't exist yet
    setOrderNumber(null);
  };

  // Open cancel recurring modal and load pending bookings
  const handleOpenCancelRecurringModal = async () => {
    if (!reservation?.recurringGroupId) return;
    
    try {
      const response = await apiClient.getRecurringPendingBookings(reservation.recurringGroupId) as any;
      if (response.success) {
        setPendingBookingsForCancel(response.pendingBookings || []);
      }
    } catch (error) {
      console.error('Error loading pending bookings:', error);
    }
    setShowCancelRecurringModal(true);
  };

  // Handle recurring booking cancellation
  const handleCancelRecurring = async () => {
    if (!reservation?.recurringGroupId) return;
    
    setIsCancellingRecurring(true);
    try {
      const response = await apiClient.cancelRecurringBooking(reservation.recurringGroupId, {
        cancelType: cancelRecurringType,
        bookingId: cancelRecurringType === 'single' ? reservation.id : undefined,
        reason: cancelRecurringReason
      }) as any;
      
      if (response.success) {
        showSuccess(
          cancelRecurringType === 'single' 
            ? 'Turno cancelado exitosamente' 
            : `${response.cancelledBookings?.length || 0} turnos cancelados`
        );
        setShowCancelRecurringModal(false);
        setCancelRecurringReason('');
        // Refresh the view
        if (onStatusChanged) {
          onStatusChanged(reservation.id, 'cancelled');
        }
        onClose();
      } else {
        throw new Error(response.error || 'Error al cancelar');
      }
    } catch (error: any) {
      console.error('Error cancelling recurring booking:', error);
      showError('Error al cancelar el turno fijo');
    } finally {
      setIsCancellingRecurring(false);
    }
  };

  // Load products when in fullscreen mode (products column is always visible)
  useEffect(() => {
    if (isFullscreen && isOpen && products.length === 0) {
      loadProducts();
    }
  }, [isFullscreen, isOpen]);

  const loadPayments = async (bookingId: string) => {
    setLoadingPayments(true);
    try {
      const response = await apiClient.getBookingPayments(bookingId) as { payments: BookingPaymentRecord[] };
      setPayments(response.payments || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadPaymentMethods = async (establishmentId: string) => {
    try {
      const response = await apiClient.getPaymentMethods(establishmentId) as { paymentMethods: { id: string; name: string; code: string; icon: string | null }[] };
      setPaymentMethods(response.paymentMethods || []);
      // Set default payment method if available
      if (response.paymentMethods?.length > 0) {
        setPaymentMethod(response.paymentMethods[0].code);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      // Fallback to default methods if API fails
      setPaymentMethods([
        { id: '1', name: 'Efectivo', code: 'cash', icon: 'Banknote' },
        { id: '2', name: 'Transferencia', code: 'transfer', icon: 'Building2' },
        { id: '3', name: 'Tarjeta', code: 'card', icon: 'CreditCard' }
      ]);
    }
  };

  // Helper to get payment method name from code
  const getPaymentMethodName = (code: string) => {
    const method = paymentMethods.find(m => m.code === code);
    if (method) return method.name;
    // Fallback for common codes
    const fallbacks: Record<string, string> = {
      cash: 'Efectivo',
      transfer: 'Transferencia',
      card: 'Tarjeta',
      credit_card: 'Credito',
      debit_card: 'Debito',
      mercadopago: 'MercadoPago'
    };
    return fallbacks[code] || code;
  };

  const loadConsumptions = async (bookingId: string) => {
    setLoadingConsumptions(true);
    try {
      const response = await apiClient.getBookingConsumptions(bookingId) as { consumptions: BookingConsumption[]; total: number };
      setConsumptions(response.consumptions || []);
      setConsumptionsTotal(response.total || 0);
    } catch (error) {
      console.error('Error loading consumptions:', error);
    } finally {
      setLoadingConsumptions(false);
    }
  };

  const handleUpdateConsumption = async (consumptionId: string, newQuantity: number) => {
    try {
      await apiClient.updateBookingConsumption(consumptionId, { quantity: newQuantity });
      if (reservation?.id) {
        await loadConsumptions(reservation.id);
        onConsumptionChanged?.(reservation.id);
      }
    } catch (error) {
      console.error('Error updating consumption:', error);
      alert('Error al actualizar el consumo');
    }
  };

  const handleDeleteConsumption = async (consumptionId: string) => {
    if (!confirm('¿Estás seguro de eliminar este consumo?')) return;
    
    try {
      await apiClient.deleteBookingConsumption(consumptionId);
      if (reservation?.id) {
        await loadConsumptions(reservation.id);
        onConsumptionChanged?.(reservation.id);
      }
    } catch (error) {
      console.error('Error deleting consumption:', error);
      alert('Error al eliminar el consumo');
    }
  };

  // Load products for search
  const loadProducts = async () => {
    const establishmentId = reservation?.establishmentId || reservation?.establishment?.id;
    if (!establishmentId) {
      console.error('No establishment ID found in reservation');
      return;
    }
    
    setLoadingProducts(true);
    try {
      const response = await apiClient.getProducts({
        establishmentId,
        isActive: true,
        limit: 1000 // Load all products for consumption selection
      }) as any;
      console.log('Products loaded:', response);
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Error al cargar productos');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Open product search view
  const handleOpenProductSearch = () => {
    setShowProductSearch(true);
    setSearchTerm('');
    setSelectedProducts(new Map());
    loadProducts();
  };

  // Handle product quantity change
  const handleProductQuantityChange = (productId: string, delta: number) => {
    const newSelected = new Map(selectedProducts);
    const current = newSelected.get(productId) || 0;
    const newQuantity = Math.max(0, current + delta);
    
    if (newQuantity === 0) {
      newSelected.delete(productId);
    } else {
      newSelected.set(productId, newQuantity);
    }
    
    setSelectedProducts(newSelected);
  };

  // Confirm and add selected products
  const handleConfirmProducts = async () => {
    if (selectedProducts.size === 0 || !reservation?.id) return;

    setAddingConsumptions(true);
    try {
      const promises = Array.from(selectedProducts.entries()).map(([productId, quantity]) =>
        apiClient.addBookingConsumption({
          bookingId: reservation.id,
          productId,
          quantity
        })
      );

      await Promise.all(promises);
      await loadConsumptions(reservation.id);
      
      // Notify parent to refresh grid
      onConsumptionChanged?.(reservation.id);
      
      // Return to details view
      setShowProductSearch(false);
      setSelectedProducts(new Map());
      setSearchTerm('');
    } catch (error) {
      console.error('Error adding consumptions:', error);
      alert('Error al agregar consumos');
    } finally {
      setAddingConsumptions(false);
    }
  };

  // Cancel product search
  const handleCancelProductSearch = () => {
    setShowProductSearch(false);
    setSelectedProducts(new Map());
    setSearchTerm('');
  };

  // Open payment form view
  const handleOpenPaymentForm = () => {
    setShowPaymentForm(true);
    setPaymentAmount('');
    setPlayerName('');
    setPaymentMethod('cash');
  };

  // Cancel payment form
  const handleCancelPaymentForm = () => {
    setShowPaymentForm(false);
    setPaymentAmount('');
    setPlayerName('');
  };

  const handleAction = async (action: 'cancel' | 'confirm' | 'complete' | 'no_show') => {
    if (!reservation) return;
    
    setIsProcessing(true);
    setActionType(action);
    
    try {
      if (action === 'cancel') {
        await onCancel(reservation.id);
      } else if (action === 'confirm') {
        await onConfirm(reservation.id);
      } else if (action === 'complete') {
        await onComplete(reservation.id);
      } else if (action === 'no_show' && onNoShow) {
        await onNoShow(reservation.id);
      }
      onClose();
    } catch (error) {
      console.error(`Error ${action} reservation:`, error);
    } finally {
      setIsProcessing(false);
      setActionType(null);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!reservation || newStatus === reservation.status) return;
    
    // If completing, check for pending balance first
    if (newStatus === 'completed') {
      const effectiveDeposit = localDepositAmount ?? (reservation.depositAmount || 0);
      const total = reservation.price + consumptionsTotal;
      const pending = total - effectiveDeposit;
      
      if (pending > 0) {
        // Show pending warning first
        setShowPendingWarning(true);
        return;
      }
      
      // No pending balance, show print section directly
      setShowPrintSection(true);
      return;
    }
    
    // Check if cash register is open before starting a booking (in_progress creates an Order)
    if (newStatus === 'in_progress' && !isCashRegisterOpen) {
      showWarning('Caja cerrada', 'Debes abrir la caja antes de iniciar un turno');
      if (onOpenCashRegister) {
        onOpenCashRegister();
      }
      return;
    }
    
    setIsChangingStatus(true);
    try {
      if (newStatus === 'cancelled') {
        await onCancel(reservation.id);
        showWarning('Reserva cancelada', `${reservation.clientName} - ${reservation.court}`);
      } else if (newStatus === 'in_progress') {
        // Start the booking (check-in) - this creates the Order
        await onComplete(reservation.id);
        showSuccess('Turno iniciado', `${reservation.clientName} ha ingresado a ${reservation.court}`);
      } else if (newStatus === 'no_show' && onNoShow) {
        await onNoShow(reservation.id);
        showWarning('No asistió', `${reservation.clientName} no se presentó a su turno`);
      }
    } catch (error: any) {
      console.error(`Error changing status to ${newStatus}:`, error);
      showError('Error al cambiar estado', error.message || 'No se pudo actualizar el estado');
    } finally {
      setIsChangingStatus(false);
    }
  };
  
  const handleCompleteWithPrint = async (shouldPrint: boolean) => {
    if (!reservation) return;
    
    if (shouldPrint) {
      await handlePrintTicket();
    }
    
    // Use onFinalize if available (with PIN validation), otherwise direct API call
    if (onFinalize) {
      await onFinalize(reservation.id);
      setShowPrintSection(false);
    } else {
      setIsChangingStatus(true);
      try {
        await apiClient.updateBooking(reservation.id, { status: 'completed' });
        // Call callback to update the status in parent
        if (onStatusChanged) {
          onStatusChanged(reservation.id, 'completed');
        }
        // Call callback to refresh the list
        if (onPaymentRegistered) {
          const currentDeposit = localDepositAmount ?? (reservation.depositAmount || 0);
          onPaymentRegistered(reservation.id, currentDeposit);
        }
        showSuccess('Turno completado', `${reservation.clientName} - ${reservation.court}`);
      } catch (error: any) {
        console.error('Error completing reservation:', error);
        showError('Error al completar', error.message || 'No se pudo completar el turno');
      } finally {
        setIsChangingStatus(false);
        setShowPrintSection(false);
      }
    }
  };
  
  const handleCancelPrintSection = () => {
    setShowPrintSection(false);
  };

  const handleConfirmPendingWarning = () => {
    // User confirmed they want to complete despite pending balance
    setShowPendingWarning(false);
    setShowPrintSection(true);
  };

  const handleCancelPendingWarning = () => {
    // User wants to go back and declare payments
    setShowPendingWarning(false);
  };
  
  const handlePrintTicket = async () => {
    if (!isWebUSBSupported()) {
      alert('WebUSB no está soportado en este navegador. Use Chrome o Edge.');
      return;
    }

    setIsPrinting(true);
    try {
      // Helper: identificar si un pago es seña
      const isDepositPayment = (p: BookingPaymentRecord) => {
        if (p.paymentType === 'deposit') return true;
        if (p.paymentType === 'declared') return false;
        const notes = (p as any).notes || '';
        return notes.toLowerCase().includes('seña') || notes.toLowerCase().includes('inicial');
      };
      const depositPayments = payments.filter(isDepositPayment);
      const declaredPayments = payments.filter(p => !isDepositPayment(p));
      const seña = depositPayments.reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0) || (reservation?.initialDeposit || 0);
      const paymentsTotal = declaredPayments.reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);
      const total = (reservation?.price || 0) + consumptionsTotal;
      const paid = seña + paymentsTotal;

      // Use orderNumber from state (loaded from backend)
      
      // Use props for establishment data (passed from parent which has the data)
      const estName = establishmentName || reservation?.establishment?.name || 'Sports Booking';
      const estSlug = establishmentSlug || reservation?.establishment?.slug;
      const establishmentUrl = estSlug 
        ? `https://miscanchas.com/reservar/${estSlug}` 
        : 'https://miscanchas.com';
      
      // Generate review URL if booking has a review token
      const reviewUrl = reservation?.reviewToken 
        ? `${window.location.origin}/valorar/${reservation.reviewToken}`
        : undefined;

      // Debug: log data before creating ticket
      console.log('Ticket data debug:', {
        consumptions: consumptions,
        consumptionsLength: consumptions.length,
        payments: payments,
        paymentsLength: payments.length,
        consumptionsTotal,
        paymentsTotal
      });

      const ticketData: TicketData = {
        establishmentName: estName,
        orderNumber: orderNumber || undefined,
        courtName: reservation?.court,
        sportName: reservation?.sportName,
        date: reservation?.date ? formatDate(reservation.date) : undefined,
        time: reservation?.time ? `${reservation.time}${reservation.endTime ? ` - ${reservation.endTime}` : ''}` : undefined,
        clientName: reservation?.clientName,
        courtPrice: reservation?.price,
        consumptionsTotal: consumptionsTotal > 0 ? consumptionsTotal : undefined,
        depositPaid: seña > 0 ? seña : undefined,
        paymentsDeclared: paymentsTotal > 0 ? paymentsTotal : undefined,
        totalAmount: total,
        paidAmount: paid,
        pendingAmount: Math.max(0, total - paid),
        items: consumptions.map(c => ({
          name: c.product?.name || 'Producto',
          quantity: c.quantity,
          unitPrice: parseFloat(String(c.unitPrice)) || 0,
          totalPrice: parseFloat(String(c.totalPrice)) || 0
        })),
        payments: payments.map(p => ({
          playerName: p.playerName,
          method: p.method,
          amount: parseFloat(String(p.amount)) || 0
        })),
        establishmentUrl: establishmentUrl,
        reviewUrl: reviewUrl
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRegisterPayment = async () => {
    if (!reservation || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      showWarning('Monto inválido', 'Ingresa un monto válido');
      return;
    }

    const currentDeposit = localDepositAmount ?? (reservation.depositAmount || 0);
    const currentPending = reservation.price + consumptionsTotal - currentDeposit;
    
    if (amount > currentPending) {
      showWarning('Monto excedido', `El monto excede el saldo pendiente ($${currentPending.toLocaleString()})`);
      return;
    }

    setIsRegisteringPayment(true);
    try {
      const response = await apiClient.registerBookingPayment(reservation.id, {
        amount,
        method: paymentMethod,
        playerName: playerName.trim() || undefined
      }) as { success: boolean; booking?: { depositAmount: number }; payments?: BookingPaymentRecord[] };

      if (response.success && response.booking) {
        setLocalDepositAmount(response.booking.depositAmount);
        if (response.payments) {
          setPayments(response.payments);
        }
        onPaymentRegistered?.(reservation.id, response.booking.depositAmount);
        setShowPaymentForm(false);
        setPaymentAmount('');
        setPlayerName('');
        
        const methodName = paymentMethods.find(m => m.code === paymentMethod)?.name || paymentMethod;
        showPaymentNotification('Pago registrado', `$${amount.toLocaleString('es-AR')} en ${methodName} - ${reservation.clientName}`);
      }
    } catch (error: any) {
      console.error('Error registering payment:', error);
      showError('Error al registrar pago', error.message || 'No se pudo registrar el pago');
    } finally {
      setIsRegisteringPayment(false);
    }
  };

  // Use local deposit if available, otherwise use reservation's deposit
  const effectiveDepositAmount = localDepositAmount ?? (reservation?.depositAmount || 0);
  const totalAmount = reservation ? reservation.price + consumptionsTotal : 0;
  const pendingAmount = reservation ? Math.max(0, totalAmount - effectiveDepositAmount) : 0;
  
  // Calculate real payment status based on pending amount
  const calculatedPaymentStatus = (() => {
    if (pendingAmount <= 0) return 'paid';
    if (effectiveDepositAmount > 0) return 'partial';
    return 'pending';
  })();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!mounted) return null;

  const whatsappPhoneDigits = reservation?.clientPhone
    ? reservation.clientPhone.split('').filter((c) => c >= '0' && c <= '9').join('')
    : '';

  const whatsappText = reservation
    ? `Hola ${reservation.clientName}, te escribimos por tu reserva del ${formatDate(reservation.date)} a las ${reservation.time}.`
    : '';

  const whatsappHref = whatsappPhoneDigits
    ? 'https://wa.me/' + whatsappPhoneDigits + '?text=' + encodeURIComponent(whatsappText)
    : '';

  const establishmentId = reservation?.establishmentId || reservation?.establishment?.id;

  const invoiceItems: ArcaInvoiceItem[] = (() => {
    if (!reservation) return [];
    const items: ArcaInvoiceItem[] = [];
    items.push({
      descripcion: reservation.court ? `Cancha ${reservation.court}` : 'Cancha',
      cantidad: 1,
      precioUnitario: Number(reservation.price) || 0,
    });
    (consumptions || []).forEach((c) => {
      items.push({
        descripcion: c.product?.name || 'Consumo',
        cantidad: Number(c.quantity) || 1,
        precioUnitario: Number(c.unitPrice) || 0,
      });
    });
    return items;
  })();

  const invoiceTotal = (Number(reservation?.price) || 0) + (Number(consumptionsTotal) || 0);

  const sidebarContent = (
    <AnimatePresence>
      {isOpen && reservation && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 h-full bg-gray-800 shadow-2xl z-[101] flex flex-col transition-all duration-300 ${
              isFullscreen ? 'w-full' : 'w-full max-w-md'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              {/* Left side - Back button (if in sub-view on non-fullscreen) or Title */}
              <div className="flex items-center space-x-3">
                {!isFullscreen && (showProductSearch || showPaymentForm || showPrintSection) && (
                  <button
                    onClick={showProductSearch ? handleCancelProductSearch : showPaymentForm ? handleCancelPaymentForm : handleCancelPrintSection}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <h2 className="text-lg font-semibold text-white">
                  {!isFullscreen && showProductSearch ? 'Productos' : 
                   !isFullscreen && showPaymentForm ? 'Pagos' : 
                   !isFullscreen && showPrintSection ? 'Completar Reserva' :
                   'Detalles'}
                </h2>
                {/* Status badges only in fullscreen mode */}
                {isFullscreen && (
                  <>
                    {/* Status select with Calendar icon */}
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <select
                        value={reservation.status === 'confirmed' ? 'pending' : reservation.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={isChangingStatus || reservation.status === 'cancelled' || reservation.status === 'completed' || reservation.status === 'no_show'}
                        className={`px-2 py-1 rounded-full text-xs font-medium border cursor-pointer appearance-none pr-6 ${getStatusColor(reservation.status)} bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En Curso</option>
                        <option value="completed">Completada</option>
                        <option value="no_show">No asistió</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </div>
                    {/* Payment status badge with $ icon */}
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(calculatedPaymentStatus)}`}>
                        {getPaymentStatusLabel(calculatedPaymentStatus)}
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Right side - Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsInvoiceModalOpen(true)}
                  disabled={!reservation || !establishmentId || !!reservation.invoiceId || pendingAmount > 0}
                  className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  title={reservation?.invoiceId ? 'Ya facturado' : pendingAmount > 0 ? 'Debe estar pagado para facturar' : 'Facturar'}
                >
                  <FileText className="h-5 w-5" />
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
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title={isFullscreen ? 'Reducir' : 'Expandir'}
                >
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
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
            <div className={`flex-1 ${isFullscreen ? 'overflow-hidden p-4' : 'overflow-y-auto p-4 space-y-6'}`}>
              {/* Fullscreen: 3 columns layout */}
              {isFullscreen ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 h-full">
                  {/* Column 1: Reservation Info + Consumptions */}
                  <div className="flex flex-col h-full overflow-hidden">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider py-2 flex-shrink-0">Reserva</h3>
                    <div className="flex-1 overflow-y-auto space-y-4">
                    
                    {/* Client Info */}
                    <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-white">
                            {reservation.clientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{reservation.clientName}</p>
                          <p className="text-xs text-gray-400 truncate">{reservation.clientPhone || 'Sin teléfono'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="bg-gray-700/50 rounded-xl p-4 space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-white">{reservation.court}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-white">{formatDate(reservation.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-white">{reservation.time} - {reservation.endTime || ''}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <DollarSign className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-white font-medium">${reservation.price.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-700/50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total cancha:</span>
                        <span className="text-white">${reservation.price.toLocaleString()}</span>
                      </div>
                      {consumptionsTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Consumos:</span>
                          <span className="text-white">${consumptionsTotal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-600">
                        <span className="text-gray-400 font-medium">Pendiente:</span>
                        <span className={`font-bold ${pendingAmount > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                          ${pendingAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {reservation.notes && (
                      <div className="bg-gray-700/50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 uppercase mb-1">Notas</p>
                        <p className="text-gray-300 text-sm">{reservation.notes}</p>
                      </div>
                    )}

                    {/* Consumptions in Column 1 */}
                    <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                          <ShoppingCart className="h-4 w-4" />
                          <span>Consumos</span>
                        </h4>
                        {consumptionsTotal > 0 && (
                          <span className="text-emerald-400 font-bold">${consumptionsTotal.toLocaleString()}</span>
                        )}
                      </div>
                      
                      {loadingConsumptions ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      ) : consumptions.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-2">Sin consumos</p>
                      ) : (
                        <div className="space-y-2">
                          {consumptions.map((consumption) => (
                            <div key={consumption.id} className="bg-gray-800 rounded-lg p-2">
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-white text-sm font-medium truncate">{consumption.product.name}</h5>
                                  <p className="text-xs text-gray-400">${consumption.unitPrice.toLocaleString()} x {consumption.quantity}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-emerald-400 font-semibold text-sm">${consumption.totalPrice.toLocaleString()}</span>
                                  <button
                                    onClick={() => handleDeleteConsumption(consumption.id)}
                                    className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    </div>
                  </div>

                  {/* Column 2: Add Products */}
                  <div className="flex flex-col h-full overflow-hidden">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider py-2 flex-shrink-0">Productos</h3>
                    
                    <div className="relative mb-4 flex-shrink-0">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar productos..."
                        className="w-full pl-3 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Scrollable products list */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                      {loadingProducts ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <div className="space-y-2 pr-1">
                          {products
                            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .slice(0, 15)
                            .map((product) => {
                              const quantity = selectedProducts.get(product.id) || 0;
                              return (
                                <div
                                  key={product.id}
                                  className={`bg-gray-700/50 rounded-lg p-3 border transition-colors ${
                                    quantity > 0 ? 'border-emerald-500' : 'border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                      <h4 className="text-white text-sm font-medium truncate">{product.name}</h4>
                                      <p className="text-emerald-400 text-xs font-semibold">${product.salePrice.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-1 ml-2">
                                      <button
                                        onClick={() => handleProductQuantityChange(product.id, -1)}
                                        disabled={quantity === 0}
                                        className="w-7 h-7 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 rounded flex items-center justify-center"
                                      >
                                        <Minus className="w-3 h-3 text-white" />
                                      </button>
                                      <span className="text-white font-medium text-sm w-6 text-center">{quantity}</span>
                                      <button
                                        onClick={() => handleProductQuantityChange(product.id, 1)}
                                        className="w-7 h-7 bg-emerald-600 hover:bg-emerald-700 rounded flex items-center justify-center"
                                      >
                                        <Plus className="w-3 h-3 text-white" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    {/* Fixed button at bottom - always visible when products selected */}
                    {selectedProducts.size > 0 && (
                      <div className="pt-4 flex-shrink-0 bg-gray-800">
                        <button
                          onClick={handleConfirmProducts}
                          disabled={addingConsumptions}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          {addingConsumptions ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4" />
                              <span>Agregar ({selectedProducts.size})</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Payment Form */}
                  <div className="flex flex-col h-full overflow-hidden">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider py-2 flex-shrink-0">Declarar Pago</h3>
                    <div className="flex-1 overflow-y-auto space-y-4">
                    
                    {pendingAmount > 0 ? (
                      <>
                        <div className="bg-gray-700/50 rounded-xl p-3">
                          <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Nombre del jugador (opcional)"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="bg-gray-700/50 rounded-xl p-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                            <input
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder="Monto"
                              className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => setPaymentAmount(pendingAmount.toString())}
                              className="flex-1 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                            >
                              Total
                            </button>
                            <button
                              onClick={() => setPaymentAmount(Math.round(pendingAmount / 2).toString())}
                              className="flex-1 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                            >
                              Mitad
                            </button>
                          </div>
                        </div>

                        <div className={`grid gap-2 ${paymentMethods.length <= 3 ? 'grid-cols-3' : paymentMethods.length <= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                          {paymentMethods.map((method) => (
                            <button
                              key={method.id}
                              onClick={() => setPaymentMethod(method.code)}
                              className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${
                                paymentMethod === method.code 
                                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                                  : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
                              }`}
                            >
                              {method.code === 'cash' && <Banknote className="h-5 w-5 mb-1" />}
                              {method.code === 'transfer' && <Building2 className="h-5 w-5 mb-1" />}
                              {(method.code === 'credit_card' || method.code === 'debit_card' || method.code === 'card') && <CreditCard className="h-5 w-5 mb-1" />}
                              {!['cash', 'transfer', 'credit_card', 'debit_card', 'card'].includes(method.code) && <DollarSign className="h-5 w-5 mb-1" />}
                              <span className="text-xs truncate max-w-full">{method.name}</span>
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={handleRegisterPayment}
                          disabled={isRegisteringPayment || !paymentAmount}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          {isRegisteringPayment ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4" />
                              <span>Registrar Pago</span>
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="bg-emerald-600/20 rounded-xl p-4 text-center">
                        <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-emerald-400 font-medium">Pago Completo</p>
                      </div>
                    )}

                    {/* Payment History */}
                    {payments.length > 0 && (
                      <div className="bg-gray-700/50 rounded-xl p-3 space-y-2">
                        <p className="text-xs text-gray-400 uppercase">Pagos Realizados</p>
                        {payments.map((payment) => (
                          <div key={payment.id} className="flex justify-between text-sm py-1">
                            <span className="text-gray-300 truncate">
                              {payment.playerName || 'Pago'}
                            </span>
                            <span className="text-emerald-400 font-medium">
                              ${payment.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              ) : showPaymentForm ? (
                /* Payment Form View - Non-fullscreen */
                <div className="space-y-6">
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Pendiente a pagar:</span>
                      <span className="text-2xl font-bold text-yellow-400">${pendingAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <label className="block text-sm text-gray-400 mb-2">Nombre del jugador (opcional)</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Ej: Juan"
                      autoFocus
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <label className="block text-sm text-gray-400 mb-2">Monto</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setPaymentAmount(pendingAmount.toString())}
                        className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                      >
                        Total
                      </button>
                      <button
                        onClick={() => setPaymentAmount(Math.round(pendingAmount / 2).toString())}
                        className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                      >
                        Mitad
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <label className="block text-sm text-gray-400 mb-3">Método de pago</label>
                    <div className={`grid gap-3 ${paymentMethods.length <= 3 ? 'grid-cols-3' : paymentMethods.length <= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.code)}
                          className={`flex flex-col items-center p-4 rounded-xl border-2 transition-colors ${
                            paymentMethod === method.code 
                              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                              : 'bg-gray-700 border-gray-600 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          {method.code === 'cash' && <Banknote className="h-8 w-8 mb-2" />}
                          {method.code === 'transfer' && <Building2 className="h-8 w-8 mb-2" />}
                          {(method.code === 'credit_card' || method.code === 'debit_card' || method.code === 'card') && <CreditCard className="h-8 w-8 mb-2" />}
                          {!['cash', 'transfer', 'credit_card', 'debit_card', 'card'].includes(method.code) && <DollarSign className="h-8 w-8 mb-2" />}
                          <span className="text-sm font-medium truncate max-w-full">{method.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : showProductSearch ? (
                /* Product Search View - Non-fullscreen */
                <>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar productos..."
                      autoFocus
                      className="w-full pl-4 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {loadingProducts ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                      <p className="text-gray-400 mt-4">Cargando productos...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {products
                        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((product) => {
                          const quantity = selectedProducts.get(product.id) || 0;
                          return (
                            <div
                              key={product.id}
                              className={`bg-gray-700 rounded-lg p-3 border transition-colors ${
                                quantity > 0 ? 'border-emerald-500' : 'border-gray-600'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                                    {product.image ? (
                                      <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-full h-full object-cover rounded"
                                      />
                                    ) : (
                                      <Package className="w-6 h-6 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium truncate">{product.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-emerald-400 font-semibold">
                                        ${product.salePrice.toLocaleString('es-AR')}
                                      </span>
                                      {product.category && (
                                        <span
                                          className="text-xs px-2 py-0.5 rounded-full"
                                          style={{
                                            backgroundColor: `${product.category.color}20`,
                                            color: product.category.color
                                          }}
                                        >
                                          {product.category.name}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                      Stock: {product.currentStock} {product.unit}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-2">
                                  <button
                                    onClick={() => handleProductQuantityChange(product.id, -1)}
                                    disabled={quantity === 0}
                                    className="w-8 h-8 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors"
                                  >
                                    <Minus className="w-4 h-4 text-white" />
                                  </button>
                                  <div className="w-10 text-center">
                                    <span className="text-white font-semibold">{quantity}</span>
                                  </div>
                                  <button
                                    onClick={() => handleProductQuantityChange(product.id, 1)}
                                    className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 rounded flex items-center justify-center transition-colors"
                                  >
                                    <Plus className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </>
              ) : (
                /* Details View - Non-fullscreen */
                <div className="space-y-6">
              {/* Status Badges - Non-fullscreen only */}
              <div className="flex items-center justify-between bg-gray-700/50 rounded-xl p-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <select
                    value={reservation.status === 'confirmed' ? 'pending' : reservation.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isChangingStatus || reservation.status === 'cancelled' || reservation.status === 'completed' || reservation.status === 'no_show'}
                    className={`px-2 py-1 rounded-full text-xs font-medium border cursor-pointer appearance-none pr-6 ${getStatusColor(reservation.status)} bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Curso</option>
                    <option value="completed">Completada</option>
                    <option value="no_show">No asistió</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(calculatedPaymentStatus)}`}>
                    {getPaymentStatusLabel(calculatedPaymentStatus)}
                  </span>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Cliente</h3>
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {reservation.clientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{reservation.clientName}</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span>{reservation.clientEmail || 'Sin email'}</span>
                    </div>
                    {reservation.clientEmail && (
                      <button
                        onClick={() => copyToClipboard(reservation.clientEmail)}
                        className="p-1 text-gray-500 hover:text-white transition-colors"
                        title="Copiar email"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>{reservation.clientPhone || 'Sin teléfono'}</span>
                    </div>
                    {reservation.clientPhone && (
                      <button
                        onClick={() => copyToClipboard(reservation.clientPhone)}
                        className="p-1 text-gray-500 hover:text-white transition-colors"
                        title="Copiar teléfono"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Recurring Booking (Turno Fijo) Info */}
              {reservation.recurringGroupId && recurringGroup && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wider flex items-center gap-2">
                      🔄 Turno Fijo
                    </h3>
                    <button
                      onClick={() => setShowRecurringDetails(!showRecurringDetails)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      {showRecurringDetails ? 'Ocultar' : 'Ver detalles'}
                    </button>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Turno</span>
                      <span className="text-white font-medium">
                        #{reservation.recurringSequence} de {recurringGroup.totalOccurrences}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pagados</span>
                      <span className={recurringGroup.paidBookingsCount >= (reservation.recurringSequence || 0) ? 'text-emerald-400' : 'text-yellow-400'}>
                        {recurringGroup.paidBookingsCount} de {recurringGroup.totalOccurrences}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total pagado</span>
                      <span className="text-emerald-400 font-medium">
                        ${parseFloat(recurringGroup.totalPaid || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {showRecurringDetails && (
                    <div className="mt-3 pt-3 border-t border-blue-500/30">
                      <p className="text-xs text-gray-400 mb-2">Próximos turnos:</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {recurringBookings
                          .filter(b => new Date(b.date) >= new Date())
                          .slice(0, 5)
                          .map((booking: any, idx: number) => (
                            <div key={booking.id} className="flex justify-between text-xs">
                              <span className={booking.id === reservation.id ? 'text-blue-400 font-medium' : 'text-gray-300'}>
                                {new Date(booking.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </span>
                              <span className={
                                booking.recurringPaymentStatus === 'paid' ? 'text-emerald-400' :
                                booking.recurringPaymentStatus === 'paid_in_advance' ? 'text-emerald-400' :
                                'text-yellow-400'
                              }>
                                {booking.recurringPaymentStatus === 'paid' || booking.recurringPaymentStatus === 'paid_in_advance' ? '✓ Pagado' : '○ Pendiente'}
                              </span>
                            </div>
                          ))}
                      </div>
                      
                      {/* Cancel recurring button */}
                      <button
                        onClick={handleOpenCancelRecurringModal}
                        className="mt-3 w-full py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/30"
                      >
                        Cancelar turno fijo
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {loadingRecurringGroup && reservation.recurringGroupId && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-2 text-blue-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Cargando turno fijo...</span>
                  </div>
                </div>
              )}

              {/* Booking Details */}
              <div className="bg-gray-700/50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Reserva</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-white font-medium">{reservation.court}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-white">{formatDate(reservation.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-white">
                        {reservation.time} - {reservation.endTime || ''}
                        <span className="text-gray-400 ml-2">({reservation.duration} min)</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="text-white font-medium">${reservation.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Payment breakdown */}
                <div className="mt-4 pt-4 border-t border-gray-600 space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Detalle de Pago</h4>
                    {pendingAmount > 0 && (
                      <button
                        onClick={handleOpenPaymentForm}
                        className="flex items-center space-x-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Declarar pago</span>
                      </button>
                    )}
                  </div>
                  
                  {(reservation.serviceFee || 0) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Tarifa de servicio:</span>
                      <span className="font-medium text-gray-300">
                        ${(reservation.serviceFee || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total cancha:</span>
                    <span className="font-medium text-white">
                      ${reservation.price.toLocaleString()}
                    </span>
                  </div>
                  {/* Consumos realizados */}
                  {consumptionsTotal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Consumos realizados:</span>
                      <span className="font-medium text-white">
                        ${consumptionsTotal.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {/* Total a pagar (cancha + consumos) */}
                  <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-700 mt-1">
                    <span className="text-gray-400 font-medium">Total a pagar:</span>
                    <span className="font-bold text-white">
                      ${(reservation.price + consumptionsTotal).toLocaleString()}
                    </span>
                  </div>
                  {/* Seña pagada - pago inicial al reservar */}
                  {(() => {
                    // Helper: identificar si un pago es seña (por paymentType o por notes/monto)
                    const isDepositPayment = (p: BookingPaymentRecord) => {
                      if (p.paymentType === 'deposit') return true;
                      if (p.paymentType === 'declared') return false;
                      // Fallback para pagos sin paymentType: verificar notes o si es el primer pago con monto igual a depositAmount
                      const notes = (p as any).notes || '';
                      return notes.toLowerCase().includes('seña') || notes.toLowerCase().includes('inicial');
                    };
                    
                    const depositPayments = payments.filter(isDepositPayment);
                    const depositFromPayments = depositPayments.reduce((sum, p) => sum + p.amount, 0);
                    const initialDep = depositFromPayments > 0 
                      ? depositFromPayments 
                      : (reservation.initialDeposit || 0);
                    
                    return initialDep > 0 ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Seña pagada</span>
                        <span className="font-medium text-emerald-400">
                          -${initialDep.toLocaleString()}
                        </span>
                      </div>
                    ) : null;
                  })()}
                  {/* Pagos declarados - suma de pagos realizados después de la seña */}
                  {(() => {
                    const isDepositPayment = (p: BookingPaymentRecord) => {
                      if (p.paymentType === 'deposit') return true;
                      if (p.paymentType === 'declared') return false;
                      const notes = (p as any).notes || '';
                      return notes.toLowerCase().includes('seña') || notes.toLowerCase().includes('inicial');
                    };
                    const declaredPayments = payments.filter(p => !isDepositPayment(p));
                    const paymentsTotal = declaredPayments.reduce((sum, p) => sum + p.amount, 0);
                    
                    return paymentsTotal > 0 ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Pagos declarados</span>
                        <span className="font-medium text-emerald-400">
                          -${paymentsTotal.toLocaleString()}
                        </span>
                      </div>
                    ) : null;
                  })()}
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-600">
                    <span className="text-gray-400 font-medium">Pendiente a pagar:</span>
                    <span className={`font-medium ${pendingAmount > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      ${pendingAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Payment history - pagos declarados */}
                  {(() => {
                    const isDepositPayment = (p: BookingPaymentRecord) => {
                      if (p.paymentType === 'deposit') return true;
                      if (p.paymentType === 'declared') return false;
                      const notes = (p as any).notes || '';
                      return notes.toLowerCase().includes('seña') || notes.toLowerCase().includes('inicial');
                    };
                    const declaredPayments = payments.filter(p => !isDepositPayment(p));
                    return declaredPayments.length > 0 ? (
                    <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                      <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pagos declarados</h5>
                      
                      {/* Lista de pagos declarados */}
                      {declaredPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between text-sm py-1">
                          <span className="text-gray-300">
                            {payment.playerName || 'Pago'} ({getPaymentMethodName(payment.method)})
                          </span>
                          <span className="font-medium text-emerald-400">
                            ${payment.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      
                      {loadingPayments && (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    ) : null;
                  })()}
                  
                  {/* MP Transaction ID if exists */}
                  {reservation.mpPaymentId && (
                    <div className="mt-2 pt-2 border-t border-gray-600">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">ID Transacción MP:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300 font-mono text-xs">{reservation.mpPaymentId}</span>
                          <button
                            onClick={() => copyToClipboard(reservation.mpPaymentId || '')}
                            className="p-1 text-gray-500 hover:text-white transition-colors"
                            title="Copiar ID"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {reservation.notes && (
                <div className="bg-gray-700/50 rounded-xl p-4 space-y-2">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Notas</span>
                  </h3>
                  <p className="text-gray-300 text-sm">{reservation.notes}</p>
                </div>
              )}

              {/* Created At */}
              <div className="text-xs text-gray-500 text-center">
                Creada el {new Date(reservation.createdAt).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>

              {/* Consumptions Section */}
              <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Consumos</span>
                  </h3>
                  <button
                    onClick={handleOpenProductSearch}
                    className="flex items-center space-x-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Agregar</span>
                  </button>
                </div>

                {loadingConsumptions ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                ) : consumptions.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-2">
                    No hay consumos registrados
                  </p>
                ) : (
                  <div className="space-y-2">
                    {consumptions.map((consumption) => (
                      <div
                        key={consumption.id}
                        className="bg-gray-800 rounded p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-medium truncate">
                              {consumption.product.name}
                            </h4>
                            {consumption.product.category && (
                              <span
                                className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                                style={{
                                  backgroundColor: `${consumption.product.category.color}20`,
                                  color: consumption.product.category.color
                                }}
                              >
                                {consumption.product.category.name}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteConsumption(consumption.id)}
                            className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateConsumption(consumption.id, consumption.quantity - 1)}
                              disabled={consumption.quantity <= 1}
                              className="w-6 h-6 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3 h-3 text-white" />
                            </button>
                            <span className="text-white font-medium text-sm w-8 text-center">
                              {consumption.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateConsumption(consumption.id, consumption.quantity + 1)}
                              className="w-6 h-6 bg-emerald-600 hover:bg-emerald-700 rounded flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3 h-3 text-white" />
                            </button>
                            <span className="text-gray-400 text-xs">
                              {consumption.product.unit}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">
                              ${consumption.unitPrice.toLocaleString()} c/u
                            </div>
                            <div className="text-sm font-semibold text-emerald-400">
                              ${consumption.totalPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {consumption.notes && (
                          <p className="text-xs text-gray-400 italic">
                            {consumption.notes}
                          </p>
                        )}
                      </div>
                    ))}

                    {consumptions.length > 0 && (
                      <div className="pt-2 border-t border-gray-600 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">Total Consumos:</span>
                        <span className="text-lg font-bold text-emerald-400">
                          ${consumptionsTotal.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
              )}

            </div>

            {/* Footer */}
            {showPendingWarning && !isFullscreen ? (
              /* Pending Balance Warning Footer - Only in non-fullscreen */
              <div className="border-t border-gray-700 p-4 bg-gray-900">
                <div className="text-center mb-4">
                  <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-white">Saldo pendiente</h3>
                  <p className="text-sm text-gray-400">
                    Estás por marcar como completado un turno que todavía tiene saldo pendiente por pagar. ¿Estás seguro de que deseas hacerlo?
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancelPendingWarning}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    No, volver
                  </button>
                  <button
                    onClick={handleConfirmPendingWarning}
                    className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Sí, continuar</span>
                  </button>
                </div>
              </div>
            ) : showPrintSection && !isFullscreen ? (
              /* Print Section Footer - Only in non-fullscreen */
              <div className="border-t border-gray-700 p-4 bg-gray-900">
                <div className="text-center mb-4">
                  <Printer className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-white">¿Imprimir ticket?</h3>
                  <p className="text-sm text-gray-400">¿Desea imprimir el ticket antes de completar la reserva?</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleCompleteWithPrint(false)}
                    disabled={isChangingStatus}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    No, solo completar
                  </button>
                  <button
                    onClick={() => handleCompleteWithPrint(true)}
                    disabled={isChangingStatus || isPrinting}
                    className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isChangingStatus || isPrinting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{isPrinting ? 'Imprimiendo...' : 'Completando...'}</span>
                      </>
                    ) : (
                      <>
                        <Printer className="w-5 h-5" />
                        <span>Sí, imprimir</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleCancelPrintSection}
                  disabled={isChangingStatus || isPrinting}
                  className="w-full mt-2 px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            ) : showPaymentForm && !isFullscreen ? (
              /* Payment Form Footer - Only in non-fullscreen */
              <div className="border-t border-gray-700 p-4 bg-gray-900">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancelPaymentForm}
                    disabled={isRegisteringPayment}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRegisterPayment}
                    disabled={isRegisteringPayment || !paymentAmount}
                    className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isRegisteringPayment ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Registrando...</span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5" />
                        <span>Registrar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : showProductSearch && !isFullscreen ? (
              /* Product Search Footer - Only in non-fullscreen */
              <div className="border-t border-gray-700 p-4 bg-gray-900">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-400">Total a agregar</p>
                    <p className="text-xl font-bold text-white">
                      ${Array.from(selectedProducts.entries()).reduce((total, [productId, quantity]) => {
                        const product = products.find(p => p.id === productId);
                        return total + (product ? product.salePrice * quantity : 0);
                      }, 0).toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Productos</p>
                    <p className="text-lg font-semibold text-emerald-400">
                      {selectedProducts.size}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancelProductSearch}
                    disabled={addingConsumptions}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmProducts}
                    disabled={addingConsumptions || selectedProducts.size === 0}
                    className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {addingConsumptions ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Agregando...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Confirmar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Details Footer - Actions */
              <div className={`border-t border-gray-700 p-4 ${isFullscreen ? '' : ''}`}>
                {isFullscreen ? (
                  /* Fullscreen: horizontal buttons */
                  <div className="flex items-center gap-3">
                    {/* Pending/Confirmed: Show "Iniciar Turno" button */}
                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                      <>
                        <button
                          onClick={() => handleAction('complete')}
                          disabled={isProcessing}
                          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2.5 px-4 rounded-lg transition-colors"
                        >
                          {isProcessing && actionType === 'complete' ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-5 w-5" />
                          )}
                          <span>Iniciar Turno</span>
                        </button>
                        {onNoShow && (
                          <button
                            onClick={() => handleAction('no_show')}
                            disabled={isProcessing}
                            className="flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/30 disabled:bg-gray-600 text-red-400 py-2.5 px-4 rounded-lg transition-colors border border-red-600/30"
                          >
                            {isProcessing && actionType === 'no_show' ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <XCircle className="h-5 w-5" />
                            )}
                            <span>No asistió</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* In Progress: Show "Completar" button */}
                    {reservation.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange('completed')}
                        disabled={isChangingStatus}
                        className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2.5 px-4 rounded-lg transition-colors"
                      >
                        {isChangingStatus ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-5 w-5" />
                        )}
                        <span>Completar</span>
                      </button>
                    )}

                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                      <button
                        onClick={() => onEdit(reservation)}
                        disabled={isProcessing}
                        className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white py-2.5 px-4 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                    )}

                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                      <button
                        onClick={() => {
                          if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
                            handleAction('cancel');
                          }
                        }}
                        disabled={isProcessing}
                        className="flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/30 disabled:bg-gray-800 text-red-400 py-2.5 px-4 rounded-lg transition-colors border border-red-600/30"
                      >
                        {isProcessing && actionType === 'cancel' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span>Cancelar</span>
                      </button>
                    )}

                    {reservation.clientPhone && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg transition-colors"
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>Enviar WhatsApp</span>
                      </a>
                    )}
                  </div>
                ) : (
                  /* Non-fullscreen: stacked buttons with 2-column rows */
                  <div className="space-y-3">
                    {/* Pending/Confirmed: Show "Iniciar Turno" button */}
                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleAction('complete')}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2.5 rounded-lg transition-colors"
                        >
                          {isProcessing && actionType === 'complete' ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-5 w-5" />
                          )}
                          <span>Iniciar Turno</span>
                        </button>
                        {onNoShow && (
                          <button
                            onClick={() => handleAction('no_show')}
                            disabled={isProcessing}
                            className="flex-1 flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/30 disabled:bg-gray-600 text-red-400 py-2.5 rounded-lg transition-colors border border-red-600/30"
                          >
                            {isProcessing && actionType === 'no_show' ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <XCircle className="h-5 w-5" />
                            )}
                            <span>No asistió</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* In Progress: Show "Completar" button */}
                    {reservation.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange('completed')}
                        disabled={isChangingStatus}
                        className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white py-2.5 rounded-lg transition-colors"
                      >
                        {isChangingStatus ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-5 w-5" />
                        )}
                        <span>Completar</span>
                      </button>
                    )}

                    {/* Edit and Cancel buttons - side by side (only for pending/confirmed) */}
                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => onEdit(reservation)}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white py-2.5 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
                              handleAction('cancel');
                            }
                          }}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/30 disabled:bg-gray-800 text-red-400 py-2.5 rounded-lg transition-colors border border-red-600/30"
                        >
                          {isProcessing && actionType === 'cancel' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span>Cancelar</span>
                        </button>
                      </div>
                    )}

                    {/* WhatsApp Button - full width */}
                    {reservation.clientPhone && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition-colors"
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>Enviar WhatsApp</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {reservation && (
              <ArcaInvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                establishmentId={establishmentId || ''}
                bookingId={reservation.id}
                items={invoiceItems}
                total={invoiceTotal}
                defaultCustomerName={reservation.clientName}
                onInvoiced={() => {
                  // reuse existing data loaders
                  loadPayments(reservation.id);
                  loadConsumptions(reservation.id);
                }}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Cancel Recurring Modal
  const cancelRecurringModal = showCancelRecurringModal && (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Cancelar Turno Fijo</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">¿Qué deseas cancelar?</label>
            <div className="space-y-2">
              <button
                onClick={() => setCancelRecurringType('single')}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  cancelRecurringType === 'single'
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">Solo este turno</div>
                <div className="text-xs text-gray-400 mt-1">
                  {reservation && new Date(reservation.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </button>
              
              <button
                onClick={() => setCancelRecurringType('all_pending')}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  cancelRecurringType === 'all_pending'
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">Todos los turnos pendientes</div>
                <div className="text-xs text-gray-400 mt-1">
                  {pendingBookingsForCancel.length} turnos serán cancelados
                </div>
              </button>
            </div>
          </div>
          
          {cancelRecurringType === 'all_pending' && pendingBookingsForCancel.length > 0 && (
            <div className="bg-gray-700/50 rounded-lg p-3 max-h-32 overflow-y-auto">
              <p className="text-xs text-gray-400 mb-2">Turnos a cancelar:</p>
              <div className="space-y-1">
                {pendingBookingsForCancel.map((booking: any) => (
                  <div key={booking.id} className="flex justify-between text-xs">
                    <span className="text-gray-300">
                      {new Date(booking.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span className={booking.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-yellow-400'}>
                      {booking.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <label className="text-sm text-gray-400 block mb-2">Motivo (opcional)</label>
            <textarea
              value={cancelRecurringReason}
              onChange={(e) => setCancelRecurringReason(e.target.value)}
              placeholder="Ej: Cambio de horario del cliente..."
              rows={2}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setShowCancelRecurringModal(false);
              setCancelRecurringReason('');
            }}
            disabled={isCancellingRecurring}
            className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Volver
          </button>
          <button
            onClick={handleCancelRecurring}
            disabled={isCancellingRecurring}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isCancellingRecurring ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cancelando...</span>
              </>
            ) : (
              <span>Confirmar cancelación</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      {createPortal(sidebarContent, document.body)}
      {showCancelRecurringModal && createPortal(cancelRecurringModal, document.body)}
    </>
  );
};

export default ReservationDetailsSidebar;
