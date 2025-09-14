'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Mail, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  BarChart3,
  Gift,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  Send,
  Image as ImageIcon,
  Share2,
  Download,
  Megaphone,
  MoreHorizontal
} from 'lucide-react';
import { useDashboardActions } from '@/hooks/useDashboardActions';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'social' | 'promotion' | 'event';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  targetAudience: string;
  reach: number;
  clicks: number;
  conversions: number;
  revenue: number;
  createdBy: string;
  createdDate: string;
  discount?: number;
  promoCode?: string;
}

const MarketingPage = () => {
  const { establishment, isDemo, loading } = useEstablishment();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Initialize campaigns data based on demo or real data
  useEffect(() => {
    if (isDemo) {
      // Demo data
      setCampaigns([
        {
          id: '1',
          name: 'Promoción Verano 2024',
          description: 'Descuento del 20% en reservas de canchas de fútbol durante enero',
          type: 'promotion',
          status: 'active',
          startDate: '2024-01-01',
      endDate: '2024-01-31',
      budget: 50000,
      spent: 32000,
      targetAudience: 'Jugadores de fútbol frecuentes',
      reach: 2500,
      clicks: 450,
      conversions: 89,
      revenue: 178000,
      createdBy: 'María González',
      createdDate: '2023-12-20',
      discount: 20,
      promoCode: 'VERANO20'
    },
    {
      id: '2',
      name: 'Newsletter Enero',
      description: 'Boletín mensual con novedades y promociones',
      type: 'email',
      status: 'completed',
      startDate: '2024-01-05',
      endDate: '2024-01-05',
      budget: 15000,
      spent: 12000,
      targetAudience: 'Todos los clientes registrados',
      reach: 1200,
      clicks: 180,
      conversions: 24,
      revenue: 48000,
      createdBy: 'Carlos Rodríguez',
      createdDate: '2024-01-02'
    },
    {
      id: '3',
      name: 'Torneo de Paddle',
      description: 'Promoción del torneo mensual de paddle',
      type: 'event',
      status: 'active',
      startDate: '2024-01-10',
      endDate: '2024-01-25',
      budget: 30000,
      spent: 18000,
      targetAudience: 'Jugadores de paddle',
      reach: 800,
      clicks: 120,
      conversions: 32,
      revenue: 96000,
      createdBy: 'Ana Martínez',
      createdDate: '2024-01-08'
    },
    {
      id: '4',
      name: 'Redes Sociales - Instagram',
      description: 'Campaña publicitaria en Instagram para atraer nuevos clientes',
      type: 'social',
      status: 'paused',
      startDate: '2024-01-01',
      endDate: '2024-02-29',
      budget: 80000,
      spent: 45000,
      targetAudience: 'Jóvenes 18-35 años interesados en deportes',
      reach: 15000,
      clicks: 750,
      conversions: 125,
      revenue: 250000,
      createdBy: 'Diego López',
      createdDate: '2023-12-28'
    },
    {
      id: '5',
      name: 'Descuento Primera Reserva',
      description: '50% de descuento para nuevos clientes en su primera reserva',
      type: 'promotion',
      status: 'draft',
      startDate: '2024-02-01',
      endDate: '2024-02-29',
      budget: 40000,
      spent: 0,
      targetAudience: 'Nuevos clientes',
      reach: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      createdBy: 'Laura Fernández',
          createdDate: '2024-01-12',
          discount: 50,
          promoCode: 'BIENVENIDO50'
        }
      ]);
    } else {
      // Real establishment - no marketing campaigns yet
      setCampaigns([]);
    }
  }, [establishment, isDemo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Form state for creating/editing campaigns
  const [formData, setFormData] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    type: 'promotion',
    status: 'draft',
    startDate: '',
    endDate: '',
    budget: 0,
    targetAudience: '',
    discount: 0,
    promoCode: ''
  });

  // Handler functions
  const handleCreateCampaign = () => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: formData.name || '',
      description: formData.description || '',
      type: formData.type as Campaign['type'] || 'promotion',
      status: formData.status as Campaign['status'] || 'draft',
      startDate: formData.startDate || '',
      endDate: formData.endDate || '',
      budget: formData.budget || 0,
      spent: 0,
      targetAudience: formData.targetAudience || '',
      reach: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      createdBy: 'Admin',
      createdDate: new Date().toISOString().split('T')[0],
      discount: formData.discount || 0,
      promoCode: formData.promoCode || ''
    };

    setCampaigns(prev => [...prev, newCampaign]);
    setShowCreateModal(false);
    resetForm();
    alert('Campaña creada exitosamente');
  };

  const handleEditCampaign = () => {
    if (!selectedCampaign) return;

    setCampaigns(prev => prev.map(campaign => 
      campaign.id === selectedCampaign.id 
        ? { ...campaign, ...formData }
        : campaign
    ));
    setShowEditModal(false);
    setSelectedCampaign(null);
    resetForm();
    alert('Campaña actualizada exitosamente');
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
      setCampaigns(campaigns.filter(c => c.id !== id));
      alert('Campaña eliminada exitosamente');
    }
  };

  // Dashboard actions integration
  useDashboardActions({
    create: () => setShowCreateModal(true)
  });

  const openEditModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setFormData(campaign);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'promotion',
      status: 'draft',
      startDate: '',
      endDate: '',
      budget: 0,
      targetAudience: '',
      discount: 0,
      promoCode: ''
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'text-blue-400 bg-blue-400/10';
      case 'social': return 'text-purple-400 bg-purple-400/10';
      case 'promotion': return 'text-emerald-400 bg-emerald-400/10';
      case 'event': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-400 bg-gray-400/10';
      case 'active': return 'text-emerald-400 bg-emerald-400/10';
      case 'paused': return 'text-yellow-400 bg-yellow-400/10';
      case 'completed': return 'text-blue-400 bg-blue-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'active': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateROI = (revenue: number, spent: number) => {
    if (spent === 0) return 0;
    return ((revenue - spent) / spent) * 100;
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = !searchTerm || 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || campaign.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    totalRevenue: campaigns.reduce((sum, c) => sum + c.revenue, 0),
    totalReach: campaigns.reduce((sum, c) => sum + c.reach, 0),
    totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
    avgROI: campaigns.filter(c => c.spent > 0).reduce((sum, c) => sum + calculateROI(c.revenue, c.spent), 0) / campaigns.filter(c => c.spent > 0).length || 0
  };

  const openCampaignModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Marketing y Promociones</h1>
          <p className="text-gray-400 mt-1">Gestiona campañas, promociones y estrategias de marketing</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Campaña</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Campañas Activas</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            </div>
            <Megaphone className="h-8 w-8 text-emerald-400" />
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
              <p className="text-gray-400 text-sm">Alcance Total</p>
              <p className="text-2xl font-bold text-blue-400">{stats.totalReach.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
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
              <p className="text-gray-400 text-sm">Ingresos Generados</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-400" />
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
              <p className="text-gray-400 text-sm">ROI Promedio</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.avgROI.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Presupuesto</h3>
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Asignado</span>
              <span className="text-white font-medium">{formatCurrency(stats.totalBudget)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Gastado</span>
              <span className="text-emerald-400 font-medium">{formatCurrency(stats.totalSpent)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Disponible</span>
              <span className="text-blue-400 font-medium">{formatCurrency(stats.totalBudget - stats.totalSpent)}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full" 
                style={{ width: `${(stats.totalSpent / stats.totalBudget) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Conversiones</h3>
            <Target className="h-5 w-5 text-purple-400" />
          </div>
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{stats.totalConversions}</p>
              <p className="text-gray-400 text-sm">Total Conversiones</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Tasa de Conversión</span>
              <span className="text-purple-400 font-medium">
                {((stats.totalConversions / campaigns.reduce((sum, c) => sum + c.clicks, 0)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Tipos de Campaña</h3>
            <BarChart3 className="h-5 w-5 text-orange-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Promociones</span>
              <span className="text-emerald-400 font-medium">
                {campaigns.filter(c => c.type === 'promotion').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Email</span>
              <span className="text-blue-400 font-medium">
                {campaigns.filter(c => c.type === 'email').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Redes Sociales</span>
              <span className="text-purple-400 font-medium">
                {campaigns.filter(c => c.type === 'social').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Eventos</span>
              <span className="text-orange-400 font-medium">
                {campaigns.filter(c => c.type === 'event').length}
              </span>
            </div>
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
                placeholder="Buscar campañas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-80"
                suppressHydrationWarning={true}
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="email">Email</option>
              <option value="social">Redes Sociales</option>
              <option value="promotion">Promociones</option>
              <option value="event">Eventos</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="active">Activas</option>
              <option value="paused">Pausadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
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

      {/* Campaigns Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Campaña</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fechas</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Presupuesto</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Resultados</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ROI</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCampaigns.map((campaign, index) => (
                <motion.tr
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-gray-600 flex items-center justify-center">
                        <Megaphone className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{campaign.name}</div>
                        <div className="text-sm text-gray-400">{campaign.targetAudience}</div>
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">{campaign.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(campaign.type)}`}>
                      {campaign.type === 'email' ? 'Email' :
                       campaign.type === 'social' ? 'Redes Sociales' :
                       campaign.type === 'promotion' ? 'Promoción' : 'Evento'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusIcon(campaign.status)}
                      <span className="ml-1">
                        {campaign.status === 'draft' ? 'Borrador' :
                         campaign.status === 'active' ? 'Activa' :
                         campaign.status === 'paused' ? 'Pausada' :
                         campaign.status === 'completed' ? 'Completada' : 'Cancelada'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div>
                      <div>Inicio: {new Date(campaign.startDate).toLocaleDateString('es-AR')}</div>
                      <div>Fin: {new Date(campaign.endDate).toLocaleDateString('es-AR')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-emerald-400 font-medium">{formatCurrency(campaign.budget)}</div>
                      <div className="text-gray-400 text-xs">
                        Gastado: {formatCurrency(campaign.spent)}
                      </div>
                      <div className="w-16 bg-gray-600 rounded-full h-1 mt-1">
                        <div 
                          className="bg-emerald-500 h-1 rounded-full" 
                          style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Alcance:</span>
                        <span className="text-blue-400">{campaign.reach.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Clicks:</span>
                        <span className="text-purple-400">{campaign.clicks}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Conversiones:</span>
                        <span className="text-emerald-400">{campaign.conversions}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        calculateROI(campaign.revenue, campaign.spent) > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {calculateROI(campaign.revenue, campaign.spent).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatCurrency(campaign.revenue)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openCampaignModal(campaign)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(campaign)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Editar campaña"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {campaign.status === 'active' ? (
                        <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : campaign.status === 'paused' ? (
                        <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                          <Play className="h-4 w-4" />
                        </button>
                      ) : campaign.status === 'draft' ? (
                        <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                          <Send className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button className="text-purple-400 hover:text-purple-300 transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300 transition-colors">
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

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">No hay campañas</h3>
            <p className="mt-1 text-sm text-gray-400">
              No se encontraron campañas que coincidan con los filtros seleccionados.
            </p>
          </div>
        )}
      </div>

      {/* Campaign Details Modal */}
      {showCampaignModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Detalles de la Campaña</h3>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Info */}
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Información de la Campaña</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Nombre</p>
                      <p className="text-white font-medium">{selectedCampaign.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Descripción</p>
                      <p className="text-white">{selectedCampaign.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Audiencia</p>
                        <p className="text-white">{selectedCampaign.targetAudience}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Creado por</p>
                        <p className="text-white">{selectedCampaign.createdBy}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Tipo y Estado</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Tipo</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedCampaign.type)}`}>
                        {selectedCampaign.type === 'email' ? 'Email' :
                         selectedCampaign.type === 'social' ? 'Redes Sociales' :
                         selectedCampaign.type === 'promotion' ? 'Promoción' : 'Evento'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Estado</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCampaign.status)}`}>
                        {getStatusIcon(selectedCampaign.status)}
                        <span className="ml-1">
                          {selectedCampaign.status === 'draft' ? 'Borrador' :
                           selectedCampaign.status === 'active' ? 'Activa' :
                           selectedCampaign.status === 'paused' ? 'Pausada' :
                           selectedCampaign.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </span>
                      </span>
                    </div>
                    {selectedCampaign.promoCode && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Código Promocional</span>
                        <span className="text-emerald-400 font-mono">{selectedCampaign.promoCode}</span>
                      </div>
                    )}
                    {selectedCampaign.discount && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Descuento</span>
                        <span className="text-emerald-400">{selectedCampaign.discount}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Cronograma</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Creada</span>
                      <span className="text-white">{new Date(selectedCampaign.createdDate).toLocaleDateString('es-AR')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Inicio</span>
                      <span className="text-white">{new Date(selectedCampaign.startDate).toLocaleDateString('es-AR')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Fin</span>
                      <span className="text-white">{new Date(selectedCampaign.endDate).toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Presupuesto</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">{formatCurrency(selectedCampaign.budget)}</p>
                      <p className="text-gray-400 text-sm">Presupuesto Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{formatCurrency(selectedCampaign.spent)}</p>
                      <p className="text-gray-400 text-sm">Gastado</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Progreso del Presupuesto</span>
                      <span className="text-white">{((selectedCampaign.spent / selectedCampaign.budget) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full" 
                        style={{ width: `${(selectedCampaign.spent / selectedCampaign.budget) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Métricas de Rendimiento</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{selectedCampaign.reach.toLocaleString()}</p>
                      <p className="text-gray-400 text-sm">Alcance</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">{selectedCampaign.clicks}</p>
                      <p className="text-gray-400 text-sm">Clicks</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">{selectedCampaign.conversions}</p>
                      <p className="text-gray-400 text-sm">Conversiones</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">
                        {selectedCampaign.clicks > 0 ? ((selectedCampaign.conversions / selectedCampaign.clicks) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-gray-400 text-sm">Tasa Conversión</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">ROI y Ingresos</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">{formatCurrency(selectedCampaign.revenue)}</p>
                      <p className="text-gray-400 text-sm">Ingresos Generados</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${
                        calculateROI(selectedCampaign.revenue, selectedCampaign.spent) > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {calculateROI(selectedCampaign.revenue, selectedCampaign.spent).toFixed(1)}%
                      </p>
                      <p className="text-gray-400 text-sm">ROI</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Acciones</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedCampaign.status === 'active' ? (
                      <button className="flex items-center justify-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <Pause className="h-4 w-4" />
                        <span>Pausar</span>
                      </button>
                    ) : selectedCampaign.status === 'paused' ? (
                      <button className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <Play className="h-4 w-4" />
                        <span>Reanudar</span>
                      </button>
                    ) : selectedCampaign.status === 'draft' ? (
                      <button className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <Send className="h-4 w-4" />
                        <span>Lanzar</span>
                      </button>
                    ) : null}
                    <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Share2 className="h-4 w-4" />
                      <span>Compartir</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <BarChart3 className="h-4 w-4" />
                      <span>Reporte</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCampaignModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                Cerrar
              </button>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">
                Editar Campaña
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Nueva Campaña</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de la Campaña
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Ej: Promoción Verano 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Campaña
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Campaign['type'] }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="promotion">Promoción</option>
                    <option value="email">Email Marketing</option>
                    <option value="social">Redes Sociales</option>
                    <option value="event">Evento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Presupuesto ($)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Campaign['status'] }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="draft">Borrador</option>
                    <option value="active">Activa</option>
                    <option value="paused">Pausada</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="20"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Código Promocional
                  </label>
                  <input
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="VERANO2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Audiencia Objetivo
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ej: Clientes frecuentes, Nuevos usuarios"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Descripción detallada de la campaña..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCampaign}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Crear Campaña
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Editar Campaña</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre de la Campaña
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Campaña
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Campaign['type'] }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="promotion">Promoción</option>
                    <option value="email">Email Marketing</option>
                    <option value="social">Redes Sociales</option>
                    <option value="event">Evento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Presupuesto ($)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Campaign['status'] }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="draft">Borrador</option>
                    <option value="active">Activa</option>
                    <option value="paused">Pausada</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descuento (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Código Promocional
                  </label>
                  <input
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Audiencia Objetivo
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditCampaign}
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

export default MarketingPage;
