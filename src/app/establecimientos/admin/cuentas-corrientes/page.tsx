'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Percent,
  Tag,
  Clock,
  ChevronRight,
  UserPlus,
  Building2,
  ShoppingCart,
  Wallet,
  Ban,
  Loader2,
  Download
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useEstablishment } from '@/contexts/EstablishmentContext';

interface CurrentAccount {
  id: string;
  establishmentId: string;
  clientId?: string;
  staffId?: string;
  holderName: string;
  holderPhone?: string;
  holderEmail?: string;
  accountType: 'employee' | 'client' | 'supplier' | 'other';
  useCostPrice: boolean;
  discountPercentage: number;
  creditLimit?: number;
  currentBalance: number;
  totalPurchases: number;
  totalPayments: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  client?: { id: string; name: string; phone?: string; email?: string };
  staff?: { id: string; name: string; phone?: string; email?: string };
}

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface AccountMovement {
  id: string;
  movementType: 'purchase' | 'payment' | 'adjustment' | 'refund';
  amount: number;
  balanceAfter: number;
  description?: string;
  paymentMethod?: string;
  createdAt: string;
  order?: {
    id: string;
    orderNumber?: string;
  };
  registeredByUser?: {
    name: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function CuentasCorrientesPage() {
  const { establishment } = useEstablishment();
  const [accounts, setAccounts] = useState<CurrentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<CurrentAccount | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [headerPortalContainer, setHeaderPortalContainer] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Detail sidebar state
  const [accountMovements, setAccountMovements] = useState<AccountMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Set mounted for portal rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Find header portal container
  useEffect(() => {
    const container = document.getElementById('header-page-controls');
    setHeaderPortalContainer(container);
  }, []);

  // Load movements when account is selected
  useEffect(() => {
    if (selectedAccount && showDetailsSidebar) {
      loadAccountMovements(selectedAccount.id);
    }
  }, [selectedAccount, showDetailsSidebar]);

  const loadAccountMovements = async (accountId: string) => {
    setLoadingMovements(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/current-accounts/${accountId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success && data.data.movements) {
        setAccountMovements(data.data.movements);
      }
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoadingMovements(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!selectedAccount) return;
    
    if (!confirm(`¿Estás seguro de dar de baja la cuenta de ${selectedAccount.holderName}?`)) {
      return;
    }
    
    setDeactivating(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/current-accounts/${selectedAccount.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setShowDetailsSidebar(false);
        setSelectedAccount(null);
        loadAccounts();
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
    } finally {
      setDeactivating(false);
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase': return 'Compra';
      case 'payment': return 'Pago';
      case 'adjustment': return 'Ajuste';
      case 'refund': return 'Devolución';
      default: return type;
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-red-400';
      case 'payment': return 'text-green-400';
      case 'adjustment': return 'text-yellow-400';
      case 'refund': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  // Form state
  const [formMode, setFormMode] = useState<'new' | 'existing'>('existing');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [formData, setFormData] = useState({
    holderName: '',
    holderPhone: '',
    holderEmail: '',
    accountType: 'client' as 'employee' | 'client' | 'supplier' | 'other',
    useCostPrice: false,
    discountPercentage: 0,
    creditLimit: '',
    notes: ''
  });
  const [clientSearch, setClientSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAccounts = async () => {
    if (!establishment?.id) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/current-accounts/establishment/${establishment.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setAccounts(data.data || []);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    if (!establishment?.id) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/clients/establishment/${establishment.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setClients(data.data || []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadStaff = async () => {
    if (!establishment?.id) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/staff/establishment/${establishment.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setStaff(data.data || []);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadClients();
    loadStaff();
  }, [establishment?.id]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const matchesSearch = 
        account.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.holderPhone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.holderEmail?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || account.accountType === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [accounts, searchQuery, filterType]);

  const stats = useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(String(acc.currentBalance)), 0);
    const employeeCount = accounts.filter(acc => acc.accountType === 'employee').length;
    const clientCount = accounts.filter(acc => acc.accountType === 'client').length;
    const withDebt = accounts.filter(acc => parseFloat(String(acc.currentBalance)) > 0).length;
    
    return { totalBalance, employeeCount, clientCount, withDebt };
  }, [accounts]);

  const handleCreateAccount = async () => {
    if (!establishment?.id) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const payload: any = {
        establishmentId: establishment.id,
        holderName: formData.holderName,
        holderPhone: formData.holderPhone,
        holderEmail: formData.holderEmail,
        accountType: formData.accountType,
        useCostPrice: formData.useCostPrice,
        discountPercentage: formData.discountPercentage,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null,
        notes: formData.notes
      };

      if (formMode === 'existing') {
        if (formData.accountType === 'employee' && selectedStaffId) {
          payload.staffId = selectedStaffId;
          const staffMember = staff.find(s => s.id === selectedStaffId);
          if (staffMember) {
            payload.holderName = staffMember.name;
            payload.holderPhone = staffMember.phone;
            payload.holderEmail = staffMember.email;
          }
        } else if (selectedClientId) {
          payload.clientId = selectedClientId;
          const client = clients.find(c => c.id === selectedClientId);
          if (client) {
            payload.holderName = client.name;
            payload.holderPhone = client.phone;
            payload.holderEmail = client.email;
          }
        }
      }

      const response = await fetch(`${API_URL}/api/current-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        resetForm();
        loadAccounts();
      } else {
        alert(data.error || 'Error al crear la cuenta');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Error al crear la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoCreateStaffAccounts = async () => {
    if (!establishment?.id) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/current-accounts/establishment/${establishment.id}/auto-create-staff`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ useCostPrice: true })
        }
      );

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        loadAccounts();
      } else {
        alert(data.error || 'Error al crear cuentas');
      }
    } catch (error) {
      console.error('Error auto-creating accounts:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      holderName: '',
      holderPhone: '',
      holderEmail: '',
      accountType: 'client',
      useCostPrice: false,
      discountPercentage: 0,
      creditLimit: '',
      notes: ''
    });
    setSelectedClientId('');
    setSelectedStaffId('');
    setFormMode('existing');
    setClientSearch('');
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'employee': return 'Personal';
      case 'client': return 'Cliente';
      case 'supplier': return 'Proveedor';
      default: return 'Otro';
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'employee': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'client': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'supplier': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients.slice(0, 10);
    return clients.filter(c => 
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(clientSearch.toLowerCase())
    ).slice(0, 10);
  }, [clients, clientSearch]);

  if (loading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  // Header controls for portal
  const headerControls = (
    <div className="flex items-center gap-2 flex-1 justify-start">
      {/* Search - hidden on mobile, shown on sm+ */}
      <div className="relative hidden sm:block sm:w-48 lg:w-64">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        />
      </div>

      {/* Filter Pills - scrollable on mobile */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {['all', 'employee', 'client'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filterType === type
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {type === 'all' ? 'Todos' : type === 'employee' ? 'Personal' : 'Clientes'}
          </button>
        ))}
      </div>

      {/* Export Dropdown */}
      <div className="relative">
        <select
          onChange={async (e) => {
            if (!e.target.value || !establishment?.id) return;
            const type = e.target.value;
            e.target.value = '';
            setIsExporting(true);
            try {
              if (type === 'movements') {
                await apiClient.exportAccountMovementsToCSV({
                  establishmentId: establishment.id
                });
              } else if (type === 'debts') {
                await apiClient.exportPendingDebtsToCSV({
                  establishmentId: establishment.id
                });
              } else {
                await apiClient.exportCurrentAccountsToCSV({
                  establishmentId: establishment.id,
                  accountType: filterType !== 'all' ? filterType : undefined,
                  hasBalance: undefined
                });
              }
            } catch (error) {
              console.error('Error exporting:', error);
            } finally {
              setIsExporting(false);
            }
          }}
          disabled={isExporting}
          className="p-1.5 w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 appearance-none cursor-pointer opacity-0 absolute inset-0 z-10"
          title="Exportar"
        >
          <option value=""></option>
          <option value="accounts">Cuentas</option>
          <option value="movements">Movimientos</option>
          <option value="debts">Deudas</option>
        </select>
        <div className={`p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors ${isExporting ? 'opacity-50' : ''}`}>
          <Download className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
        </div>
      </div>

      {/* Create for Staff Button */}
      <button
        onClick={handleAutoCreateStaffAccounts}
        className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        title="Crear para personal"
      >
        <Building2 className="h-4 w-4" />
      </button>

      {/* New Account Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nueva Cuenta</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Render controls in header via portal */}
      {headerPortalContainer && createPortal(headerControls, headerPortalContainer)}

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Mobile Search - only shown on mobile */}
        <div className="sm:hidden relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg">
              <DollarSign className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Total</p>
              <p className={`text-xl font-bold ${stats.totalBalance >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                ${Math.abs(stats.totalBalance).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
              <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Personal</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.employeeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg">
              <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Clientes</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.clientCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Con Deuda</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.withDebt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Titular
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Beneficios
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAccounts.map((account) => (
                <tr
                  key={account.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedAccount(account);
                    setShowDetailsSidebar(true);
                  }}
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {account.staff?.name || account.client?.name || account.holderName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {account.staff?.phone || account.client?.phone || account.holderPhone || account.staff?.email || account.client?.email || account.holderEmail || 'Sin contacto'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getAccountTypeColor(account.accountType)}`}>
                      {getAccountTypeLabel(account.accountType)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {account.useCostPrice && (
                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                          Precio costo
                        </span>
                      )}
                      {account.discountPercentage > 0 && (
                        <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                          {account.discountPercentage}% desc.
                        </span>
                      )}
                      {!account.useCostPrice && account.discountPercentage === 0 && (
                        <span className="text-gray-500 text-sm">Sin beneficios</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`font-medium ${
                      parseFloat(String(account.currentBalance)) > 0 
                        ? 'text-red-400' 
                        : parseFloat(String(account.currentBalance)) < 0 
                          ? 'text-green-400' 
                          : 'text-gray-400'
                    }`}>
                      ${Math.abs(parseFloat(String(account.currentBalance))).toLocaleString()}
                      {parseFloat(String(account.currentBalance)) > 0 && ' (debe)'}
                      {parseFloat(String(account.currentBalance)) < 0 && ' (a favor)'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAccount(account);
                        setShowDetailsSidebar(true);
                      }}
                      className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No se encontraron cuentas corrientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Sidebar */}
      {mounted && createPortal(
        <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                onClick={() => setShowCreateModal(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-800 border-l border-gray-700 z-[101] flex flex-col"
              >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Nueva Cuenta Corriente</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de cuenta
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'employee', label: 'Personal', icon: Briefcase },
                      { value: 'client', label: 'Cliente', icon: Users }
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setFormData({ ...formData, accountType: value as any })}
                        className={`p-3 rounded-lg border flex items-center gap-2 transition-colors ${
                          formData.accountType === value
                            ? 'bg-cyan-600 border-cyan-500 text-white'
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Seleccionar titular
                  </label>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setFormMode('existing')}
                      className={`flex-1 p-2 rounded-lg text-sm font-medium transition-colors ${
                        formMode === 'existing'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {formData.accountType === 'employee' ? 'Personal existente' : 'Cliente existente'}
                    </button>
                    <button
                      onClick={() => setFormMode('new')}
                      className={`flex-1 p-2 rounded-lg text-sm font-medium transition-colors ${
                        formMode === 'new'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Nuevo
                    </button>
                  </div>

                  {formMode === 'existing' ? (
                    <div>
                      {formData.accountType === 'employee' ? (
                        <select
                          value={selectedStaffId}
                          onChange={(e) => setSelectedStaffId(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="">Seleccionar personal...</option>
                          {staff.filter(s => s.isActive).map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} - {s.role}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500"
                          />
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {filteredClients.map((client) => (
                              <button
                                key={client.id}
                                onClick={() => setSelectedClientId(client.id)}
                                className={`w-full p-2 text-left rounded-lg transition-colors ${
                                  selectedClientId === client.id
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                <p className="font-medium">{client.name}</p>
                                <p className="text-xs opacity-70">{client.phone || client.email}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={formData.holderName}
                        onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500"
                      />
                      <input
                        type="tel"
                        placeholder="Teléfono"
                        value={formData.holderPhone}
                        onChange={(e) => setFormData({ ...formData, holderPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.holderEmail}
                        onChange={(e) => setFormData({ ...formData, holderEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300">Beneficios</h3>
                  
                  <label className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.useCostPrice}
                      onChange={(e) => setFormData({ ...formData, useCostPrice: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-500 text-cyan-600 focus:ring-cyan-500"
                    />
                    <div>
                      <p className="text-white font-medium">Precio de costo</p>
                      <p className="text-xs text-gray-400">Los productos se venden al precio de costo</p>
                    </div>
                  </label>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Descuento adicional (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Límite de crédito (opcional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Sin límite"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Notas</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 resize-none"
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-700 flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateAccount}
                  disabled={isSubmitting || (formMode === 'existing' && !selectedClientId && !selectedStaffId) || (formMode === 'new' && !formData.holderName)}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Crear Cuenta
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
      )}

      {/* Details Sidebar - rendered via portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showDetailsSidebar && selectedAccount && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                onClick={() => setShowDetailsSidebar(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-800 border-l border-gray-700 z-[101] flex flex-col"
              >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Detalle de Cuenta</h2>
                  <button
                    onClick={() => setShowDetailsSidebar(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Account Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {selectedAccount.staff?.name || selectedAccount.client?.name || selectedAccount.holderName}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getAccountTypeColor(selectedAccount.accountType)}`}>
                        {getAccountTypeLabel(selectedAccount.accountType)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Saldo actual</p>
                      <p className={`text-lg font-bold ${
                        parseFloat(String(selectedAccount.currentBalance)) > 0 
                          ? 'text-red-400' 
                          : parseFloat(String(selectedAccount.currentBalance)) < 0 
                            ? 'text-green-400' 
                            : 'text-gray-400'
                      }`}>
                        ${Math.abs(parseFloat(String(selectedAccount.currentBalance))).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Total compras</p>
                      <p className="text-lg font-bold text-white">
                        ${parseFloat(String(selectedAccount.totalPurchases)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Beneficios</h4>
                  <div className="space-y-2">
                    {selectedAccount.useCostPrice && (
                      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <Tag className="h-4 w-4 text-green-400" />
                        <span className="text-green-400">Acceso a precio de costo</span>
                      </div>
                    )}
                    {selectedAccount.discountPercentage > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <Percent className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400">{selectedAccount.discountPercentage}% de descuento</span>
                      </div>
                    )}
                    {selectedAccount.creditLimit && (
                      <div className="flex items-center gap-2 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                        <DollarSign className="h-4 w-4 text-cyan-400" />
                        <span className="text-cyan-400">Límite: ${parseFloat(String(selectedAccount.creditLimit)).toLocaleString()}</span>
                      </div>
                    )}
                    {!selectedAccount.useCostPrice && selectedAccount.discountPercentage === 0 && !selectedAccount.creditLimit && (
                      <p className="text-gray-500 text-sm">Sin beneficios configurados</p>
                    )}
                  </div>
                </div>

                {/* Debt Alert */}
                {parseFloat(String(selectedAccount.currentBalance)) > 0 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/20 rounded-full">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-red-400 font-medium">Cuenta con deuda</p>
                        <p className="text-red-300 text-sm">
                          Saldo pendiente: ${parseFloat(String(selectedAccount.currentBalance)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Movements */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Movimientos
                  </h4>
                  {loadingMovements ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
                    </div>
                  ) : accountMovements.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No hay movimientos registrados
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {accountMovements.map((movement) => (
                        <div
                          key={movement.id}
                          className="p-3 bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {movement.movementType === 'purchase' ? (
                                <ShoppingCart className="h-4 w-4 text-red-400" />
                              ) : (
                                <Wallet className="h-4 w-4 text-green-400" />
                              )}
                              <span className={`text-sm font-medium ${getMovementTypeColor(movement.movementType)}`}>
                                {getMovementTypeLabel(movement.movementType)}
                              </span>
                            </div>
                            <span className={`font-bold ${
                              movement.movementType === 'purchase' ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {movement.movementType === 'purchase' ? '+' : '-'}${Math.abs(movement.amount).toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                            <span>
                              {new Date(movement.createdAt).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span>Saldo: ${movement.balanceAfter.toLocaleString()}</span>
                          </div>
                          {movement.description && (
                            <p className="text-xs text-gray-500 mt-1">{movement.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Contacto</h4>
                  <div className="space-y-2 text-sm">
                    {selectedAccount.holderPhone && (
                      <p className="text-gray-300">📞 {selectedAccount.holderPhone}</p>
                    )}
                    {selectedAccount.holderEmail && (
                      <p className="text-gray-300">✉️ {selectedAccount.holderEmail}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedAccount.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Notas</h4>
                    <p className="text-gray-300 text-sm bg-gray-700/50 rounded-lg p-3">
                      {selectedAccount.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer with deactivate button */}
              <div className="p-4 border-t border-gray-700">
                <button
                  onClick={handleDeactivateAccount}
                  disabled={deactivating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deactivating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Ban className="h-4 w-4" />
                  )}
                  Dar de baja cuenta
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
      )}
      </div>
    </>
  );
}
