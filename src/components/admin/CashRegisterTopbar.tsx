'use client';

import { useState, useRef, useEffect } from 'react';
import { DollarSign, Banknote, CreditCard, TrendingDown, TrendingUp, Eye, X, Building2, Smartphone, Clock, ChevronRight, Wallet } from 'lucide-react';
import { useCashRegisterContext } from '@/contexts/CashRegisterContext';
import { apiClient } from '@/lib/api';
import OpenCashRegisterSidebar from './OpenCashRegisterSidebar';
import CloseCashRegisterSidebar from './CloseCashRegisterSidebar';
import Link from 'next/link';
import { usePinConfirmation } from './PinConfirmation';

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  icon: string | null;
}

interface CashRegisterTopbarProps {
  establishmentId: string | null;
}

// Map payment method codes to their totals in cash register
const getPaymentMethodTotal = (cashRegister: any, code: string): number => {
  switch (code) {
    case 'cash': return parseFloat(String(cashRegister.totalCash)) || 0;
    case 'card': return (parseFloat(String(cashRegister.totalCard)) || 0) + (parseFloat(String(cashRegister.totalCreditCard)) || 0) + (parseFloat(String(cashRegister.totalDebitCard)) || 0);
    case 'credit_card': return parseFloat(String(cashRegister.totalCreditCard)) || 0;
    case 'debit_card': return parseFloat(String(cashRegister.totalDebitCard)) || 0;
    case 'transfer': return parseFloat(String(cashRegister.totalTransfer)) || 0;
    case 'mercadopago': return parseFloat(String(cashRegister.totalMercadoPago)) || 0;
    default: return parseFloat(String(cashRegister.totalOther)) || 0;
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

export default function CashRegisterTopbar({ establishmentId }: CashRegisterTopbarProps) {
  const { cashRegister, isOpen, loading, openCashRegister, closeCashRegister, refreshCashRegister, setEstablishmentId } = useCashRegisterContext();
  const { requestPin, PinModal } = usePinConfirmation();
  
  // Set establishment ID in context when it changes
  useEffect(() => {
    setEstablishmentId(establishmentId);
  }, [establishmentId, setEstablishmentId]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOpenSidebar, setShowOpenSidebar] = useState(false);
  const [showCloseSidebar, setShowCloseSidebar] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load payment methods from establishment
  useEffect(() => {
    if (establishmentId) {
      loadPaymentMethods(establishmentId);
    }
  }, [establishmentId]);

  const loadPaymentMethods = async (estId: string) => {
    try {
      const response = await apiClient.getPaymentMethods(estId) as { paymentMethods: PaymentMethod[] };
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = async (initialCash: number, notes?: string) => {
    await openCashRegister(initialCash, notes);
    await refreshCashRegister();
    setShowDropdown(false);
  };

  const handleClose = async (actualCash: number, notes?: string) => {
    await closeCashRegister(actualCash, notes);
    await refreshCashRegister();
    setShowDropdown(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleIconClick = () => {
    if (!isOpen) {
      // Si la caja está cerrada, abrir directamente el sidebar
      setShowOpenSidebar(true);
    } else {
      // Si la caja está abierta, mostrar el dropdown
      setShowDropdown(!showDropdown);
    }
  };

  if (loading) {
    return (
      <div className="relative p-2">
        <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icon Button */}
      <button
        onClick={handleIconClick}
        className={`relative p-2 rounded-lg transition-colors ${
          isOpen 
            ? 'text-green-400 hover:bg-green-500/10' 
            : 'text-red-400 hover:bg-red-500/10'
        }`}
        title={isOpen ? 'Caja Abierta' : 'Caja Cerrada'}
      >
        <DollarSign className="w-5 h-5" />
        {/* Status indicator dot */}
        <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          isOpen ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </button>

      {/* Dropdown (solo cuando la caja está abierta) */}
      {showDropdown && isOpen && cashRegister && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header con gradiente */}
          <div className="relative p-5 bg-gradient-to-br from-emerald-900/60 via-emerald-800/40 to-gray-900">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <Wallet className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-white">Caja Activa</p>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300/80 text-xs mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>Desde {new Date(cashRegister.openedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Métricas principales */}
          <div className="p-4 grid grid-cols-3 gap-3">
            <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/50">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Ingresos</p>
              <p className="text-lg font-bold text-emerald-400">{formatCurrency(cashRegister.totalSales)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/50">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Egresos</p>
              <p className="text-lg font-bold text-red-400">{formatCurrency(cashRegister.totalExpenses)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-3 text-center border border-blue-700/50">
              <p className="text-[10px] uppercase tracking-wider text-blue-300/70 mb-1">En Caja</p>
              <p className="text-lg font-bold text-blue-400">{formatCurrency(cashRegister.expectedCash)}</p>
            </div>
          </div>

          {/* Desglose por método de pago */}
          <div className="px-4 pb-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" />
              Por método de pago
            </p>
            <div className="space-y-1.5">
              {paymentMethods.map((pm) => {
                const Icon = getPaymentMethodIcon(pm.code);
                const colorClass = getPaymentMethodColor(pm.code);
                const total = getPaymentMethodTotal(cashRegister, pm.code);
                const percentage = cashRegister.totalSales > 0 ? (total / cashRegister.totalSales) * 100 : 0;
                return (
                  <div key={pm.id} className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      pm.code === 'cash' ? 'bg-green-500/10' :
                      pm.code === 'transfer' ? 'bg-purple-500/10' :
                      pm.code === 'mercadopago' ? 'bg-cyan-500/10' : 'bg-blue-500/10'
                    }`}>
                      <Icon className={`w-4 h-4 ${colorClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-300">{pm.name}</p>
                        <p className="text-sm font-semibold text-white">{formatCurrency(total)}</p>
                      </div>
                      <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* Acciones */}
          <div className="p-3 bg-gray-800/30 border-t border-gray-700/50 flex gap-2">
            <Link
              href="/establecimientos/admin/caja"
              onClick={() => setShowDropdown(false)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
            >
              <Eye className="w-4 h-4" />
              Ver detalle
              <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
            </Link>
            <button
              onClick={() => {
                setShowDropdown(false);
                setShowCloseSidebar(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm font-medium transition-all hover:scale-[1.02] shadow-lg shadow-red-900/30"
            >
              <X className="w-4 h-4" />
              Cerrar Caja
            </button>
          </div>
        </div>
      )}

      {/* Sidebars */}
      <OpenCashRegisterSidebar
        isOpen={showOpenSidebar}
        onClose={() => setShowOpenSidebar(false)}
        onOpen={handleOpen}
        requestPin={requestPin}
      />

      <CloseCashRegisterSidebar
        isOpen={showCloseSidebar}
        onClose={() => setShowCloseSidebar(false)}
        onCloseCashRegister={handleClose}
        cashRegister={cashRegister}
        requestPin={requestPin}
      />

      {/* PIN Confirmation Modal */}
      <PinModal />
    </div>
  );
}
