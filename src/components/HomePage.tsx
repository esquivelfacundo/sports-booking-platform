'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Clock, Users, Star, ArrowRight, Trophy, Target, Zap, Shield, CheckCircle, TrendingUp, Award, Heart } from 'lucide-react';
import SearchBar from './SearchBar';
import SportCard from './SportCard';
import { useSocial } from '@/contexts/SocialContext';
import { useEstablishments } from '@/hooks/useEstablishments';
import Link from 'next/link';

// Helper function to get mock city based on coordinates
const getMockCityFromCoords = (lat: number, lng: number): string => {
  // Argentina major cities with approximate coordinates
  const cities = [
    { name: 'Buenos Aires', lat: -34.6118, lng: -58.3960, radius: 50 },
    { name: 'Córdoba', lat: -31.4201, lng: -64.1888, radius: 30 },
    { name: 'Rosario', lat: -32.9442, lng: -60.6505, radius: 25 },
    { name: 'Mendoza', lat: -32.8895, lng: -68.8458, radius: 20 },
    { name: 'La Plata', lat: -34.9215, lng: -57.9545, radius: 15 },
    { name: 'Mar del Plata', lat: -38.0055, lng: -57.5426, radius: 15 },
  ];

  // Find closest city within radius
  for (const city of cities) {
    const distance = Math.sqrt(
      Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
    ) * 111; // Approximate km per degree
    
    if (distance <= city.radius) {
      return city.name;
    }
  }
  
  return 'Buenos Aires'; // Default fallback
};

