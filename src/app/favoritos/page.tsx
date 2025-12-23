'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, Filter, MapPin, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import FacilityCard from '@/components/FacilityCard';

// Mock data for facilities
const mockFacilities = [
  {
    id: '1',
    name: 'Club Deportivo San Lorenzo',
    sport: 'futbol5',
    location: 'Palermo, Buenos Aires',
    price: 8000,
    rating: 4.8,
    reviews: 124,
    amenities: ['Estacionamiento', 'Vestuarios', 'Parrilla'],
    availability: ['18:00', '19:00', '20:00', '21:00']
  },
  {
    id: '2',
    name: 'Padel Center Norte',
    sport: 'paddle',
    location: 'Belgrano, Buenos Aires',
    price: 6500,
    rating: 4.6,
    reviews: 89,
    amenities: ['Vestuarios', 'Cafetería', 'Aire acondicionado'],
    availability: ['17:00', '18:00', '19:00']
  },
  {
    id: '3',
    name: 'Tenis Club Recoleta',
    sport: 'tenis',
    location: 'Recoleta, Buenos Aires',
    price: 7500,
    rating: 4.9,
    reviews: 156,
    amenities: ['Vestuarios', 'Instructor', 'Alquiler de raquetas'],
    availability: ['16:00', '17:00', '18:00', '19:00']
  },
  {
    id: '4',
    name: 'Básquet Arena Villa Crespo',
    sport: 'basquet',
    location: 'Villa Crespo, Buenos Aires',
    price: 9000,
    rating: 4.7,
    reviews: 78,
    amenities: ['Estacionamiento', 'Vestuarios', 'Tribuna'],
    availability: ['19:00', '20:00', '21:00']
  },
  {
    id: '5',
    name: 'Complejo Deportivo Núñez',
    sport: 'futbol5',
    location: 'Núñez, Buenos Aires',
    price: 7200,
    rating: 4.5,
    reviews: 203,
    amenities: ['Estacionamiento', 'Vestuarios', 'Buffet', 'Parrilla'],
    availability: ['18:00', '19:00', '20:00', '21:00', '22:00']
  }
];

const FavoritesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [favoriteFacilities, setFavoriteFacilities] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.favoriteVenues) {
      // Filter facilities that are in user's favorites
      const favorites = mockFacilities.filter(facility => 
        user.favoriteVenues.includes(facility.id)
      );
      setFavoriteFacilities(favorites);
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Acceso Restringido</h1>
          <p className="text-gray-400">Debes iniciar sesión para ver tus favoritos</p>
        </div>
      </div>
    );
  }

  // Filter facilities based on search and sport
  const filteredFacilities = favoriteFacilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === 'all' || facility.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const getSportName = (sport: string) => {
    const sportNames: { [key: string]: string } = {
      'futbol5': 'Fútbol 5',
      'paddle': 'Padel',
      'tenis': 'Tenis',
      'basquet': 'Básquet'
    };
    return sportNames[sport] || sport;
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Mis Favoritos
            </h1>
          </div>
          <p className="text-gray-400">
            Tienes {favoriteFacilities.length} {favoriteFacilities.length === 1 ? 'cancha favorita' : 'canchas favoritas'}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar en favoritos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Sport Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              >
                <option value="all">Todos los deportes</option>
                <option value="futbol5">Fútbol 5</option>
                <option value="paddle">Padel</option>
                <option value="tenis">Tenis</option>
                <option value="basquet">Básquet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredFacilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFacilities.map((facility, index) => (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <FacilityCard 
                  facility={facility}
                  onReserve={() => window.location.href = `/reservar/${facility.id}`}
                />
              </motion.div>
            ))}
          </div>
        ) : favoriteFacilities.length === 0 ? (
          // No favorites at all
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Heart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">No tienes favoritos aún</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Explora canchas y guarda tus favoritas haciendo clic en el corazón. 
              Así podrás acceder rápidamente a los lugares que más te gustan.
            </p>
            <button
              onClick={() => window.location.href = '/buscar'}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 font-medium"
            >
              Explorar Canchas
            </button>
          </motion.div>
        ) : (
          // Has favorites but none match current filters
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-white mb-4">No se encontraron resultados</h2>
            <p className="text-gray-400 mb-6">
              Intenta cambiar los filtros o el término de búsqueda
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSport('all');
              }}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Limpiar filtros
            </button>
          </motion.div>
        )}

        {/* Quick Stats */}
        {favoriteFacilities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-gray-800 border border-gray-700 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Resumen de Favoritos</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {favoriteFacilities.length}
                </div>
                <div className="text-sm text-gray-400">Total Favoritos</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {(favoriteFacilities.reduce((sum, f) => sum + f.rating, 0) / favoriteFacilities.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">Rating Promedio</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  ${Math.round(favoriteFacilities.reduce((sum, f) => sum + f.price, 0) / favoriteFacilities.length).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Precio Promedio</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {new Set(favoriteFacilities.map(f => f.sport)).size}
                </div>
                <div className="text-sm text-gray-400">Deportes</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
