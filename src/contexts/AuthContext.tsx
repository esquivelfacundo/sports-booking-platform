'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '@/types/user';
import { apiClient } from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  incrementSportGames: (sportId: string) => Promise<User | undefined>;
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
    province: 'Buenos Aires',
    postalCode: '1425',
    userType: 'player',
    isEmailVerified: true,
    isPhoneVerified: true,
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
        position: 'Mediocampista',
        gamesPlayed: 127
      },
      {
        sport: 'paddle',
        level: 'beginner',
        yearsPlaying: 2,
        gamesPlayed: 34
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
    const initAuth = () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Get stored user data if available
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setAuthState({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            // If stored user data is corrupted, clear it
            localStorage.removeItem('user_data');
            setAuthState({
              user: null,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // First, check if there's a registered establishment with these credentials
      const establishmentData = localStorage.getItem('establishment_registration');
      if (establishmentData) {
        try {
          const establishment = JSON.parse(establishmentData);
          const representative = establishment.representative;
          
          if (representative && 
              representative.username === credentials.email && 
              representative.password === credentials.password) {
            
            // Create user object from representative data
            const representativeUser = {
              id: `rep_${Date.now()}`,
              firstName: representative.fullName.split(' ')[0],
              lastName: representative.fullName.split(' ').slice(1).join(' '),
              name: representative.fullName,
              email: representative.email,
              phone: representative.whatsapp,
              userType: 'establishment' as const,
              isAuthenticated: true,
              establishmentId: establishment.id || establishment.establishmentId || 'temp_establishment',
              position: representative.position,
              avatar: undefined,
              isEmailVerified: true,
              isPhoneVerified: true,
              isActive: true,
              favoritesSports: [],
              skillLevel: 'intermediate' as const,
              dateOfBirth: undefined,
              city: establishment.location?.city || '',
              province: establishment.location?.state || '',
              postalCode: establishment.location?.zipCode || '',
              location: establishment.location?.coordinates ? {
                lat: establishment.location.coordinates.lat,
                lng: establishment.location.coordinates.lng,
                address: establishment.location.address
              } : undefined,
              birthDate: undefined,
              bio: `Representante legal de ${establishment.basicInfo?.name || 'establecimiento'}`,
              sports: [],
              preferredTimes: [],
              level: 'intermediate' as const,
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
              updatedAt: new Date().toISOString(),
              lastActive: new Date().toISOString()
            };
            
            // Store auth token and user data
            localStorage.setItem('auth_token', `establishment_${Date.now()}`);
            localStorage.setItem('user_data', JSON.stringify(representativeUser));
            
            setAuthState({
              user: representativeUser,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
        } catch (parseError) {
          console.error('Error parsing establishment data:', parseError);
        }
      }

      // If not a representative login, try regular API login
      const response = await apiClient.login(credentials) as any;
      
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
          lastActive: response.user.lastLoginAt || response.user.updatedAt,
          friends: response.user.friends || [],
          favoriteVenues: response.user.favoriteVenues || [],
          favoriteEstablishments: response.user.favoriteEstablishments || [],
          sports: response.user.sports || [],
          stats: response.user.stats || {
            totalGames: 0,
            totalReservations: 0,
            favoriteVenuesCount: 0,
            friendsCount: 0,
            rating: 0,
            reviewsReceived: 0
          }
        };
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user_data', JSON.stringify(transformedUser));
        
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
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const registerData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName || '',
        phone: data.phone,
        country: data.country,
        province: data.province,
        city: data.city,
        postalCode: data.postalCode,
        sports: data.sports,
        preferredTimes: data.preferredTimes,
        birthDate: data.birthDate,
        bio: data.bio,
        userType: 'player'
      };

      console.log('Sending registration data:', registerData);
      const response = await apiClient.register(registerData) as any;
      
      if (response.tokens && response.tokens.accessToken) {
        // Store tokens
        localStorage.setItem('auth_token', response.tokens.accessToken);
        if (response.tokens.refreshToken) {
          localStorage.setItem('refresh_token', response.tokens.refreshToken);
        }
        
        // Transform backend user data to frontend format with registration data fallback
        const transformedUser = {
          ...response.user,
          name: `${response.user.firstName} ${response.user.lastName}`.trim(),
          avatar: response.user.profileImage || null,
          birthDate: response.user.dateOfBirth || data.birthDate || null,
          bio: response.user.bio || data.bio || null,
          country: response.user.country || data.country || null,
          province: response.user.province || data.province || null,
          city: response.user.city || data.city || null,
          postalCode: response.user.postalCode || data.postalCode || null,
          preferredTimes: response.user.preferredTimes || data.preferredTimes || [],
          level: response.user.skillLevel || 'beginner',
          lastActive: response.user.lastLoginAt || response.user.updatedAt,
          friends: response.user.friends || [],
          favoriteVenues: response.user.favoriteVenues || [],
          favoriteEstablishments: response.user.favoriteEstablishments || [],
          sports: response.user.sports || data.sports || response.user.favoritesSports || [],
          location: response.user.location || (data.city && data.province ? {
            lat: 0,
            lng: 0,
            address: `${data.city}, ${data.province}`
          } : null),
          stats: response.user.stats || {
            totalGames: 0,
            totalReservations: 0,
            favoriteVenuesCount: 0,
            friendsCount: 0,
            rating: 0,
            reviewsReceived: 0
          }
        };
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user_data', JSON.stringify(transformedUser));
        
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
    localStorage.removeItem('user_data');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateProfile = async (profileData: Partial<User>) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...authState.user!, ...profileData };
      
      // Update localStorage
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false
      });
      
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating profile';
      console.error(errorMessage);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const incrementSportGames = async (sportId: string) => {
    if (!authState.user) return;
    
    try {
      const updatedSports = authState.user.sports?.map((sport: any) => {
        const currentSportId = sport.sportId || sport.sport;
        if (currentSportId === sportId) {
          return {
            ...sport,
            gamesPlayed: (sport.gamesPlayed || 0) + 1
          };
        }
        return sport;
      }) || [];

      const updatedUser = {
        ...authState.user,
        sports: updatedSports
      };

      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false
      });
      
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Error incrementing sport games:', error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    incrementSportGames,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
