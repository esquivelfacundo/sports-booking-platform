'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { 
  Users, 
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Activity,
  TrendingUp,
  Clock,
  DollarSign,
  Award,
  MessageSquare,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'blocked';
  joinDate: string;
  lastVisit: string;
  totalSpent: number;
  totalReservations: number;
  rating: number;
  preferredSports: string[];
  notes?: string;
  birthDate?: string;
  address?: string;
  membershipType: 'basic' | 'premium' | 'vip';
  registrationDate?: string;
}

const ClientsPage = () => {
  const { establishment, isDemo, loading } = useEstablishment();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all')
  const [membershipFilter, setMembershipFilter] = useState<'all' | 'basic' | 'premium' | 'vip'>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membership: 'basic' as 'basic' | 'premium' | 'vip',
    status: 'active' as 'active' | 'inactive' | 'blocked',
    birthDate: '',
    address: '',
    notes: ''
  })
  const [clients, setClients] = useState<Client[]>([]);

  // Initialize clients data based on demo or real data
  useEffect(() => {
    if (isDemo) {
      // Demo data
      setClients([
        {
          id: '1',
          name: 'Juan Carlos Pérez',
          email: 'juan.perez@email.com',
          phone: '+54 11 1234-5678',
          address: 'Av. Corrientes 1234, CABA',
          joinDate: '2024-01-15',
          registrationDate: '2024-01-15',
          lastVisit: '2024-09-10',
          totalReservations: 45,
          totalSpent: 67500,
          status: 'active' as const,
          rating: 4.8,
          preferredSports: ['futbol', 'tenis'],
          membershipType: 'premium' as const,
          birthDate: '1985-03-20',
          notes: 'Cliente frecuente, prefiere horarios de tarde'
        },
        {
          id: '2',
          name: 'María González',
          email: 'maria.gonzalez@email.com',
          phone: '+54 11 2345-6789',
          address: 'Av. Santa Fe 2345, CABA',
          joinDate: '2024-02-20',
          registrationDate: '2024-02-20',
          lastVisit: '2024-09-12',
          totalReservations: 32,
          totalSpent: 48000,
          status: 'active' as const,
          rating: 4.9,
          preferredSports: ['paddle', 'tenis'],
          membershipType: 'vip' as const,
          birthDate: '1990-07-15',
          notes: 'Excelente jugadora, siempre puntual'
        },
        {
          id: '3',
          name: 'Carlos Rodriguez',
          email: 'carlos.rodriguez@email.com',
          phone: '+54 11 3456-7890',
          address: 'Av. Rivadavia 3456, CABA',
          joinDate: '2024-03-10',
          registrationDate: '2024-03-10',
          lastVisit: '2024-09-08',
          totalReservations: 18,
          totalSpent: 27000,
          status: 'active' as const,
          rating: 4.5,
          preferredSports: ['futbol'],
          membershipType: 'basic' as const,
          birthDate: '1992-11-08'
        },
        {
          id: '4',
          name: 'Ana Martínez',
          email: 'ana.martinez@email.com',
          phone: '+54 11 4567-8901',
          address: 'Av. Cabildo 4567, CABA',
          joinDate: '2024-01-25',
          registrationDate: '2024-01-25',
          lastVisit: '2024-08-20',
          totalReservations: 12,
          totalSpent: 18000,
          status: 'inactive' as const,
          rating: 4.2,
          preferredSports: ['tenis'],
          membershipType: 'basic' as const,
          birthDate: '1988-05-12',
          notes: 'No ha visitado en el último mes'
        },
        {
          id: '5',
          name: 'Roberto Silva',
          email: 'roberto.silva@email.com',
          phone: '+54 11 5678-9012',
          address: 'Av. Las Heras 5678, CABA',
          joinDate: '2024-04-05',
          registrationDate: '2024-04-05',
          lastVisit: '2024-09-11',
          totalReservations: 28,
          totalSpent: 42000,
          status: 'active' as const,
          rating: 4.7,
          preferredSports: ['paddle', 'futbol'],
          membershipType: 'vip' as const,
          birthDate: '1987-09-30',
          notes: 'Organiza torneos internos'
        },
        {
          id: '6',
          name: 'Laura Fernández',
          email: 'laura.fernandez@email.com',
          phone: '+54 11 6789-0123',
          address: 'Av. Belgrano 6789, CABA',
          joinDate: '2024-02-14',
          registrationDate: '2024-02-14',
          lastVisit: '2024-07-15',
          totalReservations: 8,
          totalSpent: 12000,
          status: 'blocked' as const,
          rating: 3.8,
          preferredSports: ['tenis'],
          membershipType: 'basic' as const,
          birthDate: '1995-12-03',
          notes: 'Bloqueado por pagos pendientes'
        }
      ]);
    } else {
      // Real establishment - no clients data yet
      setClients([]);
    }
  }, [establishment, isDemo]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Cargando clientes...</div>
      </div>
    );
  }

  // Filter clients based on search and status
  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchTerm || 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesMembership = membershipFilter === 'all' || client.membershipType === membershipFilter;
    return matchesSearch && matchesStatus && matchesMembership;
  });

  // Calculate stats
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
    blocked: clients.filter(c => c.status === 'blocked').length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0),
    avgSpent: clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.length || 0,
    totalReservations: clients.reduce((sum, c) => sum + c.totalReservations, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10';
      case 'inactive': return 'text-yellow-400 bg-yellow-400/10';
      case 'blocked': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      case 'blocked': return <Ban className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case 'vip': return 'text-purple-400 bg-purple-400/10';
      case 'premium': return 'text-yellow-400 bg-yellow-400/10';
      case 'basic': return 'text-gray-400 bg-gray-400/10';
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

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      setClients(clients.filter(c => c.id !== clientId));
    }
  };

  const handleAddClient = () => {
    const newClient: Client = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      joinDate: new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      totalReservations: 0,
      rating: 5,
      preferredSports: ['futbol'],
      notes: formData.notes,
      birthDate: formData.birthDate,
      membershipType: formData.membership
    };

    setClients([...clients, newClient]);
    setShowAddModal(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      membership: 'basic',
      status: 'active',
      birthDate: '',
      address: '',
      notes: ''
    });
    alert('Cliente creado exitosamente');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Clientes</h1>
          <p className="text-gray-400 mt-1">Administra la base de datos de clientes del complejo</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Clientes</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-lg">
              <Users className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-400 mr-1" />
            <span className="text-emerald-400">+12%</span>
            <span className="text-gray-400 ml-1">vs mes anterior</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Clientes Activos</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.active}</p>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-400">{stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}%</span>
            <span className="text-gray-400 ml-1">del total</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ingresos Totales</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-400 mr-1" />
            <span className="text-emerald-400">+8.2%</span>
            <span className="text-gray-400 ml-1">vs mes anterior</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gasto Promedio</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.avgSpent)}</p>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-400">Por cliente</span>
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
            <h3 className="text-lg font-semibold text-white">Membresías</h3>
            <Award className="h-5 w-5 text-purple-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">VIP</span>
              <span className="text-purple-400 font-medium">
                {clients.filter(c => c.membershipType === 'vip').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Premium</span>
              <span className="text-blue-400 font-medium">
                {clients.filter(c => c.membershipType === 'premium').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Básico</span>
              <span className="text-gray-400 font-medium">
                {clients.filter(c => c.membershipType === 'basic').length}
              </span>
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
            <h3 className="text-lg font-semibold text-white">Estados</h3>
            <Activity className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Activos</span>
              <span className="text-emerald-400 font-medium">{stats.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Inactivos</span>
              <span className="text-gray-400 font-medium">{stats.inactive}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Bloqueados</span>
              <span className="text-red-400 font-medium">{stats.blocked}</span>
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
            <h3 className="text-lg font-semibold text-white">Actividad</h3>
            <Calendar className="h-5 w-5 text-blue-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Reservas</span>
              <span className="text-blue-400 font-medium">{stats.totalReservations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Promedio por Cliente</span>
              <span className="text-blue-400 font-medium">
                {Math.round(stats.totalReservations / stats.total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Nuevos este mes</span>
              <span className="text-emerald-400 font-medium">12</span>
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
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-80"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'blocked')}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="blocked">Bloqueados</option>
            </select>

            {/* Membership Filter */}
            <select
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value as 'all' | 'basic' | 'premium' | 'vip')}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas</option>
              <option value="basic">Básica</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
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

      {/* Clients Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Membresía</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reservas</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Gastado</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Última Visita</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredClients.map((client, index) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{client.name}</div>
                        <div className="text-sm text-gray-400">{client.email}</div>
                        <div className="text-sm text-gray-400">{client.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                      {getStatusIcon(client.status)}
                      <span className="ml-1 capitalize">
                        {client.status === 'active' ? 'Activo' : 
                         client.status === 'inactive' ? 'Inactivo' : 'Bloqueado'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMembershipColor(client.membershipType)}`}>
                      {client.membershipType === 'basic' ? 'Básico' :
                       client.membershipType === 'premium' ? 'Premium' : 'VIP'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {client.totalReservations}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-400">
                    {formatCurrency(client.totalSpent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-yellow-400">{client.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(client.lastVisit).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openClientModal(client)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-purple-400 hover:text-purple-300 transition-colors">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="text-orange-400 hover:text-orange-300 transition-colors">
                        <MessageSquare className="h-4 w-4" />
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

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-white">No hay clientes</h3>
            <p className="mt-1 text-sm text-gray-400">
              No se encontraron clientes que coincidan con los filtros seleccionados.
            </p>
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Detalles del Cliente</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Información Personal</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center">
                        <span className="text-lg font-medium text-white">
                          {selectedClient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{selectedClient.name}</p>
                        <p className="text-sm text-gray-400">{selectedClient.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Teléfono</p>
                        <p className="text-white">{selectedClient.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Fecha de Nacimiento</p>
                        <p className="text-white">
                          {selectedClient.birthDate ? new Date(selectedClient.birthDate).toLocaleDateString('es-AR') : 'No especificada'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Dirección</p>
                      <p className="text-white">{selectedClient.address}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Estado y Membresía</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Estado</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedClient.status)}`}>
                        {getStatusIcon(selectedClient.status)}
                        <span className="ml-1 capitalize">
                          {selectedClient.status === 'active' ? 'Activo' : 
                           selectedClient.status === 'inactive' ? 'Inactivo' : 'Bloqueado'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Membresía</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMembershipColor(selectedClient.membershipType)}`}>
                        {selectedClient.membershipType === 'basic' ? 'Básico' :
                         selectedClient.membershipType === 'premium' ? 'Premium' : 'VIP'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Rating</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-yellow-400">{selectedClient.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Notas</h4>
                    <p className="text-gray-300 text-sm">{selectedClient.notes}</p>
                  </div>
                )}
              </div>

              {/* Activity Info */}
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Actividad</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">{selectedClient.totalReservations}</p>
                      <p className="text-gray-400 text-sm">Total Reservas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">{formatCurrency(selectedClient.totalSpent)}</p>
                      <p className="text-gray-400 text-sm">Total Gastado</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Registro</span>
                      <span className="text-white">{selectedClient.registrationDate ? new Date(selectedClient.registrationDate).toLocaleDateString('es-AR') : selectedClient.joinDate ? new Date(selectedClient.joinDate).toLocaleDateString('es-AR') : 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Última Visita</span>
                      <span className="text-white">{new Date(selectedClient.lastVisit).toLocaleDateString('es-AR')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Gasto Promedio</span>
                      <span className="text-emerald-400">{formatCurrency(selectedClient.totalSpent / selectedClient.totalReservations)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Deportes Preferidos</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedClient.preferredSports.map((sport, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400"
                      >
                        {sport === 'futbol' ? 'Fútbol' :
                         sport === 'tenis' ? 'Tenis' :
                         sport === 'paddle' ? 'Paddle' :
                         sport === 'basquet' ? 'Básquet' : 'Vóley'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-4">Acciones Rápidas</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Calendar className="h-4 w-4" />
                      <span>Nueva Reserva</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Mail className="h-4 w-4" />
                      <span>Enviar Email</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <Award className="h-4 w-4" />
                      <span>Cambiar Membresía</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      <span>Agregar Nota</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                Cerrar
              </button>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">
                Editar Cliente
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Nuevo Cliente</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Ej: Juan Carlos Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="cliente@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Membresía
                  </label>
                  <select
                    value={formData.membership}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, membership: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="basic">Básica</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Av. Corrientes 1234, CABA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Notas adicionales sobre el cliente..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => console.log(formData)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Crear Cliente
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
