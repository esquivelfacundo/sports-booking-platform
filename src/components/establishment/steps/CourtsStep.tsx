'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  X,
  Check,
  Clock,
  DollarSign,
  Users,
  Lightbulb,
  Umbrella,
  Camera,
  Ruler,
  Save
} from 'lucide-react';
import { EstablishmentRegistration, Court, SPORTS_OPTIONS, SURFACE_OPTIONS } from '@/types/establishment';

interface CourtsStepProps {
  data: Partial<EstablishmentRegistration>;
  onUpdate: (data: Partial<EstablishmentRegistration>) => void;
  onValidation: (isValid: boolean) => void;
}

interface CourtFormData extends Omit<Court, 'id'> {
  id?: string;
}

const CourtsStep: React.FC<CourtsStepProps> = ({ data, onUpdate, onValidation }) => {
  const [courts, setCourts] = useState<Court[]>(data.courts || []);
  const [showForm, setShowForm] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [formData, setFormData] = useState<CourtFormData>({
    name: '',
    type: 'futbol',
    surface: 'Césped sintético',
    capacity: 10,
    pricePerHour: 5000,
    openTime: '08:00',
    closeTime: '22:00',
    lighting: true,
    covered: false,
    images: [],
    description: '',
    dimensions: { length: 40, width: 20 }
  });

  // Auto-validation: Courts step is always valid (optional step)
  useEffect(() => {
    onValidation(true);
    onUpdate({ courts });
  }, [courts, onUpdate, onValidation]);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'futbol',
      surface: 'Césped sintético',
      capacity: 10,
      pricePerHour: 5000,
      openTime: '08:00',
      closeTime: '22:00',
      lighting: true,
      covered: false,
      images: [],
      description: '',
      dimensions: { length: 40, width: 20 }
    });
    setEditingCourt(null);
  };

  const handleAddCourt = () => {
    setShowForm(true);
    resetForm();
  };

  const handleEditCourt = (court: Court) => {
    setEditingCourt(court);
    setFormData({ ...court });
    setShowForm(true);
  };

  const handleSaveCourt = () => {
    if (!formData.name.trim()) return;

    const courtData: Court = {
      ...formData,
      id: editingCourt?.id || `court-${Date.now()}`
    };

    if (editingCourt) {
      setCourts(prev => prev.map(court => 
        court.id === editingCourt.id ? courtData : court
      ));
    } else {
      setCourts(prev => [...prev, courtData]);
    }

    setShowForm(false);
    resetForm();
  };

  const handleDeleteCourt = (courtId: string) => {
    setCourts(prev => prev.filter(court => court.id !== courtId));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const getSportIcon = (type: string) => {
    const sport = SPORTS_OPTIONS.find(s => s.value === type);
    return sport?.icon || '⚽';
  };

  const getSportLabel = (type: string) => {
    const sport = SPORTS_OPTIONS.find(s => s.value === type);
    return sport?.label || type;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Canchas y Precios</h2>
        <p className="text-gray-400">Configura los espacios deportivos de tu establecimiento</p>
      </div>

      {/* Courts List */}
      <div className="space-y-6">
        {courts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-gray-700 rounded-xl border-2 border-dashed border-gray-600"
          >
            <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No hay canchas configuradas</h3>
            <p className="text-gray-400 mb-6">Agrega tu primera cancha para comenzar a recibir reservas</p>
            <button
              onClick={handleAddCourt}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar Primera Cancha</span>
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Canchas Configuradas ({courts.length})</h3>
              <button
                onClick={handleAddCourt}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Cancha</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courts.map((court, index) => (
                <motion.div
                  key={court.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-700 border border-gray-600 rounded-xl p-6 hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getSportIcon(court.type)}</div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{court.name}</h4>
                        <p className="text-gray-400 text-sm">{getSportLabel(court.type)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCourt(court)}
                        className="p-2 text-gray-400 hover:text-emerald-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourt(court.id!)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Superficie:</span>
                      <span className="text-white">{court.surface}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Capacidad:</span>
                      <span className="text-white">{court.capacity} jugadores</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Precio/hora:</span>
                      <span className="text-emerald-400 font-semibold">${court.pricePerHour.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Horario:</span>
                      <span className="text-white">{court.openTime} - {court.closeTime}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 pt-2">
                      {court.lighting && (
                        <div className="flex items-center space-x-1 text-yellow-400 text-xs">
                          <Lightbulb className="w-3 h-3" />
                          <span>Iluminación</span>
                        </div>
                      )}
                      {court.covered && (
                        <div className="flex items-center space-x-1 text-blue-400 text-xs">
                          <Umbrella className="w-3 h-3" />
                          <span>Techada</span>
                        </div>
                      )}
                    </div>

                    {court.images.length > 0 && (
                      <div className="flex space-x-2 pt-2">
                        {court.images.slice(0, 3).map((image, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={image}
                            alt={`${court.name} ${imgIndex + 1}`}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ))}
                        {court.images.length > 3 && (
                          <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center text-xs text-gray-400">
                            +{court.images.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Court Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingCourt ? 'Editar Cancha' : 'Agregar Nueva Cancha'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre de la Cancha *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ej: Cancha 1, Pista Central"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Deporte *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Court['type'] }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {SPORTS_OPTIONS.map(sport => (
                        <option key={sport.value} value={sport.value}>
                          {sport.icon} {sport.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Superficie *
                    </label>
                    <select
                      value={formData.surface}
                      onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {SURFACE_OPTIONS.map(surface => (
                        <option key={surface} value={surface}>
                          {surface}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Capacidad
                      </label>
                      <input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Precio/hora ($)
                      </label>
                      <input
                        type="number"
                        value={formData.pricePerHour}
                        onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Hora Apertura
                      </label>
                      <input
                        type="time"
                        value={formData.openTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, openTime: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Hora Cierre
                      </label>
                      <input
                        type="time"
                        value={formData.closeTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, closeTime: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      placeholder="Características especiales de la cancha..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Largo (m)
                      </label>
                      <input
                        type="number"
                        value={formData.dimensions?.length || 0}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          dimensions: { 
                            ...prev.dimensions!, 
                            length: parseInt(e.target.value) || 0 
                          } 
                        }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ancho (m)
                      </label>
                      <input
                        type="number"
                        value={formData.dimensions?.width || 0}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          dimensions: { 
                            ...prev.dimensions!, 
                            width: parseInt(e.target.value) || 0 
                          } 
                        }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.lighting}
                        onChange={(e) => setFormData(prev => ({ ...prev, lighting: e.target.checked }))}
                        className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                      />
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-300">Iluminación artificial</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.covered}
                        onChange={(e) => setFormData(prev => ({ ...prev, covered: e.target.checked }))}
                        className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                      />
                      <Umbrella className="w-5 h-5 text-blue-400" />
                      <span className="text-gray-300">Cancha techada</span>
                    </label>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fotos de la Cancha
                    </label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="court-image-upload"
                      />
                      <label htmlFor="court-image-upload" className="cursor-pointer">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Subir fotos</p>
                      </label>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCourt}
                  disabled={!formData.name.trim()}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                    formData.name.trim()
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{editingCourt ? 'Guardar Cambios' : 'Agregar Cancha'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourtsStep;
