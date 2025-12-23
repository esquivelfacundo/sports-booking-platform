'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlayerRating, PlayerStats, RatingFilters, RatingForm } from '@/types/ratings';
import { useAuth } from './AuthContext';

interface RatingContextType {
  ratings: PlayerRating[];
  playerStats: { [playerId: string]: PlayerStats };
  isLoading: boolean;
  
  // Rating functions
  submitRating: (toUserId: string, ratingData: RatingForm, matchId?: string) => Promise<string | null>;
  updateRating: (ratingId: string, ratingData: Partial<RatingForm>) => Promise<boolean>;
  deleteRating: (ratingId: string) => Promise<boolean>;
  
  // Stats functions
  getPlayerStats: (playerId: string, filters?: RatingFilters) => Promise<PlayerStats | null>;
  getPlayerRatings: (playerId: string, filters?: RatingFilters) => Promise<PlayerRating[]>;
  
  // Utility functions
  canRatePlayer: (playerId: string, matchId?: string) => boolean;
  hasRatedPlayer: (playerId: string, matchId?: string) => boolean;
}

const RatingContext = createContext<RatingContextType | undefined>(undefined);

export const useRatings = () => {
  const context = useContext(RatingContext);
  if (context === undefined) {
    throw new Error('useRatings must be used within a RatingProvider');
  }
  return context;
};

// Mock data
const mockRatings: PlayerRating[] = [
  {
    id: '1',
    fromUserId: '1',
    toUserId: '2',
    fromUser: {
      id: '1',
      name: 'Juan Pérez',
      avatar: '/api/placeholder/150/150'
    },
    toUser: {
      id: '2',
      name: 'María González',
      avatar: '/api/placeholder/150/150'
    },
    matchId: 'match1',
    match: {
      id: 'match1',
      title: 'Padel - Sábado mañana',
      sport: 'paddle',
      date: '2024-01-20'
    },
    rating: 5,
    review: 'Excelente jugadora, muy buena técnica y gran compañera de equipo.',
    categories: {
      skill: 5,
      sportsmanship: 5,
      punctuality: 4,
      communication: 5
    },
    isAnonymous: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: '2',
    fromUserId: '3',
    toUserId: '2',
    fromUser: {
      id: '3',
      name: 'Carlos Rodríguez',
      avatar: '/api/placeholder/150/150'
    },
    toUser: {
      id: '2',
      name: 'María González',
      avatar: '/api/placeholder/150/150'
    },
    matchId: 'match2',
    match: {
      id: 'match2',
      title: 'Fútbol 5 - Miércoles',
      sport: 'futbol5',
      date: '2024-01-17'
    },
    rating: 4,
    review: 'Buena jugadora, siempre puntual y con buena actitud.',
    categories: {
      skill: 4,
      sportsmanship: 5,
      punctuality: 5,
      communication: 4
    },
    isAnonymous: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  }
];

interface RatingProviderProps {
  children: ReactNode;
}

