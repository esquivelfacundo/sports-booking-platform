'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Search, 
  Filter,
  Trophy,
  Calendar,
  MapPin,
  User,
  MessageCircle,
  ThumbsUp,
  Award,
  TrendingUp
} from 'lucide-react';

interface RatingsSectionProps {
  user: any;
}

const RatingsSection: React.FC<RatingsSectionProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('received');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with real API call
  const ratingsData = {
    received: [
      {
        id: 1,
        rating: 5,
        comment: 'Excelente compañero de juego. Muy puntual y deportivo. Definitivamente jugaría de nuevo.',
        reviewer: 'Carlos Mendez',
        reviewerAvatar: null,
        sport: 'Tenis',
        location: 'Club Deportivo Central',
        date: '2024-01-12',
        match: 'Partido amistoso'
      },
      {
        id: 2,
        rating: 4,
        comment: 'Buen nivel de juego, aunque llegó un poco tarde. Muy buena onda.',
        reviewer: 'Ana Rodriguez',
        reviewerAvatar: null,
        sport: 'Padel',
        location: 'Padel Club Norte',
        date: '2024-01-10',
        match: 'Dobles mixtos'
      },
      {
        id: 3,
        rating: 5,
        comment: 'Jugador muy técnico y respetuoso. Gran partido!',
        reviewer: 'Diego Martinez',
        reviewerAvatar: null,
        sport: 'Tenis',
        location: 'Club Central',
        date: '2024-01-08',
        match: 'Singles competitivo'
      }
    ],
    given: [
      {
        id: 4,
        rating: 5,
        comment: 'Excelente jugadora, muy buena técnica y actitud positiva.',
        reviewee: 'Laura Gonzalez',
        revieweeAvatar: null,
        sport: 'Tenis',
        location: 'Club Recoleta',
        date: '2024-01-11',
        match: 'Partido de práctica'
      },
      {
        id: 5,
        rating: 4,
        comment: 'Buen compañero de equipo, aunque podría mejorar la comunicación.',
        reviewee: 'Miguel Torres',
        revieweeAvatar: null,
        sport: 'Fútbol 5',
        location: 'Complejo San Telmo',
        date: '2024-01-09',
        match: 'Partido amistoso'
      }
    ]
  };

  const tabs = [
    { id: 'received', name: 'Recibidas', count: ratingsData.received.length },
    { id: 'given', name: 'Dadas', count: ratingsData.given.length }
  ];

  const currentRatings = ratingsData[activeTab as keyof typeof ratingsData] || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
        }`}
      />
    ));
  };

  const averageRating = ratingsData.received.length > 0 
    ? ratingsData.received.reduce((acc, r) => acc + r.rating, 0) / ratingsData.received.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: ratingsData.received.filter(r => r.rating === stars).length,
    percentage: ratingsData.received.length > 0 
      ? (ratingsData.received.filter(r => r.rating === stars).length / ratingsData.received.length) * 100 
      : 0
  }));

  const RatingCard = ({ rating }: { rating: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
          {(rating.reviewerAvatar || rating.revieweeAvatar) ? (
            <img 
              src={rating.reviewerAvatar || rating.revieweeAvatar} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover" 
            />
          ) : (
            <span className="text-white font-bold">
              {getInitials(rating.reviewer || rating.reviewee)}
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold">
                {rating.reviewer || rating.reviewee}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  {renderStars(rating.rating)}
                </div>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-gray-400 text-sm">{rating.date}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-300 mb-4 italic">"{rating.comment}"</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center space-x-2 text-gray-400">
              <Trophy className="w-4 h-4" />
              <span>{rating.sport}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{rating.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{rating.match}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Calificaciones
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar calificaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Average Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center space-x-1 mb-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-gray-400 text-sm">
              Basado en {ratingsData.received.length} reseñas
            </p>
          </div>
        </motion.div>

        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4">Distribución</h3>
          <div className="space-y-2">
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm w-8">{dist.stars}★</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${dist.percentage}%` }}
                  ></div>
                </div>
                <span className="text-gray-400 text-sm w-8">{dist.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4">Estadísticas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-300 text-sm">Reseñas positivas</span>
              </div>
              <span className="text-white font-semibold">
                {ratingsData.received.filter(r => r.rating >= 4).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">Con comentarios</span>
              </div>
              <span className="text-white font-semibold">
                {ratingsData.received.filter(r => r.comment.length > 0).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 text-sm">Este mes</span>
              </div>
              <span className="text-white font-semibold">3</span>
            </div>
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

      {/* Ratings List */}
      {currentRatings.length > 0 ? (
        <div className="space-y-4">
          {currentRatings.map((rating, index) => (
            <RatingCard key={rating.id} rating={rating} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {activeTab === 'received' ? 'No has recibido calificaciones' : 'No has dado calificaciones'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'received' 
              ? 'Las calificaciones de otros jugadores aparecerán aquí.'
              : 'Las calificaciones que des a otros jugadores aparecerán aquí.'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default RatingsSection;
