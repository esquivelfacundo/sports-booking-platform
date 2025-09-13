'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Filter, ChevronDown, X } from 'lucide-react';

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  sport: string;
  date: string;
  timeRange: string;
  priceRange: [number, number];
  showOnlyAvailable: boolean;
}

const SearchFilters = ({ onFiltersChange, initialFilters }: SearchFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sport: initialFilters?.sport || '',
    date: initialFilters?.date || '',
    timeRange: initialFilters?.timeRange || 'all',
    priceRange: initialFilters?.priceRange || [0, 100],
    showOnlyAvailable: initialFilters?.showOnlyAvailable ?? true,
  });

  const sports = [
    { id: 'futbol5', name: 'Fútbol 5', emoji: '⚽' },
    { id: 'paddle', name: 'Paddle', emoji: '🏓' },
    { id: 'tenis', name: 'Tenis', emoji: '🎾' },
    { id: 'basquet', name: 'Básquet', emoji: '🏀' },
    { id: 'voley', name: 'Vóley', emoji: '🏐' },
    { id: 'hockey', name: 'Hockey', emoji: '🏒' },
  ];

  const timeRanges = [
    { id: 'all', name: 'Todo el día', time: '00:00 - 23:59' },
    { id: 'morning', name: 'Mañana', time: '06:00 - 12:00' },
    { id: 'afternoon', name: 'Tarde', time: '12:00 - 18:00' },
    { id: 'evening', name: 'Noche', time: '18:00 - 24:00' },
  ];

  // Get next 7 days
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        month: monthNames[date.getMonth()],
        isToday: i === 0,
      });
    }
    
    return days;
  };

  const days = getNextDays();

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      sport: '',
      date: '',
      timeRange: 'all',
      priceRange: [0, 100],
      showOnlyAvailable: true,
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = filters.sport || filters.date || filters.timeRange !== 'all' || 
    filters.priceRange[0] > 0 || filters.priceRange[1] < 100 || !filters.showOnlyAvailable;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 mb-6">
      {/* Quick Filters Row */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Sport Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => updateFilter('sport', '')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-all duration-200 ${
              !filters.sport
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
            }`}
          >
            Todos
          </button>
          {sports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => updateFilter('sport', sport.id)}
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 ${
                filters.sport === sport.id
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <span>{sport.emoji}</span>
              <span className="text-sm font-medium">{sport.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">¿Qué día quieres jugar?</span>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {days.map((day) => (
            <button
              key={day.date}
              onClick={() => updateFilter('date', day.date)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border transition-all duration-200 min-w-[80px] ${
                filters.date === day.date
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <span className="text-xs font-medium">{day.dayName}</span>
              <span className="text-lg font-bold">{day.dayNumber}</span>
              <span className="text-xs">{day.month}</span>
              {day.isToday && (
                <span className="text-xs text-emerald-400 mt-1">Hoy</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Time Range */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">¿A qué hora?</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => updateFilter('timeRange', range.id)}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-200 ${
                filters.timeRange === range.id
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <span className="text-sm font-medium">{range.name}</span>
              <span className="text-xs opacity-80">{range.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filtros avanzados</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-gray-700 space-y-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Rango de precios: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </label>
                <div className="flex space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.priceRange[0]}
                    onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                    className="flex-1 accent-emerald-500"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.priceRange[1]}
                    onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                    className="flex-1 accent-emerald-500"
                  />
                </div>
              </div>

              {/* Show Only Available */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Mostrar solo horarios disponibles</span>
                <button
                  onClick={() => updateFilter('showOnlyAvailable', !filters.showOnlyAvailable)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    filters.showOnlyAvailable ? 'bg-emerald-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      filters.showOnlyAvailable ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchFilters;
