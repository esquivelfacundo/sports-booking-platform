'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Player, FriendRequest, Match, Team, Activity } from '@/types/social';
import { useAuth } from './AuthContext';
import { apiClient } from '@/lib/api';

interface SocialContextType {
  friends: Player[];
  friendRequests: FriendRequest[];
  nearbyPlayers: Player[];
  matches: Match[];
  teams: Team[];
  activities: Activity[];
  isLoading: boolean;
  
  // Friend functions
  sendFriendRequest: (userId: string, message?: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  rejectFriendRequest: (requestId: string) => Promise<boolean>;
  removeFriend: (userId: string) => Promise<boolean>;
  
  // Player search
  searchPlayers: (query: string, filters?: any) => Promise<Player[]>;
  
  // Match functions
  createMatch: (matchData: Partial<Match>) => Promise<string | null>;
  joinMatch: (matchId: string) => Promise<boolean>;
  leaveMatch: (matchId: string) => Promise<boolean>;
  
  // Team functions
  createTeam: (teamData: Partial<Team>) => Promise<string | null>;
  joinTeam: (teamId: string) => Promise<boolean>;
  leaveTeam: (teamId: string) => Promise<boolean>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

// Mock data
const mockPlayers: Player[] = [
  {
    id: '2',
    name: 'María González',
    avatar: '/api/placeholder/150/150',
    location: 'Palermo, Buenos Aires',
    sports: [
      { sport: 'paddle', level: 'intermediate', yearsPlaying: 3 },
      { sport: 'tenis', level: 'beginner', yearsPlaying: 1 }
    ],
    level: 'intermediate',
    rating: 4.6,
    gamesPlayed: 32,
    isOnline: true,
    lastActive: new Date().toISOString(),
    bio: 'Apasionada del paddle, siempre buscando mejorar mi juego.',
    preferredTimes: ['18:00', '19:00', '20:00']
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    avatar: '/api/placeholder/150/150',
    location: 'Belgrano, Buenos Aires',
    sports: [
      { sport: 'futbol5', level: 'advanced', yearsPlaying: 10, position: 'Delantero' },
      { sport: 'basquet', level: 'intermediate', yearsPlaying: 5 }
    ],
    level: 'advanced',
    rating: 4.8,
    gamesPlayed: 89,
    isOnline: false,
    lastActive: '2024-01-15T20:30:00Z',
    bio: 'Jugador de fútbol 5 con experiencia. Me gusta el juego rápido y técnico.',
    preferredTimes: ['19:00', '20:00', '21:00']
  },
  {
    id: '4',
    name: 'Ana Martínez',
    avatar: '/api/placeholder/150/150',
    location: 'Recoleta, Buenos Aires',
    sports: [
      { sport: 'tenis', level: 'advanced', yearsPlaying: 8 },
      { sport: 'paddle', level: 'intermediate', yearsPlaying: 4 }
    ],
    level: 'advanced',
    rating: 4.9,
    gamesPlayed: 156,
    isOnline: true,
    lastActive: new Date().toISOString(),
    bio: 'Instructora de tenis los fines de semana. Siempre dispuesta a ayudar.',
    preferredTimes: ['17:00', '18:00', '19:00']
  },
  {
    id: '5',
    name: 'Diego López',
    avatar: '/api/placeholder/150/150',
    location: 'Villa Crespo, Buenos Aires',
    sports: [
      { sport: 'basquet', level: 'intermediate', yearsPlaying: 6 },
      { sport: 'futbol5', level: 'beginner', yearsPlaying: 2 }
    ],
    level: 'intermediate',
    rating: 4.4,
    gamesPlayed: 43,
    isOnline: true,
    lastActive: new Date().toISOString(),
    bio: 'Nuevo en el fútbol 5, pero con experiencia en básquet.',
    preferredTimes: ['20:00', '21:00', '22:00']
  }
];

const mockMatches: Match[] = [
  {
    id: '1',
    title: 'Fútbol 5 - Miércoles por la noche',
    sport: 'futbol5',
    venue: {
      id: '1',
      name: 'Club Deportivo San Lorenzo',
      location: 'Palermo, Buenos Aires'
    },
    date: '2024-01-17',
    time: '20:00',
    duration: 90,
    organizer: mockPlayers[1],
    players: [mockPlayers[1], mockPlayers[0]],
    maxPlayers: 10,
    minPlayers: 8,
    level: 'intermediate',
    price: 800,
    description: 'Partido amistoso, buen ambiente. Faltan 8 jugadores.',
    status: 'open',
    isPrivate: false,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Padel - Sábado mañana',
    sport: 'paddle',
    venue: {
      id: '2',
      name: 'Padel Center Norte',
      location: 'Belgrano, Buenos Aires'
    },
    date: '2024-01-20',
    time: '10:00',
    duration: 60,
    organizer: mockPlayers[0],
    players: [mockPlayers[0], mockPlayers[2]],
    maxPlayers: 4,
    minPlayers: 4,
    level: 'intermediate',
    price: 650,
    description: 'Dobles de paddle, nivel intermedio.',
    status: 'open',
    isPrivate: false,
    createdAt: '2024-01-15T11:00:00Z'
  }
];

interface SocialProviderProps {
  children: ReactNode;
}

export const SocialProvider: React.FC<SocialProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socialState, setSocialState] = useState({
    friends: [] as Player[],
    friendRequests: [] as FriendRequest[],
    nearbyPlayers: [] as Player[],
    matches: [] as Match[],
    teams: [] as Team[],
    activities: [] as Activity[],
    isLoading: false
  });

