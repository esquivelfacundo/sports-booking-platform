'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  TrendingUp, 
  TrendingDown,
  MessageSquare, 
  ThumbsUp,
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  ChevronDown,
  X,
  Send,
  BarChart3,
  Percent,
  AlertCircle,
  CheckCircle,
  Building2,
  MapPin
} from 'lucide-react';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { apiClient } from '@/lib/api';
import OrderDetailSidebar from '@/components/admin/OrderDetailSidebar';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  npsScore?: number;
  aspects?: {
    courtCondition?: number;
    cleanliness?: number;
    customerService?: number;
    valueForMoney?: number;
    punctuality?: number;
    facilities?: number;
    service?: number;
  };
  source: string;
  isVerified: boolean;
  isAnonymous: boolean;
  establishmentResponse?: string;
  establishmentResponseAt?: string;
  createdAt: string;
  bookingId?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  court?: {
    id: string;
    name: string;
  };
  booking?: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    clientName?: string;
    clientPhone?: string;
    createdByUser?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    startedByUser?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    completedByUser?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

interface ReviewStats {
  overview: {
    averageRating: string;
    totalReviews: number;
    npsScore: number | null;
    responseRate: number;
  };
  ratingDistribution: Record<number, number>;
  sourceDistribution: Array<{ source: string; count: string }>;
  monthlyTrend: Array<{ month: string; averageRating: string; count: string }>;
  recentReviews: Review[];
}

const aspectLabels: Record<string, string> = {
  facilities: 'Instalaciones',
  service: 'Atención',
  // Legacy fields for backward compatibility
  courtCondition: 'Estado de la cancha',
  cleanliness: 'Limpieza',
  customerService: 'Atención al cliente',
  valueForMoney: 'Relación precio/calidad',
  punctuality: 'Puntualidad'
};

const sourceLabels: Record<string, string> = {
  app: 'App',
  qr_ticket: 'QR Ticket',
  email_link: 'Email',
  whatsapp_link: 'WhatsApp',
  manual: 'Manual'
};