export const RatingProvider: React.FC<RatingProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [ratings, setRatings] = useState<PlayerRating[]>([]);
  const [playerStats, setPlayerStats] = useState<{ [playerId: string]: PlayerStats }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load ratings data
      setRatings(mockRatings);
      
      // Calculate player stats
      const stats = calculatePlayerStats(mockRatings);
      setPlayerStats(stats);
    }
  }, [user, isAuthenticated]);

  const calculatePlayerStats = (ratingsData: PlayerRating[]): { [playerId: string]: PlayerStats } => {
    const statsMap: { [playerId: string]: PlayerStats } = {};

    // Group ratings by player
    const ratingsByPlayer: { [playerId: string]: PlayerRating[] } = {};
    ratingsData.forEach(rating => {
      if (!ratingsByPlayer[rating.toUserId]) {
        ratingsByPlayer[rating.toUserId] = [];
      }
      ratingsByPlayer[rating.toUserId].push(rating);
    });

    // Calculate stats for each player
    Object.entries(ratingsByPlayer).forEach(([playerId, playerRatings]) => {
      const totalRatings = playerRatings.length;
      const averageRating = playerRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
      
      const categoryAverages = {
        skill: playerRatings.reduce((sum, r) => sum + r.categories.skill, 0) / totalRatings,
        sportsmanship: playerRatings.reduce((sum, r) => sum + r.categories.sportsmanship, 0) / totalRatings,
        punctuality: playerRatings.reduce((sum, r) => sum + r.categories.punctuality, 0) / totalRatings,
        communication: playerRatings.reduce((sum, r) => sum + r.categories.communication, 0) / totalRatings
      };

      const ratingDistribution = {
        5: playerRatings.filter(r => r.rating === 5).length,
        4: playerRatings.filter(r => r.rating === 4).length,
        3: playerRatings.filter(r => r.rating === 3).length,
        2: playerRatings.filter(r => r.rating === 2).length,
        1: playerRatings.filter(r => r.rating === 1).length
      };

      statsMap[playerId] = {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        categoryAverages: {
          skill: Math.round(categoryAverages.skill * 10) / 10,
          sportsmanship: Math.round(categoryAverages.sportsmanship * 10) / 10,
          punctuality: Math.round(categoryAverages.punctuality * 10) / 10,
          communication: Math.round(categoryAverages.communication * 10) / 10
        },
        ratingDistribution,
        recentRatings: playerRatings.slice(0, 5)
      };
    });

    return statsMap;
  };

  const submitRating = async (toUserId: string, ratingData: RatingForm, matchId?: string): Promise<string | null> => {
    try {
      if (!user) return null;
      
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRating: PlayerRating = {
        id: Date.now().toString(),
        fromUserId: user.id,
        toUserId,
        fromUser: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        toUser: {
          id: toUserId,
          name: 'Player Name', // Would be fetched from API
          avatar: '/api/placeholder/150/150'
        },
        matchId,
        rating: ratingData.rating,
        review: ratingData.review,
        categories: ratingData.categories,
        isAnonymous: ratingData.isAnonymous,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setRatings(prev => [newRating, ...prev]);
      
      // Recalculate stats
      const updatedStats = calculatePlayerStats([newRating, ...ratings]);
      setPlayerStats(updatedStats);
      
      return newRating.id;
    } catch (error) {
      console.error('Error submitting rating:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRating = async (ratingId: string, ratingData: Partial<RatingForm>): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRatings(prev => 
        prev.map(rating => 
          rating.id === ratingId 
            ? { 
                ...rating, 
                ...ratingData,
                updatedAt: new Date().toISOString()
              }
            : rating
        )
      );
      
      // Recalculate stats
      const updatedStats = calculatePlayerStats(ratings);
      setPlayerStats(updatedStats);
      
      return true;
    } catch (error) {
      console.error('Error updating rating:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRating = async (ratingId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRatings(prev => prev.filter(rating => rating.id !== ratingId));
      
      // Recalculate stats
      const updatedRatings = ratings.filter(r => r.id !== ratingId);
      const updatedStats = calculatePlayerStats(updatedRatings);
      setPlayerStats(updatedStats);
      
      return true;
    } catch (error) {
      console.error('Error deleting rating:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getPlayerStats = async (playerId: string, filters?: RatingFilters): Promise<PlayerStats | null> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let playerRatings = ratings.filter(r => r.toUserId === playerId);
      
      // Apply filters
      if (filters) {
        if (filters.sport) {
          playerRatings = playerRatings.filter(r => r.match?.sport === filters.sport);
        }
        if (filters.minRating) {
          playerRatings = playerRatings.filter(r => r.rating >= filters.minRating!);
        }
        if (filters.maxRating) {
          playerRatings = playerRatings.filter(r => r.rating <= filters.maxRating!);
        }
        if (filters.hasReview !== undefined) {
          playerRatings = playerRatings.filter(r => filters.hasReview ? !!r.review : !r.review);
        }
      }
      
      if (playerRatings.length === 0) return null;
      
      const stats = calculatePlayerStats(playerRatings);
      return stats[playerId] || null;
    } catch (error) {
      console.error('Error getting player stats:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPlayerRatings = async (playerId: string, filters?: RatingFilters): Promise<PlayerRating[]> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let playerRatings = ratings.filter(r => r.toUserId === playerId);
      
      // Apply filters
      if (filters) {
        if (filters.sport) {
          playerRatings = playerRatings.filter(r => r.match?.sport === filters.sport);
        }
        if (filters.minRating) {
          playerRatings = playerRatings.filter(r => r.rating >= filters.minRating!);
        }
        if (filters.maxRating) {
          playerRatings = playerRatings.filter(r => r.rating <= filters.maxRating!);
        }
        if (filters.hasReview !== undefined) {
          playerRatings = playerRatings.filter(r => filters.hasReview ? !!r.review : !r.review);
        }
      }
      
      return playerRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error getting player ratings:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const canRatePlayer = (playerId: string, matchId?: string): boolean => {
    if (!user || playerId === user.id) return false;
    
    // Check if already rated this player for this match
    if (matchId) {
      const existingRating = ratings.find(r => 
        r.fromUserId === user.id && 
        r.toUserId === playerId && 
        r.matchId === matchId
      );
      return !existingRating;
    }
    
    return true;
  };

  const hasRatedPlayer = (playerId: string, matchId?: string): boolean => {
    if (!user) return false;
    
    if (matchId) {
      return ratings.some(r => 
        r.fromUserId === user.id && 
        r.toUserId === playerId && 
        r.matchId === matchId
      );
    }
    
    return ratings.some(r => 
      r.fromUserId === user.id && 
      r.toUserId === playerId
    );
  };

  const value: RatingContextType = {
    ratings,
    playerStats,
    isLoading,
    submitRating,
    updateRating,
    deleteRating,
    getPlayerStats,
    getPlayerRatings,
    canRatePlayer,
    hasRatedPlayer
  };

  return <RatingContext.Provider value={value}>{children}</RatingContext.Provider>;
};
