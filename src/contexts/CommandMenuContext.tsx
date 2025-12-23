'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import CommandMenu from '@/components/admin/CommandMenu';
import CreateReservationSidebar from '@/components/admin/CreateReservationSidebar';
import DirectSaleSidebar from '@/components/admin/DirectSaleSidebar';
import ReservationDetailsSidebar from '@/components/admin/ReservationDetailsSidebar';
import OpenCashRegisterSidebar from '@/components/admin/OpenCashRegisterSidebar';
import CloseCashRegisterSidebar from '@/components/admin/CloseCashRegisterSidebar';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useCashRegisterContext } from '@/contexts/CashRegisterContext';
import { apiClient } from '@/lib/api';
import { usePinConfirmation } from '@/components/admin/PinConfirmation';

interface Court {
  id: string;
  name: string;
  sport: string;
  pricePerHour: number;
  pricePerHour90?: number;
  pricePerHour120?: number;
  isActive: boolean;
}

interface Amenity {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  pricePerHour: number;
  pricePerHour90?: number;
  pricePerHour120?: number;
  isBookable: boolean;
  isPublic: boolean;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
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
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  createdAt: string;
  notes?: string;
  isRecurring?: boolean;
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
}

interface CommandMenuContextType {
  openReservationSidebar: () => void;
  openSaleSidebar: () => void;
  openProductModal: () => void;
  openStockMovementModal: () => void;
  openReservationDetail: (bookingId: string) => void;
  openCashRegisterAction: () => void;
}

const CommandMenuContext = createContext<CommandMenuContextType | undefined>(undefined);

export const useCommandMenu = () => {
  const context = useContext(CommandMenuContext);
  if (!context) {
    throw new Error('useCommandMenu must be used within a CommandMenuProvider');
  }
  return context;
};

interface CommandMenuProviderProps {
  children: ReactNode;
}