  // Load matches from API
  const loadMatches = useCallback(async () => {
    // Don't fetch if user just logged out (no token)
    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
      setSocialState(prev => ({ ...prev, matches: [] }));
      return;
    }
    
    try {
      const response = await apiClient.getMatches({ status: 'open' }) as any;
      const matchesData = response.data || response || [];
      
      // Transform backend matches to frontend format
      const transformedMatches: Match[] = Array.isArray(matchesData) 
        ? matchesData.map((m: any) => ({
            id: m.id,
            title: m.description || `${m.sport} - ${m.date}`,
            sport: m.sport || 'futbol5',
            venue: m.court?.establishment ? {
              id: m.court.establishment.id,
              name: m.court.establishment.name,
              location: m.court.establishment.city || m.court.establishment.address
            } : { id: '', name: 'Por definir', location: 'Por definir' },
            date: m.date,
            time: m.startTime,
            duration: 90,
            organizer: m.organizer ? {
              id: m.organizer.id,
              name: `${m.organizer.firstName} ${m.organizer.lastName}`,
              avatar: m.organizer.profileImage || '/api/placeholder/150/150',
              location: '',
              sports: [],
              level: m.organizer.skillLevel || 'intermediate',
              rating: 4.5,
              gamesPlayed: 0,
              isOnline: false,
              lastActive: new Date().toISOString(),
              bio: '',
              preferredTimes: []
            } : mockPlayers[0],
            players: m.participants?.map((p: any) => ({
              id: p.user?.id || p.userId,
              name: p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Jugador',
              avatar: p.user?.profileImage || '/api/placeholder/150/150',
              location: '',
              sports: [],
              level: 'intermediate' as const,
              rating: 4.5,
              gamesPlayed: 0,
              isOnline: false,
              lastActive: new Date().toISOString(),
              bio: '',
              preferredTimes: []
            })) || [],
            maxPlayers: m.maxPlayers || 10,
            minPlayers: m.minPlayers || 6,
            level: m.skillLevel || 'intermediate',
            price: m.pricePerPlayer,
            description: m.description,
            status: m.status || 'open',
            isPrivate: m.isPrivate || false,
            createdAt: m.createdAt
          }))
        : [];
      
      setSocialState(prev => ({
        ...prev,
        matches: transformedMatches
      }));
    } catch (error) {
      console.error('Error loading matches:', error);
      // No fallback to mock data - show empty state
      setSocialState(prev => ({
        ...prev,
        matches: []
      }));
    }
  }, []);

  // Load public matches always (even without authentication)
  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load user's friends - this would need a friends API
      // For now, just set empty array
      setSocialState(prev => ({
        ...prev,
        friends: []
      }));
    }
  }, [user, isAuthenticated]);

  const sendFriendRequest = async (userId: string, message?: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const targetUser = mockPlayers.find(p => p.id === userId);
      if (!targetUser) return false;

      const newRequest: FriendRequest = {
        id: Date.now().toString(),
        fromUserId: user.id,
        toUserId: userId,
        fromUser: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          location: user.location,
          sports: user.sports,
          level: user.level,
          rating: user.stats.rating,
          gamesPlayed: user.stats.totalGames,
          isOnline: true,
          lastActive: new Date().toISOString(),
          bio: user.bio,
          preferredTimes: user.preferredTimes
        },
        toUser: targetUser,
        status: 'pending',
        createdAt: new Date().toISOString(),
        message
      };

      setSocialState(prev => ({
        ...prev,
        friendRequests: [...prev.friendRequests, newRequest]
      }));

      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
  };

  const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const request = socialState.friendRequests.find(r => r.id === requestId);
      if (!request) return false;

      // Add to friends list
      setSocialState(prev => ({
        ...prev,
        friends: [...prev.friends, request.fromUser],
        friendRequests: prev.friendRequests.filter(r => r.id !== requestId)
      }));

      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return false;
    }
  };

  const rejectFriendRequest = async (requestId: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSocialState(prev => ({
        ...prev,
        friendRequests: prev.friendRequests.filter(r => r.id !== requestId)
      }));

      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      return false;
    }
  };

  const removeFriend = async (userId: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSocialState(prev => ({
        ...prev,
        friends: prev.friends.filter(f => f.id !== userId)
      }));

      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      return false;
    }
  };

  const searchPlayers = async (query: string, filters?: any): Promise<Player[]> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return mockPlayers.filter(player => {
        const matchesQuery = player.name.toLowerCase().includes(query.toLowerCase()) ||
                           player.location.toLowerCase().includes(query.toLowerCase());
        
        if (filters?.sport) {
          const hasSport = player.sports.some(s => s.sport === filters.sport);
          return matchesQuery && hasSport;
        }
        
        if (filters?.level) {
          return matchesQuery && player.level === filters.level;
        }
        
        return matchesQuery;
      });
    } catch (error) {
      console.error('Error searching players:', error);
      return [];
    }
  };

  const createMatch = async (matchData: Partial<Match>): Promise<string | null> => {
    try {
      if (!user) return null;
      
      // Call real API
      const response = await apiClient.createMatch({
        sport: matchData.sport || 'futbol5',
        date: matchData.date || new Date().toISOString().split('T')[0],
        startTime: matchData.time || '20:00',
        maxPlayers: matchData.maxPlayers,
        pricePerPlayer: matchData.price,
        skillLevel: matchData.level,
        description: matchData.description || matchData.title
      }) as any;

      if (response.success && response.data) {
        await loadMatches(); // Refresh matches list
        return response.data.id;
      }
      
      // Fallback to local creation if API fails
      
      const newMatch: Match = {
        id: Date.now().toString(),
        title: matchData.title || 'Nuevo partido',
        sport: matchData.sport || 'futbol5',
        venue: matchData.venue || { id: '1', name: 'Cancha por definir', location: 'Por definir' },
        date: matchData.date || new Date().toISOString().split('T')[0],
        time: matchData.time || '20:00',
        duration: matchData.duration || 90,
        organizer: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          location: user.location,
          sports: user.sports,
          level: user.level,
          rating: user.stats.rating,
          gamesPlayed: user.stats.totalGames,
          isOnline: true,
          lastActive: new Date().toISOString(),
          bio: user.bio,
          preferredTimes: user.preferredTimes
        },
        players: [{
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          location: user.location,
          sports: user.sports,
          level: user.level,
          rating: user.stats.rating,
          gamesPlayed: user.stats.totalGames,
          isOnline: true,
          lastActive: new Date().toISOString(),
          bio: user.bio,
          preferredTimes: user.preferredTimes
        }],
        maxPlayers: matchData.maxPlayers || 10,
        minPlayers: matchData.minPlayers || 6,
        level: matchData.level || 'intermediate',
        price: matchData.price,
        description: matchData.description,
        status: 'open',
        isPrivate: matchData.isPrivate || false,
        createdAt: new Date().toISOString()
      };

      setSocialState(prev => ({
        ...prev,
        matches: [newMatch, ...prev.matches]
      }));

      return newMatch.id;
    } catch (error) {
      console.error('Error creating match:', error);
      return null;
    }
  };

  const joinMatch = async (matchId: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Call real API
      try {
        await apiClient.joinMatch(matchId);
        await loadMatches(); // Refresh matches list
        return true;
      } catch (apiError) {
        console.error('API joinMatch failed, using local fallback:', apiError);
      }
      
      // Fallback to local update
      
      const userPlayer: Player = {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        location: user.location,
        sports: user.sports,
        level: user.level,
        rating: user.stats.rating,
        gamesPlayed: user.stats.totalGames,
        isOnline: true,
        lastActive: new Date().toISOString(),
        bio: user.bio,
        preferredTimes: user.preferredTimes
      };

      setSocialState(prev => ({
        ...prev,
        matches: prev.matches.map(match => {
          if (match.id === matchId && match.players.length < match.maxPlayers) {
            const updatedMatch = {
              ...match,
              players: [...match.players, userPlayer]
            };
            
            // Update status if match is full
            if (updatedMatch.players.length >= updatedMatch.maxPlayers) {
              updatedMatch.status = 'full' as const;
            }
            
            return updatedMatch;
          }
          return match;
        })
      }));

      return true;
    } catch (error) {
      console.error('Error joining match:', error);
      return false;
    }
  };

  const leaveMatch = async (matchId: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Call real API
      try {
        await apiClient.leaveMatch(matchId);
        await loadMatches(); // Refresh matches list
        return true;
      } catch (apiError) {
        console.error('API leaveMatch failed, using local fallback:', apiError);
      }
      
      // Fallback to local update
      
      setSocialState(prev => ({
        ...prev,
        matches: prev.matches.map(match => {
          if (match.id === matchId) {
            const updatedMatch = {
              ...match,
              players: match.players.filter(p => p.id !== user.id)
            };
            
            // Update status if match is no longer full
            if (updatedMatch.status === 'full' && updatedMatch.players.length < updatedMatch.maxPlayers) {
              updatedMatch.status = 'open' as const;
            }
            
            return updatedMatch;
          }
          return match;
        })
      }));

      return true;
    } catch (error) {
      console.error('Error leaving match:', error);
      return false;
    }
  };

  const createTeam = async (teamData: Partial<Team>): Promise<string | null> => {
    try {
      if (!user) return null;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTeam: Team = {
        id: Date.now().toString(),
        name: teamData.name || 'Nuevo equipo',
        sport: teamData.sport || 'futbol5',
        captain: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          location: user.location,
          sports: user.sports,
          level: user.level,
          rating: user.stats.rating,
          gamesPlayed: user.stats.totalGames,
          isOnline: true,
          lastActive: new Date().toISOString(),
          bio: user.bio,
          preferredTimes: user.preferredTimes
        },
        members: [{
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          location: user.location,
          sports: user.sports,
          level: user.level,
          rating: user.stats.rating,
          gamesPlayed: user.stats.totalGames,
          isOnline: true,
          lastActive: new Date().toISOString(),
          bio: user.bio,
          preferredTimes: user.preferredTimes
        }],
        maxMembers: teamData.maxMembers || 15,
        level: teamData.level || 'intermediate',
        location: teamData.location || user.location,
        description: teamData.description,
        avatar: teamData.avatar,
        isPrivate: teamData.isPrivate || false,
        createdAt: new Date().toISOString(),
        stats: {
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0
        }
      };

      setSocialState(prev => ({
        ...prev,
        teams: [newTeam, ...prev.teams]
      }));

      return newTeam.id;
    } catch (error) {
      console.error('Error creating team:', error);
      return null;
    }
  };

  const joinTeam = async (teamId: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userPlayer: Player = {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        location: user.location,
        sports: user.sports,
        level: user.level,
        rating: user.stats.rating,
        gamesPlayed: user.stats.totalGames,
        isOnline: true,
        lastActive: new Date().toISOString(),
        bio: user.bio,
        preferredTimes: user.preferredTimes
      };

      setSocialState(prev => ({
        ...prev,
        teams: prev.teams.map(team => {
          if (team.id === teamId && team.members.length < team.maxMembers) {
            return {
              ...team,
              members: [...team.members, userPlayer]
            };
          }
          return team;
        })
      }));

      return true;
    } catch (error) {
      console.error('Error joining team:', error);
      return false;
    }
  };

  const leaveTeam = async (teamId: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSocialState(prev => ({
        ...prev,
        teams: prev.teams.map(team => {
          if (team.id === teamId) {
            return {
              ...team,
              members: team.members.filter(m => m.id !== user.id)
            };
          }
          return team;
        })
      }));

      return true;
    } catch (error) {
      console.error('Error leaving team:', error);
      return false;
    }
  };

  const value: SocialContextType = {
    ...socialState,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchPlayers,
    createMatch,
    joinMatch,
    leaveMatch,
    createTeam,
    joinTeam,
    leaveTeam
  };

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
};
