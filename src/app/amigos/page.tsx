'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  UserPlus, 
  MessageCircle, 
  Star, 
  MapPin, 
  Clock,
  Filter,
  Trophy,
  Check,
  X,
  Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';

const FriendsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    friends, 
    friendRequests, 
    nearbyPlayers, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest,
    searchPlayers 
  } = useSocial();
  
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'discover'>('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Acceso Restringido</h1>
          <p className="text-gray-400">Debes iniciar sesión para ver tus amigos</p>
        </div>
      </div>
    );
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPlayers(query, {
        sport: selectedSport !== 'all' ? selectedSport : undefined,
        level: selectedLevel !== 'all' ? selectedLevel : undefined
      });
      
      // Filter out current user and existing friends
      const filteredResults = results.filter(player => 
        player.id !== user.id && 
        !friends.some(friend => friend.id === player.id)
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching players:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getSportName = (sport: string) => {
    const sportNames: { [key: string]: string } = {
      'futbol5': 'Fútbol 5',
      'paddle': 'Padel',
      'tenis': 'Tenis',
      'basquet': 'Básquet'
    };
    return sportNames[sport] || sport;
  };

  const getLevelName = (level: string) => {
    const levelNames: { [key: string]: string } = {
      'beginner': 'Principiante',
      'intermediate': 'Intermedio',
      'advanced': 'Avanzado'
    };
    return levelNames[level] || level;
  };

  const PlayerCard = ({ player, showActions = true, actionType = 'add' }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-4"
    >
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
          {player.avatar ? (
            <img 
              src={player.avatar} 
              alt={player.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-medium">
              {player.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-white truncate">{player.name}</h3>
            {player.isOnline && (
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            )}
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-400 mb-2">
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-emerald-400" />
              <span>{player.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="w-3 h-3 text-emerald-400" />
              <span>{player.gamesPlayed} partidos</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-400 mb-2">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{player.location}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {player.sports.slice(0, 2).map((sport: any, index: number) => (
              <span 
                key={index}
                className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded-full"
              >
                {getSportName(sport.sport)} - {getLevelName(sport.level)}
              </span>
            ))}
          </div>
          
          {player.bio && (
            <p className="text-xs text-gray-400 mb-3 line-clamp-2">{player.bio}</p>
          )}
          
          {showActions && (
            <div className="flex space-x-2">
              {actionType === 'add' && (
                <button
                  onClick={() => sendFriendRequest(player.id)}
                  className="flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Agregar</span>
                </button>
              )}
              
              <button className="flex items-center space-x-1 bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-600 transition-colors">
                <MessageCircle className="w-3 h-3" />
                <span>Mensaje</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const FriendRequestCard = ({ request }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-4"
    >
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
          {request.fromUser.avatar ? (
            <img 
              src={request.fromUser.avatar} 
              alt={request.fromUser.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-medium">
              {request.fromUser.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">{request.fromUser.name}</h3>
          <p className="text-sm text-gray-400 mb-2">Quiere ser tu amigo deportivo</p>
          
          {request.message && (
            <div className="bg-gray-700 rounded-lg p-2 mb-3">
              <p className="text-sm text-gray-300">"{request.message}"</p>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={() => acceptFriendRequest(request.id)}
              className="flex items-center space-x-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
            >
              <Check className="w-3 h-3" />
              <span>Aceptar</span>
            </button>
            
            <button
              onClick={() => rejectFriendRequest(request.id)}
              className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Rechazar</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Mis Amigos Deportivos
            </h1>
          </div>
          <p className="text-gray-400">
            Conecta con otros jugadores y forma tu red deportiva
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-1 mb-8 inline-flex">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'friends'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Amigos ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Solicitudes ({friendRequests.length})
            {friendRequests.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'discover'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Descubrir
          </button>
        </div>

        {/* Content */}
        {activeTab === 'friends' && (
          <div>
            {friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <PlayerCard 
                    key={friend.id} 
                    player={friend} 
                    showActions={true}
                    actionType="friend"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No tienes amigos aún</h2>
                <p className="text-gray-400 mb-6">
                  Busca jugadores y comienza a formar tu red deportiva
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200"
                >
                  Descubrir Jugadores
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            {friendRequests.length > 0 ? (
              <div className="space-y-4">
                {friendRequests.map((request) => (
                  <FriendRequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Send className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No tienes solicitudes pendientes</h2>
                <p className="text-gray-400">
                  Las nuevas solicitudes de amistad aparecerán aquí
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'discover' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar jugadores por nombre o ubicación..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Filtros:</span>
                  </div>
                  
                  <select
                    value={selectedSport}
                    onChange={(e) => {
                      setSelectedSport(e.target.value);
                      if (searchTerm) handleSearch(searchTerm);
                    }}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="all">Todos los deportes</option>
                    <option value="futbol5">Fútbol 5</option>
                    <option value="paddle">Padel</option>
                    <option value="tenis">Tenis</option>
                    <option value="basquet">Básquet</option>
                  </select>
                  
                  <select
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value);
                      if (searchTerm) handleSearch(searchTerm);
                    }}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="all">Todos los niveles</option>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results */}
            {isSearching ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Buscando jugadores...</p>
              </div>
            ) : searchTerm ? (
              searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((player) => (
                    <PlayerCard 
                      key={player.id} 
                      player={player} 
                      showActions={true}
                      actionType="add"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No se encontraron jugadores</h3>
                  <p className="text-gray-400">Intenta con otros términos de búsqueda</p>
                </div>
              )
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Jugadores Cercanos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nearbyPlayers.slice(0, 6).map((player) => (
                    <PlayerCard 
                      key={player.id} 
                      player={player} 
                      showActions={true}
                      actionType="add"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
