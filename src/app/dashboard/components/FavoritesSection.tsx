'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Search, 
  Filter,
  MapPin,
  Star,
  Clock,
  Users,
  Trophy,
  ChevronDown,
  Grid,
  List
} from 'lucide-react';

interface FavoritesSectionProps {
  user: any;
}

const FavoritesSection: React.FC<FavoritesSectionProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('establishments');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with real API call
  const favorites = {
    establishments: [
      {
        id: 1,
        name: 'Club Deportivo Central',
        location: 'Palermo, CABA',
        rating: 4.8,
        reviews: 124,
        image: '/api/placeholder/300/200',
        sports: ['Tenis', 'Padel', 'Fútbol 5'],
        priceRange: '$1,500 - $3,000',
        distance: '2.3 km'
      },
      {
        id: 2,
        name: 'Padel Club Norte',
        location: 'Belgrano, CABA',
        rating: 4.6,
        reviews: 89,
        image: '/api/placeholder/300/200',
        sports: ['Padel', 'Tenis'],
        priceRange: '$1,800 - $2,500',
        distance: '3.1 km'
      }
    ],
    courts: [
      {
        id: 1,
        name: 'Cancha de Tenis #1',
        establishment: 'Club Deportivo Central',
        location: 'Palermo, CABA',
        sport: 'Tenis',
        rating: 4.9,
        price: '$2,500/hora',
        image: '/api/placeholder/300/200',
        features: ['Iluminación LED', 'Superficie Polvo de Ladrillo', 'Vestuarios']
      },
      {
        id: 2,
        name: 'Cancha de Padel #3',
        establishment: 'Padel Club Norte',
        location: 'Belgrano, CABA',
        sport: 'Padel',
        rating: 4.7,
        price: '$1,800/hora',
        image: '/api/placeholder/300/200',
        features: ['Cristales Panorámicos', 'Césped Sintético', 'Aire Acondicionado']
      }
    ]
  };

  const tabs = [
    { id: 'establishments', name: 'Establecimientos', count: favorites.establishments.length },
    { id: 'courts', name: 'Canchas', count: favorites.courts.length }
  ];

  const currentFavorites = favorites[activeTab as keyof typeof favorites] || [];

  const EstablishmentCard = ({ item }: { item: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
    >
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
          <Trophy className="w-16 h-16 text-emerald-400" />
        </div>
        <button className="absolute top-3 right-3 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors">
          <Heart className="w-4 h-4 text-white fill-current" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">{item.name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white text-sm">{item.rating}</span>
            <span className="text-gray-400 text-sm">({item.reviews})</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-400 text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span>{item.location}</span>
          <span>•</span>
          <span>{item.distance}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {item.sports.map((sport: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
              {sport}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-emerald-400 font-semibold">{item.priceRange}</span>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm">
            Ver canchas
          </button>
        </div>
      </div>
    </motion.div>
  );

  const CourtCard = ({ item }: { item: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
    >
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <Trophy className="w-16 h-16 text-blue-400" />
        </div>
        <button className="absolute top-3 right-3 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors">
          <Heart className="w-4 h-4 text-white fill-current" />
        </button>
        <span className="absolute bottom-3 left-3 px-2 py-1 bg-blue-600 text-white rounded-full text-xs">
          {item.sport}
        </span>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{item.name}</h3>
            <p className="text-gray-400 text-sm">{item.establishment}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white text-sm">{item.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-400 text-sm mb-4">
          <MapPin className="w-4 h-4" />
          <span>{item.location}</span>
        </div>
        
        <div className="space-y-2 mb-4">
          {item.features.slice(0, 2).map((feature: string, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-gray-300 text-sm">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-emerald-400 font-semibold">{item.price}</span>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm">
            Reservar
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
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
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Favoritos</p>
              <p className="text-2xl font-bold text-white">
                {favorites.establishments.length + favorites.courts.length}
              </p>
            </div>
            <Heart className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Establecimientos</p>
              <p className="text-2xl font-bold text-white">{favorites.establishments.length}</p>
            </div>
            <MapPin className="w-8 h-8 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Canchas</p>
              <p className="text-2xl font-bold text-white">{favorites.courts.length}</p>
            </div>
            <Trophy className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span className="font-medium">{tab.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {currentFavorites.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {currentFavorites.map((item, index) => (
            activeTab === 'establishments' 
              ? <EstablishmentCard key={item.id} item={item} />
              : <CourtCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No tienes {activeTab === 'establishments' ? 'establecimientos' : 'canchas'} favoritos
          </h3>
          <p className="text-gray-500">
            Explora y marca como favoritos los lugares que más te gusten.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default FavoritesSection;
