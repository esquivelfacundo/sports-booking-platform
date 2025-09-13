'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, ChevronDown, Trophy, Zap, Target, Disc, Circle, Hexagon, Square, Octagon, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

const HeaderSearchBar = () => {
  const [location, setLocation] = useState('');
  const [sport, setSport] = useState('');
  const [date, setDate] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [isSportOpen, setIsSportOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const sportRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

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

  const router = useRouter();

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

    router.push(`/buscar?${searchParams.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center bg-gray-800 border border-gray-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 max-w-6xl mx-auto md:divide-x divide-gray-600">
      {/* Location */}
      <div className="flex-1 px-6 py-3 border-b md:border-b-0 border-gray-600">
        <label className="block text-xs font-medium text-gray-400 mb-1">Ubicación</label>
        <GooglePlacesAutocomplete
          value={location}
          onChange={(value, placeData) => {
            setLocation(value);
            // Store place data for filtering in search results
            if (placeData) {
              sessionStorage.setItem('selectedPlace', JSON.stringify(placeData));
            }
          }}
          placeholder="¿A dónde vas?"
          className="w-full text-sm text-white placeholder-gray-500 border-0 focus:ring-0 p-0 bg-transparent"
        />
      </div>
      {/* Sport */}
      <div className="flex-1 px-6 py-3 relative border-b md:border-b-0 border-gray-600" ref={sportRef}>
        <label className="block text-xs font-medium text-gray-400 mb-1">Deporte</label>
        <div className="relative">
          <button
            onClick={() => setIsSportOpen(!isSportOpen)}
            className="w-full text-sm text-white bg-transparent border-none outline-none appearance-none flex items-center justify-between cursor-pointer"
          >
            <span>{sports.find(s => s.value === sport)?.label || 'Todos'}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSportOpen ? 'rotate-180' : ''}`} />
          </button>
          {isSportOpen && (
            <div className="absolute top-full left-0 w-80 mt-1 bg-gray-700 border border-gray-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
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
      <div className="flex-1 px-6 py-3 border-b md:border-b-0 border-gray-600">
        <label className="block text-xs font-medium text-gray-400 mb-1">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full text-sm text-white border-0 focus:ring-0 p-0 bg-transparent"
          min={new Date().toISOString().split('T')[0]}
          suppressHydrationWarning={true}
        />
      </div>
      {/* Time Range */}
      <div className="flex-[1.6] px-6 py-3 relative border-b md:border-b-0 border-gray-600" ref={timeRef}>
        <label className="block text-xs font-medium text-gray-400 mb-1">Horario</label>
        <div className="relative">
          <button
            onClick={() => setIsTimeOpen(!isTimeOpen)}
            className="w-full text-sm text-white bg-transparent border-none outline-none appearance-none flex items-center justify-between cursor-pointer"
          >
            <span className="truncate">{timeRanges.find(t => t.value === timeRange)?.label || 'Cualquier hora'}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTimeOpen ? 'rotate-180' : ''}`} />
          </button>
          {isTimeOpen && (
            <div className="absolute top-full left-0 w-96 mt-1 bg-gray-700 border border-gray-600 rounded-xl shadow-xl z-50">
              {timeRanges.map((timeOption) => (
                <button
                  key={timeOption.value}
                  onClick={() => {
                    setTimeRange(timeOption.value);
                    setIsTimeOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-600 flex items-center space-x-3 text-white text-sm transition-colors first:rounded-t-xl last:rounded-b-xl whitespace-nowrap"
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
      <div className="px-6 py-3 md:px-2 md:py-3">
        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl w-full md:w-auto flex items-center justify-center"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HeaderSearchBar;
