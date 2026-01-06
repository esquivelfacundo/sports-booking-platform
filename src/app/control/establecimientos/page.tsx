'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Search, CheckCircle, XCircle, Eye, Edit2, Trash2, Plus, CreditCard, X, Phone, Mail, MapPin, Calendar, Users, Activity } from 'lucide-react';
import { superAdminApi, EstablishmentData } from '@/services/superAdminApi';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

interface CreateEstablishmentForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  accessEmail: string;
  accessPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

const initialFormData: CreateEstablishmentForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  accessEmail: '',
  accessPassword: '',
  adminFirstName: '',
  adminLastName: ''
};

export default function EstablecimientosPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [establishments, setEstablishments] = useState<EstablishmentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sidebarMode, setSidebarMode] = useState<'view' | 'edit' | 'create' | null>(null);
  const [selectedEstablishment, setSelectedEstablishment] = useState<EstablishmentData | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateEstablishmentForm>(initialFormData);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    isActive: true,
    registrationStatus: 'approved' as string
  });

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getAllEstablishments();
      setEstablishments(data);
    } catch (error) {
      console.error('Error loading establishments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const success = await superAdminApi.approveEstablishment(id);
    if (success) {
      setEstablishments(prev => prev.map(e => 
        e.id === id ? { ...e, registrationStatus: 'approved' } : e
      ));
    }
  };

  const handleReject = async (id: string) => {
    const success = await superAdminApi.rejectEstablishment(id);
    if (success) {
      setEstablishments(prev => prev.map(e => 
        e.id === id ? { ...e, registrationStatus: 'rejected' } : e
      ));
    }
  };

  const openSidebar = (mode: 'view' | 'edit' | 'create', est?: EstablishmentData) => {
    if (est) {
      setSelectedEstablishment(est);
      setEditFormData({
        name: est.name || '',
        email: est.email || '',
        phone: est.phone || '',
        address: est.address || '',
        city: est.city || '',
        isActive: est.isActive !== false,
        registrationStatus: est.registrationStatus || 'approved'
      });
    } else {
      setFormData(initialFormData);
    }
    setSidebarMode(mode);
  };

  const closeSidebar = () => {
    setSidebarMode(null);
    setSelectedEstablishment(null);
  };

  const handleUpdateEstablishment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEstablishment) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('superAdminToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

      const response = await fetch(`${apiUrl}/api/admin/establishments/${selectedEstablishment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error updating establishment');
      }

      closeSidebar();
      loadData();
      alert('Establecimiento actualizado exitosamente');
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al actualizar establecimiento');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEstablishment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('superAdminToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

      const response = await fetch(`${apiUrl}/api/establishments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error creating establishment');
      }

      closeSidebar();
      setFormData(initialFormData);
      loadData();
      alert('Establecimiento creado exitosamente');
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al crear establecimiento');
    } finally {
      setSaving(false);
    }
  };

  const filteredEstablishments = establishments.filter(est => {
    const matchesSearch = (est.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (est.city?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || est.registrationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Topbar content via portal
  const topbarContent = mounted && document.getElementById('header-page-controls') ? createPortal(
    <div className="flex items-center gap-4 flex-1">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">Establecimientos</h1>
      
      {/* Filters in topbar */}
      <div className="hidden md:flex items-center gap-2 ml-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Todos</option>
          <option value="approved">Aprobados</option>
          <option value="pending">Pendientes</option>
          <option value="rejected">Rechazados</option>
        </select>
      </div>

      {/* Search in topbar */}
      <div className="hidden lg:flex flex-1 max-w-xs ml-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Create button */}
      <button
        onClick={() => openSidebar('create')}
        className="hidden sm:flex px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors items-center gap-1.5 text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden xl:inline">Crear</span>
      </button>
    </div>,
    document.getElementById('header-page-controls')!
  ) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <UnifiedLoader size="lg" />
      </div>
    );
  }

  return (
    <>
      {topbarContent}
      <div className="p-6">
        {/* Mobile filters */}
        <div className="md:hidden mb-4 flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Todos</option>
            <option value="approved">Aprobados</option>
            <option value="pending">Pendientes</option>
            <option value="rejected">Rechazados</option>
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{establishments.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Aprobados</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{establishments.filter(e => e.registrationStatus === 'approved').length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{establishments.filter(e => e.registrationStatus === 'pending').length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Rechazados</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{establishments.filter(e => e.registrationStatus === 'rejected').length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Establecimiento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Canchas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Reservas</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEstablishments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No se encontraron establecimientos
                    </td>
                  </tr>
                ) : (
                  filteredEstablishments.map((est) => (
                    <tr key={est.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-white">{est.name}</p>
                              {est.mpConnected && (
                                <span className="w-5 h-5 rounded bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center" title="MP Conectado">
                                  <CreditCard className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{est.city} • {est.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          est.registrationStatus === 'approved' 
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400' 
                            : est.registrationStatus === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400'
                        }`}>
                          {est.registrationStatus === 'approved' ? 'Aprobado' : est.registrationStatus === 'pending' ? 'Pendiente' : 'Rechazado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200 hidden md:table-cell">
                        {est.courtsCount || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200 hidden lg:table-cell">
                        {est.totalBookings || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {est.registrationStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(est.id)}
                                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg transition-colors"
                                title="Aprobar"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(est.id)}
                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Rechazar"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openSidebar('edit', est)}
                            className="p-1.5 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openSidebar('view', est)}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarMode && (
          <div className="fixed inset-0 z-[100] flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeSidebar}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl overflow-y-auto z-[101]"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {sidebarMode === 'create' ? 'Nuevo Establecimiento' :
                     sidebarMode === 'edit' ? 'Editar Establecimiento' : 'Detalles del Establecimiento'}
                  </h2>
                  <button
                    onClick={closeSidebar}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* View Mode */}
                {sidebarMode === 'view' && selectedEstablishment && (
                  <div className="space-y-6">
                    {/* Avatar and Name */}
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-600 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-orange-600 dark:text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedEstablishment.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedEstablishment.city}</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Contacto</h4>
                      {selectedEstablishment.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{selectedEstablishment.phone}</span>
                        </div>
                      )}
                      {selectedEstablishment.email && (
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{selectedEstablishment.email}</span>
                        </div>
                      )}
                      {selectedEstablishment.address && (
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{selectedEstablishment.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">Estadísticas</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedEstablishment.courtsCount || 0}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Canchas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedEstablishment.totalBookings || 0}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Reservas</p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Estado de Registro</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedEstablishment.registrationStatus === 'approved'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                            : selectedEstablishment.registrationStatus === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400'
                        }`}>
                          {selectedEstablishment.registrationStatus === 'approved' ? 'Aprobado' :
                           selectedEstablishment.registrationStatus === 'pending' ? 'Pendiente' : 'Rechazado'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Mercado Pago</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedEstablishment.mpConnected
                            ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-400'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                        }`}>
                          {selectedEstablishment.mpConnected ? 'Conectado' : 'No conectado'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setSidebarMode('edit')}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                )}

                {/* Edit Mode */}
                {sidebarMode === 'edit' && selectedEstablishment && (
                  <form onSubmit={handleUpdateEstablishment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                      <input
                        type="text"
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciudad</label>
                      <input
                        type="text"
                        required
                        value={editFormData.city}
                        onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                      <select
                        value={editFormData.registrationStatus}
                        onChange={(e) => setEditFormData({ ...editFormData, registrationStatus: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="approved">Aprobado</option>
                        <option value="pending">Pendiente</option>
                        <option value="rejected">Rechazado</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editFormData.isActive}
                          onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Establecimiento activo</span>
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={closeSidebar}
                        className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Create Mode */}
                {sidebarMode === 'create' && (
                  <form onSubmit={handleCreateEstablishment} className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Información</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          placeholder="Nombre del establecimiento"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          placeholder="contacto@ejemplo.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          placeholder="+54 9 11 1234-5678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          placeholder="Av. Corrientes 1234"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciudad *</label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          placeholder="Buenos Aires"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Credenciales de Acceso</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                          <input
                            type="text"
                            required
                            value={formData.adminFirstName}
                            onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                            placeholder="Juan"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido *</label>
                          <input
                            type="text"
                            required
                            value={formData.adminLastName}
                            onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                            placeholder="Pérez"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email de Acceso *</label>
                        <input
                          type="email"
                          required
                          value={formData.accessEmail}
                          onChange={(e) => setFormData({ ...formData, accessEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          placeholder="admin@ejemplo.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña *</label>
                        <input
                          type="password"
                          required
                          value={formData.accessPassword}
                          onChange={(e) => setFormData({ ...formData, accessPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={closeSidebar}
                        className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Creando...' : 'Crear'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
