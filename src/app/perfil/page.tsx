'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Star,
  Trophy,
  Heart,
  Users,
  Clock,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserSport } from '@/types/user';

const ProfilePage = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    sports: user?.sports || []
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acceso Restringido</h1>
          <p className="text-gray-400">Debes iniciar sesión para ver tu perfil</p>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    const success = await updateProfile(editForm);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: user.name,
      phone: user.phone || '',
      location: user.location,
      bio: user.bio || '',
      sports: user.sports
    });
    setIsEditing(false);
  };

  const addSport = () => {
    const newSport: UserSport = {
      sport: 'futbol5',
      level: 'beginner',
      yearsPlaying: 1
    };
    setEditForm(prev => ({
      ...prev,
      sports: [...prev.sports, newSport]
    }));
  };

  const updateSport = (index: number, field: keyof UserSport, value: any) => {
    setEditForm(prev => ({
      ...prev,
      sports: prev.sports.map((sport, i) => 
        i === index ? { ...sport, [field]: value } : sport
      )
    }));
  };

  const removeSport = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      sports: prev.sports.filter((_, i) => i !== index)
    }));
  };

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
      'advanced': 'Avanzado'
    };
    return levelNames[level] || level;
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Mi Perfil
          </h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Perfil</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveProfile}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200"
              >
                <Save className="w-4 h-4" />
                <span>Guardar</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-all duration-200"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6"
            >
              {/* Avatar and Basic Info */}
              <div className="flex items-start space-x-6 mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  {!isEditing ? (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
                      <div className="flex items-center space-x-4 text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-emerald-400" />
                          <span>{user.stats.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4 text-emerald-400" />
                          <span>{user.stats.totalGames} partidos</span>
                        </div>
                      </div>
                      {user.bio && (
                        <p className="text-gray-300">{user.bio}</p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white"
                        placeholder="Nombre completo"
                      />
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-white resize-none"
                        rows={3}
                        placeholder="Cuéntanos sobre ti..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Información de Contacto</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-emerald-400" />
                    <span className="text-gray-300">{user.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-emerald-400" />
                    {!isEditing ? (
                      <span className="text-gray-300">{user.phone || 'No especificado'}</span>
                    ) : (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm"
                        placeholder="Teléfono"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    {!isEditing ? (
                      <span className="text-gray-300">{user.location}</span>
                    ) : (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm flex-1"
                        placeholder="Ubicación"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Sports */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Deportes que Practico</h3>
                  {isEditing && (
                    <button
                      onClick={addSport}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                    >
                      + Agregar Deporte
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {(isEditing ? editForm.sports : user.sports).map((sport, index) => (
                    <div key={index} className="bg-gray-700 rounded-xl p-4">
                      {!isEditing ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-white">{getSportName(sport.sport)}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>Nivel: {getLevelName(sport.level)}</span>
                              <span>Experiencia: {sport.yearsPlaying} años</span>
                              {sport.position && <span>Posición: {sport.position}</span>}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <select
                              value={sport.sport}
                              onChange={(e) => updateSport(index, 'sport', e.target.value)}
                              className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-1 text-white text-sm"
                            >
                              <option value="futbol5">Fútbol 5</option>
                              <option value="paddle">Paddle</option>
                              <option value="tenis">Tenis</option>
                              <option value="basquet">Básquet</option>
                            </select>
                            <button
                              onClick={() => removeSport(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={sport.level}
                              onChange={(e) => updateSport(index, 'level', e.target.value)}
                              className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-1 text-white text-sm"
                            >
                              <option value="beginner">Principiante</option>
                              <option value="intermediate">Intermedio</option>
                              <option value="advanced">Avanzado</option>
                            </select>
                            
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={sport.yearsPlaying}
                              onChange={(e) => updateSport(index, 'yearsPlaying', parseInt(e.target.value))}
                              className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-1 text-white text-sm"
                              placeholder="Años"
                            />
                          </div>
                          
                          {sport.sport === 'futbol5' && (
                            <input
                              type="text"
                              value={sport.position || ''}
                              onChange={(e) => updateSport(index, 'position', e.target.value)}
                              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-1 text-white text-sm"
                              placeholder="Posición (ej: Mediocampista)"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {user.sports.length === 0 && !isEditing && (
                    <p className="text-gray-400 text-center py-4">
                      No has agregado deportes aún
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Estadísticas</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-300">Partidos Jugados</span>
                  </div>
                  <span className="font-semibold text-white">{user.stats.totalGames}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-300">Reservas</span>
                  </div>
                  <span className="font-semibold text-white">{user.stats.totalReservations}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-300">Favoritos</span>
                  </div>
                  <span className="font-semibold text-white">{user.stats.favoriteVenuesCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-300">Amigos</span>
                  </div>
                  <span className="font-semibold text-white">{user.stats.friendsCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-300">Rating</span>
                  </div>
                  <span className="font-semibold text-white">{user.stats.rating.toFixed(1)}</span>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Logros</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-xl">
                  <Award className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="text-white font-medium">Jugador Activo</p>
                    <p className="text-gray-400 text-sm">+10 partidos jugados</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-xl">
                  <Heart className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="text-white font-medium">Explorador</p>
                    <p className="text-gray-400 text-sm">3+ canchas favoritas</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
