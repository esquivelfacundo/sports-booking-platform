'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, ChevronDown, Trophy, Zap, Target, Disc, Circle, Hexagon, Square, Octagon } from 'lucide-react';

interface SearchBarProps {
  currentCity: string;
}

const SearchBar = ({ currentCity }: SearchBarProps) => {
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isSportOpen, setIsSportOpen] = useState(false);
  const sportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sportRef.current && !sportRef.current.contains(event.target as Node)) {
        setIsSportOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Searching for:', { selectedSport, currentCity, selectedDate });
  };

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

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-2xl shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300">
      <div className="flex items-center divide-x divide-gray-600">
        {/* Location */}
        <div className="flex-1 px-6 py-4">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-1">
            Ubicación
          </div>
          <input
            type="text"
            value={currentCity}
            readOnly
            className="w-full text-sm text-white bg-transparent border-none outline-none placeholder-gray-400"
            placeholder="¿A dónde vas?"
          />
        </div>

        {/* Sport */}
        <div className="flex-1 px-6 py-4 relative" ref={sportRef}>
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-1">
            Deporte
          </div>
          <div className="relative">
            <button
              onClick={() => setIsSportOpen(!isSportOpen)}
              className="w-full text-sm text-white bg-transparent border-none outline-none appearance-none flex items-center justify-between"
            >
              <span>{sports.find(s => s.value === selectedSport)?.label || 'Todos'}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSportOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSportOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                {sports.map((sport) => {
                  const IconComponent = sport.icon;
                  return (
                    <button
                      key={sport.value}
                      onClick={() => {
                        setSelectedSport(sport.value);
                        setIsSportOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-600 flex items-center space-x-3 text-white text-sm transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <IconComponent className="w-4 h-4 text-emerald-400" />
                      <span>{sport.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="flex-1 px-6 py-4">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-1">
            Fecha
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full text-sm text-white bg-transparent border-none outline-none"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>


        {/* Search Button */}
        <div className="px-2 py-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-4 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <Search className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
