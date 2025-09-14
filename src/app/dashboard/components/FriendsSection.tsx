'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  UserPlus,
  MessageCircle,
  Trophy,
  Star,
  MapPin,
  Clock,
  Check,
  X,
  Filter
} from 'lucide-react';

interface FriendsSectionProps {
  user: any;
}

const FriendsSection: React.FC<FriendsSectionProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with real API call
  const friendsData = {
    friends: [
      {
        id: 1,
        name: 'Carlos Mendez',
        avatar: null,
        location: 'Palermo, CABA',
        sports: ['Tenis', 'Padel'],
        level: 'Intermedio',
        rating: 4.7,
        lastActive: '2 horas',
        mutualFriends: 3,
        status: 'online'
      },
      {
        id: 2,
        name: 'Ana Rodriguez',
        avatar: null,
        location: 'Belgrano, CABA',
        sports: ['Fútbol 5', 'Basketball'],
        level: 'Avanzado',
        rating: 4.9,
        lastActive: '1 día',
        mutualFriends: 7,
        status: 'offline'
      }
    ],
    requests: [
      {
        id: 3,
        name: 'Diego Martinez',
        avatar: null,
        location: 'Villa Crespo, CABA',
        sports: ['Padel', 'Tenis'],
        level: 'Principiante',
        rating: 4.2,
        mutualFriends: 2,
        requestDate: '2024-01-12'
      }
    ],
    suggestions: [
      {
        id: 4,
        name: 'Laura Gonzalez',
        avatar: null,
        location: 'Recoleta, CABA',
        sports: ['Tenis', 'Yoga'],
        level: 'Intermedio',
        rating: 4.6,
        mutualFriends: 5,
        commonInterests: ['Tenis', 'Fitness']
      },
      {
        id: 5,
        name: 'Miguel Torres',
        avatar: null,
        location: 'San Telmo, CABA',
        sports: ['Fútbol 5', 'Padel'],
        level: 'Avanzado',
        rating: 4.8,
        mutualFriends: 1,
        commonInterests: ['Fútbol 5']
      }
    ]
  };

  const tabs = [
    { id: 'friends', name: 'Mis Amigos', count: friendsData.friends.length },
    { id: 'requests', name: 'Solicitudes', count: friendsData.requests.length },
    { id: 'suggestions', name: 'Sugerencias', count: friendsData.suggestions.length }
  ];

  const currentData = friendsData[activeTab as keyof typeof friendsData] || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const FriendCard = ({ person, type }: { person: any; type: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start space-x-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
            {person.avatar ? (
              <img src={person.avatar} alt={person.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-bold text-lg">{getInitials(person.name)}</span>
            )}
          </div>
          {type === 'friends' && (
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800 ${
              person.status === 'online' ? 'bg-emerald-400' : 'bg-gray-500'
            }`}></div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-white">{person.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{person.location}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-white text-sm">{person.rating}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm text-gray-400">Nivel:</span>
            <span className="text-emerald-400 text-sm font-medium">{person.level}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {person.sports.map((sport: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                {sport}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {type === 'friends' && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Activo hace {person.lastActive}</span>
                </div>
              )}
              {type !== 'friends' && (
                <span>{person.mutualFriends} amigos en común</span>
              )}
            </div>

            <div className="flex space-x-2">
              {type === 'friends' && (
                <>
                  <button className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <Trophy className="w-4 h-4" />
                  </button>
                </>
              )}
              {type === 'requests' && (
                <>
                  <button className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
              {type === 'suggestions' && (
                <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm">
                  <UserPlus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Mis Amigos
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar amigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
            <UserPlus className="w-4 h-4" />
            <span>Buscar jugadores</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Amigos</p>
              <p className="text-2xl font-bold text-white">{friendsData.friends.length}</p>
            </div>
            <Users className="w-8 h-8 text-emerald-400" />
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
              <p className="text-gray-400 text-sm">Solicitudes</p>
              <p className="text-2xl font-bold text-white">{friendsData.requests.length}</p>
            </div>
            <UserPlus className="w-8 h-8 text-blue-400" />
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
              <p className="text-gray-400 text-sm">En línea</p>
              <p className="text-2xl font-bold text-white">
                {friendsData.friends.filter(f => f.status === 'online').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
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

      {/* Content */}
      {currentData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentData.map((person, index) => (
            <FriendCard key={person.id} person={person} type={activeTab} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {activeTab === 'friends' && 'No tienes amigos aún'}
            {activeTab === 'requests' && 'No tienes solicitudes pendientes'}
            {activeTab === 'suggestions' && 'No hay sugerencias disponibles'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'friends' && 'Conecta con otros jugadores para expandir tu red deportiva.'}
            {activeTab === 'requests' && 'Las solicitudes de amistad aparecerán aquí.'}
            {activeTab === 'suggestions' && 'Te sugeriremos jugadores basados en tus intereses.'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default FriendsSection;
