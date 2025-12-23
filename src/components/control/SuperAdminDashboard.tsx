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
  AlertTriangle,
  Settings,
  CreditCard,
  Percent,
  Check,
  Link2
} from 'lucide-react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { superAdminApi, EstablishmentData, UserData } from '@/services/superAdminApi';


// Compact fee editor for table cells
const EstablishmentFeeEditor = ({ 
  establishment, 
  defaultFee, 
  onUpdate 
}: { 
  establishment: EstablishmentData; 
  defaultFee: number; 
  onUpdate: (id: string, fee: number | null) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newFee, setNewFee] = useState<string>(
    establishment.customFeePercent !== null && establishment.customFeePercent !== undefined 
      ? String(establishment.customFeePercent) 
      : ''
  );
  const [saving, setSaving] = useState(false);

  const currentFee = establishment.effectiveFeePercent !== null && establishment.effectiveFeePercent !== undefined 
    ? establishment.effectiveFeePercent 
    : defaultFee;
  const isCustom = establishment.customFeePercent !== null && establishment.customFeePercent !== undefined;

  const handleSave = async () => {
    setSaving(true);
    try {
      const feeValue = newFee === '' ? null : parseFloat(newFee);
      const success = await superAdminApi.updateEstablishmentFee(establishment.id, feeValue);
      if (success) {
        onUpdate(establishment.id, feeValue);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error saving fee:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const success = await superAdminApi.updateEstablishmentFee(establishment.id, null);
      if (success) {
        onUpdate(establishment.id, null);
        setNewFee('');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error resetting fee:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex flex-col items-center gap-0.5 hover:bg-gray-700/50 px-2 py-1 rounded transition-colors w-full"
        title="Clic para editar"
      >
        <span className={`text-sm font-medium ${isCustom ? 'text-amber-400' : 'text-white'}`}>
          {currentFee}%
        </span>
        {isCustom && <span className="text-[10px] text-amber-400/70">personalizada</span>}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={newFee}
          onChange={(e) => setNewFee(e.target.value)}
          placeholder={String(defaultFee)}
          className="w-14 px-1.5 py-0.5 bg-gray-600 border border-gray-500 rounded text-white text-xs text-center focus:ring-1 focus:ring-emerald-500"
          autoFocus
        />
        <span className="text-gray-400 text-xs">%</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] transition-colors"
          title="Guardar"
        >
          {saving ? '...' : '✓'}
        </button>
        {isCustom && (
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-1.5 py-0.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-[10px] transition-colors"
            title="Usar defecto"
          >
            ↺
          </button>
        )}
        <button
          onClick={() => {
            setIsEditing(false);
            setNewFee(isCustom ? String(establishment.customFeePercent) : '');
          }}
          className="px-1.5 py-0.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-[10px] transition-colors"
          title="Cancelar"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Sub-component for establishment fee editor (compact inline version)
const EstablishmentFeeRow = ({ 
  establishment, 
  defaultFee, 
  onUpdate 
}: { 
  establishment: EstablishmentData; 
  defaultFee: number; 
  onUpdate: (id: string, fee: number | null) => void;
}) => {
  const [newFee, setNewFee] = useState<string>(
    establishment.customFeePercent !== null && establishment.customFeePercent !== undefined 
      ? String(establishment.customFeePercent) 
      : ''
  );
  const [saving, setSaving] = useState(false);
  const [useDefault, setUseDefault] = useState(establishment.customFeePercent === null || establishment.customFeePercent === undefined);

  const handleSave = async () => {
    setSaving(true);
    try {
      const feeValue = useDefault ? null : parseFloat(newFee);
      const success = await superAdminApi.updateEstablishmentFee(establishment.id, feeValue);
      if (success) {
        onUpdate(establishment.id, feeValue);
      }
    } catch (err) {
      console.error('Error saving fee:', err);
    } finally {
      setSaving(false);
    }
  };

  const currentFee = establishment.customFeePercent !== null && establishment.customFeePercent !== undefined
    ? establishment.customFeePercent
    : defaultFee;

  const hasChanges = useDefault 
    ? (establishment.customFeePercent !== null && establishment.customFeePercent !== undefined)
    : (newFee !== '' && parseFloat(newFee) !== establishment.customFeePercent);

  return (
    <div className="flex flex-col gap-2">
      {/* Current fee display */}
      <div className="flex items-center gap-2">
        <span className={`text-lg font-semibold ${establishment.customFeePercent !== null && establishment.customFeePercent !== undefined ? 'text-amber-400' : 'text-white'}`}>
          {currentFee}%
        </span>
        {establishment.customFeePercent !== null && establishment.customFeePercent !== undefined ? (
          <span className="text-xs text-amber-400/70">personalizada</span>
        ) : (
          <span className="text-xs text-gray-500">defecto</span>
        )}
      </div>
      
      {/* Edit controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={useDefault}
            onChange={(e) => {
              setUseDefault(e.target.checked);
              if (e.target.checked) setNewFee('');
            }}
            className="w-3 h-3 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
          />
          Defecto
        </label>
        {!useDefault && (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              placeholder={String(defaultFee)}
              className="w-14 px-1.5 py-0.5 bg-gray-600 border border-gray-500 rounded text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
            />
            <span className="text-gray-400 text-xs">%</span>
          </div>
        )}
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors flex items-center gap-1"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-2 w-2 border-b border-white"></div>
            ) : (
              <Check className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

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
  const [selectedEstablishment, setSelectedEstablishment] = useState<EstablishmentData | null>(null);
  
  // Platform config state
  const [platformConfig, setPlatformConfig] = useState<{
    defaultFeePercent: number;
    mpConnected: boolean;
    mpUserId?: string;
    mpEmail?: string;
    mpConnectedAt?: string;
    loading: boolean;
    saving: boolean;
  }>({
    defaultFeePercent: 10,
    mpConnected: false,
    loading: true,
    saving: false
  });
  const [mpConnecting, setMpConnecting] = useState(false);
  
  // Platform stats state
  const [platformStats, setPlatformStats] = useState<{
    establishments: { total: number; approved: number; pending: number; rejected: number };
    users: { total: number; active: number; players: number; establishments: number };
    bookings: { total: number; confirmed: number; completed: number; cancelled: number };
    payments: { total: number; completed: number; totalRevenue: number };
    courts: { total: number };
    reviews: { total: number };
  } | null>(null);

  // Load real data from APIs
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [establishmentsData, usersData, statsData] = await Promise.all([
        superAdminApi.getAllEstablishments(),
        superAdminApi.getAllUsers(),
        superAdminApi.getPlatformStats()
      ]);
      
      setEstablishments(establishmentsData);
      setUsers(usersData);
      if (statsData?.data) {
        setPlatformStats(statsData.data);
      }
      
      // Load platform config
      await loadPlatformConfig();
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const loadPlatformConfig = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/mp/platform/config`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('superAdminToken')}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setPlatformConfig({
          defaultFeePercent: data.config.defaultFeePercent,
          mpConnected: data.config.mpConnected,
          mpUserId: data.config.mpUserId,
          mpEmail: data.config.mpEmail,
          mpConnectedAt: data.config.mpConnectedAt,
          loading: false,
          saving: false
        });
      }
    } catch (error) {
      console.error('Error loading platform config:', error);
      setPlatformConfig(prev => ({ ...prev, loading: false }));
    }
  };

  const handleUpdateFeePercent = async (newFee: number) => {
    setPlatformConfig(prev => ({ ...prev, saving: true }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/mp/platform/config`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('superAdminToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ defaultFeePercent: newFee })
        }
      );
      
      if (response.ok) {
        setPlatformConfig(prev => ({ ...prev, defaultFeePercent: newFee, saving: false }));
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating fee:', error);
      setError('Error al actualizar la comisión');
      setPlatformConfig(prev => ({ ...prev, saving: false }));
    }
  };

  const handleConnectPlatformMP = async () => {
    setMpConnecting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/mp/oauth/authorize?type=platform&redirectUrl=${encodeURIComponent(window.location.href)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('superAdminToken')}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Error connecting MP:', error);
      setError('Error al conectar con Mercado Pago');
      setMpConnecting(false);
    }
  };

  const handleDisconnectPlatformMP = async () => {
    if (!confirm('¿Estás seguro de desconectar la cuenta de comisiones? Los pagos split no funcionarán.')) {
      return;
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/mp/platform/disconnect`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('superAdminToken')}`
          }
        }
      );
      
      if (response.ok) {
        setPlatformConfig(prev => ({ 
          ...prev, 
          mpConnected: false, 
          mpUserId: undefined, 
          mpEmail: undefined,
          mpConnectedAt: undefined 
        }));
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting MP:', error);
      setError('Error al desconectar Mercado Pago');
    }
  };

  // Check for OAuth callback on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mpStatus = params.get('mp_status');
      const mpUserId = params.get('mp_user_id');
      const mpError = params.get('mp_error');

      if (mpStatus === 'success' && mpUserId) {
        setPlatformConfig(prev => ({
          ...prev,
          mpConnected: true,
          mpUserId,
          loading: false
        }));
        window.history.replaceState({}, '', window.location.pathname);
        setActiveTab('settings');
      } else if (mpStatus === 'error') {
        setError(`Error al conectar Mercado Pago: ${mpError || 'Error desconocido'}`);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const handleChangeEstablishmentStatus = async (id: string, newStatus: 'approved' | 'pending' | 'rejected') => {
    try {
      const success = await superAdminApi.updateEstablishmentStatus(id, newStatus);
      
      if (success) {
        setEstablishments(prev => 
          prev.map(est => est.id === id ? { 
            ...est, 
            registrationStatus: newStatus, 
            isActive: newStatus === 'approved' 
          } : est)
        );
      } else {
        setError('Error al cambiar el estado del establecimiento');
      }
    } catch (err) {
      setError('Error al cambiar el estado del establecimiento');
    }
  };

  const handleApproveEstablishment = async (id: string) => {
    await handleChangeEstablishmentStatus(id, 'approved');
  };

  const handleRejectEstablishment = async (id: string) => {
    await handleChangeEstablishmentStatus(id, 'rejected');
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
    totalEstablishments: platformStats?.establishments?.total || establishments.length,
    approvedEstablishments: platformStats?.establishments?.approved || establishments.filter(e => e.registrationStatus === 'approved').length,
    pendingEstablishments: platformStats?.establishments?.pending || establishments.filter(e => e.registrationStatus === 'pending').length,
    rejectedEstablishments: platformStats?.establishments?.rejected || 0,
    totalUsers: platformStats?.users?.total || users.length,
    activeUsers: platformStats?.users?.active || 0,
    totalReservations: platformStats?.bookings?.total || 0,
    confirmedBookings: platformStats?.bookings?.confirmed || 0,
    completedBookings: platformStats?.bookings?.completed || 0,
    cancelledBookings: platformStats?.bookings?.cancelled || 0,
    totalRevenue: platformStats?.payments?.totalRevenue || 0,
    totalCourts: platformStats?.courts?.total || 0,
    totalReviews: platformStats?.reviews?.total || 0
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
              { id: 'users', label: 'Usuarios', icon: Users },
              { id: 'settings', label: 'Configuración', icon: Settings }
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
            {/* Main Stats Cards */}
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
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-emerald-400">{stats.approvedEstablishments} activos</span>
                      {stats.pendingEstablishments > 0 && (
                        <span className="text-xs text-yellow-400">{stats.pendingEstablishments} pendientes</span>
                      )}
                    </div>
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
                    <p className="text-xs text-cyan-400">{stats.activeUsers} activos</p>
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
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-emerald-400">{stats.completedBookings} completadas</span>
                      <span className="text-xs text-yellow-400">{stats.confirmedBookings} confirmadas</span>
                    </div>
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
                    <p className="text-sm text-gray-400">Facturación Total</p>
                    <p className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString('es-AR')}</p>
                    <p className="text-xs text-purple-400">Ingresos de establecimientos</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-400" />
                </div>
              </motion.div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalCourts}</p>
                    <p className="text-sm text-gray-400">Canchas registradas</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalReviews}</p>
                    <p className="text-sm text-gray-400">Reseñas totales</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.cancelledBookings}</p>
                    <p className="text-sm text-gray-400">Reservas canceladas</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Platform Commission Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Comisión de Plataforma</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Comisión por defecto: <span className="text-emerald-400 font-semibold">{platformConfig.defaultFeePercent}%</span>
                    {' '}sobre cada reserva
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">
                    ${Math.round(stats.totalRevenue * (platformConfig.defaultFeePercent / 100)).toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-gray-400">Comisiones estimadas</p>
                </div>
              </div>
            </motion.div>

            {/* Pending Approvals */}
            {stats.pendingEstablishments > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gray-800 border border-yellow-500/30 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Establecimientos Pendientes de Aprobación</h3>
                </div>
                <div className="space-y-3">
                  {establishments.filter(e => e.registrationStatus === 'pending').map((est) => (
                    <div key={est.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{est.name}</p>
                        <p className="text-sm text-gray-400">{est.city} • {est.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveEstablishment(est.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRejectEstablishment(est.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Top Establishments */}
            {establishments.filter(e => e.registrationStatus === 'approved').length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Top Establecimientos por Facturación</h3>
                <div className="space-y-3">
                  {establishments
                    .filter(e => e.registrationStatus === 'approved')
                    .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
                    .slice(0, 5)
                    .map((est, index) => (
                      <div key={est.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-white">{est.name}</p>
                            <p className="text-xs text-gray-400">{est.city} • {est.totalBookings || 0} reservas</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-400">${(est.totalRevenue || 0).toLocaleString('es-AR')}</p>
                          <p className="text-xs text-gray-500">{est.courtsCount || 0} canchas</p>
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

            {/* Info banner */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Comisión por defecto: <span className="text-emerald-400 font-medium">{platformConfig.defaultFeePercent}%</span>
                {' '}• Haz clic en la comisión para editarla
              </p>
              <span className="text-xs text-gray-500">{filteredEstablishments.length} establecimientos</span>
            </div>

            {/* Establishments Table */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Establecimiento
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Reservas
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Señas Cobradas
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Comisión
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Generado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filteredEstablishments.map((establishment) => (
                      <tr key={establishment.id} className="hover:bg-gray-700/30 transition-colors">
                        {/* Establishment Info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white truncate">{establishment.name}</p>
                                {establishment.mpConnected && (
                                  <span className="flex-shrink-0 w-5 h-5 rounded bg-sky-500/20 flex items-center justify-center" title="MP Conectado">
                                    <CreditCard className="w-3 h-3 text-sky-400" />
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 truncate">{establishment.city} • {establishment.address}</p>
                              <p className="text-xs text-gray-500 truncate">{establishment.email} • {establishment.phone}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <select
                            value={establishment.registrationStatus}
                            onChange={async (e) => {
                              const newStatus = e.target.value as 'approved' | 'pending' | 'rejected';
                              await handleChangeEstablishmentStatus(establishment.id, newStatus);
                            }}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${
                              establishment.registrationStatus === 'approved' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : establishment.registrationStatus === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            <option value="approved">Aprobado</option>
                            <option value="pending">Pendiente</option>
                            <option value="rejected">Rechazado</option>
                          </select>
                        </td>

                        {/* Bookings */}
                        <td className="px-4 py-3 text-center">
                          <div className="text-sm text-white font-medium">{establishment.totalBookings || 0}</div>
                          <div className="text-xs text-gray-500">
                            {establishment.completedBookings || 0} completadas
                          </div>
                        </td>

                        {/* Deposits */}
                        <td className="px-4 py-3 text-right">
                          <div className="text-sm text-white font-medium">
                            ${(establishment.totalDeposits || 0).toLocaleString('es-AR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${(establishment.totalRevenue || 0).toLocaleString('es-AR')} total
                          </div>
                        </td>

                        {/* Commission - Editable */}
                        <td className="px-4 py-3">
                          <EstablishmentFeeEditor
                            establishment={establishment}
                            defaultFee={platformConfig.defaultFeePercent}
                            onUpdate={(id: string, fee: number | null) => {
                              setEstablishments(prev => 
                                prev.map(e => e.id === id ? { 
                                  ...e, 
                                  customFeePercent: fee,
                                  effectiveFeePercent: fee !== null ? fee : platformConfig.defaultFeePercent
                                } : e)
                              );
                            }}
                          />
                        </td>

                        {/* Commissions Generated */}
                        <td className="px-4 py-3 text-right">
                          <div className="text-sm text-emerald-400 font-medium">
                            ${(establishment.commissionsGenerated || 0).toLocaleString('es-AR')}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => setSelectedEstablishment(establishment)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors" 
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteModal({type: 'establishment', id: establishment.id, name: establishment.name})}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
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

        {/* Establishment Detail Modal */}
        {selectedEstablishment && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedEstablishment.name}</h2>
                  <p className="text-sm text-gray-400">{selectedEstablishment.city}</p>
                </div>
                <button
                  onClick={() => setSelectedEstablishment(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Información de Contacto</h3>
                  <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-white"><span className="text-gray-400">Dirección:</span> {selectedEstablishment.address}</p>
                    <p className="text-sm text-white"><span className="text-gray-400">Email:</span> {selectedEstablishment.email}</p>
                    <p className="text-sm text-white"><span className="text-gray-400">Teléfono:</span> {selectedEstablishment.phone}</p>
                    {selectedEstablishment.owner && (
                      <p className="text-sm text-white">
                        <span className="text-gray-400">Dueño:</span> {selectedEstablishment.owner.firstName} {selectedEstablishment.owner.lastName} ({selectedEstablishment.owner.email})
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Estadísticas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-white">{selectedEstablishment.courtsCount || 0}</p>
                      <p className="text-xs text-gray-400">Canchas</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-white">{selectedEstablishment.totalBookings || 0}</p>
                      <p className="text-xs text-gray-400">Reservas</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-white">{selectedEstablishment.rating || 0}★</p>
                      <p className="text-xs text-gray-400">{selectedEstablishment.reviewCount || 0} reseñas</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-emerald-400">${(selectedEstablishment.totalRevenue || 0).toLocaleString('es-AR')}</p>
                      <p className="text-xs text-gray-400">Facturado</p>
                    </div>
                  </div>
                </div>

                {/* Financial */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Información Financiera</h3>
                  <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Señas cobradas:</span>
                      <span className="text-sm text-white font-medium">${(selectedEstablishment.totalDeposits || 0).toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Comisión aplicada:</span>
                      <span className="text-sm text-white font-medium">
                        {selectedEstablishment.effectiveFeePercent || platformConfig.defaultFeePercent}%
                        {selectedEstablishment.customFeePercent !== null && selectedEstablishment.customFeePercent !== undefined && (
                          <span className="text-amber-400 text-xs ml-1">(personalizada)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-600 pt-2 mt-2">
                      <span className="text-sm text-gray-400">Comisiones generadas:</span>
                      <span className="text-sm text-emerald-400 font-medium">${(selectedEstablishment.commissionsGenerated || 0).toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">MP Conectado:</span>
                      <span className={`text-sm font-medium ${selectedEstablishment.mpConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                        {selectedEstablishment.mpConnected ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Registrado: {new Date(selectedEstablishment.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    selectedEstablishment.registrationStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                    selectedEstablishment.registrationStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedEstablishment.registrationStatus === 'approved' ? 'Aprobado' :
                     selectedEstablishment.registrationStatus === 'pending' ? 'Pendiente' : 'Rechazado'}
                  </span>
                </div>
              </div>
            </motion.div>
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Mercado Pago Platform Account */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-sky-500/20 rounded-lg">
                  <CreditCard className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Cuenta de Comisiones</h3>
                  <p className="text-sm text-gray-400">Cuenta de Mercado Pago donde se reciben las comisiones de la plataforma</p>
                </div>
              </div>

              {platformConfig.loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                </div>
              ) : platformConfig.mpConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">Cuenta conectada</h4>
                      <p className="text-sm text-gray-400">
                        ID: {platformConfig.mpUserId}
                        {platformConfig.mpEmail && ` • ${platformConfig.mpEmail}`}
                      </p>
                      {platformConfig.mpConnectedAt && (
                        <p className="text-xs text-gray-500">
                          Conectada el {new Date(platformConfig.mpConnectedAt).toLocaleDateString('es-AR')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-700/50 rounded-xl">
                    <h5 className="text-sm font-medium text-white mb-2">¿Cómo funciona?</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Cuando un cliente paga una reserva, el dinero va al establecimiento</li>
                      <li>• La comisión de la plataforma se descuenta automáticamente</li>
                      <li>• La comisión llega a esta cuenta de Mercado Pago</li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={handleDisconnectPlatformMP}
                    className="w-full py-2 px-4 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors text-sm"
                  >
                    Desconectar cuenta
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Cuenta no conectada</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Necesitás conectar una cuenta de Mercado Pago para recibir las comisiones de la plataforma.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleConnectPlatformMP}
                    disabled={mpConnecting}
                    className="w-full py-3 px-4 bg-[#009ee3] hover:bg-[#0087c9] text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {mpConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-5 h-5" />
                        Conectar cuenta de comisiones
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Default Fee Configuration */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-500/20 rounded-lg">
                  <Percent className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Comisión de Plataforma</h3>
                  <p className="text-sm text-gray-400">Porcentaje que se cobra a cada reserva como tarifa de servicio</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Comisión por defecto (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={platformConfig.defaultFeePercent}
                      onChange={(e) => setPlatformConfig(prev => ({ ...prev, defaultFeePercent: parseFloat(e.target.value) || 0 }))}
                      className="w-32 px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <span className="text-gray-400">%</span>
                    <button
                      onClick={() => handleUpdateFeePercent(platformConfig.defaultFeePercent)}
                      disabled={platformConfig.saving}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {platformConfig.saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Guardar
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Este porcentaje se aplica a todos los establecimientos por defecto. Podés configurar comisiones personalizadas por establecimiento.
                  </p>
                </div>

                <div className="p-4 bg-gray-700/50 rounded-xl">
                  <h5 className="text-sm font-medium text-white mb-2">Ejemplo</h5>
                  <p className="text-sm text-gray-400">
                    Si un cliente paga <span className="text-white font-medium">$10,000</span> por una reserva con comisión del <span className="text-white font-medium">{platformConfig.defaultFeePercent}%</span>:
                  </p>
                  <ul className="text-sm text-gray-400 mt-2 space-y-1">
                    <li>• Establecimiento recibe: <span className="text-emerald-400 font-medium">${(10000 * (1 - platformConfig.defaultFeePercent / 100)).toLocaleString('es-AR')}</span></li>
                    <li>• Plataforma recibe: <span className="text-sky-400 font-medium">${(10000 * platformConfig.defaultFeePercent / 100).toLocaleString('es-AR')}</span></li>
                  </ul>
                </div>
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
