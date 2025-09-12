'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  address: string;
  registrationDate: string;
  lastVisit: string;
  totalReservations: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'blocked';
  rating: number;
  preferredSports: string[];
  notes?: string;
  birthDate?: string;
  membershipType: 'basic' | 'premium' | 'vip';
}

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMembership, setSelectedMembership] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Juan Carlos Pérez',
      email: 'juan.perez@email.com',
      phone: '+54 11 1234-5678',
      address: 'Av. Corrientes 1234, CABA',
      registrationDate: '2023-01-15',
      lastVisit: '2024-01-14',
      totalReservations: 45,
      totalSpent: 360000,
      status: 'active',
      rating: 4.8,
      preferredSports: ['futbol', 'tenis'],
      membershipType: 'premium',
      birthDate: '1985-03-20',
      notes: 'Cliente frecuente, prefiere horarios nocturnos'
    },
    {
      id: '2',
      name: 'María González',
      email: 'maria.gonzalez@email.com',
      phone: '+54 11 9876-5432',
      address: 'Belgrano 567, CABA',
      registrationDate: '2023-03-10',
      lastVisit: '2024-01-15',
      totalReservations: 32,
      totalSpent: 256000,
      status: 'active',
      rating: 4.6,
      preferredSports: ['paddle', 'tenis'],
      membershipType: 'vip',
      birthDate: '1990-07-12',
      notes: 'Excelente jugadora, organiza torneos'
    },
    {
      id: '3',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+54 11 5555-1234',
      address: 'San Martín 890, CABA',
      registrationDate: '2023-06-05',
      lastVisit: '2024-01-10',
      totalReservations: 28,
      totalSpent: 168000,
      status: 'active',
      rating: 4.4,
      preferredSports: ['basquet', 'voley'],
      membershipType: 'basic',
      birthDate: '1988-11-30'
    },
    {
      id: '4',
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      phone: '+54 11 7777-8888',
      address: 'Rivadavia 456, CABA',
      registrationDate: '2023-08-20',
      lastVisit: '2023-12-15',
      totalReservations: 15,
      totalSpent: 90000,
      status: 'inactive',
      rating: 4.2,
      preferredSports: ['tenis'],
      membershipType: 'basic',
      birthDate: '1992-05-18',
      notes: 'No ha visitado en el último mes'
    },
    {
      id: '5',
      name: 'Diego López',
      email: 'diego.lopez@email.com',
      phone: '+54 11 3333-4444',
      address: 'Libertador 789, CABA',
      registrationDate: '2023-04-12',
      lastVisit: '2024-01-12',
      totalReservations: 52,
      totalSpent: 520000,
      status: 'active',
      rating: 4.9,
      preferredSports: ['futbol', 'paddle', 'tenis'],
      membershipType: 'vip',
      birthDate: '1983-09-25',
      notes: 'Cliente VIP, muy activo'
    },
    {
      id: '6',
      name: 'Laura Fernández',
      email: 'laura.fernandez@email.com',
      phone: '+54 11 2222-3333',
      address: 'Santa Fe 321, CABA',
      registrationDate: '2023-09-08',
      lastVisit: '2024-01-13',
      totalReservations: 8,
      totalSpent: 32000,
      status: 'blocked',
      rating: 3.5,
      preferredSports: ['voley'],
      membershipType: 'basic',
      birthDate: '1995-12-03',
      notes: 'Bloqueada por incumplimiento de pagos'
    }
  ]);

  // Form state for creating/editing clients
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    membershipType: 'basic',
    preferredSports: [],
    notes: '',
    birthDate: ''
  });

  // Handler functions
  const handleCreateClient = () => {
    const newClient: Client = {
      id: Date.now().toString(),
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      address: formData.address || '',
      registrationDate: new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0],
      totalReservations: 0,
      totalSpent: 0,
      status: formData.status as Client['status'] || 'active',
      rating: 0,
      preferredSports: formData.preferredSports || [],
      membershipType: formData.membershipType as Client['membershipType'] || 'basic',
      notes: formData.notes || '',
      birthDate: formData.birthDate || ''
    };

    setClients(prev => [...prev, newClient]);
    setShowCreateModal(false);
    resetForm();
    alert('Cliente creado exitosamente');
  };

  const handleEditClient = () => {
    if (!selectedClient) return;

    setClients(prev => prev.map(client => 
      client.id === selectedClient.id 
        ? { ...client, ...formData }
        : client
    ));
    setShowEditModal(false);
    setSelectedClient(null);
    resetForm();
    alert('Cliente actualizado exitosamente');
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      setClients(prev => prev.filter(client => client.id !== clientId));
      alert('Cliente eliminado exitosamente');
    }
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setFormData(client);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
      membershipType: 'basic',
      preferredSports: [],
      notes: '',
      birthDate: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10';
      case 'inactive': return 'text-gray-400 bg-gray-400/10';
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

  const getMembershipColor = (membership: string) => {
    switch (membership) {
      case 'basic': return 'text-gray-400 bg-gray-400/10';
      case 'premium': return 'text-blue-400 bg-blue-400/10';
      case 'vip': return 'text-purple-400 bg-purple-400/10';
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

  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchTerm || 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
    const matchesMembership = selectedMembership === 'all' || client.membershipType === selectedMembership;
    
    return matchesSearch && matchesStatus && matchesMembership;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
    blocked: clients.filter(c => c.status === 'blocked').length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0),
    avgSpending: clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.length,
    totalReservations: clients.reduce((sum, c) => sum + c.totalReservations, 0)
  };

  const openClientModal = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
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
            onClick={() => setShowCreateModal(true)}
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
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Clientes</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
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
              <p className="text-gray-400 text-sm">Clientes Activos</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
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
              <p className="text-gray-400 text-sm">Ingresos Totales</p>
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
              <p className="text-gray-400 text-sm">Gasto Promedio</p>
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.avgSpending)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-400" />
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="blocked">Bloqueados</option>
            </select>

            {/* Membership Filter */}
            <select
              value={selectedMembership}
              onChange={(e) => setSelectedMembership(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">Todas las membresías</option>
              <option value="basic">Básico</option>
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
                      <span className="text-white">{new Date(selectedClient.registrationDate).toLocaleDateString('es-AR')}</span>
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
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Nuevo Cliente</h2>
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
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Client['status'] }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Membresía
                  </label>
                  <select
                    value={formData.membershipType}
                    onChange={(e) => setFormData(prev => ({ ...prev, membershipType: e.target.value as Client['membershipType'] }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Notas adicionales sobre el cliente..."
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
                onClick={handleCreateClient}
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
