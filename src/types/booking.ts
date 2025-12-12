export interface Booking {
  id: string;
  odId?: string;
  userId?: string;
  facilityId?: string;
  facilityName: string;
  facilityImage?: string;
  facilityAddress?: string;
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  participants?: string[];
  maxParticipants?: number;
  courtId?: string;
  courtName?: string;
  establishmentId?: string;
}

export interface BookingStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  favoritesSport: string;
  hoursPlayed: number;
}

export interface BookingFilters {
  status?: 'all' | 'upcoming' | 'completed' | 'cancelled';
  sport?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'date' | 'price' | 'facility';
  sortOrder?: 'asc' | 'desc';
}
