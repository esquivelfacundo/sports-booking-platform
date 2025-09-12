export interface PlayerRating {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  toUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  matchId?: string;
  match?: {
    id: string;
    title: string;
    sport: string;
    date: string;
  };
  rating: number; // 1-5 stars
  review?: string;
  categories: {
    skill: number;
    sportsmanship: number;
    punctuality: number;
    communication: number;
  };
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerStats {
  totalRatings: number;
  averageRating: number;
  categoryAverages: {
    skill: number;
    sportsmanship: number;
    punctuality: number;
    communication: number;
  };
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentRatings: PlayerRating[];
}

export interface RatingFilters {
  sport?: string;
  timeframe?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  minRating?: number;
  maxRating?: number;
  hasReview?: boolean;
}

export interface RatingForm {
  rating: number;
  review: string;
  categories: {
    skill: number;
    sportsmanship: number;
    punctuality: number;
    communication: number;
  };
  isAnonymous: boolean;
}
