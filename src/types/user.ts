export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  profileImage?: string;
  city?: string;
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
  stats?: UserStats;
  lastActive?: string;
}

export interface UserSport {
  sport: 'futbol5' | 'paddle' | 'tenis' | 'basquet';
  level: 'beginner' | 'intermediate' | 'advanced';
  yearsPlaying: number;
  position?: string; // Para deportes como fútbol
}

export interface UserStats {
  totalGames: number;
  totalReservations: number;
  favoriteVenuesCount: number;
  friendsCount: number;
  rating: number;
  reviewsReceived: number;
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
  name: string;
  email: string;
  password: string;
  phone?: string;
  location: string;
}
