'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Filter, 
  Search, 
  User, 
  Calendar, 
  MessageCircle,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';
import { useRatings } from '@/contexts/RatingContext';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerRating, PlayerStats, RatingFilters } from '@/types/ratings';
// Using native JavaScript date formatting instead of date-fns
import RatingModal from '@/components/RatingModal';

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

const RatingsPage = () => {
  const { ratings, playerStats, getPlayerRatings, getPlayerStats, isLoading } = useRatings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [filters, setFilters] = useState<RatingFilters>({
    sport: undefined,
    timeframe: 'all',
    minRating: undefined,
    hasReview: undefined
  });
  const [searchQuery, setSearchQuery] = useState('');

  const myReceivedRatings = ratings.filter(r => r.toUserId === user?.id);
  const myGivenRatings = ratings.filter(r => r.fromUserId === user?.id);
  const myStats = user ? playerStats[user.id] : null;

  const filteredRatings = (activeTab === 'received' ? myReceivedRatings : myGivenRatings)
    .filter(rating => {
      const matchesSearch = rating.fromUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           rating.toUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           rating.review?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSport = !filters.sport || rating.match?.sport === filters.sport;
      const matchesRating = (!filters.minRating || rating.rating >= filters.minRating);
      const matchesReview = (filters.hasReview === undefined || 
                            (filters.hasReview ? !!rating.review : !rating.review));
      
      return matchesSearch && matchesSport && matchesRating && matchesReview;
    });

  const getStarColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-400';
    if (rating >= 3.5) return 'text-yellow-400';
    if (rating >= 2.5) return 'text-orange-400';
    return 'text-red-400';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Inicia sesión para ver calificaciones</h2>
          <p className="text-gray-500">Necesitas una cuenta para ver y gestionar calificaciones</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center space-x-3">
                <Star className="h-8 w-8 text-emerald-400" />
                <span>Calificaciones</span>
              </h1>
              <p className="text-gray-400 mt-1">Gestiona tus calificaciones y reseñas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {myStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <Star className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{myStats.averageRating}</p>
                  <p className="text-sm text-gray-400">Calificación Promedio</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{myStats.totalRatings}</p>
                  <p className="text-sm text-gray-400">Total Calificaciones</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{myStats.categoryAverages.sportsmanship}</p>
                  <p className="text-sm text-gray-400">Deportividad</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{myStats.categoryAverages.skill}</p>
                  <p className="text-sm text-gray-400">Habilidad</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {myStats && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Desglose por Categorías</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Object.entries(myStats.categoryAverages).map(([category, average]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 capitalize">
                      {category === 'skill' ? 'Habilidad' :
                       category === 'sportsmanship' ? 'Deportividad' :
                       category === 'punctuality' ? 'Puntualidad' : 'Comunicación'}
                    </span>
                    <span className={`text-sm font-medium ${getStarColor(average)}`}>
                      {average}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(average / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl mb-8">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'received'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Star className="h-5 w-5" />
            <span>Recibidas ({myReceivedRatings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('given')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'given'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Enviadas ({myGivenRatings.length})</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por jugador o comentario..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Deporte</label>
              <select
                value={filters.sport || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, sport: e.target.value || undefined }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos los deportes</option>
                <option value="futbol5">Fútbol 5</option>
                <option value="paddle">Padel</option>
                <option value="tenis">Tenis</option>
                <option value="basquet">Básquet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Calificación Mínima</label>
              <select
                value={filters.minRating || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todas</option>
                <option value="5">5 estrellas</option>
                <option value="4">4+ estrellas</option>
                <option value="3">3+ estrellas</option>
                <option value="2">2+ estrellas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Comentarios</label>
              <select
                value={filters.hasReview === undefined ? '' : filters.hasReview.toString()}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  hasReview: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todas</option>
                <option value="true">Con comentario</option>
                <option value="false">Sin comentario</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ratings List */}
        <div className="space-y-4">
          {filteredRatings.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No hay calificaciones {activeTab === 'received' ? 'recibidas' : 'enviadas'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'received' 
                  ? 'Las calificaciones que recibas aparecerán aquí'
                  : 'Las calificaciones que envíes aparecerán aquí'
                }
              </p>
            </div>
          ) : (
            filteredRatings.map((rating) => (
              <RatingCard key={rating.id} rating={rating} currentUserId={user.id} />
            ))
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedPlayer && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedPlayer(null);
          }}
          playerId={selectedPlayer}
          playerName="Player Name"
        />
      )}
    </div>
  );
};

// Rating Card Component
const RatingCard = ({ rating, currentUserId }: { rating: PlayerRating; currentUserId: string }) => {
  const isReceived = rating.toUserId === currentUserId;
  const displayUser = isReceived ? rating.fromUser : rating.toUser;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
          {displayUser.avatar ? (
            <img 
              src={displayUser.avatar} 
              alt={displayUser.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-medium">
              {displayUser.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-white">{displayUser.name}</h3>
              {rating.match && (
                <p className="text-sm text-gray-400 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{rating.match.title}</span>
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= rating.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-white">{rating.rating}</span>
            </div>
          </div>

          {/* Category Ratings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {Object.entries(rating.categories).map(([category, value]) => (
              <div key={category} className="text-center">
                <p className="text-xs text-gray-400 mb-1">
                  {category === 'skill' ? 'Habilidad' :
                   category === 'sportsmanship' ? 'Deportividad' :
                   category === 'punctuality' ? 'Puntualidad' : 'Comunicación'}
                </p>
                <div className="flex items-center justify-center space-x-1">
                  <Star className={`h-4 w-4 ${value > 0 ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                  <span className="text-sm text-white">{value}</span>
                </div>
              </div>
            ))}
          </div>

          {rating.review && (
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-2">
                <MessageCircle className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{rating.review}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              {getTimeAgo(rating.createdAt)}
            </span>
            {rating.isAnonymous && (
              <span className="bg-gray-700 px-2 py-1 rounded text-xs">Anónimo</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RatingsPage;