export const CommandMenuProvider: React.FC<CommandMenuProviderProps> = ({ children }) => {
  const { establishment } = useEstablishment();
  const { cashRegister, isOpen: isCashRegisterOpen, openCashRegister: openCashRegisterFn, closeCashRegister: closeCashRegisterFn } = useCashRegisterContext();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { requestPin, PinModal } = usePinConfirmation();
  
  // Modal states
  const [showReservationSidebar, setShowReservationSidebar] = useState(false);
  const [showSaleSidebar, setShowSaleSidebar] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockMovementModal, setShowStockMovementModal] = useState(false);
  const [showReservationDetail, setShowReservationDetail] = useState(false);
  const [showOpenCashRegister, setShowOpenCashRegister] = useState(false);
  const [showCloseCashRegister, setShowCloseCashRegister] = useState(false);
  
  // Pending action after cash register opens
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);

  // Load amenities when establishment changes
  useEffect(() => {
    const loadAmenities = async () => {
      if (!establishment?.id) return;
      try {
        const response = await apiClient.getAmenities(establishment.id);
        const bookableAmenities = (response.amenities || []).filter((a: Amenity) => a.isBookable && a.isActive);
        setAmenities(bookableAmenities);
      } catch (error) {
        console.error('Error loading amenities:', error);
      }
    };
    loadAmenities();
  }, [establishment?.id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ctrl+J / Cmd+J shortcut for cash register
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        openCashRegisterAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCashRegisterOpen]);

  // Execute pending action when cash register opens
  useEffect(() => {
    if (isCashRegisterOpen && pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [isCashRegisterOpen, pendingAction]);


  // Load categories when needed
  const loadCategories = useCallback(async () => {
    if (!establishment?.id) return;
    try {
      const response = await apiClient.getProductCategories(establishment.id) as any;
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, [establishment?.id]);

  // Load booking details and map to Reservation interface
  const loadBooking = useCallback(async (bookingId: string) => {
    setLoadingBooking(true);
    try {
      const response = await apiClient.getBooking(bookingId) as any;
      const booking = response.booking || response;
      
      // Map booking data to Reservation interface
      const reservation: Reservation = {
        id: booking.id,
        clientName: booking.client?.name || booking.guestName || 
          (booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Sin nombre'),
        clientEmail: booking.client?.email || booking.guestEmail || booking.user?.email || '',
        clientPhone: booking.client?.phone || booking.guestPhone || booking.user?.phone || '',
        court: booking.court?.name || 'Sin cancha',
        courtId: booking.courtId,
        sportName: booking.court?.sport,
        date: booking.date,
        time: booking.startTime,
        endTime: booking.endTime,
        duration: booking.duration || 60,
        price: booking.totalPrice || booking.totalAmount || 0,
        status: booking.status,
        paymentStatus: booking.paidAmount >= (booking.totalPrice || booking.totalAmount || 0) ? 'paid' : 'pending',
        createdAt: booking.createdAt,
        notes: booking.notes,
        isRecurring: booking.isRecurring,
        depositAmount: booking.depositAmount || booking.paidAmount || 0,
        initialDeposit: booking.initialDeposit,
        depositPercent: booking.depositPercent,
        depositMethod: booking.depositMethod,
        serviceFee: booking.serviceFee,
        mpPaymentId: booking.mpPaymentId,
        paidAt: booking.paidAt,
        establishmentId: booking.establishmentId,
        establishment: booking.establishment,
        orders: booking.orders
      };
      
      setSelectedReservation(reservation);
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoadingBooking(false);
    }
  }, []);

  // Cash register action - open or close based on current state
  // PIN validation is handled inside the sidebars when confirming the action
  const openCashRegisterAction = useCallback(() => {
    if (isCashRegisterOpen) {
      setShowCloseCashRegister(true);
    } else {
      setShowOpenCashRegister(true);
    }
  }, [isCashRegisterOpen]);

  // Check if cash register is open before action, if not open the sidebar
  const requireCashRegister = useCallback((action: () => void) => {
    if (isCashRegisterOpen) {
      action();
    } else {
      setPendingAction(() => action);
      setShowOpenCashRegister(true);
    }
  }, [isCashRegisterOpen]);

  // Actions
  const openReservationSidebar = useCallback(() => {
    if (!establishment?.id) {
      console.warn('No establishment ID available for reservation sidebar');
      return;
    }
    // Just open the sidebar - it will load courts internally
    setShowReservationSidebar(true);
  }, [establishment?.id]);

  const openSaleSidebar = useCallback(() => {
    requireCashRegister(() => setShowSaleSidebar(true));
  }, [requireCashRegister]);

  const openProductModal = useCallback(async () => {
    await loadCategories();
    setShowProductModal(true);
  }, [loadCategories]);

  const openStockMovementModal = useCallback(() => {
    setShowStockMovementModal(true);
  }, []);

  const openReservationDetail = useCallback(async (bookingId: string) => {
    await loadBooking(bookingId);
    setShowReservationDetail(true);
  }, [loadBooking]);

  // Handlers for reservation detail sidebar
  const handleCancelReservation = async (id: string) => {
    return new Promise<void>((resolve) => {
      requestPin(async () => {
        try {
          await apiClient.updateBooking(id, { status: 'cancelled' });
          setShowReservationDetail(false);
          setSelectedReservation(null);
        } catch (error) {
          console.error('Error cancelling reservation:', error);
        }
        resolve();
      }, { title: 'Cancelar reserva', description: 'Ingresa tu PIN para confirmar' });
    });
  };

  const handleConfirmReservation = async (id: string) => {
    return new Promise<void>((resolve) => {
      requestPin(async () => {
        try {
          await apiClient.updateBooking(id, { status: 'confirmed' });
          await loadBooking(id);
        } catch (error) {
          console.error('Error confirming reservation:', error);
        }
        resolve();
      }, { title: 'Confirmar reserva', description: 'Ingresa tu PIN para confirmar' });
    });
  };

  const handleCompleteReservation = async (id: string) => {
    return new Promise<void>((resolve) => {
      requestPin(async () => {
        try {
          await apiClient.updateBooking(id, { status: 'in_progress' });
          await loadBooking(id);
        } catch (error) {
          console.error('Error completing reservation:', error);
        }
        resolve();
      }, { title: 'Iniciar turno', description: 'Ingresa tu PIN para confirmar' });
    });
  };

  const handleNoShow = async (id: string) => {
    return new Promise<void>((resolve) => {
      requestPin(async () => {
        try {
          await apiClient.updateBooking(id, { status: 'no_show' });
          await loadBooking(id);
        } catch (error) {
          console.error('Error marking no show:', error);
        }
        resolve();
      }, { title: 'Marcar no asistió', description: 'Ingresa tu PIN para confirmar' });
    });
  };

  const handleEditReservation = (reservation: Reservation) => {
    // Edit functionality - could open an edit modal
    console.log('Edit reservation:', reservation.id);
  };

  const value: CommandMenuContextType = {
    openReservationSidebar,
    openSaleSidebar,
    openProductModal,
    openStockMovementModal,
    openReservationDetail,
    openCashRegisterAction
  };

  return (
    <CommandMenuContext.Provider value={value}>
      {children}

      {/* Command Menu */}
      {mounted && (
        <CommandMenu
          onOpenReservation={openReservationDetail}
          onCreateReservation={openReservationSidebar}
          onCreateSale={openSaleSidebar}
        />
      )}

      {/* Create Reservation Sidebar */}
      {establishment?.id && (
        <CreateReservationSidebar
          isOpen={showReservationSidebar}
          onClose={() => setShowReservationSidebar(false)}
          establishmentId={establishment.id}
          courts={[]}
          amenities={amenities}
          onReservationCreated={() => {
            setShowReservationSidebar(false);
          }}
        />
      )}

      {/* Direct Sale Sidebar */}
      {establishment?.id && (
        <DirectSaleSidebar
          isOpen={showSaleSidebar}
          onClose={() => setShowSaleSidebar(false)}
          establishmentId={establishment.id}
          establishmentName={establishment.name}
          establishmentSlug={establishment.slug}
          onOrderCreated={() => {
            setShowSaleSidebar(false);
          }}
        />
      )}

      {/* Product Form Modal */}
      {establishment?.id && showProductModal && (
        <ProductFormModal
          establishmentId={establishment.id}
          categories={categories}
          product={null}
          onClose={() => setShowProductModal(false)}
          onSave={() => {
            setShowProductModal(false);
          }}
        />
      )}

      {/* Stock Movement Modal */}
      {establishment?.id && showStockMovementModal && (
        <StockMovementModal
          establishmentId={establishment.id}
          onClose={() => setShowStockMovementModal(false)}
          onSave={() => {
            setShowStockMovementModal(false);
          }}
        />
      )}

      {/* Reservation Detail Sidebar */}
      {selectedReservation && (
        <ReservationDetailsSidebar
          isOpen={showReservationDetail}
          onClose={() => {
            setShowReservationDetail(false);
            setSelectedReservation(null);
          }}
          reservation={selectedReservation}
          onEdit={handleEditReservation}
          onConfirm={handleConfirmReservation}
          onCancel={handleCancelReservation}
          onComplete={handleCompleteReservation}
          onNoShow={handleNoShow}
          onOpenCashRegister={() => setShowOpenCashRegister(true)}
        />
      )}

      {/* Open Cash Register Sidebar */}
      {establishment?.id && (
        <OpenCashRegisterSidebar
          isOpen={showOpenCashRegister}
          onClose={() => {
            setShowOpenCashRegister(false);
            setPendingAction(null);
          }}
          onOpen={async (initialCash: number, notes?: string) => {
            await openCashRegisterFn(initialCash, notes);
            setShowOpenCashRegister(false);
          }}
          requestPin={requestPin}
        />
      )}

      {/* Close Cash Register Sidebar */}
      {establishment?.id && cashRegister && (
        <CloseCashRegisterSidebar
          isOpen={showCloseCashRegister}
          onClose={() => setShowCloseCashRegister(false)}
          cashRegister={cashRegister}
          onCloseCashRegister={async (actualCash: number, notes?: string) => {
            await closeCashRegisterFn(actualCash, notes);
            setShowCloseCashRegister(false);
          }}
          requestPin={requestPin}
        />
      )}

      {/* PIN Confirmation Modal */}
      <PinModal />
    </CommandMenuContext.Provider>
  );
};

export default CommandMenuContext;
