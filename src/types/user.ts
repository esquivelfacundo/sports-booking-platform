export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  birthDate?: string;
  location: string;
  bio?: string;
  sports: UserSport[];
  preferredTimes: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  friends: string[];
  favoriteVenues: string[];
  favoriteEstablishments: string[];
  stats: UserStats;
  createdAt: string;
  lastActive: string;
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
