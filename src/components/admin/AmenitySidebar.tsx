'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Loader2,
  DollarSign,
  Users,
  Eye,
  EyeOff,
  Calendar,
  Sparkles,
  Coffee,
  Waves,
  Dumbbell,
  Car,
  Wifi,
  ShowerHead,
  UtensilsCrossed,
  TreePine,
  Flame,
  Music,
  Tv,
  Baby,
  Dog,
  Accessibility,
  Lock
} from 'lucide-react';

interface Amenity {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  pricePerHour: number;
  pricePerHour90?: number;
  pricePerHour120?: number;
  isBookable: boolean;
  isPublic: boolean;
  isActive?: boolean;
  capacity?: number;
}

interface AmenitySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Amenity>) => Promise<void>;
  amenity?: Amenity | null;
  mode: 'create' | 'edit';
}

const AMENITY_ICONS = [
  { name: 'Sparkles', icon: Sparkles, label: 'General' },
  { name: 'Coffee', icon: Coffee, label: 'Cafetería' },
  { name: 'Waves', icon: Waves, label: 'Pileta' },
  { name: 'Dumbbell', icon: Dumbbell, label: 'Gimnasio' },
  { name: 'Car', icon: Car, label: 'Estacionamiento' },
  { name: 'Wifi', icon: Wifi, label: 'WiFi' },
  { name: 'ShowerHead', icon: ShowerHead, label: 'Vestuario' },
  { name: 'UtensilsCrossed', icon: UtensilsCrossed, label: 'Quincho' },
  { name: 'TreePine', icon: TreePine, label: 'Jardín' },
  { name: 'Flame', icon: Flame, label: 'Parrilla' },
  { name: 'Music', icon: Music, label: 'Música' },
  { name: 'Tv', icon: Tv, label: 'TV' },
  { name: 'Baby', icon: Baby, label: 'Niños' },
  { name: 'Dog', icon: Dog, label: 'Mascotas' },
  { name: 'Accessibility', icon: Accessibility, label: 'Accesible' },
  { name: 'Lock', icon: Lock, label: 'Lockers' },
];

export default function AmenitySidebar({ 
  isOpen, 
  onClose, 
  onSave, 
  amenity, 
  mode 
}: AmenitySidebarProps) {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Amenity>>({
    name: '',
    description: '',
    icon: 'Sparkles',
    pricePerHour: 0,
    pricePerHour90: undefined,
    pricePerHour120: undefined,
    isBookable: true,
    isPublic: true,
    capacity: undefined,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (amenity && mode === 'edit') {
      setFormData({
        name: amenity.name,
        description: amenity.description || '',
        icon: amenity.icon || 'Sparkles',
        pricePerHour: amenity.pricePerHour,
        pricePerHour90: amenity.pricePerHour90,
        pricePerHour120: amenity.pricePerHour120,
        isBookable: amenity.isBookable,
        isPublic: amenity.isPublic,
        capacity: amenity.capacity,
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        icon: 'Sparkles',
        pricePerHour: 0,
        pricePerHour90: undefined,
        pricePerHour120: undefined,
        isBookable: true,
        isPublic: true,
        capacity: undefined,
      });
    }
  }, [amenity, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving amenity:', error);
    } finally {
      setSaving(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconData = AMENITY_ICONS.find(i => i.name === iconName);
    return iconData ? iconData.icon : Sparkles;
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-900 border-l border-gray-800 z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">
                {mode === 'create' ? 'Nuevo Amenity' : 'Editar Amenity'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Quincho, Pileta, Vestuario..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción opcional del amenity..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icono
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {AMENITY_ICONS.map(({ name, icon: Icon, label }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: name })}
                      className={`p-2 rounded-lg transition-colors ${
                        formData.icon === name
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                      title={label}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Precios
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">1 hora *</label>
                    <input
                      type="number"
                      value={formData.pricePerHour || ''}
                      onChange={(e) => setFormData({ ...formData, pricePerHour: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">1.5 horas</label>
                    <input
                      type="number"
                      value={formData.pricePerHour90 || ''}
                      onChange={(e) => setFormData({ ...formData, pricePerHour90: parseFloat(e.target.value) || undefined })}
                      placeholder="Opcional"
                      min="0"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">2 horas</label>
                    <input
                      type="number"
                      value={formData.pricePerHour120 || ''}
                      onChange={(e) => setFormData({ ...formData, pricePerHour120: parseFloat(e.target.value) || undefined })}
                      placeholder="Opcional"
                      min="0"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Precio $0 = Gratis para los clientes
                </p>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Capacidad máxima
                </label>
                <input
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || undefined })}
                  placeholder="Sin límite"
                  min="1"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Visibility Options */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300">Visibilidad y reservas</h3>
                
                {/* Is Bookable */}
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-white">Reservable</p>
                      <p className="text-xs text-gray-500">Puede ser reservado como item independiente</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isBookable}
                    onChange={(e) => setFormData({ ...formData, isBookable: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
                  />
                </label>

                {/* Is Public */}
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750">
                  <div className="flex items-center gap-3">
                    {formData.isPublic ? (
                      <Eye className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="text-sm text-white">Visible para clientes</p>
                      <p className="text-xs text-gray-500">
                        {formData.isPublic 
                          ? 'Los clientes pueden ver y reservar este amenity' 
                          : 'Solo gestión interna (no aparece en /reservar)'}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </form>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving || !formData.name}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {mode === 'create' ? 'Crear Amenity' : 'Guardar Cambios'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
