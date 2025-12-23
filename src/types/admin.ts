// Tipos centralizados para el módulo de administración de establecimientos

export interface AdminReservation {
  id: string;
  establishmentId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  court: string;
  courtId?: string;
  amenityId?: string;
  sportName?: string;
  date: string;
  time: string;
  endTime: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'cancelled' | 'completed' | 'no_show';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  notes?: string;
  isRecurring?: boolean;
  depositAmount?: number;
  initialDeposit?: number;
  depositPercent?: number;
  depositMethod?: string | null;
  serviceFee?: number;
  mpPaymentId?: string;
  paidAt?: string;
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

export interface AdminCourt {
  id: string;
  name: string;
  sport: string;
  pricePerHour: number;
  pricePerHour90?: number;
  pricePerHour120?: number;
  isActive: boolean;
  description?: string;
  images?: string[];
  surface?: string;
  covered?: boolean;
  lighting?: boolean;
  features?: string[];
  // Campos adicionales del hook viejo (para compatibilidad con canchas/page.tsx)
  isIndoor?: boolean;
  capacity?: number;
  amenities?: string[];
}

export interface AdminStats {
  todayBookings: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalClients: number;
  occupancyRate: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
}

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}
