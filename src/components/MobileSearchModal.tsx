'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, ChevronDown, Trophy, Zap, Target, Disc, Circle, Hexagon, Square, Octagon, X, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSearchModal = ({ isOpen, onClose }: MobileSearchModalProps) => {
  const [location, setLocation] = useState('');
  const [sport, setSport] = useState('');
  const [date, setDate] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [isSportOpen, setIsSportOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sportRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sportRef.current && !sportRef.current.contains(event.target as Node)) {
        setIsSportOpen(false);
      }
      if (timeRef.current && !timeRef.current.contains(event.target as Node)) {
        setIsTimeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const sports = [
    { value: '', label: 'Todos', icon: Trophy },
    { value: 'futbol5', label: 'Fútbol 5', icon: Circle },
    { value: 'paddle', label: 'Paddle', icon: Square },
    { value: 'tenis', label: 'Tenis', icon: Disc },
    { value: 'basquet', label: 'Básquet', icon: Circle },
    { value: 'voley', label: 'Vóley', icon: Hexagon },
    { value: 'hockey', label: 'Hockey', icon: Zap },
    { value: 'rugby', label: 'Rugby', icon: Octagon }
  ];

  const timeRanges = [
    { value: '', label: 'Cualquier hora' },
    { value: 'morning', label: 'Mañana (06:00 - 12:00)' },
    { value: 'afternoon', label: 'Tarde (12:00 - 18:00)' },
    { value: 'evening', label: 'Noche (18:00 - 24:00)' }
  ];

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (location) searchParams.set('location', location);
    if (sport) searchParams.set('sport', sport);
    if (date) searchParams.set('date', date);
    if (timeRange) searchParams.set('timeRange', timeRange);

    onClose();
    router.push(`/buscar?${searchParams.toString()}`);
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-800 rounded-t-2xl z-[10000] max-h-[90vh] overflow-y-auto mx-0 w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">¿Qué estás buscando?</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Form */}
            <div className="p-6 space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Ubicación
                </label>
                <GooglePlacesAutocomplete
                  value={location}
                  onChange={(value, placeData) => {
                    setLocation(value);
                    if (placeData) {
                      sessionStorage.setItem('selectedPlace', JSON.stringify(placeData));
                    }
                  }}
                  placeholder="¿A dónde vas?"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Sport */}
              <div ref={sportRef}>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Trophy className="w-4 h-4 inline mr-2" />
                  Deporte
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsSportOpen(!isSportOpen)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <span>{sports.find(s => s.value === sport)?.label || 'Seleccionar deporte'}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSportOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isSportOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                      {sports.map((sportOption) => {
                        const IconComponent = sportOption.icon;
                        return (
                          <button
                            key={sportOption.value}
                            onClick={() => {
                              setSport(sportOption.value);
                              setIsSportOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-600 flex items-center space-x-3 text-white text-sm transition-colors first:rounded-t-xl last:rounded-b-xl"
                          >
                            <IconComponent className="w-4 h-4 text-emerald-400" />
                            <span>{sportOption.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time Range */}
              <div ref={timeRef}>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Horario
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsTimeOpen(!isTimeOpen)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <span>{timeRanges.find(t => t.value === timeRange)?.label || 'Cualquier hora'}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTimeOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isTimeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-xl shadow-xl z-50">
                      {timeRanges.map((timeOption) => (
                        <button
                          key={timeOption.value}
                          onClick={() => {
                            setTimeRange(timeOption.value);
                            setIsTimeOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-600 flex items-center space-x-3 text-white text-sm transition-colors first:rounded-t-xl last:rounded-b-xl"
                        >
                          <Clock className="w-4 h-4 text-emerald-400" />
                          <span>{timeOption.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5" />
                <span>Buscar canchas</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default MobileSearchModal;