const HomePage = () => {
  const [currentCity, setCurrentCity] = useState<string>('Buenos Aires');
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { matches } = useSocial();
  const { establishments, loading: establishmentsLoading, fetchEstablishments } = useEstablishments({
    autoFetch: false
  });

  // Helper function to normalize establishment data for display
  const normalizeEstablishment = (establishment: any) => {
    if ('sport' in establishment) {
      // Mock data format
      return establishment;
    } else {
      // API data format
      return {
        id: establishment.id,
        name: establishment.name,
        location: `${establishment.address}, ${establishment.city}`,
        rating: establishment.rating,
        reviews: establishment.reviewCount,
        price: 8000, // Default price for API data
        image: (establishment.images?.photos && establishment.images.photos.length > 0) ? establishment.images.photos[0] : 
               (establishment.images && Array.isArray(establishment.images) && establishment.images.length > 0) ? establishment.images[0] : 
               '/assets/default-card.png',
        sport: establishment.sports[0] === 'futbol5' ? 'Fútbol 5' :
               establishment.sports[0] === 'paddle' ? 'Padel' :
               establishment.sports[0] === 'tenis' ? 'Tenis' : 'Deporte',
        features: establishment.amenities ? establishment.amenities.slice(0, 3) : []
      };
    }
  };

  useEffect(() => {
    // Set client-side flag to prevent hydration mismatch
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Fetch establishments when component mounts
    if (isClient) {
      fetchEstablishments();
    }
  }, [isClient]);

  useEffect(() => {
    // Skip geolocation and use default city
    if (!isClient) return;

    const initializeCity = async () => {
      try {
        setCurrentCity('Buenos Aires');
        await fetchEstablishments({ city: 'Buenos Aires' });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching establishments:', error);
        setIsLoading(false);
      }
    };

    initializeCity();
  }, [isClient]);

  const popularCities = [
    { name: 'Buenos Aires', facilities: 245, image: '🏙️' },
    { name: 'Córdoba', facilities: 128, image: '🏛️' },
    { name: 'Rosario', facilities: 89, image: '🌉' },
    { name: 'Mendoza', facilities: 67, image: '🏔️' },
    { name: 'La Plata', facilities: 54, image: '🏛️' },
    { name: 'Mar del Plata', facilities: 43, image: '🏖️' }
  ];

  const featuredFacilities = [
    {
      id: 1,
      name: 'Club Atlético River',
      location: 'Núñez, Buenos Aires',
      rating: 4.8,
      reviews: 324,
      price: 8500,
      image: '🏟️',
      sport: 'Fútbol 5',
      features: ['Césped sintético', 'Vestuarios', 'Estacionamiento']
    },
    {
      id: 2,
      name: 'Padel Center Palermo',
      location: 'Palermo, Buenos Aires',
      rating: 4.9,
      reviews: 187,
      price: 6200,
      image: '🏓',
      sport: 'Padel',
      features: ['Canchas cubiertas', 'Iluminación LED', 'Cafetería']
    },
    {
      id: 3,
      name: 'Tennis Club Belgrano',
      location: 'Belgrano, Buenos Aires',
      rating: 4.7,
      reviews: 156,
      price: 7800,
      image: '🎾',
      sport: 'Tenis',
      features: ['Canchas de polvo de ladrillo', 'Vestuarios', 'Alquiler de raquetas']
    }
  ];

  const sports = [
    {
      id: 1,
      name: 'Fútbol 5',
      icon: '⚽',
      facilities: 156,
      description: 'Canchas de césped sintético y natural'
    },
    {
      id: 2,
      name: 'Padel',
      icon: '🏓',
      facilities: 89,
      description: 'Canchas cubiertas y al aire libre'
    },
    {
      id: 3,
      name: 'Tenis',
      icon: '🎾',
      facilities: 67,
      description: 'Polvo de ladrillo y superficie dura'
    },
    {
      id: 4,
      name: 'Básquet',
      icon: '🏀',
      facilities: 43,
      description: 'Canchas techadas y al aire libre'
    },
    {
      id: 5,
      name: 'Vóley',
      icon: '🏐',
      facilities: 32,
      description: 'Canchas de arena y sintéticas'
    },
    {
      id: 6,
      name: 'Hockey',
      icon: '🏑',
      facilities: 28,
      description: 'Césped sintético profesional'
    }
  ];

  const specialOffers = [
    {
      title: 'Reserva 3, paga 2',
      description: 'En canchas seleccionadas de fútbol 5',
      discount: '33% OFF',
      validUntil: '31 Dic'
    },
    {
      title: 'Descuento matutino',
      description: 'Reservas antes de las 12:00 hs',
      discount: '25% OFF',
      validUntil: 'Todos los días'
    },
    {
      title: 'Membresía mensual',
      description: 'Acceso ilimitado a todas las canchas',
      discount: 'Desde $15.000',
      validUntil: 'Oferta limitada'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-gray-800 to-gray-900 py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-40">
            <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-2xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-2xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-screen filter blur-2xl animate-blob animation-delay-4000"></div>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6"
            >
              Reserva tu cancha
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto"
            >
              Más de 500 canchas deportivas disponibles en toda Argentina
            </motion.p>
          </div>
          
          {/* Main Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <SearchBar currentCity={currentCity} />
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mt-12 text-center"
          >
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-emerald-400" />
              <span className="text-white font-medium">500+ Canchas</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-emerald-400" />
              <span className="text-white font-medium">4.8 Calificación</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-emerald-400" />
              <span className="text-white font-medium">50k+ Usuarios</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span className="text-white font-medium">Reserva Segura</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Available Matches */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Partidos disponibles</h2>
              <p className="text-lg text-gray-400">Únete a partidos cerca de ti o crea el tuyo propio</p>
            </div>
            <Link 
              href="/buscar-jugadores"
              className="hidden md:flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>Ver todos</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.slice(0, 6).map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{match.sport === 'futbol5' ? '⚽' : match.sport === 'paddle' ? '🏓' : match.sport === 'tenis' ? '🎾' : '🏀'}</span>
                      <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {match.sport === 'futbol5' ? 'Fútbol 5' : 
                         match.sport === 'paddle' ? 'Padel' : 
                         match.sport === 'tenis' ? 'Tenis' : 'Básquet'}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{match.venue.location}</p>
                    <p className="text-xs text-gray-500">{match.venue.name}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    match.level === 'beginner' 
                      ? 'bg-green-500/20 text-green-400' 
                      : match.level === 'intermediate'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {match.level === 'beginner' ? 'Principiante' : 
                     match.level === 'intermediate' ? 'Intermedio' : 
                     match.level === 'advanced' ? 'Avanzado' : 'Mixto'}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 text-emerald-400" />
                    <span>{new Date(match.date).toLocaleDateString('es-AR', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Clock className="w-4 h-4 mr-2 text-cyan-400" />
                    <span>{match.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Users className="w-4 h-4 mr-2 text-yellow-400" />
                    <span>{match.players.length}/{match.maxPlayers} jugadores</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{match.organizer.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm text-gray-400">{match.organizer.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">${match.price || 0}</p>
                    <p className="text-xs text-gray-500">por persona</p>
                  </div>
                </div>

                {match.players.length < match.maxPlayers && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-emerald-400 font-medium">¡Únete al partido!</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Mobile View All Button */}
          <div className="mt-8 text-center md:hidden">
            <Link 
              href="/buscar-jugadores"
              className="inline-flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>Ver todos los partidos</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Facilities */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Canchas destacadas</h2>
              <p className="text-lg text-gray-400">Las mejores canchas según nuestros usuarios</p>
            </div>
            <button className="hidden md:flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors">
              <span>Ver todas</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(establishments.length > 0 ? establishments.slice(0, 6).map(normalizeEstablishment) : featuredFacilities).map((facility, index) => (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-gray-700 rounded-xl overflow-hidden border border-gray-600 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">
                        {facility.sport === 'Fútbol 5' ? '⚽' : 
                         facility.sport === 'Padel' ? '🏓' : 
                         facility.sport === 'Tenis' ? '🎾' : '🏟️'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-white font-medium">{facility.rating}</span>
                      <span className="text-gray-400 text-sm">({facility.reviews})</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">{facility.name}</h3>
                  <div className="flex items-center space-x-1 mb-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">{facility.location}</span>
                  </div>
                  
                  <div className="mb-4">
                    <span className="inline-block bg-emerald-600 text-white text-xs px-2 py-1 rounded-full mb-2">{facility.sport}</span>
                    <div className="flex flex-wrap gap-1">
                      {(facility.features || []).map((feature: string, idx: number) => (
                        <span key={idx} className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-white">${facility.price.toLocaleString()}</span>
                      <span className="text-gray-400 text-sm ml-1">/ hora</span>
                    </div>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Reservar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Sport */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Explora por deporte</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Encuentra la cancha perfecta para tu deporte favorito
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sports.map((sport, index) => (
              <motion.div
                key={sport.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group text-center"
              >
                <div className="text-4xl mb-3">{sport.icon}</div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">{sport.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{sport.facilities} canchas</p>
                <p className="text-xs text-gray-500">{sport.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Ofertas especiales</h2>
            <p className="text-lg text-gray-400">Aprovecha estos descuentos exclusivos</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialOffers.map((offer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-xl p-6 text-white relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute top-0 right-0 bg-white text-emerald-600 px-3 py-1 rounded-bl-lg font-bold text-sm">
                  {offer.discount}
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                  <p className="text-emerald-100 mb-3">{offer.description}</p>
                  <div className="flex items-center space-x-1 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Válido hasta: {offer.validUntil}</span>
                  </div>
                </div>
                <button className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Ver detalles
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">¿Por qué elegirnos?</h2>
            <p className="text-lg text-gray-400">Miles de usuarios confían en nosotros</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: CheckCircle,
                title: 'Reserva garantizada',
                description: 'Tu reserva está 100% asegurada o te devolvemos el dinero'
              },
              {
                icon: Zap,
                title: 'Confirmación instantánea',
                description: 'Recibe la confirmación de tu reserva al instante'
              },
              {
                icon: Award,
                title: 'Canchas verificadas',
                description: 'Todas nuestras canchas están verificadas y certificadas'
              },
              {
                icon: Heart,
                title: 'Soporte 24/7',
                description: 'Nuestro equipo está disponible para ayudarte siempre'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-emerald-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              ¿Listo para jugar?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Únete a miles de deportistas que ya reservan sus canchas con nosotros
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors">
                Buscar canchas
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-emerald-600 transition-colors">
                Registrar mi cancha
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
