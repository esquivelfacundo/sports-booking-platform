'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useEstablishmentAdminContext } from '@/contexts/EstablishmentAdminContext';
import { CreateCourtSidebar } from '@/components/admin/CreateCourtSidebar';
import AmenitySidebar from '@/components/admin/AmenitySidebar';
import { apiClient } from '@/lib/api';
import { 
  MapPin, 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  Camera,
  Settings,
  Activity,
  Users,
  Star,
  Wrench,
  RefreshCw,
  Image as ImageIcon,
  BarChart3,
  TrendingUp,
  X,
  Percent,
  Sparkles,
  Coffee,
  Waves,
  Dumbbell,
  Car,
  Wifi,
  ShowerHead,
  UtensilsCrossed,
  TreePine,
  Flame,
  Music,
  Tv,
  Baby,
  Dog,
  Accessibility,
  Lock
} from 'lucide-react';

interface Court {
  id: string;
  name: string;
  type: 'futbol' | 'futbol5' | 'tenis' | 'paddle' | 'basquet' | 'voley';
  status: 'available' | 'maintenance' | 'out_of_service';
  surface: string;
  capacity: number;
  pricePerHour: number;
  openTime: string;
  closeTime: string;
  lighting: boolean;
  covered: boolean;
  images: string[];
  lastMaintenance: string;
  nextMaintenance: string;
  totalReservations: number;
  monthlyRevenue: number;
  rating: number;
  description?: string;
}

interface Amenity {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  pricePerHour: number;
  pricePerHour90?: number;
  pricePerHour120?: number;
  isBookable: boolean;
  isPublic: boolean;
  isActive: boolean;
  capacity?: number;
}

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Coffee, Waves, Dumbbell, Car, Wifi, ShowerHead, 
  UtensilsCrossed, TreePine, Flame, Music, Tv, Baby, Dog, Accessibility, Lock
};

