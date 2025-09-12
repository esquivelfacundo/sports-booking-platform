'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Star,
  Trophy,
  UserPlus,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';

const FindPlayersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { matches, createMatch, joinMatch, leaveMatch } = useSocial();
  
  const [activeTab, setActiveTab] = useState<'matches' | 'create'>('matches');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newMatch, setNewMatch] = useState({
    title: '',
    sport: 'futbol5' as const,
    date: '',
    time: '',
    maxPlayers: 10,
    minPlayers: 6,
    level: 'intermediate' as const,
    price: '',
    description: '',
    venue: {
      id: '1',
      name: 'Club Deportivo San Lorenzo',
      location: 'Palermo, Buenos Aires'
    }
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Acceso Restringido</h1>
          <p className="text-gray-400">Debes iniciar sesión para buscar jugadores</p>
        </div>
      </div>
    );
  }

  // Filter matches
  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.venue.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSport = selectedSport === 'all' || match.sport === selectedSport;
    const matchesLevel = selectedLevel === 'all' || match.level === selectedLevel;
    
    let matchesDate = true;
    if (selectedDate !== 'all') {
      const today = new Date();
      const matchDate = new Date(match.date);
      
      switch (selectedDate) {
        case 'today':
          matchesDate = matchDate.toDateString() === today.toDateString();
          break;
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          matchesDate = matchDate.toDateString() === tomorrow.toDateString();
          break;
        case 'week':
          const weekFromNow = new Date(today);
          weekFromNow.setDate(today.getDate() + 7);
          matchesDate = matchDate >= today && matchDate <= weekFromNow;
          break;
      }
    }
    
    return matchesSearch && matchesSport && matchesLevel && matchesDate;
  });

  const getSportName = (sport: string) => {
    const sportNames: { [key: string]: string } = {
      'futbol5': 'Fútbol 5',
      'paddle': 'Paddle',
      'tenis': 'Tenis',
      'basquet': 'Básquet'
    };
    return sportNames[sport] || sport;
  };

  const getLevelName = (level: string) => {
    const levelNames: { [key: string]: string } = {
      'beginner': 'Principiante',
      'intermediate': 'Intermedio',
      'advanced': 'Avanzado',
      'mixed': 'Mixto'
    };
    return levelNames[level] || level;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-AR', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleCreateMatch = async () => {
    const matchData = {
      ...newMatch,
      price: newMatch.price ? parseInt(newMatch.price) : undefined
    };
    
    const matchId = await createMatch(matchData);
    if (matchId) {
      setShowCreateModal(false);
      setNewMatch({
        title: '',
        sport: 'futbol5',
        date: '',
        time: '',
        maxPlayers: 10,
        minPlayers: 6,
        level: 'intermediate',
        price: '',
        description: '',
        venue: {
          id: '1',
          name: 'Club Deportivo San Lorenzo',
          location: 'Palermo, Buenos Aires'
        }
      });
    }
  };

  const isUserInMatch = (match: any) => {
    return match.players.some((player: any) => player.id === user.id);
  };

  const MatchCard = ({ match }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">
              {match.sport === 'futbol5' && '⚽'}
              {match.sport === 'paddle' && '🏓'}
              {match.sport === 'tenis' && '🎾'}
              {match.sport === 'basquet' && '🏀'}
            </span>
            <h3 className="text-lg font-semibold text-white">{match.title}</h3>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(match.date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{match.time}hs</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{match.players.length}/{match.maxPlayers}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-400 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{match.venue.name} - {match.venue.location}</span>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded-full">
              {getSportName(match.sport)}
            </span>
            <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full">
              {getLevelName(match.level)}
            </span>
            {match.price && (
              <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-full">
                ${match.price}
              </span>
            )}
          </div>
          
          {match.description && (
            <p className="text-sm text-gray-300 mb-4">{match.description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <div className="text-right">
            <div className="text-sm font-medium text-white">
              {match.players.length}/{match.maxPlayers}
            </div>
            <div className="text-xs text-gray-400">jugadores</div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
            {match.organizer.avatar ? (
              <img 
                src={match.organizer.avatar} 
                alt={match.organizer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-medium">
                {match.organizer.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Players */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-white mb-2">Jugadores confirmados:</h4>
        <div className="flex flex-wrap gap-2">
          {match.players.map((player: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-1">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-white">{player.name}</span>
              {player.id === match.organizer.id && (
                <span className="text-xs bg-emerald-600 text-white px-1 py-0.5 rounded">
                  Organizador
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex space-x-2">
        {isUserInMatch(match) ? (
          <button
            onClick={() => leaveMatch(match.id)}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <span>Salir del partido</span>
          </button>
        ) : match.status === 'open' && match.players.length < match.maxPlayers ? (
          <button
            onClick={() => joinMatch(match.id)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200"
          >
            <UserPlus className="w-4 h-4" />
            <span>Unirse</span>
          </button>
        ) : (
          <div className="text-sm text-gray-400 py-2">
            {match.status === 'full' ? 'Partido completo' : 'Partido cerrado'}
          </div>
        )}
        
        <button className="flex items-center space-x-2 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span>Contactar</span>
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-8 h-8 text-emerald-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Buscar Jugadores
              </h1>
            </div>
            <p className="text-gray-400">
              Encuentra partidos abiertos o crea el tuyo propio
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Partido</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar partidos por título o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Deporte</label>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Todos</option>
                  <option value="futbol5">Fútbol 5</option>
                  <option value="paddle">Paddle</option>
                  <option value="tenis">Tenis</option>
                  <option value="basquet">Básquet</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nivel</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Todos</option>
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                  <option value="mixed">Mixto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fecha</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Todas</option>
                  <option value="today">Hoy</option>
                  <option value="tomorrow">Mañana</option>
                  <option value="week">Esta semana</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSport('all');
                    setSelectedLevel('all');
                    setSelectedDate('all');
                  }}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-6">
            {filteredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No se encontraron partidos</h2>
            <p className="text-gray-400 mb-6">
              {searchTerm || selectedSport !== 'all' || selectedLevel !== 'all' || selectedDate !== 'all'
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Sé el primero en crear un partido'
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200"
            >
              Crear Nuevo Partido
            </button>
          </div>
        )}

        {/* Create Match Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Crear Nuevo Partido</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Título del partido</label>
                    <input
                      type="text"
                      value={newMatch.title}
                      onChange={(e) => setNewMatch(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ej: Fútbol 5 - Miércoles por la noche"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Deporte</label>
                      <select
                        value={newMatch.sport}
                        onChange={(e) => setNewMatch(prev => ({ ...prev, sport: e.target.value as any }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="futbol5">Fútbol 5</option>
                        <option value="paddle">Paddle</option>
                        <option value="tenis">Tenis</option>
                        <option value="basquet">Básquet</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nivel</label>
                      <select
                        value={newMatch.level}
                        onChange={(e) => setNewMatch(prev => ({ ...prev, level: e.target.value as any }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="beginner">Principiante</option>
                        <option value="intermediate">Intermedio</option>
                        <option value="advanced">Avanzado</option>
                        <option value="mixed">Mixto</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Fecha</label>
                      <input
                        type="date"
                        value={newMatch.date}
                        onChange={(e) => setNewMatch(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Hora</label>
                      <input
                        type="time"
                        value={newMatch.time}
                        onChange={(e) => setNewMatch(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Jugadores máx.</label>
                      <input
                        type="number"
                        min="2"
                        max="22"
                        value={newMatch.maxPlayers}
                        onChange={(e) => setNewMatch(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Jugadores mín.</label>
                      <input
                        type="number"
                        min="2"
                        max={newMatch.maxPlayers}
                        value={newMatch.minPlayers}
                        onChange={(e) => setNewMatch(prev => ({ ...prev, minPlayers: parseInt(e.target.value) }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Precio (opcional)</label>
                      <input
                        type="number"
                        min="0"
                        value={newMatch.price}
                        onChange={(e) => setNewMatch(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="$"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Descripción (opcional)</label>
                    <textarea
                      value={newMatch.description}
                      onChange={(e) => setNewMatch(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                      rows={3}
                      placeholder="Detalles adicionales sobre el partido..."
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={handleCreateMatch}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200"
                  >
                    Crear Partido
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 bg-gray-700 text-white py-3 rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindPlayersPage;
