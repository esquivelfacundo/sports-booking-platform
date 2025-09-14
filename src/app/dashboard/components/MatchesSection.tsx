'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter,
  MapPin,
  Clock,
  Users,
  Trophy,
  Plus,
  Calendar,
  Star,
  Target,
  ChevronDown
} from 'lucide-react';

interface MatchesSectionProps {
  user: any;
}

const MatchesSection: React.FC<MatchesSectionProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data - replace with real API call
  const matches = {
    available: [
      {
        id: 1,
        title: 'Partido de Tenis - Nivel Intermedio',
        sport: 'Tenis',
        location: 'Club Deportivo Central, Palermo',
        date: '2024-01-15',
        time: '18:00',
        duration: '1h 30min',
        currentPlayers: 1,
        maxPlayers: 2,
        level: 'Intermedio',
        price: '$1,250',
        organizer: 'Carlos Mendez',
        description: 'Busco compañero para partido de tenis. Nivel intermedio, juego regular.'
      },
      {
        id: 2,
        title: 'Fútbol 5 - Necesitamos 3 jugadores',
        sport: 'Fútbol 5',
        location: 'Complejo San Telmo',
        date: '2024-01-16',
        time: '20:00',
        duration: '1h',
        currentPlayers: 7,
        maxPlayers: 10,
        level: 'Mixto',
        price: '$320',
        organizer: 'Ana Rodriguez',
        description: 'Partido amistoso, ambiente relajado. Todos los niveles bienvenidos.'
      }
    ],
    joined: [
      {
        id: 3,
        title: 'Padel Dobles - Torneo Amistoso',
        sport: 'Padel',
        location: 'Padel Club Norte, Belgrano',
        date: '2024-01-18',
        time: '19:30',
        duration: '1h',
        currentPlayers: 4,
        maxPlayers: 4,
        level: 'Avanzado',
        price: '$450',
        organizer: 'Diego Martinez',
        description: 'Torneo de padel por equipos. ¡Ya estamos completos!'
      }
    ],
    created: [
      {
        id: 4,
        title: 'Basketball 3v3 - Cancha Cubierta',
        sport: 'Basketball',
        location: 'Basketball Arena, Villa Crespo',
        date: '2024-01-20',
        time: '17:00',
        duration: '1h',
        currentPlayers: 2,
        maxPlayers: 6,
        level: 'Intermedio',
        price: '$333',
        organizer: user?.name || 'Usuario',
        description: 'Partido 3v3 en cancha cubierta. Buen nivel, ambiente competitivo pero amistoso.'
      }
    ]
  };

  const tabs = [
    { id: 'available', name: 'Disponibles', count: matches.available.length },
    { id: 'joined', name: 'Mis Partidos', count: matches.joined.length },
    { id: 'created', name: 'Creados por mí', count: matches.created.length }
  ];

  const currentMatches = matches[activeTab as keyof typeof matches] || [];

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'principiante':
        return 'text-green-400 bg-green-400/10';
      case 'intermedio':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'avanzado':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-blue-400 bg-blue-400/10';
    }
  };

  const getSportIcon = (sport: string) => {
    return <Trophy className="w-5 h-5" />;
  };

  const MatchCard = ({ match }: { match: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex items-center space-x-2">
              {getSportIcon(match.sport)}
              <h3 className="text-lg font-semibold text-white">{match.title}</h3>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${getLevelColor(match.level)}`}>
              {match.level}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-3">{match.description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-400">{match.price}</div>
          <div className="text-sm text-gray-400">por persona</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-gray-300">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{match.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{match.date}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{match.time} ({match.duration})</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <Users className="w-4 h-4" />
          <span className="text-sm">{match.currentPlayers}/{match.maxPlayers} jugadores</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {match.organizer.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{match.organizer}</p>
            <p className="text-gray-400 text-xs">Organizador</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {activeTab === 'available' && (
            <>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
                Ver detalles
              </button>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm">
                Unirse
              </button>
            </>
          )}
          {activeTab === 'joined' && (
            <>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
                Chat grupal
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm">
                Salir
              </button>
            </>
          )}
          {activeTab === 'created' && (
            <>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
                Editar
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                Gestionar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar for player count */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Jugadores confirmados</span>
          <span>{match.currentPlayers}/{match.maxPlayers}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(match.currentPlayers / match.maxPlayers) * 100}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Buscar Jugadores
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar partidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button className="flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Crear partido</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Partidos Disponibles</p>
              <p className="text-2xl font-bold text-white">{matches.available.length}</p>
            </div>
            <Search className="w-8 h-8 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Mis Partidos</p>
              <p className="text-2xl font-bold text-white">{matches.joined.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Creados por mí</p>
              <p className="text-2xl font-bold text-white">{matches.created.length}</p>
            </div>
            <Trophy className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Esta Semana</p>
              <p className="text-2xl font-bold text-white">5</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span className="font-medium">{tab.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Matches List */}
      {currentMatches.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentMatches.map((match, index) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {activeTab === 'available' && 'No hay partidos disponibles'}
            {activeTab === 'joined' && 'No te has unido a ningún partido'}
            {activeTab === 'created' && 'No has creado ningún partido'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'available' && 'Intenta ajustar los filtros o crear un nuevo partido.'}
            {activeTab === 'joined' && 'Explora los partidos disponibles y únete a uno.'}
            {activeTab === 'created' && 'Crea tu primer partido y encuentra compañeros de juego.'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default MatchesSection;
