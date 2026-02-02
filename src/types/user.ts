export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  profileImage?: string;
  country?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  bio?: string;
  favoritesSports: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  userType: 'player' | 'establishment' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Staff-specific fields
  isStaff?: boolean;
  staffRole?: 'admin' | 'employee';
  establishmentId?: string;
  allowedSections?: string[];
  permissions?: Record<string, boolean>;
  
  // Computed fields for compatibility
  name?: string;
  avatar?: string;
  birthDate?: string;
  sports?: UserSport[];
  preferredTimes?: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
  friends?: string[];
  favoriteVenues?: string[];
  favoriteEstablishments?: string[];
  lastActive?: string;
  stats?: {
    rating: number;
    totalGames: number;
    totalReservations: number;
    favoriteVenuesCount: number;
    friendsCount: number;
    reviewsReceived?: number;
  };
}

export interface UserSport {
  sport?: string;
  sportId?: string;
  level?: 'principiante' | 'intermedio' | 'avanzado' | 'profesional' | 'beginner' | 'intermediate' | 'advanced';
  skillLevel?: string;
  yearsPlaying: number;
  position?: string;
  gamesPlayed?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  sports: { sportId: string; skillLevel: string }[];
  preferredTimes: string[];
  birthDate: string;
  bio: string;
}
