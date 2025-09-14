'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  X, 
  Image as ImageIcon
} from 'lucide-react';
import { EstablishmentRegistration } from '@/types/establishment';

interface ImagesStepProps {
  data: Partial<EstablishmentRegistration>;
  onUpdate: (data: Partial<EstablishmentRegistration>) => void;
  onValidation: (isValid: boolean) => void;
}

const ImagesStep: React.FC<ImagesStepProps> = ({ data, onUpdate, onValidation }) => {
  const [formData, setFormData] = useState({
    images: data.images || { photos: [] }
  });

  const [mounted, setMounted] = useState(false);

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validation - always valid since images are optional
  useEffect(() => {
    if (!mounted) return;
    onValidation(true);
  }, [mounted, onValidation]);

  // Update parent data
  useEffect(() => {
    if (!mounted) return;
    onUpdate(formData);
  }, [formData, mounted, onUpdate]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto = {
            id: Date.now() + Math.random(),
            url: e.target?.result as string,
            name: file.name,
            size: file.size
          };
          
          setFormData(prev => ({
            ...prev,
            images: {
              ...prev.images,
              photos: [...prev.images.photos, newPhoto]
            }
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removePhoto = (photoId: number) => {
    setFormData(prev => ({
      ...prev,
      images: {
        ...prev.images,
        photos: prev.images.photos.filter(photo => 
          typeof photo === 'object' && photo.id !== photoId
        )
      }
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Fotos del Establecimiento</h2>
        <p className="text-gray-400">Muestra tu establecimiento con imágenes atractivas</p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Subir Fotos</h3>
                <p className="text-gray-400 mb-4">
                  Arrastra y suelta las imágenes aquí, o haz clic para seleccionar
                </p>
                <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Seleccionar Archivos</span>
                </div>
              </div>
            </div>
          </label>
        </div>

        {/* Photo Grid */}
        {formData.images.photos.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Fotos Subidas ({formData.images.photos.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.images.photos.map((photo, index) => {
                // Handle both string URLs and photo objects
                if (typeof photo === 'string') {
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  );
                }
                
                // Handle photo objects
                return (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 truncate">{photo.name}</p>
                      <p className="text-xs text-gray-500">
                        {(photo.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ImageIcon className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-white font-medium mb-1">Consejos para mejores fotos</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Incluye fotos del exterior e interior del establecimiento</li>
                <li>• Muestra las canchas y áreas de juego</li>
                <li>• Captura los vestuarios y servicios disponibles</li>
                <li>• Usa buena iluminación y ángulos atractivos</li>
                <li>• Las fotos de alta calidad atraen más reservas</li>
              </ul>
            </div>
          </div>
        </div>

        {formData.images.photos.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">
              No hay fotos subidas aún. Puedes agregar fotos más tarde desde tu panel de administración.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ImagesStep;
