'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Send,
  ThumbsUp,
  Building2
} from 'lucide-react';

interface BookingInfo {
  bookingId: string;
  date: string;
  startTime: string;
  endTime: string;
  clientName?: string;
  establishment: {
    id: string;
    name: string;
    logo?: string;
    address?: string;
    city?: string;
  };
  court: {
    id: string;
    name: string;
    sportType?: string;
  };
}

interface AspectRating {
  facilities: number;
  service: number;
}

const aspectLabels: Record<keyof AspectRating, string> = {
  facilities: 'Instalaciones',
  service: 'Atención'
};

export default function ValorarPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [aspects, setAspects] = useState<AspectRating>({
    facilities: 0,
    service: 0
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  useEffect(() => {
    const fetchBookingInfo = async () => {
      try {
        const response = await fetch(`${API_URL}/api/reviews/token/${token}`);
        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'Already reviewed') {
            setAlreadyReviewed(true);
          } else {
            setError(data.message || 'Link inválido o expirado');
          }
          return;
        }

        setBookingInfo(data.data);
      } catch (err) {
        setError('Error al cargar la información de la reserva');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBookingInfo();
    }
  }, [token, API_URL]);

  const handleAspectRating = (aspect: keyof AspectRating, value: number) => {
    setAspects(prev => ({ ...prev, [aspect]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Por favor, selecciona una calificación general');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/reviews/token/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
          aspects,
          npsScore,
          source: 'qr_ticket'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al enviar la reseña');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Error al enviar la reseña. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <img 
          src="/assets/logos/logo-dark.svg" 
          alt="Mis Canchas" 
          className="h-10 mb-8"
        />
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (alreadyReviewed) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <img 
          src="/assets/logos/logo-dark.svg" 
          alt="Mis Canchas" 
          className="h-10 mb-8"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">¡Gracias por tu valoración!</h1>
          <p className="text-gray-400 mb-6">
            Tu opinión nos ayuda a mejorar la experiencia para todos los jugadores.
          </p>
          <p className="text-sm text-gray-500">
            Puedes cerrar esta página
          </p>
        </motion.div>
      </div>
    );
  }

  if (error && !bookingInfo) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <img 
          src="/assets/logos/logo-dark.svg" 
          alt="Mis Canchas" 
          className="h-10 mb-8"
        />
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Link Inválido</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <img 
          src="/assets/logos/logo-dark.svg" 
          alt="Mis Canchas" 
          className="h-10 mb-8"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">¡Gracias por tu valoración!</h1>
          <p className="text-gray-400 mb-6">
            Tu opinión nos ayuda a mejorar la experiencia para todos los jugadores.
          </p>
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Puedes cerrar esta página
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/assets/logos/logo-dark.svg" 
            alt="Mis Canchas" 
            className="h-10"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">¿Cómo estuvo tu partido?</h1>
          <p className="text-gray-400">Tu opinión nos ayuda a mejorar</p>
        </div>

        {/* Booking Info Card */}
        {bookingInfo && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              {bookingInfo.establishment.logo ? (
                <img 
                  src={bookingInfo.establishment.logo.startsWith('http') 
                    ? bookingInfo.establishment.logo 
                    : `${API_URL}${bookingInfo.establishment.logo}`
                  }
                  alt={bookingInfo.establishment.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-emerald-500" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-white">{bookingInfo.establishment.name}</h2>
                <p className="text-emerald-400">{bookingInfo.court.name}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(bookingInfo.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatTime(bookingInfo.startTime)} - {formatTime(bookingInfo.endTime)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Calificación General</h3>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-gray-400 mt-2">
                {rating === 1 && 'Muy malo'}
                {rating === 2 && 'Malo'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bueno'}
                {rating === 5 && 'Excelente'}
              </p>
            )}
          </div>

          {/* Aspect Ratings */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Califica cada aspecto</h3>
            <div className="space-y-4">
              {(Object.keys(aspects) as Array<keyof AspectRating>).map((aspect) => (
                <div key={aspect} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{aspectLabels[aspect]}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleAspectRating(aspect, star)}
                        className="p-0.5"
                      >
                        <Star
                          className={`w-5 h-5 transition-colors ${
                            star <= aspects[aspect]
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NPS Score */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">¿Recomendarías este lugar?</h3>
            <p className="text-gray-400 text-sm mb-4">Del 1 al 5, ¿qué tan probable es que recomiendes este establecimiento?</p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setNpsScore(score)}
                  className={`w-12 h-12 rounded-xl text-lg font-semibold transition-colors ${
                    npsScore === score
                      ? score >= 4
                        ? 'bg-emerald-500 text-white'
                        : score >= 3
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
              <span>Nada probable</span>
              <span>Muy probable</span>
            </div>
          </div>

          {/* Comment */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Comentario (opcional)</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos más sobre tu experiencia..."
              className="w-full h-32 bg-gray-700 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              maxLength={1000}
            />
            <p className="text-right text-xs text-gray-500 mt-1">{comment.length}/1000</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Valoración
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
