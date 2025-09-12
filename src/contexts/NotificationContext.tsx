'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification, ActivityFeedItem, NotificationPreferences } from '@/types/notifications';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  activityFeed: ActivityFeedItem[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  
  // Notification functions
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  
  // Activity functions
  createActivity: (activity: Omit<ActivityFeedItem, 'id' | 'createdAt'>) => Promise<string | null>;
  likeActivity: (activityId: string) => Promise<boolean>;
  commentOnActivity: (activityId: string, content: string) => Promise<boolean>;
  
  // Preferences
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<boolean>;
  
  // Real-time updates
  refreshNotifications: () => Promise<void>;
  refreshActivityFeed: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'friend_request',
    title: 'Nueva solicitud de amistad',
    message: 'María González te ha enviado una solicitud de amistad',
    userId: '1',
    fromUserId: '2',
    fromUser: {
      id: '2',
      name: 'María González',
      avatar: '/api/placeholder/150/150'
    },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    priority: 'medium',
    actionUrl: '/amigos'
  },
  {
    id: '2',
    type: 'match_invite',
    title: 'Invitación a partido',
    message: 'Carlos te ha invitado a un partido de fútbol 5 mañana a las 20:00',
    userId: '1',
    fromUserId: '3',
    fromUser: {
      id: '3',
      name: 'Carlos Rodríguez',
      avatar: '/api/placeholder/150/150'
    },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    priority: 'high',
    actionUrl: '/buscar-jugadores'
  },
  {
    id: '3',
    type: 'match_reminder',
    title: 'Recordatorio de partido',
    message: 'Tu partido de paddle es en 1 hora en Paddle Center Norte',
    userId: '1',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    priority: 'high'
  }
];

const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: '1',
    type: 'match_created',
    userId: '2',
    user: {
      id: '2',
      name: 'María González',
      avatar: '/api/placeholder/150/150'
    },
    targetId: 'match1',
    targetName: 'Paddle - Sábado mañana',
    targetType: 'match',
    description: 'creó un nuevo partido de paddle para el sábado',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    isVisible: true,
    reactions: {
      likes: ['1', '3'],
      comments: [
        {
          id: '1',
          userId: '3',
          user: {
            id: '3',
            name: 'Carlos Rodríguez',
            avatar: '/api/placeholder/150/150'
          },
          content: '¡Me apunto!',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        }
      ]
    }
  },
  {
    id: '2',
    type: 'team_joined',
    userId: '4',
    user: {
      id: '4',
      name: 'Ana Martínez',
      avatar: '/api/placeholder/150/150'
    },
    targetId: 'team1',
    targetName: 'Los Tigres FC',
    targetType: 'team',
    description: 'se unió al equipo Los Tigres FC',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isVisible: true,
    reactions: {
      likes: ['1', '2'],
      comments: []
    }
  },
  {
    id: '3',
    type: 'match_completed',
    userId: '3',
    user: {
      id: '3',
      name: 'Carlos Rodríguez',
      avatar: '/api/placeholder/150/150'
    },
    targetId: 'match2',
    targetName: 'Fútbol 5 - Miércoles',
    targetType: 'match',
    description: 'completó un partido de fútbol 5',
    metadata: { score: '5-3', result: 'win' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    isVisible: true,
    reactions: {
      likes: ['1', '2', '4'],
      comments: []
    }
  }
];

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    friendRequests: true,
    matchInvites: true,
    teamInvites: true,
    matchReminders: true,
    friendActivity: true,
    matchUpdates: true,
    teamUpdates: true,
    venueRecommendations: false,
    emailNotifications: true,
    pushNotifications: true,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load user notifications and activity feed
      setNotifications(mockNotifications.filter(n => n.userId === user.id));
      setActivityFeed(mockActivityFeed);
    }
  }, [user, isAuthenticated]);

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  const deleteNotification = async (notificationId: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  };

  const createActivity = async (activity: Omit<ActivityFeedItem, 'id' | 'createdAt'>): Promise<string | null> => {
    try {
      if (!user) return null;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newActivity: ActivityFeedItem = {
        ...activity,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        reactions: {
          likes: [],
          comments: []
        }
      };
      
      setActivityFeed(prev => [newActivity, ...prev]);
      
      return newActivity.id;
    } catch (error) {
      console.error('Error creating activity:', error);
      return null;
    }
  };

  const likeActivity = async (activityId: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setActivityFeed(prev => 
        prev.map(activity => {
          if (activity.id === activityId) {
            const likes = activity.reactions?.likes || [];
            const hasLiked = likes.includes(user.id);
            
            return {
              ...activity,
              reactions: {
                ...activity.reactions,
                likes: hasLiked 
                  ? likes.filter(id => id !== user.id)
                  : [...likes, user.id],
                comments: activity.reactions?.comments || []
              }
            };
          }
          return activity;
        })
      );
      
      return true;
    } catch (error) {
      console.error('Error liking activity:', error);
      return false;
    }
  };

  const commentOnActivity = async (activityId: string, content: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newComment = {
        id: Date.now().toString(),
        userId: user.id,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        content,
        createdAt: new Date().toISOString()
      };
      
      setActivityFeed(prev => 
        prev.map(activity => {
          if (activity.id === activityId) {
            return {
              ...activity,
              reactions: {
                ...activity.reactions,
                likes: activity.reactions?.likes || [],
                comments: [...(activity.reactions?.comments || []), newComment]
              }
            };
          }
          return activity;
        })
      );
      
      return true;
    } catch (error) {
      console.error('Error commenting on activity:', error);
      return false;
    }
  };

  const updatePreferences = async (prefs: Partial<NotificationPreferences>): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPreferences(prev => ({ ...prev, ...prefs }));
      
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  };

  const refreshNotifications = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        setNotifications(mockNotifications.filter(n => n.userId === user.id));
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshActivityFeed = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setActivityFeed(mockActivityFeed);
    } catch (error) {
      console.error('Error refreshing activity feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: NotificationContextType = {
    notifications,
    activityFeed,
    unreadCount,
    preferences,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createActivity,
    likeActivity,
    commentOnActivity,
    updatePreferences,
    refreshNotifications,
    refreshActivityFeed
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
