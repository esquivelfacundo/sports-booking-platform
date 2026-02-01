'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Plus,
  Minus,
  ShoppingCart,
  User,
  Phone,
  Mail,
  DollarSign,
  Banknote,
  CreditCard,
  Building2,
  Loader2,
  Trash2,
  Package,
  Calendar,
  Clock,
  MapPin,
  Printer,
  AlertTriangle,
  UserPlus,
  Check,
  PlayCircle
} from 'lucide-react';
import { printTicket, isWebUSBSupported, TicketData } from '@/lib/ticketPrinter';
import { apiClient } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface Product {
  id: string;
  name: string;
  salePrice: number;
  costPrice: number;
  currentStock: number;
  trackStock: boolean;
  unit: string;
  image?: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

interface CurrentAccount {
  id: string;
  holderName: string;
  holderPhone?: string;
  holderEmail?: string;
  accountType: 'employee' | 'client' | 'supplier' | 'other';
  useCostPrice: boolean;
  discountPercentage: number;
  currentBalance: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface ActiveBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  court: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    name: string;
    phone?: string;
  };
  clientName?: string;
  clientPhone?: string;
}

interface DirectSaleSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  establishmentId: string;
  establishmentName?: string;
  establishmentSlug?: string;
  onOrderCreated: () => void;
}

