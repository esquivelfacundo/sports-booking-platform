'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Save, 
  X, 
  Camera,
  Trophy,
  Star,
  Calendar,
  Users,
  Shield,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProvinceSelect from '@/components/ProvinceSelect';

interface ProfileSectionProps {
  user: any;
  updateProfile: any;
}

const ProfileSection = ({ user, updateProfile }: ProfileSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [selectedSports, setSelectedSports] = useState<any[]>([]);
  const [showSportsModal, setShowSportsModal] = useState(false);

  // Function to translate skill levels to Spanish
  const getSkillLevelInSpanish = (level: string): string => {
    const translations: { [key: string]: string } = {
      'Beginner': 'Principiante',
      'Intermediate': 'Intermedio',
      'Advanced': 'Avanzado',
      'Professional': 'Profesional'
    };
    return translations[level] || level;
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    province: user?.province || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
    location: user?.location || '',
    bio: user?.bio || '',
    birthDate: user?.birthDate || '',
    preferredTimes: user?.preferredTimes || [],
    sports: user?.sports || []
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        ...formData,
        avatar: previewImage || user?.avatar
      };
      
      await updateProfile(updatedData);
      setIsEditing(false);
      setPreviewImage(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      province: user?.province || '',
      city: user?.city || '',
      postalCode: user?.postalCode || '',
      location: user?.location || '',
      bio: user?.bio || '',
      birthDate: user?.birthDate || '',
      preferredTimes: user?.preferredTimes || [],
      sports: user?.sports || []
    });
    setPreviewImage(null);
    setIsEditing(false);
  };

  const startEditing = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      province: user?.province || '',
      city: user?.city || '',
      postalCode: user?.postalCode || '',
      location: user?.location || '',
      bio: user?.bio || '',
      birthDate: user?.birthDate || '',
      preferredTimes: user?.preferredTimes || [],
      sports: user?.sports || []
    });
    setIsEditing(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Mi Perfil
        </h1>
        {!isEditing ? (
          <button
            onClick={startEditing}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Editar</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
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
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
            {/* Avatar Section */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                  {(previewImage || user?.avatar) ? (
                    <img
                      src={previewImage || user?.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                  {user?.isPhoneVerified && (
                    <div className="flex items-center space-x-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-sm border border-emerald-500/30">
                      <Shield className="w-3 h-3" />
                      <span className="text-xs font-medium">Verificado</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-400">{user?.level || 'Jugador'}</p>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-white">{user?.stats?.rating || 0}</span>
                  <span className="text-gray-400 ml-2">
                    ({user?.stats?.reviewsReceived || 0} reseñas)
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{user?.name || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{user?.email || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{user?.phone || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Fecha de Nacimiento
                    </label>
                    <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded-full">Privado</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-white">
                        {user?.birthDate ? new Date(user.birthDate).toLocaleDateString('es-AR') : 'No especificada'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ubicación - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ubicación
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ProvinceSelect
                      value={formData.province}
                      onChange={(value) => setFormData(prev => ({ ...prev, province: value }))}
                      placeholder="Selecciona provincia"
                      className="rounded-lg"
                    />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Ciudad"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="Código Postal"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div className="flex flex-col space-y-1">
                      <span className="text-white">
                        {user?.city && user?.province ? `${user.city}, ${user.province}` : 'No especificado'}
                      </span>
                      {user?.postalCode && (
                        <span className="text-sm text-gray-400">CP: {user.postalCode}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Biografía
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                    placeholder="Cuéntanos sobre ti..."
                  />
                ) : (
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">
                      {user?.bio || 'No hay biografía disponible'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Estadísticas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-emerald-400" />
                  <span className="text-gray-300">Partidos</span>
                </div>
                <span className="text-white font-semibold">
                  {user?.stats?.totalGames || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Reservas</span>
                </div>
                <span className="text-white font-semibold">
                  {user?.stats?.totalReservations || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Amigos</span>
                </div>
                <span className="text-white font-semibold">
                  {user?.stats?.friendsCount || 0}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Deportes</h3>
            </div>
            
            {!isEditing ? (
              // Display mode - show selected sports in a clean grid
              <div className="space-y-3">
                {(user?.sports || []).length > 0 ? (
                  (user?.sports || []).map((sport: any, index: number) => {
                    const sportId = sport.sportId || sport.sport;
                    const skillLevel = sport.skillLevel || sport.level;
                    const yearsPlaying = sport.yearsPlaying || 1;
                    const gamesPlayed = sport.gamesPlayed || 0;
                    
                    const availableSports = [
                      { id: 'futbol5', name: 'Fútbol 5', icon: '⚽', color: 'from-green-500 to-green-600' },
                      { id: 'futbol11', name: 'Fútbol 11', icon: '⚽', color: 'from-blue-500 to-blue-600' },
                      { id: 'paddle', name: 'Pádel', icon: '🎾', color: 'from-orange-500 to-orange-600' },
                      { id: 'tenis', name: 'Tenis', icon: '🎾', color: 'from-yellow-500 to-yellow-600' },
                      { id: 'basquet', name: 'Básquet', icon: '🏀', color: 'from-purple-500 to-purple-600' },
                      { id: 'voley', name: 'Vóley', icon: '🏐', color: 'from-pink-500 to-pink-600' }
                    ];
                    
                    const sportInfo = availableSports.find(s => s.id === sportId);
                    
                    return (
                      <div key={index} className={`p-4 rounded-xl bg-gradient-to-r ${sportInfo?.color || 'from-gray-500 to-gray-600'} text-white`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{sportInfo?.icon || '🏃'}</span>
                            <div>
                              <h4 className="font-semibold">{sportInfo?.name || sportId}</h4>
                              <p className="text-sm opacity-90">{getSkillLevelInSpanish(skillLevel)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="bg-white/20 rounded-full px-3 py-1">
                              <span className="text-sm font-bold">{gamesPlayed}</span>
                            </div>
                            <p className="text-xs opacity-75 mt-1">partidos</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-center py-8">No hay deportes configurados</p>
                )}
              </div>
            ) : (
              // Edit mode - show interactive sport selection grid like registration form
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'futbol5', name: 'Fútbol 5', icon: '⚽', color: 'from-green-500 to-green-600' },
                    { id: 'futbol11', name: 'Fútbol 11', icon: '⚽', color: 'from-blue-500 to-blue-600' },
                    { id: 'paddle', name: 'Pádel', icon: '🎾', color: 'from-orange-500 to-orange-600' },
                    { id: 'tenis', name: 'Tenis', icon: '🎾', color: 'from-yellow-500 to-yellow-600' },
                    { id: 'basquet', name: 'Básquet', icon: '🏀', color: 'from-purple-500 to-purple-600' },
                    { id: 'voley', name: 'Vóley', icon: '🏐', color: 'from-pink-500 to-pink-600' }
                  ].map((sport) => {
                    const selectedSport = formData.sports.find((s: any) => (s.sportId || s.sport) === sport.id);
                    const isSelected = !!selectedSport;
                    
                    return (
                      <motion.div
                        key={sport.id}
                        className="space-y-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <motion.button
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              // Remove sport
                              const newSports = formData.sports.filter((s: any) => (s.sportId || s.sport) !== sport.id);
                              setFormData(prev => ({ ...prev, sports: newSports }));
                            } else {
                              // Add sport
                              setFormData(prev => ({
                                ...prev,
                                sports: [...prev.sports, { sportId: sport.id, skillLevel: 'intermediate', yearsPlaying: 1, gamesPlayed: 0 }]
                              }));
                            }
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                            isSelected
                              ? `bg-gradient-to-r ${sport.color} border-transparent text-white shadow-lg`
                              : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:border-gray-500'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-2xl mb-2">{sport.icon}</div>
                          <div className="text-sm font-medium">{sport.name}</div>
                        </motion.button>
                        
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            <select
                              value={selectedSport?.skillLevel || 'intermediate'}
                              onChange={(e) => {
                                const newSports = [...formData.sports];
                                const sportIndex = newSports.findIndex((s: any) => (s.sportId || s.sport) === sport.id);
                                if (sportIndex !== -1) {
                                  newSports[sportIndex] = { ...newSports[sportIndex], skillLevel: e.target.value };
                                  setFormData(prev => ({ ...prev, sports: newSports }));
                                }
                              }}
                              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="beginner">Principiante</option>
                              <option value="intermediate">Intermedio</option>
                              <option value="advanced">Avanzado</option>
                              <option value="professional">Profesional</option>
                            </select>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                
                {formData.sports.length === 0 && (
                  <p className="text-gray-400 text-center py-4 text-sm">Selecciona los deportes que practicas</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
