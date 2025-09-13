'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '@/types/user';

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
    name: 'Juan Pérez',
    email: 'juan@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format&face=center',
    phone: '+54 11 1234-5678',
    birthDate: '1990-05-15',
    location: 'Palermo, Buenos Aires',
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
    createdAt: '2024-01-15T10:00:00Z',
    lastActive: new Date().toISOString()
  };

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setAuthState({
            user: JSON.parse(savedUser),
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (credentials.email === 'juan@example.com' && credentials.password === 'password') {
        const user = { ...mockUser, lastActive: new Date().toISOString() };
        localStorage.setItem('user', JSON.stringify(user));
        setAuthState({
          user,
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        ...mockUser,
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        sports: [],
        friends: [],
        favoriteVenues: [],
        favoriteEstablishments: [],
        stats: {
          totalGames: 0,
          totalReservations: 0,
          favoriteVenuesCount: 0,
          friendsCount: 0,
          rating: 0,
          reviewsReceived: 0
        },
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };

      localStorage.setItem('user', JSON.stringify(newUser));
      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!authState.user) return false;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...authState.user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
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
