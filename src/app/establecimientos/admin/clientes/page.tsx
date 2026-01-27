'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useEstablishmentAdminContext } from '@/contexts/EstablishmentAdminContext';
import { apiClient } from '@/lib/api';
import { 
  Users, 
  UserPlus,
  Search,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Activity,
  DollarSign,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Loader2,
  RefreshCw,
  History,
  Clock,
  MapPin
} from 'lucide-react';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  // Booking stats
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  // Financial
  totalSpent: number;
  // Dates
  lastBookingDate?: string;
  lastCompletedBookingDate?: string;
  createdAt: string;
  // Status
  isActive: boolean;
  hasDebt: boolean;
  debtAmount: number;
}

interface ClientBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  court: {
    id: string;
    name: string;
    sportType: string;
  };
  totalPrice: number;
}

const ClientsPage = () => {
  const { establishment, loading: establishmentLoading } = useEstablishment();
  const { establishmentId } = useEstablishmentAdminContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'edit' | 'create' | 'history' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [clientBookings, setClientBookings] = useState<ClientBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [headerPortalContainer, setHeaderPortalContainer] = useState<HTMLElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Get the header portal container on mount
  useEffect(() => {
    const container = document.getElementById('header-page-controls');
    if (container) {
      setHeaderPortalContainer(container);
    }
  }, []);

  // Load clients from API
  const loadClients = useCallback(async () => {
    if (!establishmentId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getClients(establishmentId, { page: pagination.page, limit: pagination.limit }) as {
        success: boolean;
        data?: any[];
        pagination?: { page: number; limit: number; total: number; pages: number };
      };
      if (response.success && response.data) {
        // Transform backend data to match frontend interface
        const transformedClients = response.data.map((client: any) => ({
          ...client,
          // Map new fields with defaults for backwards compatibility
          completedBookings: client.completedBookings || 0,
          pendingBookings: client.pendingBookings || 0,
          cancelledBookings: client.cancelledBookings || 0,
          noShowBookings: client.noShowBookings || client.noShows || 0,
          lastCompletedBookingDate: client.lastCompletedBookingDate || null
        }));
        setClients(transformedClients);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  }, [establishmentId, pagination.page, pagination.limit]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <UnifiedLoader size="md" />
      </div>
    );
  }

  // Filter clients based on search and status
  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchTerm || 
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm);
    
    // Map backend fields to status
    const clientStatus = client.hasDebt ? 'blocked' : (client.isActive ? 'active' : 'inactive');
    const matchesStatus = statusFilter === 'all' || clientStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.isActive !== false).length,
    inactive: clients.filter(c => c.isActive === false && !c.hasDebt).length,
    blocked: clients.filter(c => c.hasDebt).length,
    totalRevenue: clients.reduce((sum, c) => sum + (Number(c.totalSpent) || 0), 0),
    avgSpent: clients.length > 0 ? clients.reduce((sum, c) => sum + (Number(c.totalSpent) || 0), 0) / clients.length : 0,
    totalReservations: clients.reduce((sum, c) => sum + (c.totalBookings || 0), 0)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const openClientSidebar = (client: Client, mode: 'view' | 'edit' | 'history' = 'view') => {
    setSelectedClient(client);
    if (mode === 'edit') {
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        notes: client.notes || ''
      });
    }
    if (mode === 'view' || mode === 'history') {
      // Load booking history when viewing client details or history
      loadClientBookings(client.id);
    }
    setSidebarMode(mode);
  };

  const openCreateSidebar = () => {
    setSelectedClient(null);
    setFormData({ name: '', email: '', phone: '', notes: '' });
    setSidebarMode('create');
  };

  const closeSidebar = () => {
    setSidebarMode(null);
    setSelectedClient(null);
    setFormData({ name: '', email: '', phone: '', notes: '' });
    setClientBookings([]);
  };

  // Load client booking history
  const loadClientBookings = async (clientId: string) => {
    if (!establishmentId) return;
    
    setLoadingBookings(true);
    try {
      // Get bookings for this client from establishment bookings
      const response = await apiClient.getEstablishmentBookings(establishmentId, { 
        clientId,
        limit: 100 
      }) as {
        bookings?: any[];
      };
      if (response.bookings) {
        const bookings = response.bookings.map((booking: any) => ({
          id: booking.id,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          court: booking.court || { id: '', name: 'Cancha', sportType: '' },
          totalPrice: booking.totalAmount || 0
        }));
        setClientBookings(bookings);
      }
    } catch (error) {
      console.error('Error loading client bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!establishmentId) return;
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        await apiClient.deleteClient(establishmentId, clientId);
        setClients(clients.filter(c => c.id !== clientId));
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  const handleUpdateClient = async () => {
    if (!selectedClient || !establishmentId) return;
    
    setSaving(true);
    try {
      await apiClient.updateClient(establishmentId, selectedClient.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes
      });
      
      setClients(clients.map(c => 
        c.id === selectedClient.id 
          ? {
              ...c,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              notes: formData.notes
            }
          : c
      ));
      closeSidebar();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Error al actualizar el cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateClient = async () => {
    if (!establishmentId || !formData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    setSaving(true);
    try {
      const response = await apiClient.createClient(establishmentId, {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined
      }) as { success: boolean; data?: any };
      
      if (response.success && response.data) {
        const newClient = {
          ...response.data,
          status: 'active' as const,
          joinDate: response.data.createdAt?.split('T')[0],
          totalReservations: 0
        };
        setClients([newClient, ...clients]);
        closeSidebar();
      }
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error al crear el cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = async () => {
    if (!establishmentId) return;
    setIsExporting(true);
    try {
      await apiClient.exportClientsToCSV({
        establishmentId,
        hasDebt: statusFilter === 'blocked' ? true : undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
      });
    } catch (error) {
      console.error('Error exporting clients:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !establishmentId) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1); // Skip header
      
      let importedCount = 0;
      for (const line of lines) {
        if (!line.trim()) continue;
        const [name, email, phone] = line.split(',');
        if (!name?.trim()) continue;
        
        try {
          await apiClient.createClient(establishmentId, {
            name: name.trim(),
            email: email?.trim() || undefined,
            phone: phone?.trim() || undefined
          });
          importedCount++;
        } catch (error) {
          console.error('Error importing client:', name, error);
        }
      }

      alert(`${importedCount} clientes importados exitosamente`);
      loadClients(); // Reload clients from API
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Header controls to be rendered via portal
  const headerControls = (
    <div className="flex items-center w-full space-x-2 overflow-x-auto">
      {/* Search */}
      <div className="relative flex-shrink-0">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 w-36"
        />
      </div>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'blocked')}
        className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 flex-shrink-0"
      >
        <option value="all">Estados</option>
        <option value="active">Activos</option>
        <option value="inactive">Inactivos</option>
        <option value="blocked">Con deuda</option>
      </select>

      {/* Refresh Button */}
      <button 
        onClick={loadClients}
        className="flex items-center space-x-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex-shrink-0"
      >
        <RefreshCw className="h-4 w-4" />
        <span className="hidden sm:inline">Actualizar</span>
      </button>

      {/* Import CSV */}
      <label className="flex items-center space-x-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer flex-shrink-0">
        <Upload className="h-4 w-4" />
        <span className="hidden sm:inline">Importar</span>
        <input
          type="file"
          accept=".csv"
          onChange={handleImportCSV}
          className="hidden"
        />
      </label>

      {/* Export CSV */}
      <button 
        onClick={handleExportCSV}
        disabled={isExporting}
        className={`p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex-shrink-0 ${isExporting ? 'opacity-50' : ''}`}
        title="Exportar"
      >
        <Download className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
      </button>

      {/* New Client */}
      <button 
        onClick={openCreateSidebar}
        className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex-shrink-0"
      >
        <UserPlus className="h-4 w-4" />
        <span className="hidden sm:inline">Nuevo Cliente</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Render controls in header via portal */}
      {headerPortalContainer && createPortal(headerControls, headerPortalContainer)}
      
      <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-500/10 p-3 rounded-lg">
              <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-600 dark:text-emerald-400">{stats.active}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">activos</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Reservas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalReservations}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-500/10 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-600 dark:text-blue-400">{stats.total > 0 ? Math.round(stats.totalReservations / stats.total) : 0}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-1">promedio por cliente</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">De todos los clientes</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Gasto Promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(stats.avgSpent)}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-500/10 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Por cliente</span>
          </div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estado de Clientes</h3>
            <Activity className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Activos</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{stats.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Inactivos</span>
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">{stats.inactive}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Con deuda</span>
              <span className="text-red-600 dark:text-red-400 font-medium">{stats.blocked}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resumen de Reservas</h3>
            <Calendar className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="text-gray-900 dark:text-white font-medium">{stats.totalReservations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Completadas</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {clients.reduce((sum, c) => sum + (c.completedBookings || 0), 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">No asistió</span>
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                {clients.reduce((sum, c) => sum + (c.noShowBookings || 0), 0)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Reservas</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Completadas</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Pendientes</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Canceladas</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">No asistió</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Última Visita</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client, index) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-white">
                          {client.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{client.phone || client.email || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white font-medium">
                    {client.totalBookings || 0}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-emerald-400">
                    {client.completedBookings || 0}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-yellow-400">
                    {client.pendingBookings || 0}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                    {client.cancelledBookings || 0}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-orange-400">
                    {client.noShowBookings || 0}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {client.lastCompletedBookingDate 
                      ? new Date(client.lastCompletedBookingDate).toLocaleDateString('es-AR') 
                      : '-'}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => openClientSidebar(client, 'view')}
                        className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => openClientSidebar(client, 'history')}
                        className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 rounded transition-colors"
                        title="Ver historial de reservas"
                      >
                        <History className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => openClientSidebar(client, 'edit')}
                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                        title="Eliminar"
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

      {/* Client Sidebar */}
      {sidebarMode && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-800 border-l border-gray-700 shadow-xl overflow-y-auto z-[101]"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {sidebarMode === 'create' ? 'Nuevo Cliente' : 
                   sidebarMode === 'edit' ? 'Editar Cliente' : 
                   sidebarMode === 'history' ? 'Historial de Reservas' : 'Detalles del Cliente'}
                </h2>
                <button
                  onClick={closeSidebar}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* View Mode */}
              {sidebarMode === 'view' && selectedClient && (
                <div className="space-y-6">
                  {/* Client Avatar and Name */}
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {selectedClient.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedClient.name}</h3>
                      <p className="text-gray-400 text-sm">
                        Cliente desde {selectedClient.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString('es-AR') : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium text-gray-400 uppercase">Contacto</h4>
                    {selectedClient.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-white">{selectedClient.phone}</span>
                      </div>
                    )}
                    {selectedClient.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-white">{selectedClient.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Booking Stats */}
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-400 uppercase mb-3">Estadísticas de Reservas</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-xl font-bold text-white">{selectedClient.totalBookings || 0}</p>
                        <p className="text-gray-400 text-xs">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-emerald-400">{selectedClient.completedBookings || 0}</p>
                        <p className="text-gray-400 text-xs">Completadas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-yellow-400">{selectedClient.pendingBookings || 0}</p>
                        <p className="text-gray-400 text-xs">Pendientes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-400">{selectedClient.cancelledBookings || 0}</p>
                        <p className="text-gray-400 text-xs">Canceladas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-orange-400">{selectedClient.noShowBookings || 0}</p>
                        <p className="text-gray-400 text-xs">No asistió</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-blue-400">{formatCurrency(Number(selectedClient.totalSpent) || 0)}</p>
                        <p className="text-gray-400 text-xs">Gastado</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-600 flex justify-between text-sm">
                      <span className="text-gray-400">Última visita completada</span>
                      <span className="text-white">
                        {selectedClient.lastCompletedBookingDate 
                          ? new Date(selectedClient.lastCompletedBookingDate).toLocaleDateString('es-AR')
                          : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Status & Debt */}
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Estado</span>
                      {(() => {
                        const status = selectedClient.hasDebt ? 'blocked' : (selectedClient.isActive ? 'active' : 'inactive');
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            <span className="ml-1">
                              {status === 'active' ? 'Activo' : status === 'inactive' ? 'Inactivo' : 'Con deuda'}
                            </span>
                          </span>
                        );
                      })()}
                    </div>
                    {selectedClient.hasDebt && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-sm">Deuda pendiente</span>
                        <span className="text-red-400 font-medium">{formatCurrency(Number(selectedClient.debtAmount) || 0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {selectedClient.notes && (
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 uppercase mb-2">Notas</h4>
                      <p className="text-gray-300 text-sm">{selectedClient.notes}</p>
                    </div>
                  )}

                  {/* Booking History */}
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-400 uppercase mb-3 flex items-center">
                      <History className="h-4 w-4 mr-2" />
                      Historial de Reservas
                    </h4>
                    {loadingBookings ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : clientBookings.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">No hay reservas registradas</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {clientBookings.map((booking) => (
                          <div 
                            key={booking.id} 
                            className="bg-gray-800 rounded-lg p-3 border border-gray-600"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-3 w-3 text-gray-400" />
                                  <span className="text-white text-sm font-medium">
                                    {booking.court?.name || 'Cancha'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-400 text-xs">
                                    {new Date(booking.date).toLocaleDateString('es-AR')}
                                  </span>
                                  <Clock className="h-3 w-3 text-gray-400 ml-2" />
                                  <span className="text-gray-400 text-xs">
                                    {booking.startTime?.substring(0, 5)}
                                  </span>
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                booking.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' :
                                booking.status === 'confirmed' ? 'bg-blue-400/10 text-blue-400' :
                                booking.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                                booking.status === 'cancelled' ? 'bg-gray-400/10 text-gray-400' :
                                booking.status === 'no_show' ? 'bg-orange-400/10 text-orange-400' :
                                'bg-gray-400/10 text-gray-400'
                              }`}>
                                {booking.status === 'completed' ? 'Completada' :
                                 booking.status === 'confirmed' ? 'Confirmada' :
                                 booking.status === 'pending' ? 'Pendiente' :
                                 booking.status === 'cancelled' ? 'Cancelada' :
                                 booking.status === 'no_show' ? 'No asistió' :
                                 booking.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 pt-4">
                    <button
                      onClick={() => setSidebarMode('history')}
                      className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <History className="h-4 w-4" />
                      <span>Ver Historial Completo</span>
                    </button>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setFormData({
                            name: selectedClient.name,
                            email: selectedClient.email || '',
                            phone: selectedClient.phone || '',
                            notes: selectedClient.notes || ''
                          });
                          setSidebarMode('edit');
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteClient(selectedClient.id);
                          closeSidebar();
                        }}
                        className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* History Mode */}
              {sidebarMode === 'history' && selectedClient && (
                <div className="space-y-6">
                  {/* Client Info Header */}
                  <div className="flex items-center space-x-4 pb-4 border-b border-gray-700">
                    <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {selectedClient.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedClient.name}</h3>
                      <p className="text-gray-400 text-sm">{selectedClient.phone || selectedClient.email || '-'}</p>
                    </div>
                  </div>

                  {/* Booking Stats Summary */}
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="bg-gray-700/50 rounded-lg p-2">
                      <p className="text-lg font-bold text-white">{selectedClient.totalBookings || 0}</p>
                      <p className="text-gray-400 text-xs">Total</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-2">
                      <p className="text-lg font-bold text-emerald-400">{selectedClient.completedBookings || 0}</p>
                      <p className="text-gray-400 text-xs">Completadas</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-2">
                      <p className="text-lg font-bold text-yellow-400">{selectedClient.pendingBookings || 0}</p>
                      <p className="text-gray-400 text-xs">Pendientes</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-2">
                      <p className="text-lg font-bold text-gray-400">{selectedClient.cancelledBookings || 0}</p>
                      <p className="text-gray-400 text-xs">Canceladas</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-2">
                      <p className="text-lg font-bold text-orange-400">{selectedClient.noShowBookings || 0}</p>
                      <p className="text-gray-400 text-xs">No asistió</p>
                    </div>
                  </div>

                  {/* Booking History List */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 uppercase mb-3">
                      Todas las Reservas ({clientBookings.length})
                    </h4>
                    {loadingBookings ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : clientBookings.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="mx-auto h-12 w-12 text-gray-500" />
                        <p className="text-gray-400 mt-2">No hay reservas registradas</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                        {clientBookings.map((booking) => (
                          <div 
                            key={booking.id} 
                            className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-emerald-400" />
                                <span className="text-white font-medium">
                                  {booking.court?.name || 'Cancha'}
                                </span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                booking.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' :
                                booking.status === 'confirmed' ? 'bg-blue-400/10 text-blue-400' :
                                booking.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                                booking.status === 'cancelled' ? 'bg-gray-400/10 text-gray-400' :
                                booking.status === 'no_show' ? 'bg-orange-400/10 text-orange-400' :
                                'bg-gray-400/10 text-gray-400'
                              }`}>
                                {booking.status === 'completed' ? 'Completada' :
                                 booking.status === 'confirmed' ? 'Confirmada' :
                                 booking.status === 'pending' ? 'Pendiente' :
                                 booking.status === 'cancelled' ? 'Cancelada' :
                                 booking.status === 'no_show' ? 'No asistió' :
                                 booking.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(booking.date).toLocaleDateString('es-AR')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{booking.startTime?.substring(0, 5)} - {booking.endTime?.substring(0, 5)}</span>
                              </div>
                            </div>
                            {booking.totalPrice > 0 && (
                              <div className="mt-2 text-sm text-emerald-400 font-medium">
                                {formatCurrency(booking.totalPrice)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => setSidebarMode('view')}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver Detalles</span>
                    </button>
                    <button
                      onClick={() => {
                        setFormData({
                          name: selectedClient.name,
                          email: selectedClient.email || '',
                          phone: selectedClient.phone || '',
                          notes: selectedClient.notes || ''
                        });
                        setSidebarMode('edit');
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Create/Edit Mode */}
              {(sidebarMode === 'create' || sidebarMode === 'edit') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre Completo *
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

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={closeSidebar}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={sidebarMode === 'create' ? handleCreateClient : handleUpdateClient}
                      disabled={!formData.name.trim() || saving}
                      className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>{sidebarMode === 'create' ? 'Crear' : 'Guardar'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </>
  );
};

export default ClientsPage;
