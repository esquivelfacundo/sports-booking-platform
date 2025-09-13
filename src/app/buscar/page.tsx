'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, Grid3X3, List, MapPin, Star, Heart } from 'lucide-react';
import dynamic from 'next/dynamic';
import FacilityCard from '@/components/FacilityCard';
import CompactFacilityCard from '@/components/CompactFacilityCard';
import BookingModal from '@/components/BookingModal';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { useAuth } from '@/contexts/AuthContext';

const MapView = dynamic(() => import('../../components/MapView'), {
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
  name: string;
  sport: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  coordinates: [number, number];
  amenities: string[];
  availability: string[];
  timeSlots?: TimeSlot[];
  priceFrom?: number;
}

const SearchContent = () => {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [showMap, setShowMap] = useState(true);
  // const [isLoading, setIsLoading] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [loading, setLoading] = useState(true);
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

  // Mock data - in a real app, this would come from an API
  const mockFacilities: Facility[] = [
    {
      id: '1',
      name: 'Complejo Deportivo San Lorenzo',
      sport: 'futbol5',
      location: 'Palermo, Buenos Aires',
      price: 2500,
      rating: 4.8,
      reviews: 124,
      image: '/api/placeholder/400/300',
      coordinates: [-34.5875, -58.4260],
      amenities: ['Estacionamiento', 'Vestuarios', 'Parrilla', 'Buffet'],
      availability: ['18:00', '19:00', '20:00', '21:00'],
      timeSlots: generateTimeSlots(),
      priceFrom: 2200
    },
    {
      id: '2',
      name: 'Paddle Club Norte',
      sport: 'paddle',
      location: 'Belgrano, Buenos Aires',
      price: 1800,
      rating: 4.6,
      reviews: 89,
      image: '/api/placeholder/400/300',
      coordinates: [-34.5633, -58.4583],
      amenities: ['Vestuarios', 'Alquiler de paletas', 'Cafetería'],
      availability: ['17:00', '18:00', '19:00'],
      timeSlots: generateTimeSlots(),
      priceFrom: 1600
    },
    {
      id: '3',
      name: 'Tennis Center Premium',
      sport: 'tenis',
      location: 'Recoleta, Buenos Aires',
      price: 3200,
      rating: 4.9,
      reviews: 156,
      image: '/api/placeholder/400/300',
      coordinates: [-34.5936, -58.3994],
      amenities: ['Vestuarios', 'Alquiler de raquetas', 'Instructor', 'Tienda'],
      availability: ['16:00', '17:00', '18:00', '19:00', '20:00'],
      timeSlots: generateTimeSlots(),
      priceFrom: 2800
    },
    {
      id: '4',
      name: 'Cancha Municipal Villa Crespo',
      sport: 'futbol5',
      location: 'Villa Crespo, Buenos Aires',
      price: 1900,
      rating: 4.3,
      reviews: 67,
      image: '/api/placeholder/400/300',
      coordinates: [-34.5998, -58.4317],
      amenities: ['Vestuarios', 'Estacionamiento'],
      availability: ['19:00', '20:00', '21:00'],
      timeSlots: generateTimeSlots(),
      priceFrom: 1700
    },
    {
      id: '5',
      name: 'Básquet Arena Pro',
      sport: 'basquet',
      location: 'Caballito, Buenos Aires',
      price: 2800,
      rating: 4.7,
      reviews: 93,
      image: '/api/placeholder/400/300',
      coordinates: [-34.6118, -58.4396],
      amenities: ['Vestuarios', 'Tribuna', 'Aire acondicionado', 'Buffet'],
      availability: ['18:00', '19:00', '20:00'],
      timeSlots: generateTimeSlots(),
      priceFrom: 2400
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setFacilities(mockFacilities);
      setLoading(false);
    }, 1000);

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
  }, []);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const locationParam = urlParams.get('location');
    const sportParam = urlParams.get('sport');
    const dateParam = urlParams.get('date');
    const timeRangeParam = urlParams.get('timeRange');
    
    if (locationParam) setSearchLocation(locationParam);
    if (sportParam) setSelectedSport(sportParam);
    if (dateParam) setSelectedDate(dateParam);
    if (timeRangeParam) setTimeRange(timeRangeParam);
  }, []);

  useEffect(() => {
    // Filtrar por parámetros de búsqueda y filtros
    const filteredFacilities = facilities.filter(facility => {
      const matchesLocation = !searchLocation || 
        facility.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
        facility.location.toLowerCase().includes(searchLocation.toLowerCase());
      
      const matchesSport = !selectedSport || facility.sport === selectedSport;
      
      const matchesDate = !selectedDate || facility.timeSlots?.some(slot => 
        slot.time === selectedDate
      );

      const matchesTimeRange = !timeRange || facility.timeSlots?.some(slot => {
        if (slot.time !== selectedDate && selectedDate) return false;
        
        const slotHour = parseInt(slot.time.split(':')[0]);
        switch (timeRange) {
          case 'morning':
            return slotHour >= 6 && slotHour < 12;
          case 'afternoon':
            return slotHour >= 12 && slotHour < 18;
          case 'evening':
            return slotHour >= 18 && slotHour <= 24;
          default:
            return true;
        }
      });

      return matchesLocation && matchesSport && matchesDate && matchesTimeRange;
    });

    setFilteredFacilities(filteredFacilities);
  }, [facilities, searchLocation, selectedSport, selectedDate, timeRange]);

  // Initialize filtered facilities when facilities are loaded
  useEffect(() => {
    if (facilities.length > 0 && filteredFacilities.length === 0) {
      setFilteredFacilities(facilities);
    }
  }, [facilities, filteredFacilities.length]);

  // Filter facilities based on map bounds and zoom level
  const handleMapChange = (bounds: any, center: {lat: number, lng: number}, zoom: number) => {
    setMapBounds(bounds);
    setMapCenter(center);
    setMapZoom(zoom);
  };

  // Apply map-based filtering
  useEffect(() => {
    // Start with all facilities
    let filtered = [...facilities];

    // Apply search parameters first
    const location = searchParams.get('location');
    const sport = searchParams.get('sport');

    if (sport && sport !== '') {
      filtered = filtered.filter(facility => facility.sport === sport);
    }

    if (location && location !== '') {
      filtered = filtered.filter(facility => 
        facility.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Apply additional filters
    if (selectedSports.length > 0) {
      filtered = filtered.filter(facility => selectedSports.includes(facility.sport));
    }

    filtered = filtered.filter(facility => 
      facility.price >= priceRange[0] && facility.price <= priceRange[1]
    );

    filtered = filtered.filter(facility => facility.rating >= minRating);

    // Apply map bounds filtering only if user has interacted with the map
    // Don't filter on initial load to show all pins by default
    if (mapBounds && mapCenter && mapZoom && mapZoom !== 13) { // 13 is initial zoom
      filtered = filtered.filter(facility => {
        const [lat, lng] = facility.coordinates;
        return (
          lat >= mapBounds.south &&
          lat <= mapBounds.north &&
          lng >= mapBounds.west &&
          lng <= mapBounds.east
        );
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        break;
    }

    setFilteredFacilities(filtered);
  }, [mapBounds, facilities, searchParams, selectedSports, priceRange, minRating, sortBy, mapCenter, mapZoom]);

  const handleReserve = (facility: Facility) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setSelectedFacility(facility);
    setIsModalOpen(true);
  };

  const handleLoginRequired = () => {
    setShowLoginModal(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFacility(null);
  };

  const getSportName = (sport: string) => {
    const sportNames: { [key: string]: string } = {
      'futbol5': 'Fútbol 5',
      'paddle': 'Paddle',
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
              <h1 className="text-2xl font-semibold text-white">
                {filteredFacilities.length} canchas disponibles
              </h1>
              <p className="text-gray-400 mt-1">
                {searchParams.get('location') && `en ${searchParams.get('location')}`}
                {(searchParams.get('sport') || selectedSport) && ` • ${getSportName((searchParams.get('sport') || selectedSport)!)}`}
                {(searchParams.get('date') || selectedDate) && ` • ${(searchParams.get('date') || selectedDate)}`}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
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
                      onLoginRequired={handleLoginRequired}
                    />
                  ) : (
                    <CompactFacilityCard 
                      facility={facility} 
                      onReserve={() => handleReserve(facility)}
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
            <MapView facilities={facilities} onMapChange={handleMapChange} />
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
                      onBookingClick={() => setSelectedFacility(facility)}
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando resultados...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
};

export default SearchPage;
