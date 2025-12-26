'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  MapPin, 
  Shield, 
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Menu,
  X,
  Home,
  Search,
  Heart,
  User
} from 'lucide-react';

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  
  // Get booking details from URL params
  const establishmentId = searchParams.get('establishmentId') || '';
  const establishmentName = searchParams.get('establishmentName') || '';
  const courtId = searchParams.get('courtId') || '';
  const courtName = searchParams.get('courtName') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const endTime = searchParams.get('endTime') || '';
  const duration = parseInt(searchParams.get('duration') || '60');
  const price = parseInt(searchParams.get('price') || '0');
  const sport = searchParams.get('sport') || '';
  
  // Payment state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingFee, setIsLoadingFee] = useState(true);
  
  // Fee and deposit state from backend - initialize with defaults based on price
  const [serviceFeePercent, setServiceFeePercent] = useState(10);
  const defaultDepositPercent = 50;
  const defaultDepositBase = Math.round(price * defaultDepositPercent / 100);
  const defaultDepositFee = Math.round(defaultDepositBase * 0.10);
  const [depositInfo, setDepositInfo] = useState({
    required: true,
    type: 'percentage' as 'percentage' | 'fixed',
    percent: defaultDepositPercent,
    baseAmount: defaultDepositBase,
    fee: defaultDepositFee,
    generalFee: defaultDepositFee, // For showing crossed-out fee when discounted
    totalAmount: defaultDepositBase + defaultDepositFee,
    remainingAmount: price - defaultDepositBase
  });
  
  // Fee discount info
  const [feeDiscount, setFeeDiscount] = useState({
    hasDiscount: false,
    generalFeePercent: 10,
    generalFee: defaultDepositFee,
    discountPercent: 0,
    actualFee: defaultDepositFee
  });
  
  // Full payment option state
  const [fullPaymentInfo, setFullPaymentInfo] = useState({
    enabled: false,
    baseAmount: price,
    fee: Math.round(price * 0.10),
    generalFee: Math.round(price * 0.10), // For showing crossed-out fee when discounted
    totalAmount: price + Math.round(price * 0.10),
    remainingAmount: 0
  });
  
  // Pending debt state
  const [pendingDebt, setPendingDebt] = useState({
    hasDebt: false,
    totalDebt: 0,
    debts: [] as Array<{ id: string; amount: number; reason: string; description: string }>
  });
  
  // Selected payment type: 'deposit' or 'full'
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit');
  
  // Sidebar state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };
  
  // Fetch platform fee and deposit config on mount
  useEffect(() => {
    const fetchFeeAndDeposit = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const clientEmail = user?.email || '';
        const response = await fetch(`${API_URL}/api/mp/payments/calculate-fee?amount=${price}&establishmentId=${establishmentId}&clientEmail=${encodeURIComponent(clientEmail)}`);
        if (response.ok) {
          const data = await response.json();
          setServiceFeePercent(data.feePercent || 10);
          if (data.deposit) {
            setDepositInfo(data.deposit);
          }
          if (data.fullPayment) {
            setFullPaymentInfo(data.fullPayment);
          }
          if (data.pendingDebt) {
            setPendingDebt(data.pendingDebt);
          }
          if (data.feeDiscount) {
            setFeeDiscount(data.feeDiscount);
          }
        }
      } catch (err) {
        console.error('Error fetching fee and deposit:', err);
      } finally {
        setIsLoadingFee(false);
      }
    };
    
    if (price > 0) {
      fetchFeeAndDeposit();
    } else {
      setIsLoadingFee(false);
    }
  }, [price, establishmentId, user?.email]);
  
  // Handle payment - redirect to Mercado Pago
  const handlePayment = async () => {
    setError('');
    
    // Get payment info based on selected type
    const isFullPayment = paymentType === 'full';
    const selectedPaymentInfo = isFullPayment ? fullPaymentInfo : depositInfo;
    
    // Add pending debt to payment amount
    const basePaymentAmount = selectedPaymentInfo.totalAmount;
    const debtAmount = pendingDebt.hasDebt ? pendingDebt.totalDebt : 0;
    const paymentAmount = basePaymentAmount + debtAmount;
    
    if (paymentAmount <= 0) {
      setError('Error: No se pudo calcular el monto a pagar');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const token = localStorage.getItem('auth_token');
      
      // Payment title and description based on type
      let paymentTitle = isFullPayment 
        ? `Pago completo - ${courtName} (${establishmentName})`
        : `Seña - ${courtName} (${establishmentName})`;
      let paymentDescription = isFullPayment
        ? `Pago completo - ${formatDate(date)} de ${time} a ${endTime}`
        : `Seña ${depositInfo.percent}% - ${formatDate(date)} de ${time} a ${endTime}`;
      
      // Add debt info to description if applicable
      if (debtAmount > 0) {
        paymentTitle += ' + Deuda';
        paymentDescription += ` + Deuda acumulada: $${debtAmount.toLocaleString('es-AR')}`;
      }
      
      // Create payment preference with split payment
      const response = await fetch(`${API_URL}/api/mp/payments/create-split-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          establishmentId,
          items: [{
            title: paymentTitle,
            description: paymentDescription,
            quantity: 1,
            unit_price: paymentAmount,
            currency_id: 'ARS'
          }],
          payer: {
            email: user?.email || '',
            name: user?.firstName || '',
            surname: user?.lastName || ''
          },
          metadata: {
            courtId,
            establishmentId,
            date,
            startTime: time,
            endTime,
            duration,
            fullPrice: price,
            // Payment type info
            paymentType: isFullPayment ? 'full' : 'deposit',
            // Base amounts (without service fee) - these go to establishment
            depositBaseAmount: isFullPayment ? price : depositInfo.baseAmount,
            depositFee: selectedPaymentInfo.fee,
            depositTotal: basePaymentAmount, // Without debt
            depositPercent: isFullPayment ? 100 : depositInfo.percent,
            remainingAmount: selectedPaymentInfo.remainingAmount,
            // Debt info
            debtAmount: debtAmount,
            debtIds: pendingDebt.debts.map(d => d.id),
            // Client data
            clientName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.firstName || user?.email || ''),
            clientEmail: user?.email || '',
            clientPhone: user?.phone || '',
            userId: user?.id || ''
          },
          back_urls: {
            success: `${window.location.origin}/reservar/confirmacion`,
            failure: `${window.location.origin}/reservar/pago?${searchParams.toString()}&error=payment_failed`,
            pending: `${window.location.origin}/reservar/confirmacion?status=pending`
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear preferencia de pago');
      }
      
      const data = await response.json();
      
      // Redirect to Mercado Pago checkout (support both camelCase and snake_case)
      const checkoutUrl = data.preference?.initPoint || data.preference?.init_point || data.init_point || data.initPoint;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        console.error('Response data:', data);
        throw new Error('No se recibió URL de pago');
      }
      
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Error al procesar el pago. Intenta nuevamente.');
      setIsProcessing(false);
    }
  };
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  
  if (!establishmentId || !courtId || !date || !time) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Datos incompletos</h2>
          <p className="text-gray-400 mb-4">No se encontraron los datos de la reserva</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/assets/logos/logo-light.svg" alt="Mis Canchas" className="h-10 w-auto dark:hidden" />
              <img src="/assets/logos/logo-dark.svg" alt="Mis Canchas" className="h-10 w-auto hidden dark:block" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            <div className="px-2 space-y-1">
              <Link href="/" onClick={() => setSidebarOpen(false)} className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Home className="mr-3 h-5 w-5 flex-shrink-0" />
                Inicio
              </Link>
              <Link href="/buscar" onClick={() => setSidebarOpen(false)} className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Search className="mr-3 h-5 w-5 flex-shrink-0" />
                Buscar
              </Link>
            </div>
            <div className="mx-4 my-3 border-t border-gray-200 dark:border-gray-700" />
            <div className="px-2 space-y-1">
              <Link href="/dashboard?section=reservations" onClick={() => setSidebarOpen(false)} className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Calendar className="mr-3 h-5 w-5 flex-shrink-0" />
                Mis Reservas
              </Link>
              <Link href="/dashboard?section=favorites" onClick={() => setSidebarOpen(false)} className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Heart className="mr-3 h-5 w-5 flex-shrink-0" />
                Favoritos
              </Link>
              <Link href="/dashboard/perfil" onClick={() => setSidebarOpen(false)} className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <User className="mr-3 h-5 w-5 flex-shrink-0" />
                Mi Perfil
              </Link>
            </div>
          </nav>
          {isAuthenticated && user && (
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-white">{user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.firstName || user.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile topbar */}
      <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mr-2">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-gray-900 dark:text-white text-sm truncate">Confirmar y pagar</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{establishmentName}</p>
          </div>
          <button onClick={() => router.back()} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Desktop Header */}
        <div className="hidden lg:block mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Confirmar y pagar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Completa el pago de la seña para confirmar tu reserva</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Section - order-last on mobile so it appears after booking summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 order-last lg:order-first"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Método de pago</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pago seguro con Mercado Pago</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Payment type selector - only show if full payment is enabled */}
              {fullPaymentInfo.enabled && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Elegí cómo pagar</p>
                  
                  {/* Deposit option */}
                  <button
                    type="button"
                    onClick={() => setPaymentType('deposit')}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      paymentType === 'deposit'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${paymentType === 'deposit' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                          Pagar seña ({depositInfo.percent}%)
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Pagás ${depositInfo.totalAmount.toLocaleString('es-AR')} ahora, ${depositInfo.remainingAmount.toLocaleString('es-AR')} en el lugar
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentType === 'deposit' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {paymentType === 'deposit' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  </button>
                  
                  {/* Full payment option */}
                  <button
                    type="button"
                    onClick={() => setPaymentType('full')}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      paymentType === 'full'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${paymentType === 'full' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                          Pago completo
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Pagás ${fullPaymentInfo.totalAmount.toLocaleString('es-AR')} ahora, nada en el lugar
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentType === 'full' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {paymentType === 'full' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  </button>
                </div>
              )}
              
              {/* Mercado Pago info */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#009ee3] rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">MP</span>
                    </div>
                    <span className="text-gray-900 dark:text-white font-semibold">Mercado Pago</span>
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Serás redirigido a Mercado Pago para completar el pago de forma segura. 
                  Podés pagar con tarjeta de crédito, débito o dinero en cuenta.
                </p>
              </div>
              
              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {/* Security note */}
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Shield className="w-4 h-4" />
                <span>Pago 100% seguro con Mercado Pago</span>
              </div>
              
              {/* Submit button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || isLoadingFee}
                className="w-full py-4 rounded-xl font-semibold text-white text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[#009ee3] hover:bg-[#007eb5] shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirigiendo a Mercado Pago...
                  </>
                ) : isLoadingFee ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    {paymentType === 'full' 
                      ? `Pagar $${(fullPaymentInfo.totalAmount + (pendingDebt.hasDebt ? pendingDebt.totalDebt : 0)).toLocaleString('es-AR')}`
                      : `Pagar seña $${(depositInfo.totalAmount + (pendingDebt.hasDebt ? pendingDebt.totalDebt : 0)).toLocaleString('es-AR')}`
                    }
                  </>
                )}
              </button>
              
            </div>
          </motion.div>
          
          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Reservation details */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resumen de reserva</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{establishmentName}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{courtName} • {sport}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium capitalize">{formatDate(date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{time} - {endTime}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{duration} minutos</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pending Debt Alert */}
            {pendingDebt.hasDebt && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-orange-400 font-medium">Deuda acumulada</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Tenés una deuda pendiente de <span className="text-orange-400 font-semibold">${pendingDebt.totalDebt.toLocaleString('es-AR')}</span> en este establecimiento.
                      Este monto se sumará a tu pago actual.
                    </p>
                    <div className="mt-2 space-y-1">
                      {pendingDebt.debts.map((debt, idx) => (
                        <div key={debt.id} className="text-xs text-gray-500">
                          • {debt.reason === 'late_cancellation' ? 'Cancelación tardía' : debt.reason === 'no_show' ? 'No asistió' : 'Otro'}: ${debt.amount.toLocaleString('es-AR')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Price breakdown */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detalle del pago</h3>
              
              <div className="space-y-3">
                {/* Full price */}
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Precio total del turno</span>
                  <span>${price.toLocaleString('es-AR')}</span>
                </div>
                
                {/* Payment section - changes based on selected type */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    {paymentType === 'full' ? 'Pago completo' : `Pago de seña (${depositInfo.percent}%)`}
                  </p>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>{paymentType === 'full' ? 'Cancha' : 'Seña'}</span>
                    <span>${(paymentType === 'full' ? price : depositInfo.baseAmount).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Tarifa de servicio</span>
                    <span className="flex items-center gap-2">
                      {feeDiscount.hasDiscount && (
                        <span className="line-through text-gray-400 dark:text-gray-500">
                          ${(paymentType === 'full' ? fullPaymentInfo.generalFee : depositInfo.generalFee)?.toLocaleString('es-AR') || feeDiscount.generalFee.toLocaleString('es-AR')}
                        </span>
                      )}
                      <span className={feeDiscount.hasDiscount ? 'text-emerald-500' : ''}>
                        {(paymentType === 'full' ? fullPaymentInfo.fee : depositInfo.fee) === 0 
                          ? '$0' 
                          : `$${(paymentType === 'full' ? fullPaymentInfo.fee : depositInfo.fee).toLocaleString('es-AR')}`
                        }
                      </span>
                      {feeDiscount.hasDiscount && feeDiscount.discountPercent === 100 && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">¡Gratis!</span>
                      )}
                    </span>
                  </div>
                </div>
                
                {/* Pending debt if any */}
                {pendingDebt.hasDebt && (
                  <div className="flex justify-between text-orange-400">
                    <span>Deuda acumulada</span>
                    <span>${pendingDebt.totalDebt.toLocaleString('es-AR')}</span>
                  </div>
                )}
                
                {/* Total to pay now */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                  <span className="text-gray-900 dark:text-white font-medium">Total a pagar ahora</span>
                  <span className="text-emerald-500 font-semibold text-lg">
                    ${((paymentType === 'full' ? fullPaymentInfo.totalAmount : depositInfo.totalAmount) + (pendingDebt.hasDebt ? pendingDebt.totalDebt : 0)).toLocaleString('es-AR')}
                  </span>
                </div>
                
                {/* Remaining */}
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Restante a pagar en el lugar</span>
                  <span>
                    {paymentType === 'full' 
                      ? '$0' 
                      : `$${(price - depositInfo.baseAmount).toLocaleString('es-AR')}`
                    }
                  </span>
                </div>
              </div>
            </div>
            
            {/* Info note */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-emerald-500 font-medium">Cancelación flexible</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Podés cancelar hasta 24 horas antes y recibir el reembolso completo de la seña.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
