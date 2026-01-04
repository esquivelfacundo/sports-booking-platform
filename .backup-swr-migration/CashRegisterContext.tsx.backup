'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

interface CashRegister {
  id: string;
  establishmentId: string;
  userId: string;
  openedAt: string;
  closedAt: string | null;
  status: 'open' | 'closed';
  initialCash: number;
  expectedCash: number;
  actualCash: number | null;
  cashDifference: number | null;
  totalCash: number;
  totalCard: number;
  totalTransfer: number;
  totalCreditCard: number;
  totalDebitCard: number;
  totalMercadoPago: number;
  totalOther: number;
  totalSales: number;
  totalExpenses: number;
  totalOrders: number;
  totalMovements: number;
  openingNotes: string | null;
  closingNotes: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface CashRegisterContextType {
  cashRegister: CashRegister | null;
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  openCashRegister: (initialCash: number, openingNotes?: string) => Promise<CashRegister>;
  closeCashRegister: (actualCash: number, closingNotes?: string) => Promise<CashRegister>;
  refreshCashRegister: () => Promise<void>;
  setEstablishmentId: (id: string | null) => void;
}

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined);

const POLLING_INTERVAL = 30000; // 30 seconds

export function useCashRegisterContext() {
  const context = useContext(CashRegisterContext);
  if (!context) {
    throw new Error('useCashRegisterContext must be used within a CashRegisterProvider');
  }
  return context;
}

interface CashRegisterProviderProps {
  children: ReactNode;
}

export function CashRegisterProvider({ children }: CashRegisterProviderProps) {
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchActiveCashRegister = useCallback(async (showLoading = true) => {
    if (!establishmentId) {
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError(null);
      const response = await apiClient.getActiveCashRegister(establishmentId) as { cashRegister: CashRegister | null };
      setCashRegister(response.cashRegister || null);
    } catch (err: any) {
      console.error('Error fetching active cash register:', err);
      setError(err.message || 'Error al cargar la caja');
      setCashRegister(null);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [establishmentId]);

  const openCashRegister = async (initialCash: number, openingNotes?: string) => {
    if (!establishmentId) {
      throw new Error('No establishment ID provided');
    }

    try {
      const response = await apiClient.openCashRegister({
        establishmentId,
        initialCash,
        openingNotes,
      }) as { cashRegister: CashRegister };
      setCashRegister(response.cashRegister);
      return response.cashRegister;
    } catch (err: any) {
      console.error('Error opening cash register:', err);
      throw err;
    }
  };

  const closeCashRegister = async (actualCash: number, closingNotes?: string) => {
    if (!cashRegister) {
      throw new Error('No active cash register');
    }

    try {
      const response = await apiClient.closeCashRegister(cashRegister.id, {
        actualCash,
        closingNotes,
      }) as { cashRegister: CashRegister };
      setCashRegister(null);
      return response.cashRegister;
    } catch (err: any) {
      console.error('Error closing cash register:', err);
      throw err;
    }
  };

  const refreshCashRegister = useCallback(async () => {
    await fetchActiveCashRegister(false);
  }, [fetchActiveCashRegister]);

  // Initial fetch when establishmentId changes
  useEffect(() => {
    if (establishmentId) {
      fetchActiveCashRegister();
    } else {
      setCashRegister(null);
      setLoading(false);
    }
  }, [establishmentId, fetchActiveCashRegister]);

  // Polling for updates (only when cash register is open)
  useEffect(() => {
    if (cashRegister?.status === 'open') {
      pollingRef.current = setInterval(() => {
        fetchActiveCashRegister(false);
      }, POLLING_INTERVAL);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [cashRegister?.status, fetchActiveCashRegister]);

  return (
    <CashRegisterContext.Provider
      value={{
        cashRegister,
        loading,
        error,
        isOpen: cashRegister?.status === 'open',
        openCashRegister,
        closeCashRegister,
        refreshCashRegister,
        setEstablishmentId,
      }}
    >
      {children}
    </CashRegisterContext.Provider>
  );
}