export default function ResenasPage() {
  const { establishment } = useEstablishment();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // Order sidebar state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderSidebar, setShowOrderSidebar] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'createdAt' | 'rating'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (establishment?.id) {
      fetchStats();
      fetchReviews();
    }
  }, [establishment?.id]);

  useEffect(() => {
    if (establishment?.id) {
      fetchReviews();
    }
  }, [page, ratingFilter, sortBy, sortOrder]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/reviews/establishment/${establishment?.id}/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      let url = `${API_URL}/api/reviews/establishment/${establishment?.id}?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedReview || !responseText.trim()) return;

    setSubmittingResponse(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/reviews/${selectedReview.id}/respond`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ response: responseText.trim() })
        }
      );

      if (response.ok) {
        // Update local state
        setReviews(prev => prev.map(r => 
          r.id === selectedReview.id 
            ? { ...r, establishmentResponse: responseText.trim(), establishmentResponseAt: new Date().toISOString() }
            : r
        ));
        setShowResponseModal(false);
        setSelectedReview(null);
        setResponseText('');
      }
    } catch (error) {
      console.error('Error responding to review:', error);
    } finally {
      setSubmittingResponse(false);
    }
  };

  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.comment?.toLowerCase().includes(query) ||
        r.user?.firstName?.toLowerCase().includes(query) ||
        r.user?.lastName?.toLowerCase().includes(query)
      );
    }

    if (ratingFilter) {
      filtered = filtered.filter(r => r.rating === ratingFilter);
    }

    return filtered;
  }, [reviews, searchQuery, ratingFilter]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getNpsColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 50) return 'text-emerald-500';
    if (score >= 0) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-emerald-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const handleOpenOrderSidebar = async (review: Review) => {
    if (!review.booking?.id) return;
    
    try {
      // Find the order associated with this booking
      const orders = await apiClient.getOrders(establishment?.id || '', { bookingId: review.booking.id });
      if (orders && orders.length > 0) {
        setSelectedOrderId(orders[0].id);
        setShowOrderSidebar(true);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const getCreatedByLabel = (review: Review) => {
    if (review.booking?.createdByUser) {
      return `${review.booking.createdByUser.firstName} ${review.booking.createdByUser.lastName}`;
    }
    return 'Autogestión';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Rating */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(parseFloat(stats?.overview.averageRating || '0'))
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.overview.averageRating || '0.0'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Calificación promedio</p>
        </div>

        {/* Total Reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.overview.totalReviews || 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Reseñas totales</p>
        </div>

        {/* NPS Score */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-emerald-500" />
            </div>
            {stats?.overview.npsScore !== null && (
              <span className={`text-sm font-medium ${getNpsColor(stats?.overview.npsScore || null)}`}>
                {(stats?.overview.npsScore || 0) >= 0 ? '+' : ''}{stats?.overview.npsScore}
              </span>
            )}
          </div>
          <p className={`text-3xl font-bold ${getNpsColor(stats?.overview.npsScore || null)}`}>
            {stats?.overview.npsScore !== null ? stats?.overview.npsScore : 'N/A'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">NPS Score</p>
        </div>

        {/* Response Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Percent className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.overview.responseRate || 0}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tasa de respuesta</p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución de Calificaciones</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats?.ratingDistribution[rating] || 0;
              const total = stats?.overview.totalReviews || 1;
              const percentage = (count / total) * 100;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Origen de Reseñas</h3>
          <div className="space-y-3">
            {stats?.sourceDistribution.map((source) => (
              <div key={source.source} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {sourceLabels[source.source] || source.source}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{source.count}</span>
              </div>
            ))}
            {(!stats?.sourceDistribution || stats.sourceDistribution.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Sin datos</p>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tendencia Mensual</h3>
          <div className="space-y-3">
            {stats?.monthlyTrend.slice(-5).map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(month.month).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {parseFloat(month.averageRating).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({month.count})</span>
                </div>
              </div>
            ))}
            {(!stats?.monthlyTrend || stats.monthlyTrend.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Sin datos</p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Todas las Reseñas</h3>
            
            <div className="flex gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Rating Filter */}
              <select
                value={ratingFilter || ''}
                onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todas</option>
                <option value="5">5 estrellas</option>
                <option value="4">4 estrellas</option>
                <option value="3">3 estrellas</option>
                <option value="2">2 estrellas</option>
                <option value="1">1 estrella</option>
              </select>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by as 'createdAt' | 'rating');
                  setSortOrder(order as 'DESC' | 'ASC');
                }}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="createdAt-DESC">Más recientes</option>
                <option value="createdAt-ASC">Más antiguas</option>
                <option value="rating-DESC">Mayor calificación</option>
                <option value="rating-ASC">Menor calificación</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Cargando reseñas...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-8 text-center">
              <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No hay reseñas aún</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div 
                key={review.id} 
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => handleOpenOrderSidebar(review)}
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {review.user?.profileImage ? (
                      <img 
                        src={review.user.profileImage}
                        alt={`${review.user.firstName} ${review.user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {review.booking?.clientName?.[0] || review.user?.firstName?.[0] || '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {review.booking?.clientName || 
                              (review.isAnonymous 
                                ? 'Anónimo' 
                                : `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.trim() || 'Cliente')
                            }
                          </span>
                          {review.isVerified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Verificado
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(review.createdAt)}
                          </span>
                          {review.court && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              • {review.court.name}
                            </span>
                          )}
                        </div>
                        
                        {/* Booking info */}
                        {review.booking && (
                          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-xs space-y-1">
                            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(review.booking.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(review.booking.startTime)} - {formatTime(review.booking.endTime)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-500 dark:text-gray-400">
                              <span><strong>Creado por:</strong> {getCreatedByLabel(review)}</span>
                              {review.booking.startedByUser && (
                                <span><strong>Iniciado por:</strong> {review.booking.startedByUser.firstName} {review.booking.startedByUser.lastName}</span>
                              )}
                              {review.booking.completedByUser && (
                                <span><strong>Completado por:</strong> {review.booking.completedByUser.firstName} {review.booking.completedByUser.lastName}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Respond button */}
                      {!review.establishmentResponse && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReview(review);
                            setShowResponseModal(true);
                          }}
                          className="px-3 py-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                        >
                          Responder
                        </button>
                      )}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="mt-2 text-gray-700 dark:text-gray-300">{review.comment}</p>
                    )}

                    {/* Aspects */}
                    {review.aspects && Object.keys(review.aspects).some(k => (review.aspects as any)[k] > 0) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(review.aspects).map(([key, value]) => (
                          value > 0 && (
                            <span 
                              key={key}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400"
                            >
                              {aspectLabels[key] || key}: {value}/5
                            </span>
                          )
                        ))}
                      </div>
                    )}

                    {/* Establishment Response */}
                    {review.establishmentResponse && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-emerald-500">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Respuesta del establecimiento
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {review.establishmentResponse}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {mounted && showResponseModal && selectedReview && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowResponseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Responder Reseña</h3>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Original Review */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= selectedReview.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedReview.isAnonymous ? 'Anónimo' : `${selectedReview.user?.firstName || ''} ${selectedReview.user?.lastName || ''}`}
                  </span>
                </div>
                {selectedReview.comment && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedReview.comment}</p>
                )}
              </div>

              {/* Response Input */}
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="w-full h-32 p-4 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 resize-none focus:ring-2 focus:ring-emerald-500"
                maxLength={500}
              />
              <p className="text-right text-xs text-gray-500 mt-1">{responseText.length}/500</p>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRespond}
                  disabled={!responseText.trim() || submittingResponse}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {submittingResponse ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Order Detail Sidebar */}
      {showOrderSidebar && selectedOrderId && (
        <OrderDetailSidebar
          orderId={selectedOrderId}
          onClose={() => {
            setShowOrderSidebar(false);
            setSelectedOrderId(null);
          }}
          onUpdate={() => {
            fetchReviews();
          }}
        />
      )}
    </div>
  );
}
