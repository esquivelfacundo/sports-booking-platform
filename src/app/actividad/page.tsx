'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Bell, 
  Heart, 
  MessageCircle, 
  Users, 
  Calendar, 
  Trophy,
  MapPin,
  Clock,
  Filter,
  RefreshCw,
  Settings,
  X
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
// Using native JavaScript date formatting instead of date-fns

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'hace un momento';
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
  return `hace ${Math.floor(diffInSeconds / 2592000)} meses`;
};

const ActivityPage = () => {
  const { 
    notifications, 
    activityFeed, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    likeActivity,
    commentOnActivity,
    refreshNotifications,
    refreshActivityFeed,
    isLoading
  } = useNotifications();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'notifications'>('feed');
  const [showCommentInput, setShowCommentInput] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match_created': return <Calendar className="h-5 w-5 text-emerald-400" />;
      case 'match_joined': return <Users className="h-5 w-5 text-blue-400" />;
      case 'match_completed': return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 'team_created': return <Users className="h-5 w-5 text-purple-400" />;
      case 'team_joined': return <Users className="h-5 w-5 text-cyan-400" />;
      case 'friend_added': return <Heart className="h-5 w-5 text-pink-400" />;
      case 'venue_liked': return <MapPin className="h-5 w-5 text-orange-400" />;
      default: return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return <Users className="h-5 w-5 text-blue-400" />;
      case 'match_invite': return <Calendar className="h-5 w-5 text-emerald-400" />;
      case 'team_invite': return <Users className="h-5 w-5 text-purple-400" />;
      case 'match_reminder': return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'friend_activity': return <Heart className="h-5 w-5 text-pink-400" />;
      default: return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleLike = async (activityId: string) => {
    await likeActivity(activityId);
  };

  const handleComment = async (activityId: string) => {
    if (!commentText.trim()) return;
    
    await commentOnActivity(activityId, commentText);
    setCommentText('');
    setShowCommentInput(null);
  };

  const filteredActivities = activityFeed.filter(activity => {
    if (filterType === 'all') return true;
    return activity.type === filterType;
  });

  const filteredNotifications = notifications.filter(notification => {
    if (filterType === 'all') return true;
    return notification.type === filterType;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Inicia sesión para ver tu actividad</h2>
          <p className="text-gray-500">Necesitas una cuenta para ver notificaciones y actividad social</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center space-x-3">
                <Activity className="h-8 w-8 text-emerald-400" />
                <span>Actividad Social</span>
              </h1>
              <p className="text-gray-400 mt-1">Mantente al día con tu comunidad deportiva</p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Marcar todo como leído
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={activeTab === 'feed' ? refreshActivityFeed : refreshNotifications}
                disabled={isLoading}
                className="bg-gray-700 text-white p-2 rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl mb-8">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'feed'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="h-5 w-5" />
            <span>Feed de Actividad</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all relative ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bell className="h-5 w-5" />
            <span>Notificaciones</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas las actividades</option>
              {activeTab === 'feed' ? (
                <>
                  <option value="match_created">Partidos creados</option>
                  <option value="match_joined">Partidos unidos</option>
                  <option value="match_completed">Partidos completados</option>
                  <option value="team_created">Equipos creados</option>
                  <option value="team_joined">Equipos unidos</option>
                  <option value="friend_added">Amigos agregados</option>
                </>
              ) : (
                <>
                  <option value="friend_request">Solicitudes de amistad</option>
                  <option value="match_invite">Invitaciones a partidos</option>
                  <option value="team_invite">Invitaciones a equipos</option>
                  <option value="match_reminder">Recordatorios</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'feed' ? (
          <div className="space-y-6">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No hay actividad reciente</h3>
                <p className="text-gray-500">La actividad de tus amigos aparecerá aquí</p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  currentUserId={user.id}
                  onLike={() => handleLike(activity.id)}
                  onComment={() => setShowCommentInput(activity.id)}
                  showCommentInput={showCommentInput === activity.id}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  onSubmitComment={() => handleComment(activity.id)}
                  onCancelComment={() => setShowCommentInput(null)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No hay notificaciones</h3>
                <p className="text-gray-500">Las notificaciones aparecerán aquí</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Activity Card Component
const ActivityCard = ({ 
  activity, 
  currentUserId, 
  onLike, 
  onComment,
  showCommentInput,
  commentText,
  setCommentText,
  onSubmitComment,
  onCancelComment
}: any) => {
  const hasLiked = activity.reactions?.likes?.includes(currentUserId);
  const likesCount = activity.reactions?.likes?.length || 0;
  const commentsCount = activity.reactions?.comments?.length || 0;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match_created': return <Calendar className="h-5 w-5 text-emerald-400" />;
      case 'match_joined': return <Users className="h-5 w-5 text-blue-400" />;
      case 'match_completed': return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 'team_created': return <Users className="h-5 w-5 text-purple-400" />;
      case 'team_joined': return <Users className="h-5 w-5 text-cyan-400" />;
      case 'friend_added': return <Heart className="h-5 w-5 text-pink-400" />;
      case 'venue_liked': return <MapPin className="h-5 w-5 text-orange-400" />;
      default: return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
          {activity.user.avatar ? (
            <img 
              src={activity.user.avatar} 
              alt={activity.user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-medium">
              {activity.user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {getActivityIcon(activity.type)}
            <p className="text-white">
              <span className="font-medium">{activity.user.name}</span>
              <span className="text-gray-300 ml-1">{activity.description}</span>
              {activity.targetName && (
                <span className="text-emerald-400 ml-1 font-medium">{activity.targetName}</span>
              )}
            </p>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">
            <span className="text-sm text-gray-400">{getTimeAgo(activity.createdAt)}</span>
          </p>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <button
              onClick={onLike}
              className={`flex items-center space-x-2 text-sm transition-colors ${
                hasLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>
            
            <button
              onClick={onComment}
              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{commentsCount}</span>
            </button>
          </div>

          {/* Comments */}
          {activity.reactions?.comments?.length > 0 && (
            <div className="mt-4 space-y-3">
              {activity.reactions.comments.map((comment: any) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {comment.user.avatar ? (
                      <img 
                        src={comment.user.avatar} 
                        alt={comment.user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-lg p-3">
                    <p className="text-sm font-medium text-white">{comment.user.name}</p>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {getTimeAgo(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment Input */}
          {showCommentInput && (
            <div className="mt-4 flex items-center space-x-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                onKeyPress={(e) => e.key === 'Enter' && onSubmitComment()}
              />
              <button
                onClick={onSubmitComment}
                disabled={!commentText.trim()}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                Enviar
              </button>
              <button
                onClick={onCancelComment}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Notification Card Component
const NotificationCard = ({ notification, onMarkAsRead, onDelete }: any) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return <Users className="h-5 w-5 text-blue-400" />;
      case 'match_invite': return <Calendar className="h-5 w-5 text-emerald-400" />;
      case 'team_invite': return <Users className="h-5 w-5 text-purple-400" />;
      case 'match_reminder': return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'friend_activity': return <Heart className="h-5 w-5 text-pink-400" />;
      default: return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-gray-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-gray-800 rounded-xl p-4 border border-gray-700 border-l-4 ${getPriorityColor(notification.priority)} ${
        !notification.isRead ? 'bg-gray-800/80' : 'bg-gray-800/40'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-medium ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                {notification.title}
              </h3>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              )}
            </div>
            
            <p className="text-sm text-gray-400 mb-2">{notification.message}</p>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                <span>{getTimeAgo(notification.createdAt)}</span>
              </p>
              
              <div className="flex items-center space-x-2">
                {!notification.isRead && (
                  <button
                    onClick={onMarkAsRead}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Marcar como leído
                  </button>
                )}
                <button
                  onClick={onDelete}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {notification.fromUser && (
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 ml-4">
            {notification.fromUser.avatar ? (
              <img 
                src={notification.fromUser.avatar} 
                alt={notification.fromUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-medium text-sm">
                {notification.fromUser.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityPage;
