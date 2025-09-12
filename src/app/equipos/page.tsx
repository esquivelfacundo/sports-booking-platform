'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Crown, 
  MapPin, 
  Calendar,
  Trophy,
  Star,
  Settings,
  UserPlus,
  MessageCircle
} from 'lucide-react';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { Team } from '@/types/social';

const TeamsPage = () => {
  const { teams, createTeam, joinTeam, leaveTeam } = useSocial();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-teams' | 'discover' | 'create'>('my-teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Mock teams for discovery
  const mockTeams: Team[] = [
    {
      id: 'team1',
      name: 'Los Tigres FC',
      sport: 'futbol5',
      captain: {
        id: '2',
        name: 'Carlos Rodríguez',
        avatar: '/api/placeholder/150/150',
        location: 'Belgrano, Buenos Aires',
        sports: [{ sport: 'futbol5', level: 'advanced', yearsPlaying: 10, position: 'Delantero' }],
        level: 'advanced',
        rating: 4.8,
        gamesPlayed: 89,
        isOnline: true,
        lastActive: new Date().toISOString(),
        preferredTimes: ['19:00', '20:00']
      },
      members: [],
      maxMembers: 12,
      level: 'advanced',
      location: 'Belgrano, Buenos Aires',
      description: 'Equipo competitivo de fútbol 5. Buscamos jugadores comprometidos.',
      isPrivate: false,
      createdAt: '2024-01-10T10:00:00Z',
      stats: { gamesPlayed: 15, wins: 10, losses: 3, draws: 2 }
    }
  ];

  const myTeams = teams.filter(team => 
    team.members.some(member => member.id === user?.id)
  );

  const availableTeams = [...teams, ...mockTeams].filter(team => 
    !team.members.some(member => member.id === user?.id) &&
    team.members.length < team.maxMembers
  );

  const filteredTeams = availableTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'all' || team.sport === selectedSport;
    const matchesLevel = selectedLevel === 'all' || team.level === selectedLevel;
    
    return matchesSearch && matchesSport && matchesLevel;
  });

  const handleCreateTeam = async (teamData: any) => {
    setIsCreating(true);
    try {
      const teamId = await createTeam(teamData);
      if (teamId) {
        setShowCreateModal(false);
        setActiveTab('my-teams');
      }
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    await joinTeam(teamId);
  };

  const handleLeaveTeam = async (teamId: string) => {
    await leaveTeam(teamId);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Equipos
              </h1>
              <p className="text-gray-400 mt-1">Encuentra tu equipo perfecto o crea uno nuevo</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 hover:shadow-lg transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>Crear Equipo</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl mb-8">
          {[
            { id: 'my-teams', label: 'Mis Equipos', icon: Users },
            { id: 'discover', label: 'Descubrir', icon: Search }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* My Teams Tab */}
        {activeTab === 'my-teams' && (
          <div className="space-y-6">
            {myTeams.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No tienes equipos aún</h3>
                <p className="text-gray-500 mb-6">Únete a un equipo existente o crea uno nuevo</p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Explorar Equipos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTeams.map((team) => (
                  <TeamCard 
                    key={team.id} 
                    team={team} 
                    isMyTeam={true}
                    onLeave={() => handleLeaveTeam(team.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nombre del equipo o ubicación..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Deporte</label>
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Todos los deportes</option>
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
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Todos los niveles</option>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                    <option value="mixed">Mixto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  isMyTeam={false}
                  onJoin={() => handleJoinTeam(team.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <CreateTeamModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTeam}
          isCreating={isCreating}
        />
      )}
    </div>
  );
};

// Team Card Component
const TeamCard = ({ team, isMyTeam, onJoin, onLeave }: {
  team: Team;
  isMyTeam: boolean;
  onJoin?: () => void;
  onLeave?: () => void;
}) => {
  const getSportIcon = (sport: string) => {
    const icons = {
      futbol5: '⚽',
      paddle: '🏓',
      tenis: '🎾',
      basquet: '🏀'
    };
    return icons[sport as keyof typeof icons] || '⚽';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: 'text-green-400',
      intermediate: 'text-yellow-400',
      advanced: 'text-red-400',
      mixed: 'text-purple-400'
    };
    return colors[level as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getSportIcon(team.sport)}</div>
          <div>
            <h3 className="font-semibold text-white">{team.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{team.location}</span>
            </div>
          </div>
        </div>
        {isMyTeam && team.captain.id === team.captain.id && (
          <Crown className="h-5 w-5 text-yellow-400" />
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Nivel:</span>
          <span className={`font-medium ${getLevelColor(team.level)}`}>
            {team.level.charAt(0).toUpperCase() + team.level.slice(1)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Miembros:</span>
          <span className="text-white">{team.members.length}/{team.maxMembers}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Partidos:</span>
          <span className="text-white">{team.stats.gamesPlayed}</span>
        </div>
      </div>

      {team.description && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{team.description}</p>
      )}

      <div className="flex items-center space-x-2">
        {isMyTeam ? (
          <>
            <button className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </button>
            <button 
              onClick={onLeave}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Salir
            </button>
          </>
        ) : (
          <button 
            onClick={onJoin}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Unirse</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Create Team Modal Component
const CreateTeamModal = ({ isOpen, onClose, onCreate, isCreating }: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
  isCreating: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sport: 'futbol5',
    level: 'intermediate',
    maxMembers: 12,
    location: '',
    description: '',
    isPrivate: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
      >
        <h2 className="text-xl font-bold text-white mb-6">Crear Nuevo Equipo</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Equipo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Deporte</label>
            <select
              value={formData.sport}
              onChange={(e) => setFormData(prev => ({ ...prev, sport: e.target.value as any }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
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
              value={formData.level}
              onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
              <option value="mixed">Mixto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ubicación</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
              className="rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-300">Equipo privado</label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isCreating ? 'Creando...' : 'Crear Equipo'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TeamsPage;
