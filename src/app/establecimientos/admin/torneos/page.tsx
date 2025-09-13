'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trophy, Users, Calendar, DollarSign, Edit, Trash2, Eye } from 'lucide-react';
import { useTournament } from '@/contexts/TournamentContext';
import { Tournament } from '@/types/tournament';

const TournamentsContent = () => {
  const { tournaments, getTournamentsByEstablishment } = useTournament();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Mock establishment ID - in real app this would come from auth context
  const establishmentTournaments = getTournamentsByEstablishment('est1');

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'registration-open': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Tournament['status']) => {
    switch (status) {
      case 'registration-open': return 'Inscripciones Abiertas';
      case 'upcoming': return 'Próximamente';
      case 'in-progress': return 'En Progreso';
      case 'completed': return 'Finalizado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Gestión de Torneos
          </h1>
          <p className="text-gray-400 mt-2">Crea y administra torneos para tu establecimiento</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Crear Torneo</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Torneos Activos</p>
              <p className="text-2xl font-bold text-white">
                {establishmentTournaments.filter(t => t.status === 'registration-open' || t.status === 'in-progress').length}
              </p>
            </div>
            <Trophy className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Participantes</p>
              <p className="text-2xl font-bold text-white">
                {establishmentTournaments.reduce((sum, t) => sum + t.currentParticipants, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Próximos Torneos</p>
              <p className="text-2xl font-bold text-white">
                {establishmentTournaments.filter(t => t.status === 'upcoming').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ingresos Estimados</p>
              <p className="text-2xl font-bold text-white">
                ${establishmentTournaments.reduce((sum, t) => sum + (t.currentParticipants * t.entryFee), 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Tournaments List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Mis Torneos</h2>
        </div>

        {establishmentTournaments.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No tienes torneos creados</h3>
            <p className="text-gray-500 mb-6">Crea tu primer torneo para comenzar a atraer participantes</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200"
            >
              Crear Primer Torneo
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {establishmentTournaments.map((tournament) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-white">{tournament.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(tournament.status)}`}>
                        {getStatusText(tournament.status)}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 mb-3">{tournament.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Deporte:</span>
                        <span className="text-white ml-2 capitalize">{tournament.sport}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Participantes:</span>
                        <span className="text-white ml-2">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Inscripción:</span>
                        <span className="text-white ml-2">${tournament.entryFee.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Premio:</span>
                        <span className="text-white ml-2">${tournament.prizePool.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => setSelectedTournament(tournament)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <CreateTournamentModal 
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Tournament Details Modal */}
      {selectedTournament && (
        <TournamentDetailsModal 
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </div>
  );
};

// Create Tournament Modal Component
const CreateTournamentModal = ({ onClose }: { onClose: () => void }) => {
  const { createTournament } = useTournament();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sport: 'futbol5',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: 16,
    entryFee: 0,
    prizePool: 0,
    format: 'single-elimination' as const,
    location: '',
    rules: [''],
    requirements: ['']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createTournament({
        ...formData,
        rules: formData.rules.filter(rule => rule.trim() !== ''),
        requirements: formData.requirements.filter(req => req.trim() !== '')
      });
      onClose();
    } catch (error) {
      console.error('Error creating tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Crear Nuevo Torneo</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Torneo</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Deporte</label>
              <select
                value={formData.sport}
                onChange={(e) => setFormData({...formData, sport: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="futbol5">Fútbol 5</option>
                <option value="paddle">Paddle</option>
                <option value="tenis">Tenis</option>
                <option value="basquet">Básquet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Inicio</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Fin</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Límite de Inscripción</label>
              <input
                type="date"
                required
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Participants and Money */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Máx. Participantes</label>
              <input
                type="number"
                required
                min="2"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Costo de Inscripción ($)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.entryFee}
                onChange={(e) => setFormData({...formData, entryFee: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Premio Total ($)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.prizePool}
                onChange={(e) => setFormData({...formData, prizePool: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Torneo'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Tournament Details Modal Component
const TournamentDetailsModal = ({ tournament, onClose }: { tournament: Tournament; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{tournament.name}</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Participantes:</span>
              <span className="text-white ml-2">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
            </div>
            <div>
              <span className="text-gray-400">Inscripción:</span>
              <span className="text-white ml-2">${tournament.entryFee.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2">Reglas</h3>
            <ul className="text-gray-300 space-y-1">
              {tournament.rules.map((rule, index) => (
                <li key={index}>• {rule}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const TournamentsPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Cargando...</div>
      </div>
    }>
      <TournamentsContent />
    </Suspense>
  );
};

export default TournamentsPage;
