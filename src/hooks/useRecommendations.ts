'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { 
  PersonalizedRecommendations, 
  UserPreferences, 
  UserBehavior,
  MatchRecommendation,
  VenueRecommendation,
  PlayerRecommendation,
  TeamRecommendation,
  RecommendationScore,
  RecommendationFilters
} from '@/types/recommendations';

export const useRecommendations = () => {
  const { user } = useAuth();
  const { matches, nearbyPlayers, teams } = useSocial();
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Mock venues data for recommendations
  const mockVenues = [
    {
      id: '1',
      name: 'Club Deportivo Central',
      location: 'Palermo, Buenos Aires',
      sports: ['futbol5', 'paddle'],
      rating: 4.5,
      priceRange: { min: 800, max: 1200 },
      distance: 2.5
    },
    {
      id: '2',
      name: 'Padel Center Norte',
      location: 'Belgrano, Buenos Aires',
      sports: ['paddle', 'tenis'],
      rating: 4.7,
      priceRange: { min: 600, max: 900 },
      distance: 4.2
    }
  ];

  // Calculate recommendation score based on multiple factors
  const calculateScore = useCallback((
    item: any,
    type: 'match' | 'venue' | 'player' | 'team',
    userPrefs: UserPreferences,
    userBehavior: UserBehavior
  ): RecommendationScore => {
    let score = 0;
    const reasons: string[] = [];
    let maxScore = 100;

    switch (type) {
      case 'match':
        // Sport preference (25 points)
        if (userPrefs.sports.includes(item.sport)) {
          score += 25;
          reasons.push(`Coincide con tu deporte favorito: ${item.sport}`);
        }

        // Skill level match (20 points)
        if (item.level === userPrefs.skillLevel || item.level === 'mixed') {
          score += 20;
          reasons.push(`Nivel apropiado: ${item.level}`);
        }

        // Time preference (20 points)
        if (userPrefs.preferredTimes.includes(item.time)) {
          score += 20;
          reasons.push(`Horario preferido: ${item.time}`);
        }

        // Price range (15 points)
        if (item.price && item.price >= userPrefs.priceRange.min && item.price <= userPrefs.priceRange.max) {
          score += 15;
          reasons.push('Dentro de tu rango de precio');
        }

        // Friend activity (20 points)
        const friendsInMatch = item.players?.filter((p: any) => 
          userBehavior.friendInteractions.includes(p.id)
        ).length || 0;
        if (friendsInMatch > 0) {
          score += 20;
          reasons.push(`${friendsInMatch} amigo(s) participando`);
        }
        break;

      case 'venue':
        // Sport availability (30 points)
        const commonSports = item.sports?.filter((s: string) => userPrefs.sports.includes(s)).length || 0;
        if (commonSports > 0) {
          score += 30;
          reasons.push(`Ofrece ${commonSports} de tus deportes favoritos`);
        }

        // Distance (25 points)
        if (item.distance <= userPrefs.maxDistance) {
          const distanceScore = Math.max(0, 25 - (item.distance / userPrefs.maxDistance) * 25);
          score += distanceScore;
          reasons.push(`A ${item.distance}km de distancia`);
        }

        // Price range (20 points)
        if (item.priceRange && 
            item.priceRange.min <= userPrefs.priceRange.max && 
            item.priceRange.max >= userPrefs.priceRange.min) {
          score += 20;
          reasons.push('Precios compatibles');
        }

        // Rating (15 points)
        if (item.rating >= 4.0) {
          score += 15;
          reasons.push(`Excelente rating: ${item.rating}/5`);
        }

        // Previous visits (10 points)
        if (userBehavior.favoriteVenues.includes(item.id)) {
          score += 10;
          reasons.push('Has visitado antes');
        }
        break;

      case 'player':
        // Skill level compatibility (25 points)
        const skillDiff = Math.abs(
          ['beginner', 'intermediate', 'advanced'].indexOf(item.level) -
          ['beginner', 'intermediate', 'advanced'].indexOf(userPrefs.skillLevel)
        );
        if (skillDiff <= 1) {
          score += 25 - (skillDiff * 5);
          reasons.push(`Nivel similar: ${item.level}`);
        }

        // Common sports (30 points)
        const playerSports = item.sports?.map((s: any) => s.sport) || [];
        const commonPlayerSports = playerSports.filter((s: string) => userPrefs.sports.includes(s)).length;
        if (commonPlayerSports > 0) {
          score += Math.min(30, commonPlayerSports * 10);
          reasons.push(`${commonPlayerSports} deporte(s) en común`);
        }

        // Location proximity (20 points)
        if (item.location && userBehavior.locationHistory.includes(item.location)) {
          score += 20;
          reasons.push('Ubicación familiar');
        }

        // Activity level (15 points)
        if (item.gamesPlayed > 10) {
          score += 15;
          reasons.push(`Jugador activo: ${item.gamesPlayed} partidos`);
        }

        // Rating (10 points)
        if (item.rating >= 4.0) {
          score += 10;
          reasons.push(`Buen rating: ${item.rating}/5`);
        }
        break;

      case 'team':
        // Sport match (35 points)
        if (userPrefs.sports.includes(item.sport)) {
          score += 35;
          reasons.push(`Tu deporte favorito: ${item.sport}`);
        }

        // Skill level (25 points)
        if (item.level === userPrefs.skillLevel || item.level === 'mixed') {
          score += 25;
          reasons.push(`Nivel apropiado: ${item.level}`);
        }

        // Location (20 points)
        if (userBehavior.locationHistory.includes(item.location)) {
          score += 20;
          reasons.push('Ubicación conveniente');
        }

        // Team activity (10 points)
        if (item.stats?.gamesPlayed > 5) {
          score += 10;
          reasons.push(`Equipo activo: ${item.stats.gamesPlayed} partidos`);
        }

        // Available spots (10 points)
        if (item.members.length < item.maxMembers) {
          score += 10;
          reasons.push('Tiene cupos disponibles');
        }
        break;
    }

    // Normalize score to 0-100
    score = Math.min(100, Math.max(0, score));

    // Determine confidence level
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (score >= 70) confidence = 'high';
    else if (score >= 40) confidence = 'medium';

    return { score, reasons, confidence };
  }, []);

  // Get user preferences from profile
  const getUserPreferences = useCallback((): UserPreferences => {
    if (!user) {
      return {
        sports: ['futbol5'],
        preferredTimes: ['19:00', '20:00'],
        preferredDays: ['monday', 'wednesday', 'friday'],
        maxDistance: 10,
        priceRange: { min: 500, max: 1500 },
        skillLevel: 'intermediate',
        socialPreference: 'mixed'
      };
    }

    return {
      sports: user.sports?.map(s => s.sport) || ['futbol5'],
      preferredTimes: user.preferredTimes || ['19:00', '20:00'],
      preferredDays: ['monday', 'wednesday', 'friday'], // Could be extracted from user data
      maxDistance: 15, // Default 15km
      priceRange: { min: 500, max: 1500 }, // Could be from user preferences
      skillLevel: user.level,
      socialPreference: 'mixed'
    };
  }, [user]);

  // Get user behavior patterns
  const getUserBehavior = useCallback((): UserBehavior => {
    if (!user) {
      return {
        recentSearches: [],
        favoriteVenues: [],
        joinedMatches: [],
        createdMatches: [],
        friendInteractions: [],
        locationHistory: [],
        timePreferences: {},
        sportFrequency: {}
      };
    }

    return {
      recentSearches: [], // Could be tracked
      favoriteVenues: user.favoriteVenues || [],
      joinedMatches: [], // Could be tracked from social context
      createdMatches: [], // Could be tracked from social context
      friendInteractions: user.friends || [],
      locationHistory: [user.location], // Could include more locations
      timePreferences: user.preferredTimes?.reduce((acc, time) => ({
        ...acc,
        [time]: 1
      }), {}) || {},
      sportFrequency: user.sports?.reduce((acc, sport) => ({
        ...acc,
        [sport.sport]: sport.yearsPlaying
      }), {}) || {}
    };
  }, [user]);

  // Generate recommendations
  const generateRecommendations = useCallback(async (filters?: RecommendationFilters): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userPrefs = getUserPreferences();
      const userBehavior = getUserBehavior();

      // Generate match recommendations
      const matchRecommendations: MatchRecommendation[] = matches
        .filter(match => !filters?.sport || match.sport === filters.sport)
        .map(match => ({
          matchId: match.id,
          match,
          score: calculateScore(match, 'match', userPrefs, userBehavior),
          recommendationType: 'skill_match' as const
        }))
        .sort((a, b) => b.score.score - a.score.score)
        .slice(0, 10);

      // Generate venue recommendations
      const venueRecommendations: VenueRecommendation[] = mockVenues
        .filter(venue => !filters?.sport || venue.sports.includes(filters.sport))
        .map(venue => ({
          venueId: venue.id,
          venue,
          score: calculateScore(venue, 'venue', userPrefs, userBehavior),
          recommendationType: 'location_based' as const
        }))
        .sort((a, b) => b.score.score - a.score.score)
        .slice(0, 8);

      // Generate player recommendations
      const playerRecommendations: PlayerRecommendation[] = nearbyPlayers
        .filter(player => player.id !== user.id)
        .filter(player => !filters?.sport || player.sports.some(s => s.sport === filters.sport))
        .map(player => ({
          playerId: player.id,
          player,
          score: calculateScore(player, 'player', userPrefs, userBehavior),
          recommendationType: 'skill_match' as const
        }))
        .sort((a, b) => b.score.score - a.score.score)
        .slice(0, 12);

      // Generate team recommendations
      const teamRecommendations: TeamRecommendation[] = teams
        .filter(team => !team.members.some(member => member.id === user.id))
        .filter(team => !filters?.sport || team.sport === filters.sport)
        .map(team => ({
          teamId: team.id,
          team,
          score: calculateScore(team, 'team', userPrefs, userBehavior),
          recommendationType: 'sport_match' as const
        }))
        .sort((a, b) => b.score.score - a.score.score)
        .slice(0, 6);

      const newRecommendations: PersonalizedRecommendations = {
        matches: matchRecommendations,
        venues: venueRecommendations,
        players: playerRecommendations,
        teams: teamRecommendations,
        lastUpdated: new Date().toISOString(),
        nextUpdateIn: 60 // 1 hour
      };

      setRecommendations(newRecommendations);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, matches, nearbyPlayers, teams, getUserPreferences, getUserBehavior, calculateScore]);

  // Auto-generate recommendations on mount and when dependencies change
  useEffect(() => {
    if (user && matches.length > 0) {
      generateRecommendations();
    }
  }, [user, matches.length, generateRecommendations]);

  // Refresh recommendations periodically
  useEffect(() => {
    if (!lastUpdate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeDiff = now.getTime() - lastUpdate.getTime();
      const hoursPassed = timeDiff / (1000 * 60 * 60);

      if (hoursPassed >= 1) {
        generateRecommendations();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastUpdate, generateRecommendations]);

  return {
    recommendations,
    isLoading,
    lastUpdate,
    generateRecommendations,
    refreshRecommendations: () => generateRecommendations()
  };
};
