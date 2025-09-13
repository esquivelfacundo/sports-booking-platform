'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '@/types/user';
import { apiClient } from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Mock user data
  const mockUser: User = {
    id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    phone: '+54 11 1234-5678',
    dateOfBirth: '1990-05-15',
    city: 'Buenos Aires',
    userType: 'player',
    isEmailVerified: true,
    isPhoneVerified: false,
    isActive: true,
    favoritesSports: ['futbol5', 'paddle'],
    skillLevel: 'intermediate',
    location: {
      lat: -34.6037,
      lng: -58.3816,
      address: 'Palermo, Buenos Aires'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: new Date().toISOString(),
    // Compatibility fields
    name: 'Juan Pérez',
    avatar: undefined,
    birthDate: '1990-05-15',
    bio: 'Apasionado del fútbol 5 y el paddle. Siempre buscando nuevos desafíos deportivos.',
    sports: [
      {
        sport: 'futbol5',
        level: 'intermediate',
        yearsPlaying: 8,
        position: 'Mediocampista'
      },
      {
        sport: 'paddle',
        level: 'beginner',
        yearsPlaying: 2
      }
    ],
    preferredTimes: ['18:00', '19:00', '20:00'],
    level: 'intermediate',
    friends: ['2', '3', '4'],
    favoriteVenues: ['1', '3', '5'],
    favoriteEstablishments: ['1', '2'],
    stats: {
      totalGames: 45,
      totalReservations: 23,
      favoriteVenuesCount: 3,
      friendsCount: 12,
      rating: 4.7,
      reviewsReceived: 8
    },
    lastActive: new Date().toISOString()
  };

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Verify token with backend
          const response = await apiClient.getProfile() as any;
          setAuthState({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear invalid token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await apiClient.login(credentials) as any;
      
      if (response.success && response.data.token) {
        // Store tokens
        localStorage.setItem('auth_token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refresh_token', response.data.refreshToken);
        }
        
        // Set user state
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const registerData = {
        email: data.email,
        password: data.password,
        firstName: data.name.split(' ')[0],
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        phone: data.phone,
        userType: 'player'
      };

      const response = await apiClient.register(registerData) as any;
      
      if (response.tokens && response.tokens.accessToken) {
        // Store tokens
        localStorage.setItem('auth_token', response.tokens.accessToken);
        if (response.tokens.refreshToken) {
          localStorage.setItem('refresh_token', response.tokens.refreshToken);
        }
        
        // Transform backend user data to frontend format
        const transformedUser = {
          ...response.user,
          name: `${response.user.firstName} ${response.user.lastName}`,
          avatar: response.user.profileImage,
          birthDate: response.user.dateOfBirth,
          level: response.user.skillLevel,
          lastActive: response.user.lastLoginAt || response.user.updatedAt
        };
        
        // Set user state
        setAuthState({
          user: transformedUser,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!authState.user) return false;
      
      // For now, keep local update until we implement profile update endpoint
      const updatedUser = { ...authState.user, ...updates };
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
