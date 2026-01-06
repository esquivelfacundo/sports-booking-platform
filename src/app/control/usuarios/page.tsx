'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Edit2, Trash2, Shield, Search, X, Building2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'player' | 'establishment' | 'admin';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'establishment' | 'admin'>('player');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'admin' as 'player' | 'establishment' | 'admin',
    isActive: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [activeTab, searchTerm, pagination.page]);

  const fetchCurrentUser = async () => {
    try {
      const userData = localStorage.getItem('superadmin_data');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superadmin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      
      const params = new URLSearchParams({
        userType: activeTab,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${apiUrl}/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching users');

      const result = await response.json();
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('superadmin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error creating user');

      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear usuario');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('superadmin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        isActive: formData.isActive
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`${apiUrl}/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Error updating user');

      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      fetchUsers();
      
      if (selectedUser.id === currentUser?.id) {
        fetchCurrentUser();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const token = localStorage.getItem('superadmin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

      const response = await fetch(`${apiUrl}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error deleting user');

      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar usuario');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      userType: user.userType,
      isActive: user.isActive
    });
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setFormData(prev => ({ ...prev, userType: activeTab }));
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      userType: 'admin',
      isActive: true
    });
  };

  // Topbar content via portal
  const topbarContent = mounted && document.getElementById('header-page-controls') ? createPortal(
    <div className="flex items-center gap-4 flex-1">
      {/* Title */}
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">Usuarios</h1>
      
      {/* Tabs in topbar */}
      <div className="hidden md:flex items-center gap-1 ml-4">
        <button
          onClick={() => setActiveTab('player')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'player'
              ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Jugadores
        </button>
        <button
          onClick={() => setActiveTab('establishment')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'establishment'
              ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Establecimientos
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'admin'
              ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          Administradores
        </button>
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
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Create button in topbar */}
      {(activeTab === 'admin' || activeTab === 'establishment') && (
        <button
          onClick={openCreateModal}
          className="hidden sm:flex px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors items-center gap-1.5 text-sm font-medium"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden xl:inline">{activeTab === 'admin' ? 'Crear Admin' : 'Crear Est.'}</span>
        </button>
      )}
    </div>,
    document.getElementById('header-page-controls')!
  ) : null;

  return (
    <>
      {topbarContent}
      <div className="p-6">
        {/* Mobile tabs and search */}
        <div className="md:hidden mb-4 space-y-3">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('player')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'player'
                  ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Jugadores
            </button>
            <button
              onClick={() => setActiveTab('establishment')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'establishment'
                  ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Est.
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'admin'
                  ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Admins
            </button>
          </div>
          <div className="flex gap-2">
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
            {(activeTab === 'admin' || activeTab === 'establishment') && (
              <button
                onClick={openCreateModal}
                className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Último acceso</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold">
                            {user.firstName?.[0] || '?'}{user.lastName?.[0] || '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                              {user.id === currentUser?.id && (
                                <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">(Tú)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{user.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400'
                        }`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Nunca'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 mr-4"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {formData.userType === 'admin' ? 'Crear Administrador' : 'Crear Establecimiento'}
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500 bg-white dark:bg-gray-700"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">Usuario activo</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Editar {selectedUser.id === currentUser?.id ? 'Mi Perfil' : 'Usuario'}
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva Contraseña (dejar vacío para no cambiar)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              {selectedUser.id !== currentUser?.id && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActiveEdit"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-orange-600 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500 bg-white dark:bg-gray-700"
                  />
                  <label htmlFor="isActiveEdit" className="text-sm text-gray-700 dark:text-gray-300">Usuario activo</label>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
