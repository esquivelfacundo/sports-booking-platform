'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Filter, 
  RefreshCw, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  TrendingUp,
  Calendar,
  Target,
  Zap
} from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';

const RecommendationsPage = () => {
  const { recommendations, isLoading, refreshRecommendations } = useRecommendations();
  const { user } = useAuth();
  const { joinMatch, joinTeam } = useSocial();
  const [activeTab, setActiveTab] = useState<'all' | 'matches' | 'venues' | 'players' | 'teams'>('all');
  const [selectedSport, setSelectedSport] = useState<string>('all');

  const getSportIcon = (sport: string) => {
    const icons = {
      futbol5: '⚽',
      paddle: '🏓',
      tenis: '🎾',
      basquet: '🏀'
    };
    return icons[sport as keyof typeof icons] || '⚽';
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const handleJoinMatch = async (matchId: string) => {
    await joinMatch(matchId);
    refreshRecommendations();
  };

  const handleJoinTeam = async (teamId: string) => {
    await joinTeam(teamId);
    refreshRecommendations();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Inicia sesión para ver recomendaciones</h2>
          <p className="text-gray-500">Necesitas una cuenta para recibir recomendaciones personalizadas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center space-x-3">
                <Sparkles className="h-8 w-8 text-emerald-400" />
                <span>Recomendaciones</span>
              </h1>
              <p className="text-gray-400 mt-1">Descubre partidos, lugares y jugadores perfectos para ti</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshRecommendations}
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 hover:shadow-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg">
              {[
                { id: 'all', label: 'Todo', icon: Sparkles },
                { id: 'matches', label: 'Partidos', icon: Calendar },
                { id: 'venues', label: 'Lugares', icon: MapPin },
                { id: 'players', label: 'Jugadores', icon: Users },
                { id: 'teams', label: 'Equipos', icon: Target }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Todos los deportes</option>
                <option value="futbol5">Fútbol 5</option>
                <option value="paddle">Padel</option>
                <option value="tenis">Tenis</option>
                <option value="basquet">Básquet</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-emerald-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Generando recomendaciones personalizadas...</p>
            </div>
          </div>
        ) : !recommendations ? (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No hay recomendaciones disponibles</h3>
            <p className="text-gray-500 mb-6">Intenta actualizar o ajustar tus filtros</p>
            <button
              onClick={refreshRecommendations}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Generar Recomendaciones
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Matches Section */}
            {(activeTab === 'all' || activeTab === 'matches') && recommendations.matches.length > 0 && (
              <section>
                <div className="flex items-center space-x-3 mb-6">
                  <Calendar className="h-6 w-6 text-emerald-400" />
                  <h2 className="text-2xl font-bold text-white">Partidos Recomendados</h2>
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                    {recommendations.matches.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.matches
                    .filter(rec => selectedSport === 'all' || rec.match.sport === selectedSport)
                    .slice(0, 6)
                    .map((rec) => (
                      <MatchRecommendationCard 
                        key={rec.matchId} 
                        recommendation={rec}
                        onJoin={() => handleJoinMatch(rec.matchId)}
                      />
                    ))}
                </div>
              </section>
            )}

            {/* Venues Section */}
            {(activeTab === 'all' || activeTab === 'venues') && recommendations.venues.length > 0 && (
              <section>
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="h-6 w-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">Lugares Recomendados</h2>
                  <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium">
                    {recommendations.venues.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.venues
                    .filter(rec => selectedSport === 'all' || rec.venue.sports?.includes(selectedSport))
                    .slice(0, 4)
                    .map((rec) => (
                      <VenueRecommendationCard key={rec.venueId} recommendation={rec} />
                    ))}
                </div>
              </section>
            )}

            {/* Players Section */}
            {(activeTab === 'all' || activeTab === 'players') && recommendations.players.length > 0 && (
              <section>
                <div className="flex items-center space-x-3 mb-6">
                  <Users className="h-6 w-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Jugadores Recomendados</h2>
                  <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                    {recommendations.players.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.players
                    .filter(rec => selectedSport === 'all' || rec.player.sports?.some((s: any) => s.sport === selectedSport))
                    .slice(0, 8)
                    .map((rec) => (
                      <PlayerRecommendationCard key={rec.playerId} recommendation={rec} />
                    ))}
                </div>
              </section>
            )}

            {/* Teams Section */}
            {(activeTab === 'all' || activeTab === 'teams') && recommendations.teams.length > 0 && (
              <section>
                <div className="flex items-center space-x-3 mb-6">
                  <Target className="h-6 w-6 text-orange-400" />
                  <h2 className="text-2xl font-bold text-white">Equipos Recomendados</h2>
                  <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium">
                    {recommendations.teams.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.teams
                    .filter(rec => selectedSport === 'all' || rec.team.sport === selectedSport)
                    .slice(0, 6)
                    .map((rec) => (
                      <TeamRecommendationCard 
                        key={rec.teamId} 
                        recommendation={rec}
                        onJoin={() => handleJoinTeam(rec.teamId)}
                      />
                    ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Match Recommendation Card
const MatchRecommendationCard = ({ recommendation, onJoin }: any) => {
  const { match, score } = recommendation;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{match.sport === 'futbol5' ? '⚽' : match.sport === 'paddle' ? '🏓' : match.sport === 'tenis' ? '🎾' : '🏀'}</div>
          <div>
            <h3 className="font-semibold text-white">{match.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{match.venue.location}</span>
            </div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${score.confidence === 'high' ? 'bg-green-400/20 text-green-400' : score.confidence === 'medium' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-gray-400/20 text-gray-400'}`}>
          {score.score}%
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Fecha:</span>
          <span className="text-white">{match.date} - {match.time}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Jugadores:</span>
          <span className="text-white">{match.players.length}/{match.maxPlayers}</span>
        </div>
        {match.price && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Precio:</span>
            <span className="text-white">${match.price}</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-2">¿Por qué te recomendamos esto?</p>
        <div className="space-y-1">
          {score.reasons.slice(0, 2).map((reason: string, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-xs text-gray-300">
              <Zap className="h-3 w-3 text-emerald-400" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onJoin}
        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
      >
        Unirse al Partido
      </button>
    </motion.div>
  );
};

// Venue Recommendation Card
const VenueRecommendationCard = ({ recommendation }: any) => {
  const { venue, score } = recommendation;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-cyan-500/50 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-white text-sm">{venue.name}</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${score.confidence === 'high' ? 'bg-green-400/20 text-green-400' : score.confidence === 'medium' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-gray-400/20 text-gray-400'}`}>
          {score.score}%
        </div>
      </div>

      <div className="flex items-center space-x-2 text-xs text-gray-400 mb-3">
        <MapPin className="h-3 w-3" />
        <span>{venue.location}</span>
      </div>

      <div className="flex items-center space-x-2 mb-3">
        <Star className="h-4 w-4 text-yellow-400" />
        <span className="text-sm text-white">{venue.rating}</span>
        <span className="text-xs text-gray-400">• {venue.distance}km</span>
      </div>

      <div className="text-xs text-gray-400 mb-3">
        <span>Deportes: {venue.sports?.join(', ')}</span>
      </div>

      <div className="space-y-1">
        {score.reasons.slice(0, 1).map((reason: string, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-xs text-gray-300">
            <Zap className="h-3 w-3 text-cyan-400" />
            <span>{reason}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Player Recommendation Card
const PlayerRecommendationCard = ({ recommendation }: any) => {
  const { player, score } = recommendation;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-all"
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {player.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white text-sm">{player.name}</h3>
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>{player.level}</span>
            <span>•</span>
            <span>{player.rating}/5</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${score.confidence === 'high' ? 'bg-green-400/20 text-green-400' : score.confidence === 'medium' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-gray-400/20 text-gray-400'}`}>
          {score.score}%
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-3">
        <MapPin className="h-3 w-3 inline mr-1" />
        {player.location}
      </div>

      <div className="space-y-1">
        {score.reasons.slice(0, 1).map((reason: string, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-xs text-gray-300">
            <Zap className="h-3 w-3 text-purple-400" />
            <span>{reason}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Team Recommendation Card
const TeamRecommendationCard = ({ recommendation, onJoin }: any) => {
  const { team, score } = recommendation;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500/50 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{team.sport === 'futbol5' ? '⚽' : team.sport === 'paddle' ? '🏓' : team.sport === 'tenis' ? '🎾' : '🏀'}</div>
          <div>
            <h3 className="font-semibold text-white">{team.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{team.location}</span>
            </div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${score.confidence === 'high' ? 'bg-green-400/20 text-green-400' : score.confidence === 'medium' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-gray-400/20 text-gray-400'}`}>
          {score.score}%
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Nivel:</span>
          <span className="text-white">{team.level}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Miembros:</span>
          <span className="text-white">{team.members.length}/{team.maxMembers}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="space-y-1">
          {score.reasons.slice(0, 2).map((reason: string, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-xs text-gray-300">
              <Zap className="h-3 w-3 text-orange-400" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onJoin}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
      >
        Unirse al Equipo
      </button>
    </motion.div>
  );
};

export default RecommendationsPage;
