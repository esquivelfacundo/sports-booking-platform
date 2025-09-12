export interface Booking {
  id: string;
  userId: string;
  facilityId: string;
  facilityName: string;
  facilityImage: string;
  facilityAddress: string;
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  participants?: string[];
  maxParticipants?: number;
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
