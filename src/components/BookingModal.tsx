'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, MapPin, Star } from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  sport: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  availability: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
  duration: number;
}

interface BookingModalProps {
  facility: Facility | null;
  selectedTimeSlot?: TimeSlot | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal = ({ facility, selectedTimeSlot, isOpen, onClose }: BookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [bookingStep, setBookingStep] = useState(1);

  // Set preselected time slot when modal opens
  useEffect(() => {
    if (selectedTimeSlot && isOpen) {
      setSelectedTimes([selectedTimeSlot.time]);
      // Set today's date as default when time slot is preselected
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
    } else if (isOpen) {
      // Reset when opening without preselected time
      setSelectedTimes([]);
      setSelectedDate('');
    }
  }, [selectedTimeSlot, isOpen]);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('es-AR', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        })
      });
    }
    return dates;
  };

  const calculateTotal = () => {
    if (!facility) return 0;
    return facility.price * selectedTimes.length;
  };

  const handleTimeToggle = (time: string) => {
    setSelectedTimes(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);
      } else {
        return [...prev, time].sort();
      }
    });
  };

  const handleBooking = () => {
    if (bookingStep === 1) {
      if (!selectedDate || selectedTimes.length === 0) {
        alert('Por favor selecciona fecha y al menos un horario');
        return;
      }
      setBookingStep(2);
    } else {
      // Simular proceso de reserva
      alert('¡Reserva confirmada! Te enviaremos un email con los detalles.');
      onClose();
      setBookingStep(1);
    }
  };

  if (!facility) return null;

  const getSportName = (sport: string) => {
    const sportNames: { [key: string]: string } = {
      'futbol5': 'Fútbol 5',
      'paddle': 'Padel',
      'tenis': 'Tenis',
      'basquet': 'Básquet',
      'voley': 'Vóley',
      'hockey': 'Hockey',
      'rugby': 'Rugby'
    };
    return sportNames[sport] || sport;
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Reservar Cancha
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Facility Info */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl bg-gray-700 p-3 rounded-xl">
                  {facility.sport === 'futbol5' && '⚽'}
                  {facility.sport === 'paddle' && '🏓'}
                  {facility.sport === 'tenis' && '🎾'}
                  {facility.sport === 'basquet' && '🏀'}
                  {facility.sport === 'voley' && '🏐'}
                  {facility.sport === 'hockey' && '🏒'}
                  {facility.sport === 'rugby' && '🏉'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{facility.name}</h3>
                  <p className="text-sm text-emerald-400">{getSportName(facility.sport)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{facility.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-current text-emerald-400" />
                  <span>{facility.rating} ({facility.reviews})</span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-2xl font-semibold text-white">${facility.price}</span>
                  <span className="text-gray-400">por hora</span>
                </div>
              </div>

              {bookingStep === 1 ? (
                <>
                  {/* Date Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fecha
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Seleccionar fecha</option>
                      {generateDates().map((date) => (
                        <option key={date.value} value={date.value}>
                          {date.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Horarios {selectedTimeSlot && <span className="text-emerald-400">(preseleccionado)</span>}
                      <span className="text-xs text-gray-400 block mt-1">
                        Selecciona uno o más horarios consecutivos
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {facility.availability.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeToggle(time)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            selectedTimes.includes(time)
                              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-emerald-500'
                              : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    {selectedTimes.length > 0 && (
                      <div className="mt-2 text-xs text-emerald-400">
                        {selectedTimes.length} horario{selectedTimes.length > 1 ? 's' : ''} seleccionado{selectedTimes.length > 1 ? 's' : ''}: {selectedTimes.join(', ')}
                      </div>
                    )}
                  </div>


                </>
              ) : (
                <>
                  {/* Booking Summary */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Resumen de la reserva</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fecha:</span>
                        <span className="font-medium text-white">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Horarios:</span>
                        <span className="font-medium text-white">{selectedTimes.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duración:</span>
                        <span className="font-medium text-white">{selectedTimes.length} hora{selectedTimes.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Total */}
              <div className="border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total</span>
                  <span className="text-xl font-semibold text-white">${calculateTotal()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              {/* Action Button */}
              <button
                onClick={handleBooking}
                disabled={!selectedDate || selectedTimes.length === 0}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mb-3"
              >
                {bookingStep === 1 ? 'Continuar' : 'Confirmar reserva'}
              </button>

              {bookingStep === 2 ? (
                <button
                  onClick={() => setBookingStep(1)}
                  className="w-full bg-gray-700 text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors border border-gray-600 mb-3"
                >
                  Volver
                </button>
              ) : null}

              <button
                onClick={onClose}
                className="w-full px-4 py-2 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-all duration-200 font-medium"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
