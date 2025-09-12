export interface UserPreferences {
  sports: string[];
  preferredTimes: string[];
  preferredDays: string[];
  maxDistance: number; // in km
  priceRange: {
    min: number;
    max: number;
  };
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  socialPreference: 'competitive' | 'casual' | 'mixed';
}

export interface UserBehavior {
  recentSearches: string[];
  favoriteVenues: string[];
  joinedMatches: string[];
  createdMatches: string[];
  friendInteractions: string[];
  locationHistory: string[];
  timePreferences: { [key: string]: number }; // time -> frequency
  sportFrequency: { [key: string]: number }; // sport -> frequency
}

export interface RecommendationScore {
  score: number;
  reasons: string[];
  confidence: 'low' | 'medium' | 'high';
}

export interface MatchRecommendation {
  matchId: string;
  match: any; // Match type from social.ts
  score: RecommendationScore;
  recommendationType: 'skill_match' | 'location_based' | 'friend_activity' | 'time_preference' | 'sport_preference';
}

export interface VenueRecommendation {
  venueId: string;
  venue: any; // Facility type
  score: RecommendationScore;
  recommendationType: 'location_based' | 'price_match' | 'sport_availability' | 'friend_activity' | 'rating_based';
}

export interface PlayerRecommendation {
  playerId: string;
  player: any; // Player type from social.ts
  score: RecommendationScore;
  recommendationType: 'skill_match' | 'location_proximity' | 'mutual_friends' | 'similar_interests' | 'activity_overlap';
}

export interface TeamRecommendation {
  teamId: string;
  team: any; // Team type from social.ts
  score: RecommendationScore;
  recommendationType: 'skill_match' | 'location_proximity' | 'sport_match' | 'activity_level' | 'friend_connections';
}

export interface PersonalizedRecommendations {
  matches: MatchRecommendation[];
  venues: VenueRecommendation[];
  players: PlayerRecommendation[];
  teams: TeamRecommendation[];
  lastUpdated: string;
  nextUpdateIn: number; // minutes
}

export interface RecommendationFilters {
  sport?: string;
  timeFrame?: 'today' | 'this_week' | 'this_month';
  maxDistance?: number;
  skillLevel?: string;
  priceRange?: { min: number; max: number };
  includeTypes?: ('matches' | 'venues' | 'players' | 'teams')[];
}
