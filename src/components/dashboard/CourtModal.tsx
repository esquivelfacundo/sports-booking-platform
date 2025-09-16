'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Plus, 
  Upload,
  X,
  Clock,
  DollarSign,
  Users,
  Lightbulb,
  Umbrella,
  Camera,
  Save
} from 'lucide-react';
import { Court, SPORTS_OPTIONS, SURFACE_OPTIONS } from '@/types/establishment';

interface CourtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (court: Court) => void;
  editingCourt?: Court | null;
}

interface CourtFormData extends Omit<Court, 'id'> {
  id?: string;
}

const CourtModal: React.FC<CourtModalProps> = ({ isOpen, onClose, onSuccess, editingCourt }) => {
  const [formData, setFormData] = useState<CourtFormData>({
    name: editingCourt?.name || '',
    type: editingCourt?.type || 'futbol',
    surface: editingCourt?.surface || 'Césped sintético',
    capacity: editingCourt?.capacity || 10,
    pricePerHour: editingCourt?.pricePerHour || 5000,
    openTime: editingCourt?.openTime || '08:00',
    closeTime: editingCourt?.closeTime || '22:00',
    lighting: editingCourt?.lighting || true,
    covered: editingCourt?.covered || false,
    images: editingCourt?.images || [],
    description: editingCourt?.description || '',
    dimensions: editingCourt?.dimensions || { length: 40, width: 20 },
    lightingPrice: editingCourt?.lightingPrice || 0
  });

  // Estado para precio de iluminación
  const [lightingPrice, setLightingPrice] = useState<number>(editingCourt?.lightingPrice || 0);

  const handleSaveCourt = async () => {
    console.log('handleSaveCourt called');
    if (!formData.name.trim()) {
      console.log('Name is empty, returning');
      return;
    }

    const courtData: Court = {
      ...formData,
      lightingPrice: formData.lighting ? lightingPrice : 0,
      id: editingCourt?.id || `court-${Date.now()}`
    };

    console.log('Sending court data:', courtData);

    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'exists' : 'missing');
      
      const requestBody = {
        name: courtData.name,
        type: courtData.type,
        surface: courtData.surface,
        capacity: courtData.capacity,
        pricePerHour: courtData.pricePerHour,
        openTime: courtData.openTime,
        closeTime: courtData.closeTime,
        lighting: courtData.lighting,
        lightingPrice: courtData.lightingPrice || 0,
        covered: courtData.covered,
        description: courtData.description,
        length: courtData.dimensions?.length,
        width: courtData.dimensions?.width
      };

      console.log('Request body:', requestBody);
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/courts`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      const responseData = await response.text();
      console.log('Response data:', responseData);

      if (response.ok) {
        console.log('Court created successfully');
        onSuccess(courtData);
      } else {
        console.error('Error creating court:', response.status, responseData);
        alert(`Error creating court: ${response.status} - ${responseData}`);
      }
    } catch (error: any) {
      console.error('Network error:', error);
      alert(`Network error: ${error.message}`);
    }
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
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
                onClick={onClose}
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

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.lighting}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, lighting: e.target.checked }));
                          if (!e.target.checked) {
                            setLightingPrice(0);
                          }
                        }}
                        className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                      />
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-300">Iluminación artificial</span>
                    </label>
                    
                    {formData.lighting && (
                      <div className="mt-3 ml-8">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Precio extra por iluminación ($)
                        </label>
                        <input
                          type="number"
                          value={lightingPrice}
                          onChange={(e) => setLightingPrice(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="1000"
                          min="0"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Monto que se suma al precio base por hora cuando se usa iluminación
                        </p>
                      </div>
                    )}
                  </div>

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
                onClick={onClose}
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
  );
};

export default CourtModal;
