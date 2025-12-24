'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Copy,
  DollarSign,
  CheckCircle,
  TrendingUp,
  Tag,
  ToggleLeft,
  ToggleRight,
  User
} from 'lucide-react';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import CouponSidebar from '@/components/admin/CouponSidebar';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_booking';
  discountValue: number;
  maxDiscount?: number;
  minPurchaseAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usageCount: number;
  startDate?: string;
  endDate?: string;
  applicableCourts?: string[];
  applicableSports?: string[];
  applicableDays?: number[];
  newCustomersOnly?: boolean;
  individualUseOnly?: boolean;
  specificClients?: string[];
  isActive: boolean;
  createdAt: string;
  stats?: {
    usageCount: number;
    totalDiscountGiven: number;
    remainingUses: number | null;
  };
}

interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalUsages: number;
  totalDiscountGiven: number;
  topCoupons: Array<{ id: string; code: string; name: string; usageCount: number }>;
}

export default function CuponesPage() {
  const { establishment } = useEstablishment();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'inactive'>('all');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  useEffect(() => {
    if (establishment?.id) {
      fetchCoupons();
      fetchStats();
    }
  }, [establishment?.id, statusFilter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/coupons/establishment/${establishment?.id}?status=${statusFilter}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setCoupons(data.data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/coupons/establishment/${establishment?.id}/stats`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        fetchCoupons();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !coupon.isActive })
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  const openCreateSidebar = () => {
    setSelectedCoupon(null);
    setShowSidebar(true);
  };

  const openEditSidebar = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowSidebar(true);
  };

  const handleSidebarClose = () => {
    setShowSidebar(false);
    setSelectedCoupon(null);
  };

  const handleCouponSaved = () => {
    fetchCoupons();
    fetchStats();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const filteredCoupons = useMemo(() => {
    let filtered = [...coupons];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [coupons, searchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return { label: 'Inactivo', color: 'text-gray-400 bg-gray-400/10' };
    
    const now = new Date();
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return { label: 'Expirado', color: 'text-red-400 bg-red-400/10' };
    }
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return { label: 'Programado', color: 'text-yellow-400 bg-yellow-400/10' };
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { label: 'Agotado', color: 'text-orange-400 bg-orange-400/10' };
    }
    return { label: 'Activo', color: 'text-emerald-400 bg-emerald-400/10' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cupones de Descuento</h1>
          <p className="text-gray-500 dark:text-gray-400">Crea y gestiona cupones promocionales para tus clientes</p>
        </div>
        <button
          onClick={openCreateSidebar}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cupón
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalCoupons || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Cupones totales</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.activeCoupons || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Cupones activos</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalUsages || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Usos totales</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats?.totalDiscountGiven || 0)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Descuentos otorgados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="expired">Expirados</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      {/* Coupons List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Cargando cupones...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-8 text-center">
            <Ticket className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No hay cupones creados</p>
            <button
              onClick={openCreateSidebar}
              className="text-emerald-500 hover:text-emerald-600 font-medium"
            >
              Crear tu primer cupón
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCoupons.map((coupon) => {
              const status = getCouponStatus(coupon);
              const hasSpecificClients = coupon.specificClients && coupon.specificClients.length > 0;
              
              return (
                <div key={coupon.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Tag className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-gray-900 dark:text-white">{coupon.code}</span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Copiar código"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          {hasSpecificClients && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium text-blue-400 bg-blue-400/10 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {coupon.specificClients!.length} cliente{coupon.specificClients!.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{coupon.name}</p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-500">
                          {coupon.discountType === 'percentage' 
                            ? `${coupon.discountValue}%`
                            : coupon.discountType === 'free_booking'
                            ? 'Gratis'
                            : formatCurrency(coupon.discountValue)
                          }
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Descuento</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {coupon.usageLimit ? `${coupon.usageCount}/${coupon.usageLimit}` : coupon.usageCount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Usos</p>
                      </div>
                      {coupon.endDate && (
                        <div className="text-center">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(coupon.endDate)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Expira</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`p-2 rounded-lg transition-colors ${
                          coupon.isActive 
                            ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' 
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={coupon.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {coupon.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => openEditSidebar(coupon)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Coupon Sidebar */}
      {establishment?.id && (
        <CouponSidebar
          isOpen={showSidebar}
          onClose={handleSidebarClose}
          coupon={selectedCoupon}
          establishmentId={establishment.id}
          onSave={handleCouponSaved}
        />
      )}
    </div>
  );
}
