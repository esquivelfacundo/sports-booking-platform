'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  QrCode,
  Building2,
  CreditCard
} from 'lucide-react';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

interface BookingData {
  booking: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    depositAmount: number;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    notes: string;
    confirmedAt: string;
    completedAt: string | null;
  };
  court: {
    id: string;
    name: string;
    sport: string;
  } | null;
  establishment: {
    id: string;
    name: string;
    address: string;
    phone: string;
  } | null;
  permissions: {
    canCheckIn: boolean;
    isOwner: boolean;
    isEstablishmentStaff: boolean;
  };
}

export default function BookingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  
  const bookingId = params.id as string;
  const code = searchParams.get('code');
  
  const [data, setData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId, code, isAuthenticated]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const token = localStorage.getItem('auth_token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const url = code 
        ? `${API_URL}/api/bookings/checkin/${bookingId}?code=${code}`
        : `${API_URL}/api/bookings/checkin/${bookingId}`;
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cargar la reserva');
      }
      
      const result = await response.json();
      setData(result);
      
      if (result.booking.status === 'completed') {
        setCompleted(true);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los detalles de la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!data?.permissions.canCheckIn) return;
    
    try {
      setCompleting(true);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_URL}/api/bookings/checkin/${bookingId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al completar la reserva');
      }
      
      setCompleted(true);
      // Refresh data
      fetchBookingDetails();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
      confirmed: { label: 'Confirmada', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
      completed: { label: 'Completada', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
      cancelled: { label: 'Cancelada', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
      pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.color}`}>
        {status === 'completed' && <CheckCircle className="w-4 h-4 mr-1.5" />}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <UnifiedLoader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Error</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { booking, court, establishment, permissions } = data;
  const remainingAmount = booking.totalAmount - (booking.depositAmount || 0);

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Detalle de Reserva</h1>
          {getStatusBadge(booking.status)}
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden"
        >
          {/* Court Info */}
          <div className="p-6 border-b border-neutral-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-400">{court?.name || 'Cancha'}</h2>
                <p className="text-gray-400">{establishment?.name}</p>
                {establishment?.address && (
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {establishment.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="p-6 border-b border-neutral-800">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Fecha</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(booking.date)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Horario</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
            </div>
          </div>

          {/* Client Info (only for staff) */}
          {permissions.canCheckIn && (
            <div className="p-6 border-b border-neutral-800 bg-neutral-800/30">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Datos del Cliente</p>
              <div className="space-y-2">
                <p className="text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {booking.clientName || 'No especificado'}
                </p>
                {booking.clientEmail && (
                  <p className="text-gray-400 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {booking.clientEmail}
                  </p>
                )}
                {booking.clientPhone && (
                  <p className="text-gray-400 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    {booking.clientPhone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="p-6 border-b border-neutral-800">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Pago</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total de la reserva</span>
                <span className="text-white font-medium">{formatCurrency(booking.totalAmount)}</span>
              </div>
              {booking.depositAmount > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-emerald-400">Seña abonada</span>
                    <span className="text-emerald-400">- {formatCurrency(booking.depositAmount)}</span>
                  </div>
                  <div className="border-t border-neutral-700 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">A pagar en el lugar</span>
                      <span className="text-white font-bold text-lg">{formatCurrency(remainingAmount)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="p-6 border-b border-neutral-800">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Notas</p>
              <p className="text-gray-400 text-sm">{booking.notes}</p>
            </div>
          )}

          {/* Check-in Button (only for staff) */}
          {permissions.canCheckIn && booking.status === 'confirmed' && !completed && (
            <div className="p-6">
              <button
                onClick={handleCheckIn}
                disabled={completing}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {completing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Completando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirmar Check-in
                  </>
                )}
              </button>
              <p className="text-gray-500 text-xs text-center mt-3">
                Al confirmar, la reserva pasará a estado "Completada"
              </p>
            </div>
          )}

          {/* Completed Message */}
          {(booking.status === 'completed' || completed) && (
            <div className="p-6 bg-emerald-500/10">
              <div className="flex items-center justify-center gap-3 text-emerald-400">
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold">Reserva completada</span>
              </div>
              {booking.completedAt && (
                <p className="text-emerald-400/60 text-sm text-center mt-2">
                  {new Date(booking.completedAt).toLocaleString('es-AR')}
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Contact */}
        {establishment?.phone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-6"
          >
            <p className="text-gray-500 text-sm">
              ¿Consultas?{' '}
              <a href={`tel:${establishment.phone}`} className="text-emerald-500 hover:underline">
                {establishment.phone}
              </a>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
