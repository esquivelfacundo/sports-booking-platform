'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import CourtModal from '@/components/dashboard/CourtModal';
import { 
  MapPin, 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
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
  Image as ImageIcon
} from 'lucide-react';

interface Court {
  id: string;
  name: string;
  type: 'futbol' | 'tenis' | 'paddle' | 'basquet' | 'voley';
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

const CourtsPage = () => {
  const { establishment, loading } = useEstablishment();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);

  // Initialize courts from establishment data or demo data
  useEffect(() => {
    if (establishment?.courts && establishment.courts.length > 0) {
      // Convert establishment courts to Court format
      const convertedCourts: Court[] = establishment.courts.map((court: any, index: number) => ({
        id: (index + 1).toString(),
        name: court.name,
        type: court.type as Court['type'],
        status: 'available' as Court['status'],
        surface: court.surface || 'No especificado',
        capacity: court.capacity || 0,
        pricePerHour: court.pricePerHour || 0,
        openTime: '08:00',
        closeTime: '22:00',
        lighting: court.lighting || false,
        covered: court.covered || false,
        images: [],
        lastMaintenance: new Date().toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalReservations: 0,
        monthlyRevenue: 0,
        rating: 0,
        description: court.description || `Cancha de ${court.type} profesional`
      }));
      setCourts(convertedCourts);
    } else {
      // No courts available
      setCourts([]);
    }
  }, [establishment]);

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

  // Handler functions
  const handleCreateCourt = () => {
    const newCourt: Court = {
      id: Date.now().toString(),
      name: formData.name || '',
      type: formData.type as Court['type'] || 'futbol',
      status: formData.status as Court['status'] || 'available',
      surface: formData.surface || '',
      capacity: formData.capacity || 0,
      pricePerHour: formData.pricePerHour || 0,
      openTime: formData.openTime || '08:00',
      closeTime: formData.closeTime || '22:00',
      lighting: formData.lighting || false,
      covered: formData.covered || false,
      images: [],
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalReservations: 0,
      monthlyRevenue: 0,
      rating: 0,
      description: formData.description || ''
    };

    setCourts(prev => [...prev, newCourt]);
    setShowCreateModal(false);
    resetForm();
    alert('Cancha creada exitosamente');
  };

  const handleEditCourt = () => {
    if (!selectedCourt) return;

    setCourts(prev => prev.map(court => 
      court.id === selectedCourt.id 
        ? { ...court, ...formData }
        : court
    ));
    setShowEditModal(false);
    setSelectedCourt(null);
    resetForm();
    alert('Cancha actualizada exitosamente');
  };

  const handleDeleteCourt = (courtId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta cancha?')) {
      setCourts(prev => prev.filter(court => court.id !== courtId));
      alert('Cancha eliminada exitosamente');
    }
  };

  const openEditModal = (court: Court) => {
    setSelectedCourt(court);
    setFormData(court);
    setShowEditModal(true);
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

  const courtTypes = [
    { id: 'futbol', name: 'Fútbol', color: 'emerald' },
    { id: 'tenis', name: 'Tenis', color: 'blue' },
    { id: 'paddle', name: 'Paddle', color: 'purple' },
    { id: 'basquet', name: 'Básquet', color: 'orange' },
    { id: 'voley', name: 'Vóley', color: 'cyan' }
  ];

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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Cargando canchas...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Canchas</h1>
          <p className="text-gray-400 mt-1">Administra las instalaciones deportivas del complejo</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Grilla
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Lista
            </button>
          </div>
          <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Cancha</span>
          </button>
        </div>
      </div>

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

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar canchas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-80"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todos los deportes</option>
              {courtTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todos los estados</option>
              <option value="available">Disponibles</option>
              <option value="maintenance">En mantenimiento</option>
              <option value="out_of_service">Fuera de servicio</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Courts Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourts.map((court, index) => (
            <motion.div
              key={court.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-emerald-500/50 transition-colors"
            >
              {/* Court Image */}
              <div className="relative h-48 bg-gray-700">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-gray-500" />
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(court.status)}`}>
                    {getStatusIcon(court.status)}
                    <span className="ml-1 capitalize">
                      {court.status === 'available' ? 'Disponible' : 
                       court.status === 'maintenance' ? 'Mantenimiento' : 'Fuera de servicio'}
                    </span>
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(court.type)}`}>
                    {courtTypes.find(t => t.id === court.type)?.name}
                  </span>
                </div>
              </div>

              {/* Court Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{court.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-yellow-400">{court.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4">{court.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Superficie:</span>
                    <span className="text-white">{court.surface}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Capacidad:</span>
                    <span className="text-white">{court.capacity} personas</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Precio/hora:</span>
                    <span className="text-emerald-400 font-medium">{formatCurrency(court.pricePerHour)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Horario:</span>
                    <span className="text-white">{court.openTime} - {court.closeTime}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  {court.lighting && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-400/10 text-yellow-400">
                      Iluminación
                    </span>
                  )}
                  {court.covered && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-400/10 text-blue-400">
                      Cubierta
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">Reservas</p>
                    <p className="text-white font-medium">{court.totalReservations}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Ingresos</p>
                    <p className="text-emerald-400 font-medium">{formatCurrency(court.monthlyRevenue)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-purple-400 hover:text-purple-300 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                    <button className="text-orange-400 hover:text-orange-300 transition-colors">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                  <button className="text-gray-400 hover:text-gray-300 transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
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
                      <div className="flex items-center space-x-2">
                        <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(court)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-purple-400 hover:text-purple-300 transition-colors">
                          <Camera className="h-4 w-4" />
                        </button>
                        <button className="text-orange-400 hover:text-orange-300 transition-colors">
                          <Settings className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCourt(court.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-300 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
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
      )}

      {/* Create Court Modal */}
      <CourtModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          window.location.reload();
        }}
      />

      {/* Edit Court Modal */}
      {showEditModal && selectedCourt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Editar Cancha</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CourtsPage;
