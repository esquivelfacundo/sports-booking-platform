'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, Grid3X3, List, MapPin, Star, Heart, ArrowUp, ArrowDown } from 'lucide-react';
import UnifiedLoader from '@/components/ui/UnifiedLoader';
import dynamic from 'next/dynamic';
import FacilityCard from '@/components/FacilityCard';
import CompactFacilityCard from '@/components/CompactFacilityCard';
import BookingModal from '@/components/BookingModal';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { useAuth } from '@/contexts/AuthContext';
import { useEstablishments } from '@/hooks/useEstablishments';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
  </div>
});

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
  duration: number;
}

interface Facility {
  id: string;
  slug?: string;
  name: string;
  sport: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image?: string;
  coordinates?: [number, number];
  amenities: string[];
  availability: string[];
  timeSlots?: TimeSlot[];
  priceFrom?: number;
}

const SearchContent = () => {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [showMap, setShowMap] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [timeRange, setTimeRange] = useState('');

  // Use establishments hook
  const { establishments, loading, fetchEstablishments } = useEstablishments({
    autoFetch: false
  });

  // Generate mock time slots for facilities
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    
    times.forEach(time => {
      slots.push({
        time,
        available: Math.random() > 0.3,
        price: Math.floor(Math.random() * 3000) + 1500,
        duration: 60
      });
    });
    
    return slots;
  };

  // Convert establishments to facilities format
  useEffect(() => {
    if (establishments.length > 0) {
      const convertedFacilities = establishments.map(est => ({
        id: est.id,
        slug: est.slug,
        name: est.name,
        sport: est.sports[0] === 'futbol5' ? 'Fútbol 5' :
               est.sports[0] === 'paddle' ? 'Padel' :
               est.sports[0] === 'tenis' ? 'Tenis' : 'Deporte',
        location: `${est.address}, ${est.city}`,
        price: 8000, // Default price
        rating: est.rating,
        reviews: est.reviewCount,
        image: (est.images && Array.isArray(est.images) && est.images.length > 0) ? est.images[0] : 
               '/assets/default-card.png',
        coordinates: (est.latitude && est.longitude) ? 
          [Number(est.latitude), Number(est.longitude)] as [number, number] : 
          undefined, // Use real coordinates from establishment or undefined if not available
        amenities: est.amenities,
        availability: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'],
        timeSlots: generateTimeSlots(),
        priceFrom: 2000
      }));
      setFacilities(convertedFacilities);
    } else {
      // No mock data - show empty state
      setFacilities([]);
    }
  }, [establishments]);

  useEffect(() => {
    // Initialize search based on URL params
    const location = searchParams.get('location') || '';
    const sport = searchParams.get('sport') || '';
    const date = searchParams.get('date') || '';
    
    setSearchLocation(location);
    setSelectedSport(sport);
    setSelectedDate(date);
    
    // Fetch establishments from API
    fetchEstablishments({
      search: location,
      sport: sport,
      city: location
    });

    // Check for selected place from Google Places
    const storedPlace = sessionStorage.getItem('selectedPlace');
    if (storedPlace) {
      try {
        const placeData = JSON.parse(storedPlace);
        setSelectedPlace(placeData);
        sessionStorage.removeItem('selectedPlace'); // Clean up
      } catch (error) {
        console.error('Error parsing stored place data:', error);
      }
    }
  }, [searchParams]); // Remove fetchEstablishments from dependencies


  // Remove this duplicate useEffect as it's redundant with the one above

  // Remove this useEffect as it's causing conflicts with the main filtering logic below

  // Remove this useEffect as it conflicts with the main filtering logic

  // Filter facilities based on map bounds and zoom level
  const handleMapChange = (bounds: any, center: {lat: number, lng: number}, zoom: number) => {
    setMapBounds(bounds);
    setMapCenter(center);
    setMapZoom(zoom);
  };

  // Simplified filtering - show all facilities for now
  useEffect(() => {
    if (facilities.length === 0) {
      setFilteredFacilities([]);
      return;
    }

    // For now, show all facilities without any filtering
    setFilteredFacilities([...facilities]);
  }, [facilities]);

  const handleReserve = (facility: Facility) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setSelectedFacility(facility);
    setSelectedTimeSlot(null);
    setIsModalOpen(true);
  };

  const handleTimeSlotSelect = (facility: Facility, timeSlot: TimeSlot) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setSelectedFacility(facility);
    setSelectedTimeSlot(timeSlot);
    setIsModalOpen(true);
  };

  const handleLoginRequired = () => {
    setShowLoginModal(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFacility(null);
    setSelectedTimeSlot(null);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Buscando canchas disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">

      {/* Results Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-white">
                {filteredFacilities.length} canchas disponibles
              </h1>
              {(searchParams.get('date') || selectedDate) && (
                <p className="text-sm text-gray-400 mt-1">
                  para el {(searchParams.get('date') || selectedDate)}
                </p>
              )}
              <p className="text-gray-400 mt-1 hidden md:block">
                {searchParams.get('location') && `en ${searchParams.get('location')}`}
                {(searchParams.get('sport') || selectedSport) && ` • ${getSportName((searchParams.get('sport') || selectedSport)!)}`}
              </p>
            </div>
            
            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-700 transition-all duration-200"
              >
                <option value="relevance">Más relevantes</option>
                <option value="price_low">Precio: menor a mayor</option>
                <option value="price_high">Precio: mayor a menor</option>
                <option value="rating">Mejor calificados</option>
                <option value="reviews">Más reseñas</option>
              </select>

              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-600 rounded-xl hover:bg-gray-700 transition-all duration-200 bg-gray-800"
              >
                <Filter className="w-4 h-4 text-gray-300" />
                <span className="text-gray-300 font-medium">Filtros</span>
              </button>
              
              <div className="flex items-center border border-gray-600 rounded-xl bg-gray-800">
                <button
                  onClick={() => setShowMap(false)}
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 rounded-l-xl ${
                    !showMap 
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white' 
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowMap(true)}
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 rounded-r-xl ${
                    showMap 
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white' 
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center space-x-3">
              <button
                onClick={() => setSortBy(sortBy === 'price_low' ? 'price_high' : 'price_low')}
                className="p-2 border border-gray-600 rounded-xl hover:bg-gray-700 transition-all duration-200 bg-gray-800"
              >
                {sortBy === 'price_low' ? (
                  <ArrowUp className="w-4 h-4 text-gray-300" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-gray-300" />
                )}
              </button>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 border border-gray-600 rounded-xl hover:bg-gray-700 transition-all duration-200 bg-gray-800"
              >
                <Filter className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 lg:px-8 py-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Precio por hora
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    placeholder="Mín"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    placeholder="Máx"
                  />
                </div>
              </div>
            </div>

            {/* Sports Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deportes
              </label>
              <div className="space-y-2">
                {['futbol5', 'paddle', 'tenis', 'basquet'].map((sport) => (
                  <label key={sport} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSports.includes(sport)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSports([...selectedSports, sport]);
                        } else {
                          setSelectedSports(selectedSports.filter(s => s !== sport));
                        }
                      }}
                      className="rounded border-gray-600 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-300">{getSportName(sport)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Calificación mínima
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              >
                <option value={0}>Cualquiera</option>
                <option value={3}>3+ estrellas</option>
                <option value={4}>4+ estrellas</option>
                <option value={4.5}>4.5+ estrellas</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setPriceRange([0, 5000]);
                  setSelectedSports([]);
                  setMinRating(0);
                }}
                className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex">
        {/* Facilities List */}
        <div className={`${showMap ? 'hidden md:block md:w-1/2' : 'w-full'} transition-all duration-300`}>
          <div className="p-6 bg-gray-900">
            <div className={`grid gap-6 ${
              showMap 
                ? 'grid-cols-1 lg:grid-cols-2' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
            }`}>
              {filteredFacilities.map((facility, index) => (
                <motion.div
                  key={facility.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {showMap ? (
                    <FacilityCard 
                      facility={facility} 
                      onReserve={() => handleReserve(facility)}
                      onTimeSlotSelect={handleTimeSlotSelect}
                      onLoginRequired={handleLoginRequired}
                    />
                  ) : (
                    <CompactFacilityCard 
                      facility={facility} 
                      onReserve={() => handleReserve(facility)}
                      onTimeSlotSelect={handleTimeSlotSelect}
                      onLoginRequired={handleLoginRequired}
                    />
                  )}
                </motion.div>
              ))}
            </div>
            
            {filteredFacilities.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏟️</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No encontramos canchas
                </h3>
                <p className="text-gray-400">
                  Intentá cambiar los filtros de búsqueda o la ubicación
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Map - Hidden on mobile */}
        {showMap && (
          <div className="hidden md:block md:w-1/2 h-screen sticky top-0">
            <MapView 
              facilities={filteredFacilities} 
              onMapChange={handleMapChange}
              searchLocation={searchLocation}
            />
          </div>
        )}

        {/* Mobile-only facilities list when map is shown */}
        {showMap && (
          <div className="block md:hidden w-full">
            <div className="p-6 bg-gray-900">
              <div className="grid gap-6 grid-cols-1">
                {filteredFacilities.map((facility, index) => (
                  <motion.div
                    key={`mobile-${facility.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <FacilityCard 
                      facility={facility} 
                      onReserve={() => handleReserve(facility)}
                      onTimeSlotSelect={handleTimeSlotSelect}
                      onLoginRequired={handleLoginRequired}
                    />
                  </motion.div>
                ))}
              </div>
              
              {filteredFacilities.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏟️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No encontramos canchas
                  </h3>
                  <p className="text-gray-400">
                    Intentá cambiar los filtros de búsqueda o la ubicación
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal 
        facility={selectedFacility}
        selectedTimeSlot={selectedTimeSlot}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      {/* Register Modal */}
      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
};

const SearchPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <UnifiedLoader size="lg" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
};

export default SearchPage;
