'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Search, 
  MapPin,
  Star,
  Trophy,
  Grid,
  List,
  Loader2,
  Trash2
} from 'lucide-react';
import { usePlayerDashboard } from '@/hooks/usePlayerDashboard';
import Link from 'next/link';

const FavoritesSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { favorites, stats, loading, removeFavorite } = usePlayerDashboard();

  // Filter favorites by search term
  const filteredFavorites = favorites.filter(fav => 
    fav.establishmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fav.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const FavoriteCard = ({ item }: { item: typeof favorites[0] }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-md transition-all"
    >
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center">
          <Trophy className="w-12 h-12 text-emerald-400" />
        </div>
        <button 
          onClick={async () => {
            if (confirm('¿Quitar de favoritos?')) {
              await removeFavorite(item.establishmentId);
            }
          }}
          className="absolute top-3 right-3 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
        >
          <Heart className="w-4 h-4 text-white fill-current" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{item.establishmentName}</h3>
          {item.rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-gray-900 text-sm">{item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {item.location && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-3">
            <MapPin className="w-4 h-4" />
            <span>{item.location}</span>
          </div>
        )}
        
        {item.sports && item.sports.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {item.sports.slice(0, 3).map((sport: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                {sport}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          {item.priceRange && (
            <span className="text-emerald-600 font-semibold text-sm">{item.priceRange}</span>
          )}
          <Link 
            href={`/reservar/${item.establishmentId}`}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
          >
            Ver canchas
          </Link>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Mis Favoritos
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar favoritos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
          <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Favoritos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFavorites}</p>
            </div>
            <Heart className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Establecimientos Guardados</p>
              <p className="text-2xl font-bold text-gray-900">{filteredFavorites.length}</p>
            </div>
            <MapPin className="w-8 h-8 text-emerald-400" />
          </div>
        </motion.div>
      </div>

      {/* Content */}
      {filteredFavorites.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredFavorites.map((item) => (
            <FavoriteCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No tienes favoritos guardados
          </h3>
          <p className="text-gray-500 mb-4">
            Explora y marca como favoritos los establecimientos que más te gusten.
          </p>
          <Link 
            href="/buscar"
            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Explorar establecimientos
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default FavoritesSection;
