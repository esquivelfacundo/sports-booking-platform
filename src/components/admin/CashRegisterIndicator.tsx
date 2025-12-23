'use client';

import { useState } from 'react';
import { DollarSign, Lock, Unlock } from 'lucide-react';
import { useCashRegister } from '@/hooks/useCashRegister';
import OpenCashRegisterSidebar from './OpenCashRegisterSidebar';
import CloseCashRegisterSidebar from './CloseCashRegisterSidebar';

interface CashRegisterIndicatorProps {
  establishmentId: string | null;
}

export default function CashRegisterIndicator({ establishmentId }: CashRegisterIndicatorProps) {
  const { cashRegister, isOpen, loading, openCashRegister, closeCashRegister, refreshCashRegister } = useCashRegister(establishmentId);
  const [showOpenSidebar, setShowOpenSidebar] = useState(false);
  const [showCloseSidebar, setShowCloseSidebar] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg animate-pulse">
        <div className="w-5 h-5 bg-gray-600 rounded"></div>
        <div className="w-24 h-4 bg-gray-600 rounded"></div>
      </div>
    );
  }

  const handleOpen = async (initialCash: number, notes?: string) => {
    await openCashRegister(initialCash, notes);
    await refreshCashRegister();
  };

  const handleClose = async (actualCash: number, notes?: string) => {
    await closeCashRegister(actualCash, notes);
    await refreshCashRegister();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isOpen && cashRegister) {
    return (
      <>
        <button
          onClick={() => setShowCloseSidebar(true)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-green-900/50 hover:bg-green-900/70 border border-green-700 text-green-400 rounded-lg transition-colors"
        >
          <Unlock className="w-5 h-5" />
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium">Caja Abierta</span>
            <span className="text-xs text-green-300">{formatCurrency(cashRegister.totalSales)}</span>
          </div>
        </button>

        <CloseCashRegisterSidebar
          isOpen={showCloseSidebar}
          onClose={() => setShowCloseSidebar(false)}
          onCloseCashRegister={handleClose}
          cashRegister={cashRegister}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowOpenSidebar(true)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-red-900/50 hover:bg-red-900/70 border border-red-700 text-red-400 rounded-lg transition-colors"
      >
        <Lock className="w-5 h-5" />
        <span className="text-sm font-medium">Abrir Caja</span>
      </button>

      <OpenCashRegisterSidebar
        isOpen={showOpenSidebar}
        onClose={() => setShowOpenSidebar(false)}
        onOpen={handleOpen}
      />
    </>
  );
}
