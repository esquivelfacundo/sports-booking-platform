export interface Notification {
  id: string;
  type: 'friend_request' | 'match_invite' | 'team_invite' | 'match_reminder' | 'friend_activity' | 'match_update' | 'team_update' | 'venue_recommendation';
  title: string;
  message: string;
  data?: any;
  userId: string;
  fromUserId?: string;
  fromUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ActivityFeedItem {
  id: string;
  type: 'match_created' | 'match_joined' | 'match_completed' | 'friend_added' | 'team_created' | 'team_joined' | 'venue_liked' | 'achievement_unlocked';
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  targetId?: string;
  targetName?: string;
  targetType?: 'match' | 'team' | 'venue' | 'user';
  description: string;
  metadata?: any;
  createdAt: string;
  isVisible: boolean;
  reactions?: {
    likes: string[];
    comments: ActivityComment[];
  };
}

export interface ActivityComment {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

export interface NotificationPreferences {
  friendRequests: boolean;
  matchInvites: boolean;
  teamInvites: boolean;
  matchReminders: boolean;
  friendActivity: boolean;
  matchUpdates: boolean;
  teamUpdates: boolean;
  venueRecommendations: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}