const CourtsPage = () => {
  const { establishment, loading: establishmentLoading } = useEstablishment();
  const { 
    courts: apiCourts, 
    courtsLoading,
    loadCourts,
    createCourt: apiCreateCourt,
    updateCourt: apiUpdateCourt,
    deleteCourt: apiDeleteCourt,
    refreshAll
  } = useEstablishmentAdminContext();
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [headerPortalContainer, setHeaderPortalContainer] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Amenities state
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);
  const [showAmenitySidebar, setShowAmenitySidebar] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [amenityMode, setAmenityMode] = useState<'create' | 'edit'>('create');
  const [activeTab, setActiveTab] = useState<'courts' | 'amenities'>('courts');

  // Load amenities
  const loadAmenities = async () => {
    if (!establishment?.id) return;
    setAmenitiesLoading(true);
    try {
      const response = await apiClient.getAmenities(establishment.id, { includeInactive: true });
      setAmenities(response.amenities || []);
    } catch (error) {
      console.error('Error loading amenities:', error);
    } finally {
      setAmenitiesLoading(false);
    }
  };

  useEffect(() => {
    if (establishment?.id) {
      loadAmenities();
    }
  }, [establishment?.id]);

  // Get the header portal container on mount
  useEffect(() => {
    const container = document.getElementById('header-page-controls');
    if (container) {
      setHeaderPortalContainer(container);
    }
    setMounted(true);
  }, []);

  // Mock statistics data for courts
  const getCourtStats = (court: Court) => {
    // In production, this would come from API
    const baseReservations = Math.floor(Math.random() * 50) + 30;
    const occupancyRate = Math.floor(Math.random() * 40) + 50;
    const monthlyRevenue = court.pricePerHour * baseReservations;
    
    return {
      totalReservations: baseReservations,
      monthlyReservations: Math.floor(baseReservations * 0.3),
      weeklyReservations: Math.floor(baseReservations * 0.08),
      occupancyRate,
      monthlyRevenue,
      avgRevenuePerDay: Math.floor(monthlyRevenue / 30),
      popularHours: [
        { hour: '18:00', count: Math.floor(Math.random() * 20) + 15 },
        { hour: '19:00', count: Math.floor(Math.random() * 20) + 18 },
        { hour: '20:00', count: Math.floor(Math.random() * 20) + 20 },
        { hour: '21:00', count: Math.floor(Math.random() * 20) + 16 },
        { hour: '17:00', count: Math.floor(Math.random() * 15) + 10 },
      ],
      topClients: [
        { name: 'Juan Pérez', reservations: Math.floor(Math.random() * 10) + 5, spent: Math.floor(Math.random() * 50000) + 20000 },
        { name: 'María González', reservations: Math.floor(Math.random() * 8) + 4, spent: Math.floor(Math.random() * 40000) + 15000 },
        { name: 'Carlos López', reservations: Math.floor(Math.random() * 6) + 3, spent: Math.floor(Math.random() * 30000) + 10000 },
        { name: 'Ana Martínez', reservations: Math.floor(Math.random() * 5) + 2, spent: Math.floor(Math.random() * 25000) + 8000 },
        { name: 'Roberto Silva', reservations: Math.floor(Math.random() * 4) + 2, spent: Math.floor(Math.random() * 20000) + 5000 },
      ],
      weekdayDistribution: [
        { day: 'Lun', percentage: Math.floor(Math.random() * 20) + 10 },
        { day: 'Mar', percentage: Math.floor(Math.random() * 20) + 10 },
        { day: 'Mié', percentage: Math.floor(Math.random() * 20) + 12 },
        { day: 'Jue', percentage: Math.floor(Math.random() * 20) + 12 },
        { day: 'Vie', percentage: Math.floor(Math.random() * 25) + 15 },
        { day: 'Sáb', percentage: Math.floor(Math.random() * 30) + 20 },
        { day: 'Dom', percentage: Math.floor(Math.random() * 25) + 15 },
      ],
    };
  };

  // Calculate stats for selected court
  const courtStats = useMemo(() => {
    if (!selectedCourt) return null;
    return getCourtStats(selectedCourt);
  }, [selectedCourt]);

  const handleViewStats = (court: Court) => {
    setSelectedCourt(court);
    setShowStatsModal(true);
  };

  const loading = establishmentLoading || courtsLoading;

  // Transform API courts to local format
  const courts: Court[] = apiCourts.map((court) => ({
    id: court.id,
    name: court.name,
    type: court.sport as Court['type'],
    status: court.isActive ? 'available' : 'out_of_service',
    surface: court.surface || 'No especificado',
    capacity: court.capacity || 0,
    pricePerHour: court.pricePerHour || 0,
    openTime: '08:00',
    closeTime: '22:00',
    lighting: court.amenities?.includes('Iluminación') || court.amenities?.includes('Iluminación LED') || false,
    covered: court.isIndoor || false,
    images: [],
    lastMaintenance: new Date().toISOString().split('T')[0],
    nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalReservations: 0,
    monthlyRevenue: 0,
    rating: 0,
    description: court.description || `Cancha de ${court.sport} profesional`
  }));

  // Form state for creating/editing courts
  const [formData, setFormData] = useState<Partial<Court>>({
    name: '',
    type: 'futbol',
    status: 'available',
    surface: '',
    capacity: 0,
    pricePerHour: 0,
    openTime: '08:00',
    closeTime: '22:00',
    lighting: false,
    covered: false,
    description: ''
  });

  // Handler functions - using API
  const handleCreateCourt = async () => {
    const courtData = {
      name: formData.name || '',
      sport: formData.type || 'futbol',
      surface: formData.surface || 'synthetic',
      capacity: formData.capacity || 10,
      pricePerHour: formData.pricePerHour || 0,
      isIndoor: formData.covered || false,
      amenities: formData.lighting ? ['Iluminación LED'] : [],
      description: formData.description || ''
    };

    const success = await apiCreateCourt(courtData);
    if (success) {
      setShowCreateModal(false);
      resetForm();
      alert('Cancha creada exitosamente');
    } else {
      alert('Error al crear la cancha');
    }
  };

  const handleEditCourt = async () => {
    if (!selectedCourt) return;

    const courtData = {
      name: formData.name,
      sport: formData.type,
      surface: formData.surface,
      capacity: formData.capacity,
      pricePerHour: formData.pricePerHour,
      isIndoor: formData.covered,
      description: formData.description
    };

    const success = await apiUpdateCourt(selectedCourt.id, courtData);
    if (success) {
      setShowEditModal(false);
      setSelectedCourt(null);
      resetForm();
      alert('Cancha actualizada exitosamente');
    } else {
      alert('Error al actualizar la cancha');
    }
  };

  const handleDeleteCourt = async (courtId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta cancha?')) {
      const success = await apiDeleteCourt(courtId);
      if (success) {
        alert('Cancha eliminada exitosamente');
      } else {
        alert('Error al eliminar la cancha');
      }
    }
  };

  const openEditModal = (court: Court) => {
    setSelectedCourt(court);
    setFormData(court);
    setShowEditModal(true);
  };

  // Amenity handlers
  const handleCreateAmenity = async (data: Partial<Amenity>) => {
    if (!establishment?.id) return;
    try {
      await apiClient.createAmenity({
        establishmentId: establishment.id,
        name: data.name || '',
        description: data.description,
        icon: data.icon,
        pricePerHour: data.pricePerHour || 0,
        pricePerHour90: data.pricePerHour90,
        pricePerHour120: data.pricePerHour120,
        isBookable: data.isBookable,
        isPublic: data.isPublic,
        capacity: data.capacity,
      });
      await loadAmenities();
    } catch (error) {
      console.error('Error creating amenity:', error);
      throw error;
    }
  };

  const handleUpdateAmenity = async (data: Partial<Amenity>) => {
    if (!selectedAmenity) return;
    try {
      await apiClient.updateAmenity(selectedAmenity.id, data);
      await loadAmenities();
    } catch (error) {
      console.error('Error updating amenity:', error);
      throw error;
    }
  };

  const handleDeleteAmenity = async (amenityId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este amenity?')) {
      try {
        await apiClient.deleteAmenity(amenityId);
        await loadAmenities();
      } catch (error) {
        console.error('Error deleting amenity:', error);
      }
    }
  };

  const openAmenityEdit = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setAmenityMode('edit');
    setShowAmenitySidebar(true);
  };

  const openAmenityCreate = () => {
    setSelectedAmenity(null);
    setAmenityMode('create');
    setShowAmenitySidebar(true);
  };

  const formatCurrencyAmenity = (amount: number) => {
    if (amount === 0) return 'Gratis';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'futbol',
      status: 'available',
      surface: '',
      capacity: 0,
      pricePerHour: 0,
      openTime: '08:00',
      closeTime: '22:00',
      lighting: false,
      covered: false,
      description: ''
    });
  };

  const allCourtTypes = [
    { id: 'futbol', name: 'Fútbol', color: 'emerald' },
    { id: 'tenis', name: 'Tenis', color: 'blue' },
    { id: 'paddle', name: 'Paddle', color: 'purple' },
    { id: 'basquet', name: 'Básquet', color: 'orange' },
    { id: 'voley', name: 'Vóley', color: 'cyan' }
  ];

  // Get unique sports from this establishment's courts
  const establishmentSports = useMemo(() => {
    const uniqueSports = [...new Set(courts.map(c => c.type))];
    return allCourtTypes.filter(t => uniqueSports.includes(t.id as any));
  }, [courts]);

  const courtTypes = allCourtTypes;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-emerald-400 bg-emerald-400/10';
      case 'maintenance': return 'text-yellow-400 bg-yellow-400/10';
      case 'out_of_service': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'out_of_service': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const typeData = courtTypes.find(t => t.id === type);
    switch (typeData?.color) {
      case 'emerald': return 'text-emerald-400 bg-emerald-400/10';
      case 'blue': return 'text-blue-400 bg-blue-400/10';
      case 'purple': return 'text-purple-400 bg-purple-400/10';
      case 'orange': return 'text-orange-400 bg-orange-400/10';
      case 'cyan': return 'text-cyan-400 bg-cyan-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredCourts = courts.filter(court => {
    const matchesSearch = !searchTerm || 
      court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      court.surface.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || court.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || court.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: courts.length,
    available: courts.filter(c => c.status === 'available').length,
    maintenance: courts.filter(c => c.status === 'maintenance').length,
    outOfService: courts.filter(c => c.status === 'out_of_service').length,
    totalRevenue: courts.reduce((sum, c) => sum + c.monthlyRevenue, 0),
    avgRating: courts.reduce((sum, c) => sum + c.rating, 0) / courts.length
  };

  // Header controls to be rendered via portal
  const headerControls = (
    <div className="flex items-center w-full space-x-2 overflow-x-auto">
      {/* Search */}
      <div className="relative flex-shrink-0">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 w-32"
        />
      </div>

      {/* Sport Type Pills - Only show sports from this establishment */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            selectedType === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Todos
        </button>
        {establishmentSports.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedType === type.id
                ? `${type.color === 'emerald' ? 'bg-emerald-600' : 
                    type.color === 'blue' ? 'bg-blue-600' : 
                    type.color === 'purple' ? 'bg-purple-600' : 
                    type.color === 'orange' ? 'bg-orange-600' : 
                    'bg-cyan-600'} text-white`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-emerald-500 flex-shrink-0"
      >
        <option value="all">Todos</option>
        <option value="available">Disponibles</option>
        <option value="maintenance">Mantenimiento</option>
        <option value="out_of_service">Fuera de servicio</option>
      </select>

      {/* New Court Button */}
      <button 
        onClick={() => setShowCreateModal(true)}
        className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex-shrink-0"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nueva Cancha</span>
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Cargando canchas...</div>
      </div>
    );
  }

  return (
    <>
      {/* Render controls in header via portal */}
      {headerPortalContainer && createPortal(headerControls, headerPortalContainer)}
      
      <div className="p-6">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Instalaciones</h1>
          <p className="text-gray-400 mt-1">Administra canchas y amenities del complejo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-700 pb-4">
        <button
          onClick={() => setActiveTab('courts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'courts'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <MapPin className="h-4 w-4 inline mr-2" />
          Canchas ({courts.length})
        </button>
        <button
          onClick={() => setActiveTab('amenities')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'amenities'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4 inline mr-2" />
          Amenities ({amenities.length})
        </button>
      </div>

      {activeTab === 'courts' && (
      <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Canchas</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <MapPin className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Disponibles</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.available}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Mantenimiento</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.maintenance}</p>
            </div>
            <Wrench className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Fuera de Servicio</p>
              <p className="text-2xl font-bold text-red-400">{stats.outOfService}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ingresos Mensuales</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Rating Promedio</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.avgRating.toFixed(1)}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>


      {/* Courts List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cancha</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Precio/Hora</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reservas</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ingresos</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredCourts.map((court, index) => (
                  <motion.tr
                    key={court.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gray-600 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{court.name}</div>
                          <div className="text-sm text-gray-400">{court.surface}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(court.type)}`}>
                        {courtTypes.find(t => t.id === court.type)?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(court.status)}`}>
                        {getStatusIcon(court.status)}
                        <span className="ml-1 capitalize">
                          {court.status === 'available' ? 'Disponible' : 
                           court.status === 'maintenance' ? 'Mantenimiento' : 'Fuera de servicio'}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-400">
                      {formatCurrency(court.pricePerHour)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {court.totalReservations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-400">
                      {formatCurrency(court.monthlyRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-yellow-400">{court.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleViewStats(court)}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded transition-colors"
                          title="Ver estadísticas"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(court)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                          title="Editar cancha"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCourt(court.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                          title="Eliminar cancha"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCourts.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-white">
                {courts.length === 0 ? 'No hay canchas registradas' : 'No hay canchas'}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {courts.length === 0 
                  ? 'Agrega canchas desde la configuración del establecimiento para empezar a gestionar tus instalaciones.'
                  : 'No se encontraron canchas que coincidan con los filtros seleccionados.'
                }
              </p>
              {courts.length === 0 && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  Agregar Primera Cancha
                </button>
              )}
            </div>
          )}
        </div>

      {/* Create/Edit Court Sidebar */}
      <CreateCourtSidebar
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedCourt(null);
        }}
        onSuccess={async (courtData) => {
          try {
            if (showEditModal && selectedCourt) {
              const success = await apiUpdateCourt(selectedCourt.id, courtData);
              if (success) {
                setShowEditModal(false);
                setSelectedCourt(null);
              } else {
                alert('Error al actualizar la cancha. Verifica que estés logueado.');
              }
            } else {
              console.log('Creating court with data:', courtData);
              const success = await apiCreateCourt(courtData);
              if (success) {
                setShowCreateModal(false);
              } else {
                alert('Error al crear la cancha. Verifica que estés logueado como establecimiento.');
              }
            }
          } catch (error) {
            console.error('Error in court operation:', error);
            alert('Error al procesar la operación. Verifica tu conexión y que estés logueado.');
          }
        }}
        editingCourt={showEditModal ? selectedCourt : null}
      />

      </>
      )}

      {/* Amenities Tab */}
      {activeTab === 'amenities' && (
        <div className="space-y-6">
          {/* Amenities Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Amenities del Establecimiento</h2>
              <p className="text-gray-400 text-sm mt-1">
                Gestiona servicios adicionales como quincho, pileta, vestuarios, etc.
              </p>
            </div>
            <button
              onClick={openAmenityCreate}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nuevo Amenity
            </button>
          </div>

          {/* Amenities Grid */}
          {amenitiesLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Cargando amenities...</div>
            </div>
          ) : amenities.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
              <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-white">No hay amenities</h3>
              <p className="mt-1 text-sm text-gray-400">
                Agrega amenities como quincho, pileta, vestuarios para que tus clientes puedan reservarlos.
              </p>
              <button
                onClick={openAmenityCreate}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                Agregar Primer Amenity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {amenities.map((amenity) => {
                const IconComponent = AMENITY_ICONS[amenity.icon || 'Sparkles'] || Sparkles;
                return (
                  <motion.div
                    key={amenity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-gray-800 rounded-xl border ${amenity.isActive ? 'border-gray-700' : 'border-red-900/50 opacity-60'} p-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${amenity.isActive ? 'bg-purple-500/20' : 'bg-gray-700'}`}>
                          <IconComponent className={`h-5 w-5 ${amenity.isActive ? 'text-purple-400' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{amenity.name}</h3>
                          <p className="text-sm text-emerald-400">{formatCurrencyAmenity(amenity.pricePerHour)}/hora</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openAmenityEdit(amenity)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAmenity(amenity.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {amenity.description && (
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">{amenity.description}</p>
                    )}

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center gap-1.5">
                        {amenity.isPublic ? (
                          <Eye className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        )}
                        <span className={`text-xs ${amenity.isPublic ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {amenity.isPublic ? 'Público' : 'Interno'}
                        </span>
                      </div>
                      {amenity.capacity && (
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-400">{amenity.capacity} personas</span>
                        </div>
                      )}
                      {!amenity.isActive && (
                        <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded">Inactivo</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Amenity Sidebar */}
      <AmenitySidebar
        isOpen={showAmenitySidebar}
        onClose={() => {
          setShowAmenitySidebar(false);
          setSelectedAmenity(null);
        }}
        onSave={amenityMode === 'create' ? handleCreateAmenity : handleUpdateAmenity}
        amenity={selectedAmenity}
        mode={amenityMode}
      />

      {/* Court Statistics Sidebar - rendered via portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showStatsModal && selectedCourt && courtStats && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowStatsModal(false);
                  setSelectedCourt(null);
                }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              />
              
              {/* Sidebar */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-xl bg-gray-800 border-l border-gray-700 z-[101] flex flex-col"
              >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Estadísticas de {selectedCourt.name}</h3>
                  <p className="text-gray-400 text-sm capitalize">{selectedCourt.type} • {selectedCourt.surface}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowStatsModal(false);
                  setSelectedCourt(null);
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <Percent className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-400 text-sm">Ocupación</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{courtStats.occupancyRate}%</p>
                  <p className="text-xs text-gray-500">del tiempo disponible</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span className="text-gray-400 text-sm">Reservas/Mes</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{courtStats.monthlyReservations}</p>
                  <p className="text-xs text-gray-500">{courtStats.weeklyReservations} esta semana</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-yellow-400" />
                    <span className="text-gray-400 text-sm">Ingresos/Mes</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">${courtStats.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">${courtStats.avgRevenuePerDay.toLocaleString()}/día</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    <span className="text-gray-400 text-sm">Total Histórico</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{courtStats.totalReservations}</p>
                  <p className="text-xs text-gray-500">reservas totales</p>
                </div>
              </div>

              {/* Popular Hours */}
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <h4 className="font-medium text-white mb-4 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-400" />
                  Horarios Más Populares
                </h4>
                <div className="space-y-3">
                  {courtStats.popularHours.sort((a, b) => b.count - a.count).map((slot, index) => (
                    <div key={slot.hour} className="flex items-center">
                      <span className="text-gray-400 w-14 text-sm">{slot.hour}</span>
                      <div className="flex-1 mx-3">
                        <div className="h-5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              index === 0 ? 'bg-emerald-500' : 
                              index === 1 ? 'bg-emerald-600' : 
                              'bg-emerald-700'
                            }`}
                            style={{ width: `${(slot.count / Math.max(...courtStats.popularHours.map(h => h.count))) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-white font-medium w-10 text-right text-sm">{slot.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekday Distribution */}
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <h4 className="font-medium text-white mb-4 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                  Distribución por Día
                </h4>
                <div className="flex items-end justify-between h-28 px-1">
                  {courtStats.weekdayDistribution.map((day) => (
                    <div key={day.day} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-6 bg-purple-500 rounded-t"
                        style={{ height: `${day.percentage * 1.1}px` }}
                      />
                      <span className="text-xs text-gray-400 mt-2">{day.day}</span>
                      <span className="text-xs text-white">{day.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Clients */}
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <h4 className="font-medium text-white mb-4 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-yellow-400" />
                  Clientes Frecuentes
                </h4>
                <div className="space-y-3">
                  {courtStats.topClients.map((client, index) => (
                    <div key={client.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-600' :
                          'bg-gray-600'
                        }`}>
                          <span className="text-xs font-bold text-white">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <span className="text-white text-sm">{client.name}</span>
                          <p className="text-xs text-gray-500">{client.reservations} reservas</p>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-medium text-sm">
                        ${client.spent.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setShowStatsModal(false);
                  setSelectedCourt(null);
                }}
                className="w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors border border-gray-700"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </>
      )}
        </AnimatePresence>,
        document.body
      )}
      </div>
    </div>
    </>
  );
};

export default CourtsPage;
