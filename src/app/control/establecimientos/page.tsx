'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Building2, Search, CheckCircle, XCircle, Eye, Edit2, Trash2, Plus, CreditCard } from 'lucide-react';
import { superAdminApi, EstablishmentData } from '@/services/superAdminApi';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

export default function EstablecimientosPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [establishments, setEstablishments] = useState<EstablishmentData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
    </>
  );
}
