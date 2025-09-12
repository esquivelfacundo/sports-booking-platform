'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, Calendar, User, Award } from 'lucide-react';
import { useRatings } from '@/contexts/RatingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Player } from '@/types/social';
import RatingModal from './RatingModal';

interface PlayerRatingCardProps {
  player: Player;
  showRateButton?: boolean;
  matchId?: string;
  matchTitle?: string;
}

const PlayerRatingCard = ({ 
  player, 
  showRateButton = false, 
  matchId, 
  matchTitle 
}: PlayerRatingCardProps) => {
  const { playerStats, canRatePlayer, hasRatedPlayer } = useRatings();
  const { user } = useAuth();
  const [showRatingModal, setShowRatingModal] = useState(false);

  const stats = playerStats[player.id];
  const canRate = user ? canRatePlayer(user.id, player.id) : false;
  const hasRated = user ? hasRatedPlayer(user.id, player.id) : false;

  const getStarColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-400';
    if (rating >= 3.5) return 'text-yellow-400';
    if (rating >= 2.5) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
            {player.avatar ? (
              <img 
                src={player.avatar} 
                alt={player.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-medium text-lg">
                {player.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Player Info */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{player.name}</h3>
                <p className="text-sm text-gray-400">
                  {player.sports.map(sport => sport.sport).join(', ')}
                </p>
              </div>
              
              {stats && (
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className={`h-5 w-5 ${getStarColor(stats.averageRating)} fill-current`} />
                    <span className="text-lg font-bold text-white">{stats.averageRating}</span>
                  </div>
                  <p className="text-xs text-gray-400">{stats.totalRatings} calificaciones</p>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Award className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium text-white">
                      {stats.categoryAverages.skill}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Habilidad</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <User className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">
                      {stats.categoryAverages.sportsmanship}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Deportividad</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">
                      {stats.categoryAverages.punctuality}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Puntualidad</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <MessageCircle className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">
                      {stats.categoryAverages.communication}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Comunicación</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {showRateButton && canRate && !hasRated && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  <Star className="h-4 w-4" />
                  <span>Calificar</span>
                </button>
              )}

              {hasRated && (
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">Ya calificado</span>
                </div>
              )}

              {!stats && (
                <div className="text-gray-400">
                  <p className="text-sm">Sin calificaciones aún</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          playerId={player.id}
          playerName={player.name}
          playerAvatar={player.avatar}
          matchId={matchId}
          matchTitle={matchTitle}
        />
      )}
    </>
  );
};

export default PlayerRatingCard;
