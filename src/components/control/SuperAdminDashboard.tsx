'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  LogOut, 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Activity,
  Ban,
  UserX,
  AlertTriangle
} from 'lucide-react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { superAdminApi, EstablishmentData, UserData } from '@/services/superAdminApi';


const SuperAdminDashboard = () => {
  const { superAdmin, logout } = useSuperAdmin();
  const [activeTab, setActiveTab] = useState('overview');
  const [establishments, setEstablishments] = useState<EstablishmentData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState<{type: 'establishment' | 'user', id: string, name: string} | null>(null);

  // Load real data from APIs
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [establishmentsData, usersData] = await Promise.all([
        superAdminApi.getAllEstablishments(),
        superAdminApi.getAllUsers()
      ]);
      
      setEstablishments(establishmentsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEstablishment = async (id: string) => {
    try {
      const success = await superAdminApi.approveEstablishment(id);
      if (success) {
        setEstablishments(prev => 
          prev.map(est => est.id === id ? { ...est, registrationStatus: 'approved' as const, isActive: true } : est)
        );
      } else {
        setError('Error al aprobar el establecimiento');
      }
    } catch (err) {
      setError('Error al aprobar el establecimiento');
    }
  };

  const handleRejectEstablishment = async (id: string) => {
    try {
      const success = await superAdminApi.rejectEstablishment(id);
      if (success) {
        setEstablishments(prev => 
          prev.map(est => est.id === id ? { ...est, registrationStatus: 'rejected' as const, isActive: false } : est)
        );
      } else {
        setError('Error al rechazar el establecimiento');
      }
    } catch (err) {
      setError('Error al rechazar el establecimiento');
    }
  };

  const handleDeleteEstablishment = async (id: string) => {
    try {
      setLoading(true);
      const success = await superAdminApi.deleteEstablishment(id);
      if (success) {
        setEstablishments(prev => prev.filter(est => est.id !== id));
        setShowDeleteModal(null);
        setError(null);
      } else {
        setError('Error al eliminar el establecimiento');
      }
    } catch (err) {
      console.error('Delete establishment error:', err);
      setError('Error al eliminar el establecimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (id: string) => {
    try {
      const success = await superAdminApi.suspendUser(id);
      if (success) {
        setUsers(prev => 
          prev.map(user => user.id === id ? { ...user, isActive: false } : user)
        );
      } else {
        setError('Error al suspender el usuario');
      }
    } catch (err) {
      setError('Error al suspender el usuario');
    }
  };

  const handleActivateUser = async (id: string) => {
    try {
      const success = await superAdminApi.activateUser(id);
      if (success) {
        setUsers(prev => 
          prev.map(user => user.id === id ? { ...user, isActive: true } : user)
        );
      } else {
        setError('Error al activar el usuario');
      }
    } catch (err) {
      setError('Error al activar el usuario');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const success = await superAdminApi.deleteUser(id);
      if (success) {
        setUsers(prev => prev.filter(user => user.id !== id));
        setShowDeleteModal(null);
      } else {
        setError('Error al eliminar el usuario');
      }
    } catch (err) {
      setError('Error al eliminar el usuario');
    }
  };

  const filteredEstablishments = establishments.filter(est => {
    const matchesSearch = (est.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (est.city?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || est.registrationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalEstablishments: establishments.length,
    approvedEstablishments: establishments.filter(e => e.registrationStatus === 'approved').length,
    pendingEstablishments: establishments.filter(e => e.registrationStatus === 'pending').length,
    totalUsers: users.length,
    totalReservations: 0, // Will be calculated from real booking data
    totalRevenue: 0 // Will be calculated from real payment data
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Panel de Control</h1>
                <p className="text-sm text-gray-400">Super Administrador</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Hola, {superAdmin?.name}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-300" />
                <span className="text-sm text-gray-300">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Resumen', icon: Activity },
              { id: 'establishments', label: 'Establecimientos', icon: Building2 },
              { id: 'users', label: 'Usuarios', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Cargando datos...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                setError(null);
                loadData();
              }}
              className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Establecimientos</p>
                    <p className="text-2xl font-bold text-white">{stats.totalEstablishments}</p>
                    <p className="text-xs text-emerald-400">{stats.approvedEstablishments} aprobados</p>
                  </div>
                  <Building2 className="w-8 h-8 text-emerald-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Usuarios</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                    <p className="text-xs text-cyan-400">Jugadores registrados</p>
                  </div>
                  <Users className="w-8 h-8 text-cyan-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Reservas</p>
                    <p className="text-2xl font-bold text-white">{stats.totalReservations}</p>
                    <p className="text-xs text-yellow-400">Total realizadas</p>
                  </div>
                  <Calendar className="w-8 h-8 text-yellow-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Facturación</p>
                    <p className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-purple-400">Total generada</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-400" />
                </div>
              </motion.div>
            </div>

            {/* Pending Approvals */}
            {stats.pendingEstablishments > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Establecimientos Pendientes de Aprobación</h3>
                <div className="space-y-3">
                  {establishments.filter(e => e.status === 'pending').map((est) => (
                    <div key={est.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{est.name}</p>
                        <p className="text-sm text-gray-400">{est.city} • {est.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveEstablishment(est.id)}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm transition-colors"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRejectEstablishment(est.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'establishments' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar establecimientos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Todos los estados</option>
                <option value="approved">Aprobados</option>
                <option value="pending">Pendientes</option>
                <option value="rejected">Rechazados</option>
              </select>
            </div>

            {/* Establishments Table */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Establecimiento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Reseñas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Fecha Registro
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredEstablishments.map((establishment) => (
                      <tr key={establishment.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{establishment.name}</div>
                            <div className="text-sm text-gray-400">{establishment.city} • {establishment.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            establishment.registrationStatus === 'approved' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : establishment.registrationStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {establishment.registrationStatus === 'approved' ? 'Aprobado' : 
                             establishment.registrationStatus === 'pending' ? 'Pendiente' : 'Rechazado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {establishment.reviewCount || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {establishment.rating || 0}/5
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(establishment.createdAt).toLocaleDateString('es-AR')}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {establishment.registrationStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveEstablishment(establishment.id)}
                                  className="text-emerald-400 hover:text-emerald-300"
                                  title="Aprobar"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectEstablishment(establishment.id)}
                                  className="text-red-400 hover:text-red-300"
                                  title="Rechazar"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button className="text-gray-400 hover:text-white" title="Ver detalles">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteModal({type: 'establishment', id: establishment.id, name: establishment.name})}
                              className="text-red-400 hover:text-red-300"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Users Table */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Ciudad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Fecha Registro
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {user.role || 'Jugador'}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {user.city || 'No especificada'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('es-AR')}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-gray-400 hover:text-white" title="Ver detalles">
                              <Eye className="w-4 h-4" />
                            </button>
                            {user.isActive ? (
                              <button
                                onClick={() => handleSuspendUser(user.id)}
                                className="text-yellow-400 hover:text-yellow-300"
                                title="Suspender usuario"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateUser(user.id)}
                                className="text-emerald-400 hover:text-emerald-300"
                                title="Activar usuario"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setShowDeleteModal({type: 'user', id: user.id, name: user.name})}
                              className="text-red-400 hover:text-red-300"
                              title="Eliminar usuario"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Confirmar eliminación
                </h3>
                <p className="text-sm text-gray-400">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que quieres eliminar {showDeleteModal.type === 'establishment' ? 'el establecimiento' : 'el usuario'}{' '}
              <span className="font-semibold text-white">{showDeleteModal.name}</span>?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (showDeleteModal.type === 'establishment') {
                    handleDeleteEstablishment(showDeleteModal.id);
                  } else {
                    handleDeleteUser(showDeleteModal.id);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