const DirectSaleSidebar: React.FC<DirectSaleSidebarProps> = ({
  isOpen,
  onClose,
  establishmentId,
  establishmentName,
  establishmentSlug,
  onOrderCreated
}) => {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  
  // Tabs: turnos, new-client, search-client, or current-account
  const [activeTab, setActiveTab] = useState<'turnos' | 'search-client' | 'new-client' | 'current-account'>('turnos');
  
  // Active bookings (in_progress)
  const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<ActiveBooking | null>(null);
  const [loadingBookings, setLoadingBookings] = useState(false);
  
  // Current accounts
  const [currentAccounts, setCurrentAccounts] = useState<CurrentAccount[]>([]);
  const [selectedCurrentAccount, setSelectedCurrentAccount] = useState<CurrentAccount | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  
  // Customer info (for new client)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  
  // Client search
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  
  // Payment
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; name: string; code: string; icon: string | null }[]>([]);
  
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showPendingWarning, setShowPendingWarning] = useState(false);
  
  // Toast notifications
  const { showSuccess, showError, showWarning } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && establishmentId) {
      loadProducts();
      loadClients();
      loadPaymentMethods();
      loadCurrentAccounts();
      loadActiveBookings();
    }
  }, [isOpen, establishmentId]);

  const loadActiveBookings = async () => {
    setLoadingBookings(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.getEstablishmentBookings(establishmentId, {
        status: 'in_progress',
        date: today,
        limit: 50
      }) as { bookings: ActiveBooking[] };
      setActiveBookings(response.bookings || []);
    } catch (error) {
      console.error('Error loading active bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadCurrentAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/current-accounts/establishment/${establishmentId}?isActive=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setCurrentAccounts(data.data || []);
      }
    } catch (error) {
      console.error('Error loading current accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await apiClient.getPaymentMethods(establishmentId) as { paymentMethods: { id: string; name: string; code: string; icon: string | null }[] };
      setPaymentMethods(response.paymentMethods || []);
      if (response.paymentMethods?.length > 0) {
        setPaymentMethod(response.paymentMethods[0].code);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setPaymentMethods([
        { id: '1', name: 'Efectivo', code: 'cash', icon: 'Banknote' },
        { id: '2', name: 'Transferencia', code: 'transfer', icon: 'Building2' },
        { id: '3', name: 'Tarjeta', code: 'card', icon: 'CreditCard' }
      ]);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closing
      setCart(new Map());
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setPaymentMethod('cash');
      setPaidAmount('');
      setDiscount('');
      setSearchTerm('');
      setActiveTab('turnos');
      setSelectedClient(null);
      setClientSearchTerm('');
      setSelectedCurrentAccount(null);
      setAccountSearchTerm('');
      setSelectedBooking(null);
      setShowPrintDialog(false);
      setShowPendingWarning(false);
    }
  }, [isOpen]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await apiClient.getProducts({ 
        establishmentId,
        isActive: true 
      }) as { products: Product[] };
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadClients = async () => {
    setLoadingClients(true);
    try {
      const response = await apiClient.getClients(establishmentId, { limit: 100 }) as { clients?: Client[]; data?: Client[] };
      setClients(response.clients || response.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  // Search clients when typing
  useEffect(() => {
    if (!clientSearchTerm.trim() || !establishmentId) {
      // If no search term, load all clients
      if (isOpen && establishmentId) {
        loadClients();
      }
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingClients(true);
      try {
        const response = await apiClient.searchClients(establishmentId, clientSearchTerm) as { clients?: Client[]; data?: Client[] };
        setClients(response.clients || response.data || []);
      } catch (error) {
        console.error('Error searching clients:', error);
      } finally {
        setLoadingClients(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [clientSearchTerm, establishmentId, isOpen]);

  const addToCart = (product: Product) => {
    const newCart = new Map(cart);
    const existing = newCart.get(product.id);
    
    if (existing) {
      // Allow negative stock - no validation needed
      newCart.set(product.id, { ...existing, quantity: existing.quantity + 1 });
    } else {
      newCart.set(product.id, { product, quantity: 1 });
    }
    
    setCart(newCart);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = new Map(cart);
    const item = newCart.get(productId);
    
    if (item) {
      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        newCart.delete(productId);
      } else {
        // Allow negative stock - no validation needed
        newCart.set(productId, { ...item, quantity: newQuantity });
      }
    }
    
    setCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = new Map(cart);
    newCart.delete(productId);
    setCart(newCart);
  };

  // Calculate price based on current account benefits
  const getItemPrice = (product: Product) => {
    if (selectedCurrentAccount?.useCostPrice) {
      return product.costPrice || product.salePrice;
    }
    return product.salePrice;
  };

  const subtotal = Array.from(cart.values()).reduce(
    (sum, item) => sum + getItemPrice(item.product) * item.quantity,
    0
  );

  // Calculate original subtotal (without benefits) for comparison
  const originalSubtotal = Array.from(cart.values()).reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0
  );

  // Apply discount percentage from current account
  const accountDiscountAmount = selectedCurrentAccount?.discountPercentage 
    ? (subtotal * selectedCurrentAccount.discountPercentage / 100) 
    : 0;
  const manualDiscountAmount = parseFloat(discount) || 0;
  const totalDiscountAmount = accountDiscountAmount + manualDiscountAmount;
  const total = subtotal - totalDiscountAmount;
  const paid = parseFloat(paidAmount) || 0;
  const change = paid - total;

  const handleSubmitClick = () => {
    if (cart.size === 0) return;
    
    // Check if there's pending balance
    if (paid < total && paid > 0) {
      setShowPendingWarning(true);
      return;
    }
    
    // If no payment or full payment, show print dialog
    setShowPrintDialog(true);
  };

  const handleConfirmPendingWarning = () => {
    setShowPendingWarning(false);
    setShowPrintDialog(true);
  };

  const handleCancelPendingWarning = () => {
    setShowPendingWarning(false);
  };

  const handleCompleteWithPrint = async (shouldPrint: boolean) => {
    if (shouldPrint) {
      await handlePrintTicket();
    }
    await handleSubmit();
  };

  const handlePrintTicket = async () => {
    if (!isWebUSBSupported()) {
      alert('WebUSB no está soportado en este navegador. Use Chrome o Edge.');
      return;
    }

    setIsPrinting(true);
    try {
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      };

      const today = new Date().toISOString().split('T')[0];
      const clientName = selectedClient?.name || customerName || 'Cliente';
      const establishmentUrl = establishmentSlug 
        ? `https://miscanchas.com/reservar/${establishmentSlug}` 
        : 'https://miscanchas.com';

      // Get payment method name
      const getPaymentMethodName = (code: string) => {
        const method = paymentMethods.find(m => m.code === code);
        if (method) return method.name;
        const fallbacks: Record<string, string> = {
          cash: 'Efectivo',
          transfer: 'Transferencia',
          card: 'Tarjeta',
          credit_card: 'Credito',
          debit_card: 'Debito'
        };
        return fallbacks[code] || code;
      };

      const ticketData: TicketData = {
        establishmentName: establishmentName || 'Sports Booking',
        date: formatDate(today),
        clientName: clientName,
        totalAmount: total,
        paidAmount: paid,
        pendingAmount: Math.max(0, total - paid),
        items: Array.from(cart.values()).map(({ product, quantity }) => ({
          name: product.name,
          quantity,
          unitPrice: product.salePrice,
          totalPrice: product.salePrice * quantity
        })),
        payments: paid > 0 ? [{
          method: getPaymentMethodName(paymentMethod),
          amount: paid
        }] : [],
        establishmentUrl,
        isDirectSale: true
      };

      await printTicket(ticketData);
    } catch (error) {
      console.error('Error printing ticket:', error);
      alert('❌ Error al imprimir: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setIsPrinting(false);
    }
  };

  const handleSubmit = async () => {
    if (cart.size === 0) return;
    
    setIsSubmitting(true);
    try {
      // If a booking is selected, add consumptions and payment to that booking
      if (selectedBooking) {
        // Add each product as a booking consumption
        for (const { product, quantity } of cart.values()) {
          await apiClient.addBookingConsumption({
            bookingId: selectedBooking.id,
            productId: product.id,
            quantity
          });
        }

        // Register payment if there's an amount
        if (paid > 0) {
          await apiClient.registerBookingPayment(selectedBooking.id, {
            amount: paid,
            method: paymentMethod as 'cash' | 'transfer' | 'card' | 'other',
            notes: `Consumos: ${Array.from(cart.values()).map(c => `${c.quantity}x ${c.product.name}`).join(', ')}`
          });
        }

        const courtName = selectedBooking.court?.name || 'Cancha';
        const playerName = selectedBooking.client?.name || selectedBooking.playerName || 'Jugador';
        showSuccess('Consumos agregados', `${courtName} - ${playerName}`);
        
        // Reload active bookings to update the list
        loadActiveBookings();
        onOrderCreated();
        setShowPrintDialog(false);
        return;
      }

      // Regular direct sale flow (no booking selected)
      const items = Array.from(cart.values()).map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: getItemPrice(item.product)
      }));

      const isCurrentAccountSale = !!selectedCurrentAccount;
      const effectiveCustomerName = isCurrentAccountSale 
        ? selectedCurrentAccount.holderName 
        : (selectedClient?.name || customerName || undefined);
      const effectiveCustomerPhone = isCurrentAccountSale
        ? selectedCurrentAccount.holderPhone
        : (selectedClient?.phone || customerPhone || undefined);

      await apiClient.createOrder({
        establishmentId,
        clientId: selectedClient?.id || undefined,
        customerName: effectiveCustomerName,
        customerPhone: effectiveCustomerPhone,
        customerEmail: selectedClient?.email || customerEmail || undefined,
        currentAccountId: selectedCurrentAccount?.id || undefined,
        items,
        paymentMethod: paid > 0 ? paymentMethod : undefined,
        paidAmount: paid > 0 ? paid : 0,
        discount: totalDiscountAmount,
        notes: isCurrentAccountSale ? `Cuenta Corriente: ${selectedCurrentAccount.holderName}` : undefined
      });

      const displayName = effectiveCustomerName || 'Cliente';
      const methodName = paymentMethods.find(m => m.code === paymentMethod)?.name || paymentMethod;
      showSuccess('Venta registrada', `$${total.toLocaleString('es-AR')} - ${displayName} (${methodName})`);
      
      onOrderCreated();
      setShowPrintDialog(false);
    } catch (error: any) {
      console.error('Error creating order:', error);
      showError('Error al crear pedido', error.message || 'No se pudo procesar la venta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          {/* Sidebar - Fullscreen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-800 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Nueva Venta</h2>
                  <p className="text-xs text-gray-400">
                    {cart.size} producto{cart.size !== 1 ? 's' : ''} en el carrito
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Left: Products - 50% */}
              <div className="w-1/2 flex flex-col border-r border-gray-700">
                {/* Search */}
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar productos..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Products List */}
                <div className="flex-1 overflow-y-auto p-4 pt-0">
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredProducts.map((product) => {
                        const cartItem = cart.get(product.id);
                        const inCart = cartItem?.quantity || 0;
                        const outOfStock = false; // Allow negative stock
                        
                        return (
                          <div
                            key={product.id}
                            className={`bg-gray-700/50 rounded-lg p-3 border transition-colors ${
                              inCart > 0 ? 'border-emerald-500' : 'border-transparent'
                            } ${outOfStock ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-white font-medium truncate">{product.name}</h4>
                                  {product.category && (
                                    <span
                                      className="px-2 py-0.5 rounded-full text-xs"
                                      style={{
                                        backgroundColor: `${product.category.color}20`,
                                        color: product.category.color
                                      }}
                                    >
                                      {product.category.name}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-emerald-400 font-semibold">
                                    ${product.salePrice.toLocaleString()}
                                  </span>
                                  {product.trackStock && (
                                    <span className="text-xs text-gray-400">
                                      Stock: {product.currentStock}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                {inCart > 0 ? (
                                  <>
                                    <button
                                      onClick={() => updateQuantity(product.id, -1)}
                                      className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded flex items-center justify-center"
                                    >
                                      <Minus className="w-4 h-4 text-white" />
                                    </button>
                                    <span className="text-white font-medium w-8 text-center">{inCart}</span>
                                    <button
                                      onClick={() => updateQuantity(product.id, 1)}
                                      className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 rounded flex items-center justify-center"
                                    >
                                      <Plus className="w-4 h-4 text-white" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => addToCart(product)}
                                    disabled={outOfStock}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                                  >
                                    {outOfStock ? 'Sin stock' : 'Agregar'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Cart & Checkout - 50% */}
              <div className="w-1/2 flex flex-col bg-gray-900/50">
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Carrito
                  </h3>
                  
                  {cart.size === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Carrito vacío</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Array.from(cart.values()).map(({ product, quantity }) => {
                        const itemPrice = getItemPrice(product);
                        const showCostPrice = selectedCurrentAccount?.useCostPrice && product.costPrice && product.costPrice !== product.salePrice;
                        
                        return (
                          <div key={product.id} className="bg-gray-800 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white text-sm font-medium truncate">{product.name}</h4>
                                <p className="text-xs text-gray-400">
                                  {showCostPrice ? (
                                    <>
                                      <span className="line-through text-gray-500">${product.salePrice.toLocaleString()}</span>
                                      {' '}
                                      <span className="text-emerald-400">${itemPrice.toLocaleString()}</span>
                                    </>
                                  ) : (
                                    <>${itemPrice.toLocaleString()}</>
                                  )}
                                  {' x '}{quantity}
                                </p>
                              </div>
                              <button
                                onClick={() => removeFromCart(product.id)}
                                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(product.id, -1)}
                                  className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center"
                                >
                                  <Minus className="w-3 h-3 text-white" />
                                </button>
                                <span className="text-white text-sm w-6 text-center">{quantity}</span>
                                <button
                                  onClick={() => updateQuantity(product.id, 1)}
                                  disabled={product.trackStock && quantity >= product.currentStock}
                                  className="w-6 h-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded flex items-center justify-center"
                                >
                                  <Plus className="w-3 h-3 text-white" />
                                </button>
                              </div>
                              <div className="text-right">
                                {showCostPrice && (
                                  <span className="text-xs text-gray-500 line-through mr-2">
                                    ${(product.salePrice * quantity).toLocaleString()}
                                  </span>
                                )}
                                <span className="text-emerald-400 font-semibold text-sm">
                                  ${(itemPrice * quantity).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Client Selection */}
                  {cart.size > 0 && (
                    <div className="mt-6">
                      {/* Tabs */}
                      <div className="flex border-b border-gray-700 mb-4">
                        <button
                          onClick={() => {
                            setActiveTab('turnos');
                            setSelectedClient(null);
                            setSelectedCurrentAccount(null);
                            setCustomerName('');
                            setCustomerPhone('');
                            setCustomerEmail('');
                          }}
                          className={`flex-1 py-2 text-xs font-medium transition-colors ${
                            activeTab === 'turnos'
                              ? 'text-emerald-400 border-b-2 border-emerald-500'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          <PlayCircle className="w-3 h-3 inline mr-1" />
                          Turnos
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('new-client');
                            setSelectedClient(null);
                            setSelectedCurrentAccount(null);
                            setSelectedBooking(null);
                          }}
                          className={`flex-1 py-2 text-xs font-medium transition-colors ${
                            activeTab === 'new-client'
                              ? 'text-emerald-400 border-b-2 border-emerald-500'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          <UserPlus className="w-3 h-3 inline mr-1" />
                          Nuevo
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('search-client');
                            setCustomerName('');
                            setCustomerPhone('');
                            setCustomerEmail('');
                            setSelectedCurrentAccount(null);
                            setSelectedBooking(null);
                          }}
                          className={`flex-1 py-2 text-xs font-medium transition-colors ${
                            activeTab === 'search-client'
                              ? 'text-emerald-400 border-b-2 border-emerald-500'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          Buscar
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('current-account');
                            setSelectedClient(null);
                            setCustomerName('');
                            setCustomerPhone('');
                            setCustomerEmail('');
                            setSelectedBooking(null);
                          }}
                          className={`flex-1 py-2 text-xs font-medium transition-colors ${
                            activeTab === 'current-account'
                              ? 'text-emerald-400 border-b-2 border-emerald-500'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          <CreditCard className="w-3 h-3 inline mr-1" />
                          Cta. Cte.
                        </button>
                      </div>

                      {/* Tab Content */}
                      {activeTab === 'turnos' ? (
                        /* Active Bookings (Turnos) */
                        <div className="space-y-3">
                          {loadingBookings ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                            </div>
                          ) : activeBookings.length === 0 ? (
                            <div className="text-center py-6">
                              <PlayCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No hay turnos en curso</p>
                              <p className="text-gray-600 text-xs mt-1">Los turnos iniciados aparecerán aquí</p>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {activeBookings.map((booking) => {
                                const playerName = booking.client?.name || booking.clientName || 'Sin nombre';
                                return (
                                  <button
                                    key={booking.id}
                                    onClick={() => setSelectedBooking(booking)}
                                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                                      selectedBooking?.id === booking.id
                                        ? 'bg-emerald-600/20 border border-emerald-500'
                                        : 'bg-gray-800 hover:bg-gray-750 border border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-white text-sm font-medium">{booking.court?.name}</span>
                                          <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                                            En curso
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">{playerName}</p>
                                        <p className="text-xs text-gray-500">
                                          {booking.startTime} - {booking.endTime}
                                        </p>
                                      </div>
                                      {selectedBooking?.id === booking.id && (
                                        <Check className="w-4 h-4 text-emerald-400" />
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : activeTab === 'new-client' ? (
                        /* New Client Form */
                        <div className="space-y-3">
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Nombre"
                              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="Teléfono"
                              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      ) : activeTab === 'search-client' ? (
                        <div className="space-y-3">
                          {/* Search clients */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={clientSearchTerm}
                              onChange={(e) => setClientSearchTerm(e.target.value)}
                              placeholder="Buscar cliente por nombre o teléfono..."
                              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          {/* Clients list */}
                          {loadingClients ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {clients.map((client) => (
                                  <button
                                    key={client.id}
                                    onClick={() => setSelectedClient(client)}
                                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                                      selectedClient?.id === client.id
                                        ? 'bg-emerald-600/20 border border-emerald-500'
                                        : 'bg-gray-800 hover:bg-gray-750 border border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <p className="text-white text-sm font-medium">{client.name}</p>
                                        {client.phone && (
                                          <p className="text-xs text-gray-400">{client.phone}</p>
                                        )}
                                      </div>
                                      {selectedClient?.id === client.id && (
                                        <Check className="w-4 h-4 text-emerald-400" />
                                      )}
                                    </div>
                                  </button>
                                ))}
                              {clients.length === 0 && (
                                <p className="text-center text-gray-500 text-sm py-4">
                                  {clientSearchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Current Account Tab */
                        <div className="space-y-3">
                          {/* Search current accounts */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={accountSearchTerm}
                              onChange={(e) => setAccountSearchTerm(e.target.value)}
                              placeholder="Buscar cuenta corriente..."
                              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          {/* Selected account benefits indicator */}
                          {selectedCurrentAccount && (
                            <div className="p-2 bg-emerald-600/10 border border-emerald-500/30 rounded-lg">
                              <p className="text-xs text-emerald-400 font-medium mb-1">Beneficios aplicados:</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedCurrentAccount.useCostPrice && (
                                  <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                                    Precio costo
                                  </span>
                                )}
                                {selectedCurrentAccount.discountPercentage > 0 && (
                                  <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                                    {selectedCurrentAccount.discountPercentage}% desc.
                                  </span>
                                )}
                              </div>
                              {originalSubtotal !== subtotal && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Ahorro: <span className="text-emerald-400">${(originalSubtotal - subtotal).toLocaleString()}</span>
                                </p>
                              )}
                            </div>
                          )}

                          {/* Current accounts list */}
                          {loadingAccounts ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {currentAccounts
                                .filter(acc => 
                                  !accountSearchTerm || 
                                  acc.holderName.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
                                  acc.holderPhone?.toLowerCase().includes(accountSearchTerm.toLowerCase())
                                )
                                .map((account) => (
                                  <button
                                    key={account.id}
                                    onClick={() => setSelectedCurrentAccount(account)}
                                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                                      selectedCurrentAccount?.id === account.id
                                        ? 'bg-emerald-600/20 border border-emerald-500'
                                        : 'bg-gray-800 hover:bg-gray-750 border border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <p className="text-white text-sm font-medium">{account.holderName}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className={`px-1.5 py-0.5 text-xs rounded ${
                                            account.accountType === 'employee' 
                                              ? 'bg-purple-500/20 text-purple-400' 
                                              : 'bg-cyan-500/20 text-cyan-400'
                                          }`}>
                                            {account.accountType === 'employee' ? 'Empleado' : 'Cliente'}
                                          </span>
                                          {account.useCostPrice && (
                                            <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                                              P. Costo
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {selectedCurrentAccount?.id === account.id && (
                                        <Check className="w-4 h-4 text-emerald-400" />
                                      )}
                                    </div>
                                  </button>
                                ))}
                              {currentAccounts.length === 0 && (
                                <p className="text-center text-gray-500 text-sm py-4">
                                  No hay cuentas corrientes
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment */}
                  {cart.size > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                        Pago
                      </h3>
                      
                      {/* Payment Method */}
                      <div className={`grid gap-2 mb-4 ${paymentMethods.length <= 3 ? 'grid-cols-3' : paymentMethods.length <= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setPaymentMethod(method.code)}
                            className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${
                              paymentMethod === method.code
                                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                            }`}
                          >
                            {method.code === 'cash' && <Banknote className="w-5 h-5 mb-1" />}
                            {method.code === 'transfer' && <Building2 className="w-5 h-5 mb-1" />}
                            {(method.code === 'credit_card' || method.code === 'debit_card' || method.code === 'card') && <CreditCard className="w-5 h-5 mb-1" />}
                            {!['cash', 'transfer', 'credit_card', 'debit_card', 'card'].includes(method.code) && <DollarSign className="w-5 h-5 mb-1" />}
                            <span className="text-xs truncate max-w-full">{method.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* Discount */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-400 mb-1">Descuento</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            placeholder="0"
                            className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Amount Paid */}
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Monto recibido</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            placeholder={total.toString()}
                            className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setPaidAmount(total.toString())}
                            className="flex-1 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                          >
                            Exacto
                          </button>
                          <button
                            onClick={() => setPaidAmount('')}
                            className="flex-1 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                          >
                            Fiado
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer - Totals & Submit or Dialogs */}
                {cart.size > 0 && (
                  showPendingWarning ? (
                    /* Pending Balance Warning */
                    <div className="border-t border-gray-700 p-4 bg-gray-900">
                      <div className="text-center mb-4">
                        <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-white">Saldo pendiente</h3>
                        <p className="text-sm text-gray-400">
                          Estás por completar una venta con saldo pendiente. ¿Estás seguro?
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
                          className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                        >
                          Sí, continuar
                        </button>
                      </div>
                    </div>
                  ) : showPrintDialog ? (
                    /* Print Dialog */
                    <div className="border-t border-gray-700 p-4 bg-gray-900">
                      <div className="text-center mb-4">
                        <Printer className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-white">¿Imprimir ticket?</h3>
                        <p className="text-sm text-gray-400">¿Desea imprimir el ticket de la venta?</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleCompleteWithPrint(false)}
                          disabled={isSubmitting}
                          className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          No, solo completar
                        </button>
                        <button
                          onClick={() => handleCompleteWithPrint(true)}
                          disabled={isSubmitting || isPrinting}
                          className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          {isSubmitting || isPrinting ? (
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
                        onClick={() => setShowPrintDialog(false)}
                        disabled={isSubmitting || isPrinting}
                        className="w-full mt-2 px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    /* Normal Footer with Totals */
                    <div className="border-t border-gray-700 p-4 bg-gray-900">
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Subtotal</span>
                          <span className="text-white">${subtotal.toLocaleString()}</span>
                        </div>
                        {totalDiscountAmount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Descuento</span>
                            <span className="text-red-400">-${totalDiscountAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-700">
                          <span className="text-white">Total</span>
                          <span className="text-emerald-400">${total.toLocaleString()}</span>
                        </div>
                        {paid > 0 && change > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Vuelto</span>
                            <span className="text-yellow-400">${change.toLocaleString()}</span>
                          </div>
                        )}
                        {paid > 0 && paid < total && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Pendiente</span>
                            <span className="text-orange-400">${(total - paid).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleSubmitClick}
                        disabled={isSubmitting || cart.size === 0}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Procesando...</span>
                          </>
                        ) : selectedBooking ? (
                          <>
                            <PlayCircle className="w-5 h-5" />
                            <span>
                              {paid > 0 
                                ? `Agregar Consumos + Pago` 
                                : 'Agregar Consumos al Turno'
                              }
                            </span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-5 h-5" />
                            <span>
                              {paid >= total 
                                ? 'Completar Venta' 
                                : paid > 0 
                                  ? 'Registrar Pago Parcial' 
                                  : 'Registrar como Fiado'
                              }
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(sidebarContent, document.body);
};

export default DirectSaleSidebar;
