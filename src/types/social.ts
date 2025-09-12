export interface Player {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  sports: PlayerSport[];
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  gamesPlayed: number;
  isOnline: boolean;
  lastActive: string;
  bio?: string;
  preferredTimes: string[];
}

export interface PlayerSport {
  sport: 'futbol5' | 'paddle' | 'tenis' | 'basquet';
  level: 'beginner' | 'intermediate' | 'advanced';
  position?: string;
  yearsPlaying: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: Player;
  toUser: Player;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  message?: string;
}

export interface Match {
  id: string;
  title: string;
  sport: 'futbol5' | 'paddle' | 'tenis' | 'basquet';
  venue: {
    id: string;
    name: string;
    location: string;
  };
  date: string;
  time: string;
  duration: number; // in minutes
  organizer: Player;
  players: Player[];
  maxPlayers: number;
  minPlayers: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  price?: number;
  description?: string;
  status: 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled';
  isPrivate: boolean;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  sport: 'futbol5' | 'paddle' | 'tenis' | 'basquet';
  captain: Player;
  members: Player[];
  maxMembers: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  location: string;
  description?: string;
  avatar?: string;
  isPrivate: boolean;
  createdAt: string;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
  };
}

export interface Activity {
  id: string;
  type: 'match_created' | 'match_joined' | 'friend_added' | 'venue_liked' | 'team_created' | 'match_completed';
  userId: string;
  user: Player;
  data: any;
  createdAt: string;
  isPublic: boolean;
}
