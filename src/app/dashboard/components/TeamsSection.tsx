'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Plus,
  Trophy,
  Star,
  Calendar,
  MapPin,
  Crown,
  UserPlus,
  Settings,
  MessageCircle
} from 'lucide-react';

interface TeamsSectionProps {
  user: any;
}

const TeamsSection: React.FC<TeamsSectionProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('myTeams');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with real API call
  const teamsData = {
    myTeams: [
      {
        id: 1,
        name: 'Los Tenistas',
        sport: 'Tenis',
        members: 8,
        maxMembers: 12,
        role: 'captain',
        wins: 15,
        losses: 3,
        rating: 4.7,
        nextMatch: '2024-01-20',
        description: 'Equipo competitivo de tenis, nivel intermedio-avanzado'
      },
      {
        id: 2,
        name: 'Padel Warriors',
        sport: 'Padel',
        members: 6,
        maxMembers: 8,
        role: 'member',
        wins: 8,
        losses: 2,
        rating: 4.9,
        nextMatch: '2024-01-18',
        description: 'Grupo de amigos que juega padel regularmente'
      }
    ],
    available: [
      {
        id: 3,
        name: 'Fútbol 5 Central',
        sport: 'Fútbol 5',
        members: 9,
        maxMembers: 15,
        rating: 4.5,
        requirements: 'Nivel intermedio mínimo',
        location: 'Palermo, CABA',
        description: 'Equipo de fútbol 5 busca jugadores comprometidos'
      },
      {
        id: 4,
        name: 'Basketball Elite',
        sport: 'Basketball',
        members: 7,
        maxMembers: 10,
        rating: 4.8,
        requirements: 'Experiencia previa requerida',
        location: 'Villa Crespo, CABA',
        description: 'Equipo competitivo de basketball, entrenamientos 2x semana'
      }
    ]
  };

  const tabs = [
    { id: 'myTeams', name: 'Mis Equipos', count: teamsData.myTeams.length },
    { id: 'available', name: 'Disponibles', count: teamsData.available.length }
  ];

  const currentTeams = teamsData[activeTab as keyof typeof teamsData] || [];

  const getRoleIcon = (role: string) => {
    return role === 'captain' ? <Crown className="w-4 h-4 text-yellow-400" /> : null;
  };

  const getRoleText = (role: string) => {
    return role === 'captain' ? 'Capitán' : 'Miembro';
  };

  const MyTeamCard = ({ team }: { team: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{team.name}</h3>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
              {team.sport}
            </span>
            {getRoleIcon(team.role)}
          </div>
          <p className="text-gray-400 text-sm mb-3">{team.description}</p>
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white text-sm">{team.rating}</span>
            <span className="text-gray-400 text-sm ml-2">
              {getRoleText(team.role)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Miembros</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-white font-semibold">{team.members}/{team.maxMembers}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Récord</span>
            <Trophy className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-white font-semibold">{team.wins}W - {team.losses}L</div>
        </div>
      </div>

      {team.nextMatch && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">
              Próximo partido: {team.nextMatch}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="w-full bg-gray-700 rounded-full h-2 mr-4">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full"
            style={{ width: `${(team.members / team.maxMembers) * 100}%` }}
          ></div>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <MessageCircle className="w-4 h-4" />
          </button>
          {team.role === 'captain' && (
            <button className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const AvailableTeamCard = ({ team }: { team: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{team.name}</h3>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
              {team.sport}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-3">{team.description}</p>
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white text-sm">{team.rating}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-gray-300 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{team.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300 text-sm">
          <Users className="w-4 h-4" />
          <span>{team.members}/{team.maxMembers} miembros</span>
        </div>
        {team.requirements && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
            <span className="text-yellow-400 text-xs">{team.requirements}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="w-full bg-gray-700 rounded-full h-2 mr-4">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full"
            style={{ width: `${(team.members / team.maxMembers) * 100}%` }}
          ></div>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
            Ver detalles
          </button>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm">
            Solicitar unirse
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Mis Equipos
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar equipos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>Crear equipo</span>
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
              <p className="text-gray-400 text-sm">Mis Equipos</p>
              <p className="text-2xl font-bold text-white">{teamsData.myTeams.length}</p>
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
              <p className="text-gray-400 text-sm">Como Capitán</p>
              <p className="text-2xl font-bold text-white">
                {teamsData.myTeams.filter(t => t.role === 'captain').length}
              </p>
            </div>
            <Crown className="w-8 h-8 text-yellow-400" />
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
              <p className="text-gray-400 text-sm">Victorias Totales</p>
              <p className="text-2xl font-bold text-white">
                {teamsData.myTeams.reduce((acc, team) => acc + team.wins, 0)}
              </p>
            </div>
            <Trophy className="w-8 h-8 text-purple-400" />
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

      {/* Teams List */}
      {currentTeams.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentTeams.map((team, index) => (
            activeTab === 'myTeams' 
              ? <MyTeamCard key={team.id} team={team} />
              : <AvailableTeamCard key={team.id} team={team} />
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
            {activeTab === 'myTeams' ? 'No tienes equipos' : 'No hay equipos disponibles'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'myTeams' 
              ? 'Crea tu primer equipo o únete a uno existente.'
              : 'Intenta ajustar los filtros de búsqueda.'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TeamsSection;
