'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, MapPin, DollarSign, Clock, Filter, Search, Star } from 'lucide-react';
import { useTournament } from '@/contexts/TournamentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Tournament } from '@/types/tournament';

const TournamentsContent = () => {
  const { getAvailableTournaments, registerForTournament } = useTournament();
  const { isAuthenticated, user } = useAuth();
  const [selectedSport, setSelectedSport] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const availableTournaments = getAvailableTournaments();

  const filteredTournaments = availableTournaments.filter(tournament => {
    const matchesSport = !selectedSport || tournament.sport === selectedSport;
    const matchesSearch = !searchTerm || 
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSport && matchesSearch;
  });

  const getSportEmoji = (sport: string) => {
    const sportEmojis: { [key: string]: string } = {
      'futbol5': '⚽',
      'paddle': '🏓',
      'tenis': '🎾',
      'basquet': '🏀',
      'voley': '🏐',
      'hockey': '🏒',
      'rugby': '🏉'
    };
    return sportEmojis[sport] || '🏆';
  };

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

  const handleRegister = (tournament: Tournament) => {
    if (!isAuthenticated) {
      // Show login modal or redirect to login
      return;
    }
    setSelectedTournament(tournament);
    setShowRegistrationModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                Torneos Deportivos
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Únete a torneos emocionantes, compite con otros jugadores y gana increíbles premios
              </p>
            </motion.div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar torneos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos los deportes</option>
                <option value="futbol5">Fútbol 5</option>
                <option value="paddle">Paddle</option>
                <option value="tenis">Tenis</option>
                <option value="basquet">Básquet</option>
                <option value="voley">Vóley</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
              <Trophy className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white">{availableTournaments.length}</h3>
              <p className="text-gray-400">Torneos Disponibles</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white">
                {availableTournaments.reduce((sum, t) => sum + t.currentParticipants, 0)}
              </h3>
              <p className="text-gray-400">Jugadores Inscritos</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
              <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white">
                ${availableTournaments.reduce((sum, t) => sum + t.prizePool, 0).toLocaleString()}
              </h3>
              <p className="text-gray-400">En Premios</p>
            </div>
          </div>

          {/* Tournaments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-emerald-500 transition-all duration-300 group"
              >
                {/* Tournament Image */}
                <div className="relative h-48 bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <div className="text-6xl">{getSportEmoji(tournament.sport)}</div>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(tournament.status)}`}>
                      {getStatusText(tournament.status)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Tournament Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {tournament.name}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{tournament.description}</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPin className="w-4 h-4 text-emerald-400 mr-2" />
                      <span>{tournament.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-emerald-400 mr-2" />
                      <span>{new Date(tournament.startDate).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Users className="w-4 h-4 text-emerald-400 mr-2" />
                      <span>{tournament.currentParticipants}/{tournament.maxParticipants} participantes</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Clock className="w-4 h-4 text-emerald-400 mr-2" />
                      <span>Inscripción hasta: {new Date(tournament.registrationDeadline).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>

                  {/* Price and Prize */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-gray-400 text-xs">Inscripción</p>
                      <p className="text-white font-bold">${tournament.entryFee.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Premio</p>
                      <p className="text-emerald-400 font-bold">${tournament.prizePool.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleRegister(tournament)}
                    disabled={tournament.currentParticipants >= tournament.maxParticipants || tournament.status !== 'registration-open'}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {tournament.currentParticipants >= tournament.maxParticipants 
                      ? 'Torneo Completo' 
                      : tournament.status === 'registration-open' 
                        ? 'Inscribirse' 
                        : 'Inscripciones Cerradas'
                    }
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTournaments.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No se encontraron torneos</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>

        {/* Registration Modal */}
        {showRegistrationModal && selectedTournament && (
          <TournamentRegistrationModal 
            tournament={selectedTournament}
            onClose={() => {
              setShowRegistrationModal(false);
              setSelectedTournament(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Tournament Registration Modal
const TournamentRegistrationModal = ({ 
  tournament, 
  onClose 
}: { 
  tournament: Tournament; 
  onClose: () => void; 
}) => {
  const { registerForTournament, processPayment } = useTournament();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Registration, 2: Payment
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    playerName: user?.name || '',
    playerEmail: user?.email || '',
    teamName: '',
    additionalInfo: ''
  });

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const registration = await registerForTournament(tournament.id, {
        ...formData,
        playerId: user?.id || 'current_player'
      });
      setRegistrationId(registration.id);
      setStep(2);
    } catch (error) {
      console.error('Error registering for tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!registrationId) return;
    
    setLoading(true);
    try {
      await processPayment(registrationId, {
        amount: tournament.entryFee,
        method: 'credit_card'
      });
      onClose();
      // Show success message
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl max-w-md w-full"
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {step === 1 ? 'Inscripción al Torneo' : 'Pago de Inscripción'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{tournament.name}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRegistration} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre Completo</label>
              <input
                type="text"
                required
                value={formData.playerName}
                onChange={(e) => setFormData({...formData, playerName: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.playerEmail}
                onChange={(e) => setFormData({...formData, playerEmail: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Equipo (opcional)</label>
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Información Adicional</label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Costo de inscripción:</span>
                <span className="text-white font-semibold">${tournament.entryFee.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
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
                {loading ? 'Procesando...' : 'Continuar al Pago'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Confirmar Pago</h3>
              <p className="text-gray-400">Total a pagar: <span className="text-white font-bold">${tournament.entryFee.toLocaleString()}</span></p>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Torneo:</span>
                <span className="text-white">{tournament.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Participante:</span>
                <span className="text-white">{formData.playerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Inscripción:</span>
                <span className="text-white">${tournament.entryFee.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Procesando Pago...' : 'Pagar Inscripción'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const TournamentsPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando torneos...</div>
      </div>
    }>
      <TournamentsContent />
    </Suspense>
  );
};

export default TournamentsPage;
