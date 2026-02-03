'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Users,
  Star,
  Camera,
  Upload,
  X,
  Edit3,
  Trash2,
  Plus,
  Calendar,
  CreditCard,
  Smartphone,
  Bell,
  DollarSign,
  Database,
  Moon,
  Check,
  Eye,
  AlertTriangle,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  GripVertical,
  Image as ImageIcon,
  Bold,
  Italic,
  List,
  Link,
  CalendarX,
  UserPlus,
  Shield,
  UserCog,
  UserCheck,
  User,
  MoreVertical,
  Pencil,
  Power,
  BarChart3,
  Wallet,
  Package,
  TrendingUp,
  Megaphone,
  Ticket,
  Receipt,
  ShoppingCart,
  Link2
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import PhoneInput from '@/components/ui/PhoneInput';
import GooglePlacesAutocomplete from '@/components/ui/GooglePlacesAutocomplete';
import { ARGENTINA_PROVINCES } from '@/constants/argentina';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { useRouter, useSearchParams } from 'next/navigation';

// Argentine National Holidays 2024-2027
const NATIONAL_HOLIDAYS = [
  // 2024
  { date: '2024-12-25', name: 'Navidad' },
  // 2025
  { date: '2025-01-01', name: 'Año Nuevo' },
  { date: '2025-02-24', name: 'Carnaval' },
  { date: '2025-02-25', name: 'Carnaval' },
  { date: '2025-03-24', name: 'Día de la Memoria' },
  { date: '2025-04-02', name: 'Día del Veterano' },
  { date: '2025-04-18', name: 'Viernes Santo' },
  { date: '2025-05-01', name: 'Día del Trabajador' },
  { date: '2025-05-25', name: 'Revolución de Mayo' },
  { date: '2025-06-16', name: 'Güemes' },
  { date: '2025-06-20', name: 'Día de la Bandera' },
  { date: '2025-07-09', name: 'Día de la Independencia' },
  { date: '2025-08-18', name: 'San Martín' },
  { date: '2025-10-13', name: 'Diversidad Cultural' },
  { date: '2025-11-24', name: 'Soberanía Nacional' },
  { date: '2025-12-08', name: 'Inmaculada Concepción' },
  { date: '2025-12-25', name: 'Navidad' },
  // 2026
  { date: '2026-01-01', name: 'Año Nuevo' },
  { date: '2026-02-16', name: 'Carnaval' },
  { date: '2026-02-17', name: 'Carnaval' },
  { date: '2026-03-24', name: 'Día de la Memoria' },
  { date: '2026-04-02', name: 'Día del Veterano' },
  { date: '2026-04-03', name: 'Viernes Santo' },
  { date: '2026-05-01', name: 'Día del Trabajador' },
  { date: '2026-05-25', name: 'Revolución de Mayo' },
  { date: '2026-06-15', name: 'Güemes' },
  { date: '2026-06-20', name: 'Día de la Bandera' },
  { date: '2026-07-09', name: 'Día de la Independencia' },
  { date: '2026-08-17', name: 'San Martín' },
  { date: '2026-10-12', name: 'Diversidad Cultural' },
  { date: '2026-11-23', name: 'Soberanía Nacional' },
  { date: '2026-12-08', name: 'Inmaculada Concepción' },
  { date: '2026-12-25', name: 'Navidad' },
  // 2027
  { date: '2027-01-01', name: 'Año Nuevo' },
  { date: '2027-02-15', name: 'Carnaval' },
  { date: '2027-02-16', name: 'Carnaval' },
  { date: '2027-03-24', name: 'Día de la Memoria' },
  { date: '2027-03-26', name: 'Viernes Santo' },
  { date: '2027-04-02', name: 'Día del Veterano' },
  { date: '2027-05-01', name: 'Día del Trabajador' },
  { date: '2027-05-25', name: 'Revolución de Mayo' },
  { date: '2027-06-20', name: 'Día de la Bandera' },
  { date: '2027-06-21', name: 'Güemes' },
  { date: '2027-07-09', name: 'Día de la Independencia' },
  { date: '2027-08-16', name: 'San Martín' },
  { date: '2027-10-11', name: 'Diversidad Cultural' },
  { date: '2027-11-22', name: 'Soberanía Nacional' },
  { date: '2027-12-08', name: 'Inmaculada Concepción' },
  { date: '2027-12-25', name: 'Navidad' },
];

const ROLE_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  admin: { label: 'Administrador', color: 'text-red-400 bg-red-400/20', icon: Shield },
  manager: { label: 'Gerente', color: 'text-purple-400 bg-purple-400/20', icon: UserCog },
  receptionist: { label: 'Recepcionista', color: 'text-blue-400 bg-blue-400/20', icon: UserCheck },
  staff: { label: 'Personal', color: 'text-gray-400 bg-gray-400/20', icon: User },
};

const ConfigurationPage = () => {
  const { establishment, loading, updateEstablishment } = useEstablishment();
  const { showSuccess, showError, showWarning } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('general');
  const [headerPortalContainer, setHeaderPortalContainer] = useState<HTMLElement | null>(null);
  
  // Get header portal container on mount
  useEffect(() => {
    const container = document.getElementById('header-page-controls');
    if (container) {
      setHeaderPortalContainer(container);
    }
  }, []);
  
  // Read tab from URL on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const validTabs = ['general', 'business', 'staff', 'booking', 'notifications', 'payments', 'security'];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  
  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/establecimientos/admin/configuracion?tab=${tab}`, { scroll: false });
  };
  const [showPassword, setShowPassword] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Staff modal state
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSaving, setStaffSaving] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'employee' as 'admin' | 'employee',
    allowedSections: ['reservas', 'canchas', 'clientes', 'resenas', 'marketing', 'cupones', 'ventas', 'gastos', 'stock', 'cuentas', 'analytics', 'finanzas', 'integraciones', 'caja', 'configuracion'] as string[],
  });
  
  // Closed date state
  const [newClosedDate, setNewClosedDate] = useState('');
  
  // Image upload state
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Mercado Pago state
  const [mpStatus, setMpStatus] = useState<{
    connected: boolean;
    mpUserId?: string;
    mpEmail?: string;
    connectedAt?: string;
    loading: boolean;
  }>({ connected: false, loading: true });
  const [mpConnecting, setMpConnecting] = useState(false);
  
  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<{
    id: string;
    name: string;
    code: string;
    icon: string | null;
    isActive: boolean;
    isDefault: boolean;
    sortOrder: number;
  }[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [showNewPaymentMethodForm, setShowNewPaymentMethodForm] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({ name: '', code: '' });
  const [savingPaymentMethod, setSavingPaymentMethod] = useState(false);

  // Expense Categories state
  const [expenseCategories, setExpenseCategories] = useState<{
    id: string;
    name: string;
    description: string | null;
    color: string;
    isActive: boolean;
    sortOrder: number;
  }[]>([]);
  const [expenseCategoriesLoading, setExpenseCategoriesLoading] = useState(false);
  const [showNewExpenseCategoryForm, setShowNewExpenseCategoryForm] = useState(false);
  const [newExpenseCategory, setNewExpenseCategory] = useState({ name: '', description: '', color: '#6B7280' });
  const [savingExpenseCategory, setSavingExpenseCategory] = useState(false);

  // Load saved configuration from localStorage
  const loadSavedConfig = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboardThemeConfig');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Error loading saved config:', error);
        }
      }
    }
    return null;
  };

  // Configuration state - initialize with establishment data
  const [config, setConfig] = useState({
    // General Settings
    establishmentName: establishment?.name || '',
    slug: establishment?.slug || '',
    logo: establishment?.logo || '',
    description: establishment?.description || '',
    address: establishment?.address || '',
    city: establishment?.city || '',
    latitude: establishment?.latitude || null,
    longitude: establishment?.longitude || null,
    phone: establishment?.phone || '',
    email: establishment?.email || '',
    website: '',
    timezone: 'America/Argentina/Buenos_Aires',
    language: 'es',
    currency: 'ARS',
    
    // Social Media
    instagram: (establishment as any)?.instagram || '',
    facebook: (establishment as any)?.facebook || '',
    twitter: (establishment as any)?.twitter || '',
    
    // Gallery
    galleryImages: [] as string[],
    
    // Closed Days
    closedDates: [] as string[], // Specific dates like '2024-12-25'
    nationalHolidays: true, // Auto-add national holidays
    
    // Staff Members
    staffMembers: [] as {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: 'admin' | 'manager' | 'receptionist' | 'staff';
      isActive: boolean;
      createdAt: string;
    }[],
    
    // Business Hours
    businessHours: {
      monday: { open: '06:00', close: '23:00', closed: false },
      tuesday: { open: '06:00', close: '23:00', closed: false },
      wednesday: { open: '06:00', close: '23:00', closed: false },
      thursday: { open: '06:00', close: '23:00', closed: false },
      friday: { open: '06:00', close: '23:00', closed: false },
      saturday: { open: '08:00', close: '22:00', closed: false },
      sunday: { open: '08:00', close: '20:00', closed: false }
    },
    
    // Booking Settings
    maxAdvanceBookingDays: 30,
    minAdvanceBookingHours: 2,
    cancellationDeadlineHours: 24,
    allowSameDayBooking: true,
    
    // Deposit/Seña Settings - load from establishment or use defaults
    requireDeposit: (establishment as any)?.requireDeposit !== false,
    depositType: ((establishment as any)?.depositType || 'percentage') as 'percentage' | 'fixed',
    depositPercentage: (establishment as any)?.depositPercentage ?? 50,
    depositFixedAmount: (establishment as any)?.depositFixedAmount || 5000,
    depositPaymentDeadlineHours: 2, // Hours to complete deposit payment
    allowFullPayment: (establishment as any)?.allowFullPayment === true, // Allow clients to pay full amount online
    
    // Cancellation Policy
    cancellationPolicy: 'partial_refund' as 'full_refund' | 'partial_refund' | 'no_refund' | 'credit',
    refundPercentage: 50, // If partial refund
    noShowPenalty: true,
    noShowPenaltyType: 'full_charge' as 'full_charge' | 'deposit_only' | 'percentage',
    noShowPenaltyPercentage: 100,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    notifyNewBookings: true,
    notifyCancellations: true,
    notifyPayments: true,
    
    // Security Settings
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: 60,
    passwordMinLength: 8,
    
    // Payment Settings
    acceptCash: true,
    acceptCards: true,
    acceptTransfers: true,
    mercadoPagoEnabled: true,
    stripeEnabled: false,
    
    // Theme Settings
    darkMode: true,
    primaryColor: 'emerald',
    accentColor: 'cyan',
    ...loadSavedConfig()
  });

  // Apply theme changes to CSS variables for live preview
  const applyThemePreview = (primaryColor: string, accentColor: string) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      // Primary color mappings
      const primaryColors = {
        emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' },
        blue: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
        purple: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
        orange: { 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c' }
      };

      // Accent color mappings
      const accentColors = {
        cyan: { 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2' },
        pink: { 400: '#f472b6', 500: '#ec4899', 600: '#db2777' },
        yellow: { 400: '#facc15', 500: '#eab308', 600: '#ca8a04' },
        green: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' }
      };

      // Apply primary colors
      const primary = primaryColors[primaryColor as keyof typeof primaryColors];
      if (primary) {
        root.style.setProperty('--color-primary-400', primary[400]);
        root.style.setProperty('--color-primary-500', primary[500]);
        root.style.setProperty('--color-primary-600', primary[600]);
        root.style.setProperty('--color-primary-700', primary[700]);
      }

      // Apply accent colors
      const accent = accentColors[accentColor as keyof typeof accentColors];
      if (accent) {
        root.style.setProperty('--color-accent-400', accent[400]);
        root.style.setProperty('--color-accent-500', accent[500]);
        root.style.setProperty('--color-accent-600', accent[600]);
      }
    }
  };

  // Load staff from API
  const loadStaff = async () => {
    if (!establishment?.id) return;
    setStaffLoading(true);
    try {
      const response = await apiClient.getStaff(establishment.id);
      setStaffList(response.staff || []);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setStaffLoading(false);
    }
  };

  // Load establishment data and saved configuration on component mount
  useEffect(() => {
    if (establishment) {
      const est = establishment as any;
      setConfig((prev: any) => ({
        ...prev,
        establishmentName: establishment.name || '',
        slug: establishment.slug || '',
        logo: establishment.logo || '',
        description: establishment.description || '',
        address: establishment.address || '',
        city: establishment.city || '',
        latitude: establishment.latitude || null,
        longitude: establishment.longitude || null,
        phone: establishment.phone || '',
        email: establishment.email || '',
        // Load schedule/opening hours from establishment
        businessHours: establishment.schedule || establishment.openingHours || prev.businessHours,
        closedDates: establishment.closedDates || [],
        nationalHolidays: establishment.useNationalHolidays !== false,
        // Load gallery images from establishment
        galleryImages: establishment.images || [],
        // Load booking/deposit settings from establishment
        requireDeposit: est.requireDeposit !== false,
        depositType: est.depositType || 'percentage',
        depositPercentage: est.depositPercentage ?? 50,
        depositFixedAmount: est.depositFixedAmount || 5000,
        allowFullPayment: est.allowFullPayment === true,
        // Load booking restrictions from establishment
        maxAdvanceBookingDays: est.maxAdvanceBookingDays ?? 30,
        minAdvanceBookingHours: est.minAdvanceBookingHours ?? 2,
        allowSameDayBooking: est.allowSameDayBooking !== false,
        cancellationDeadlineHours: est.cancellationDeadlineHours ?? 24,
        // Load cancellation policy from establishment
        cancellationPolicy: est.cancellationPolicy || 'partial_refund',
        refundPercentage: est.refundPercentage ?? 50,
        // Load no-show penalty from establishment
        noShowPenalty: est.noShowPenalty !== false,
        noShowPenaltyType: est.noShowPenaltyType || 'deposit_only',
        noShowPenaltyPercentage: est.noShowPenaltyPercentage ?? 100,
        // Load deposit payment deadline from establishment
        depositPaymentDeadlineHours: est.depositPaymentDeadlineHours ?? 2
      }));
      loadStaff();
    }
    
    const savedConfig = loadSavedConfig();
    if (savedConfig) {
      setConfig((prev: any) => ({ ...prev, ...savedConfig }));
      // Apply saved theme immediately
      applyThemePreview(savedConfig.primaryColor || 'emerald', savedConfig.accentColor || 'cyan');
    }
  }, [establishment]);

  // Apply theme preview when colors change
  useEffect(() => {
    if (previewMode || activeTab === 'appearance') {
      applyThemePreview(config.primaryColor, config.accentColor);
    }
  }, [config.primaryColor, config.accentColor, previewMode, activeTab]);

  // Load MP status and handle OAuth callback
  useEffect(() => {
    const loadMPStatus = async () => {
      if (!establishment?.id) return;
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/mp/oauth/status/${establishment.id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setMpStatus({
            connected: data.connected,
            mpUserId: data.mpUserId,
            mpEmail: data.mpEmail,
            connectedAt: data.connectedAt,
            loading: false
          });
        }
      } catch (error) {
        console.error('Error loading MP status:', error);
        setMpStatus(prev => ({ ...prev, loading: false }));
      }
    };

    // Check for OAuth callback params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mpStatusParam = params.get('mp_status');
      const mpUserId = params.get('mp_user_id');
      const mpError = params.get('mp_error');

      if (mpStatusParam === 'success' && mpUserId) {
        setMpStatus({
          connected: true,
          mpUserId,
          loading: false
        });
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        // Switch to payments tab to show success
        setActiveTab('payments');
      } else if (mpStatusParam === 'error') {
        alert(`Error al conectar Mercado Pago: ${mpError || 'Error desconocido'}`);
        window.history.replaceState({}, '', window.location.pathname);
        setMpStatus(prev => ({ ...prev, loading: false }));
      } else {
        loadMPStatus();
      }
    }
  }, [establishment?.id]);

  // Load Payment Methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!establishment?.id) return;
      
      setPaymentMethodsLoading(true);
      try {
        const response = await apiClient.getPaymentMethods(establishment.id, true);
        setPaymentMethods(response.paymentMethods || []);
      } catch (error) {
        console.error('Error loading payment methods:', error);
      } finally {
        setPaymentMethodsLoading(false);
      }
    };

    loadPaymentMethods();
  }, [establishment?.id]);

  // Payment Methods handlers
  const handleTogglePaymentMethod = async (id: string, isActive: boolean) => {
    try {
      await apiClient.updatePaymentMethod(id, { isActive: !isActive });
      setPaymentMethods(prev => prev.map(pm => 
        pm.id === id ? { ...pm, isActive: !isActive } : pm
      ));
    } catch (error) {
      console.error('Error toggling payment method:', error);
      alert('Error al actualizar el método de pago');
    }
  };

  const handleCreatePaymentMethod = async () => {
    if (!establishment?.id || !newPaymentMethod.name || !newPaymentMethod.code) return;
    
    setSavingPaymentMethod(true);
    try {
      const response = await apiClient.createPaymentMethod({
        establishmentId: establishment.id,
        name: newPaymentMethod.name,
        code: newPaymentMethod.code.toLowerCase().replace(/\s+/g, '_'),
      });
      setPaymentMethods(prev => [...prev, response.paymentMethod]);
      setNewPaymentMethod({ name: '', code: '' });
      setShowNewPaymentMethodForm(false);
      showSuccess('Método de pago creado', newPaymentMethod.name);
    } catch (error: any) {
      console.error('Error creating payment method:', error);
      showError('Error al crear método de pago', error.message || 'No se pudo crear el método');
    } finally {
      setSavingPaymentMethod(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este método de pago?')) return;
    
    try {
      const pm = paymentMethods.find(p => p.id === id);
      await apiClient.deletePaymentMethod(id);
      setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
      showSuccess('Método eliminado', pm?.name || 'Método de pago');
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      showError('Error al eliminar', error.message || 'No se pudo eliminar el método');
    }
  };

  // Load Expense Categories
  useEffect(() => {
    const loadExpenseCategories = async () => {
      if (!establishment?.id) return;
      
      setExpenseCategoriesLoading(true);
      try {
        const response: any = await apiClient.getExpenseCategories(establishment.id);
        setExpenseCategories(response.categories || []);
      } catch (error) {
        console.error('Error loading expense categories:', error);
      } finally {
        setExpenseCategoriesLoading(false);
      }
    };

    loadExpenseCategories();
  }, [establishment?.id]);

  // Expense Categories handlers
  const handleToggleExpenseCategory = async (id: string, isActive: boolean) => {
    try {
      await apiClient.updateExpenseCategory(id, { isActive: !isActive });
      setExpenseCategories(prev => prev.map(ec => 
        ec.id === id ? { ...ec, isActive: !isActive } : ec
      ));
    } catch (error) {
      console.error('Error toggling expense category:', error);
      alert('Error al actualizar la categoría');
    }
  };

  const handleCreateExpenseCategory = async () => {
    if (!establishment?.id || !newExpenseCategory.name) return;
    
    setSavingExpenseCategory(true);
    try {
      const response: any = await apiClient.createExpenseCategory({
        establishmentId: establishment.id,
        name: newExpenseCategory.name,
        description: newExpenseCategory.description || undefined,
        color: newExpenseCategory.color,
      });
      setExpenseCategories(prev => [...prev, response.category]);
      showSuccess('Categoría creada', newExpenseCategory.name);
      setNewExpenseCategory({ name: '', description: '', color: '#6B7280' });
      setShowNewExpenseCategoryForm(false);
    } catch (error: any) {
      console.error('Error creating expense category:', error);
      showError('Error al crear categoría', error.message || 'No se pudo crear la categoría');
    } finally {
      setSavingExpenseCategory(false);
    }
  };

  const handleDeleteExpenseCategory = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría de gastos?')) return;
    
    try {
      const cat = expenseCategories.find(c => c.id === id);
      await apiClient.deleteExpenseCategory(id);
      setExpenseCategories(prev => prev.filter(ec => ec.id !== id));
      showSuccess('Categoría eliminada', cat?.name || 'Categoría');
    } catch (error: any) {
      console.error('Error deleting expense category:', error);
      showError('Error al eliminar', error.message || 'No se pudo eliminar la categoría');
    }
  };

  // Connect MP account
  const handleConnectMP = async () => {
    if (!establishment?.id) return;
    
    setMpConnecting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/mp/oauth/authorize?establishmentId=${establishment.id}&type=establishment&redirectUrl=${encodeURIComponent(window.location.href)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
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
      alert('Error al conectar con Mercado Pago');
      setMpConnecting(false);
    }
  };

  // Disconnect MP account
  const handleDisconnectMP = async () => {
    if (!establishment?.id) return;
    
    if (!confirm('¿Estás seguro de desconectar tu cuenta de Mercado Pago? Los clientes no podrán pagar online.')) {
      return;
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/mp/oauth/disconnect/${establishment.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );
      
      if (response.ok) {
        setMpStatus({ connected: false, loading: false });
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting MP:', error);
      alert('Error al desconectar Mercado Pago');
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'business', name: 'Horarios', icon: Clock },
    { id: 'staff', name: 'Personal', icon: Users },
    { id: 'booking', name: 'Reservas', icon: Calendar },
    // { id: 'notifications', name: 'Notificaciones', icon: Mail }, // Temporarily hidden
    { id: 'payments', name: 'Pagos', icon: CreditCard },
    // { id: 'security', name: 'Seguridad', icon: Shield } // Temporarily hidden
  ];

  const handleConfigChange = (section: string, field: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [section]: typeof prev[section as keyof typeof prev] === 'object' 
        ? { ...prev[section as keyof typeof prev] as any, [field]: value }
        : value
    }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Update establishment data in context
      const updatedEstablishment = {
        ...establishment,
        name: config.establishmentName,
        slug: config.slug,
        logo: config.logo,
        description: config.description,
        address: config.address,
        city: config.city,
        latitude: config.latitude,
        longitude: config.longitude,
        phone: config.phone,
        email: config.email,
        // Include schedule/opening hours
        schedule: config.businessHours,
        closedDates: config.closedDates,
        useNationalHolidays: config.nationalHolidays,
        // Include gallery images
        images: config.galleryImages,
        // Include deposit/seña configuration
        requireDeposit: config.requireDeposit,
        depositType: config.depositType,
        depositPercentage: config.depositPercentage,
        depositFixedAmount: config.depositFixedAmount,
        allowFullPayment: config.allowFullPayment,
        // Include booking restrictions
        maxAdvanceBookingDays: config.maxAdvanceBookingDays,
        minAdvanceBookingHours: config.minAdvanceBookingHours,
        allowSameDayBooking: config.allowSameDayBooking,
        cancellationDeadlineHours: config.cancellationDeadlineHours,
        // Include cancellation policy
        cancellationPolicy: config.cancellationPolicy,
        refundPercentage: config.refundPercentage,
        // Include no-show penalty
        noShowPenalty: config.noShowPenalty,
        noShowPenaltyType: config.noShowPenaltyType,
        noShowPenaltyPercentage: config.noShowPenaltyPercentage,
        // Include deposit payment deadline
        depositPaymentDeadlineHours: config.depositPaymentDeadlineHours,
        // Include social media
        instagram: config.instagram,
        facebook: config.facebook,
        twitter: config.twitter
      };
      
      await updateEstablishment(updatedEstablishment);
      
      // Save theme configuration to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('dashboardThemeConfig', JSON.stringify({
          darkMode: config.darkMode,
          primaryColor: config.primaryColor,
          accentColor: config.accentColor
        }));
      }
      
      // Apply theme permanently
      applyThemePreview(config.primaryColor, config.accentColor);
      
      setUnsavedChanges(false);
      showSuccess('Configuración guardada', 'Los cambios se aplicaron correctamente');
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      showError('Error al guardar', error.message || 'No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información del Establecimiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo and Name Row */}
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-6">
            {/* Logo Upload */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Logo</label>
              <div className="relative">
                <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                  {config.logo ? (
                    <img 
                      src={config.logo.startsWith('http') ? config.logo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}${config.logo}`}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-gray-500" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && establishment?.id) {
                      const formData = new FormData();
                      formData.append('logo', file);
                      try {
                        const token = localStorage.getItem('auth_token');
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/upload/logo/${establishment.id}`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` },
                          body: formData
                        });
                        const data = await response.json();
                        if (data.success) {
                          setConfig((prev: any) => ({ ...prev, logo: data.url }));
                          setUnsavedChanges(true);
                        }
                      } catch (err) {
                        console.error('Error uploading logo:', err);
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-gray-500 text-xs">Click para cambiar</p>
                {config.logo && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfig((prev: any) => ({ ...prev, logo: '' }));
                      setUnsavedChanges(true);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
            
            {/* Name Field */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Nombre del Establecimiento</label>
              <input
                type="text"
                value={config.establishmentName}
                onChange={(e) => {
                  setConfig((prev: any) => ({ ...prev, establishmentName: e.target.value }));
                  setUnsavedChanges(true);
                }}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                suppressHydrationWarning={true}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Link de Reservas (Slug)
            </label>
            <div className="flex items-center">
              <span className="px-4 py-2 bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 border-r-0 rounded-l-xl text-gray-500 dark:text-gray-400 text-sm">
                {typeof window !== 'undefined' ? window.location.origin : ''}/reservar/
              </span>
              <input
                type="text"
                value={config.slug}
                onChange={(e) => {
                  // Only allow lowercase letters, numbers, and hyphens
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  setConfig((prev: any) => ({ ...prev, slug: value }));
                  setUnsavedChanges(true);
                }}
                placeholder="mi-establecimiento"
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                suppressHydrationWarning={true}
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Solo letras minúsculas, números y guiones. Este será el link público para que tus clientes reserven.
            </p>
            {config.slug && (
              <p className="text-emerald-400 text-sm mt-2">
                Link: <span className="font-mono">{typeof window !== 'undefined' ? window.location.origin : ''}/reservar/{config.slug}</span>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Teléfono</label>
            <PhoneInput
              value={config.phone}
              onChange={(value) => {
                setConfig(prev => ({ ...prev, phone: value }));
                setUnsavedChanges(true);
              }}
              placeholder="Número de teléfono"
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, email: e.target.value }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              suppressHydrationWarning={true}
            />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Dirección
            </label>
            <GooglePlacesAutocomplete
              value={config.address}
              onChange={(value) => {
                setConfig(prev => ({ ...prev, address: value }));
                setUnsavedChanges(true);
              }}
              onPlaceSelect={(place) => {
                if (place.formatted_address) {
                  setConfig(prev => ({ ...prev, address: place.formatted_address }));
                }
                
                // Extract province and coordinates
                if (place.address_components) {
                  place.address_components.forEach((component: any) => {
                    if (component.types.includes('administrative_area_level_1')) {
                      // Map province name to code
                      const province = ARGENTINA_PROVINCES.find(p => 
                        p.name.toLowerCase().includes(component.long_name.toLowerCase()) ||
                        component.long_name.toLowerCase().includes(p.name.toLowerCase())
                      );
                      if (province) {
                        setConfig(prev => ({ ...prev, city: province.name }));
                      }
                    }
                  });
                }
                
                if (place.geometry && place.geometry.location) {
                  setConfig(prev => ({
                    ...prev,
                    latitude: place.geometry.location.lat(),
                    longitude: place.geometry.location.lng()
                  }));
                }
                
                setUnsavedChanges(true);
              }}
              placeholder="Ej: Av. Corrientes 1234"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              types={['address']}
            />
            {config.latitude && config.longitude && (
              <p className="text-emerald-400 text-xs mt-2">
                📍 Coordenadas: {config.latitude}, {config.longitude}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Provincia</label>
            <select
              value={config.city}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, city: e.target.value }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Selecciona una provincia</option>
              {ARGENTINA_PROVINCES.map((province) => (
                <option key={province.code} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Descripción</label>
          {/* Rich Text Editor Toolbar */}
          <div className="flex items-center space-x-1 p-2 bg-gray-200 dark:bg-gray-600 rounded-t-xl border border-gray-300 dark:border-gray-500 border-b-0">
            <button
              type="button"
              className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Negrita"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Cursiva"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Lista"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Enlace"
            >
              <Link className="h-4 w-4" />
            </button>
          </div>
          <textarea
            value={config.description}
            onChange={(e) => {
              setConfig(prev => ({ ...prev, description: e.target.value }));
              setUnsavedChanges(true);
            }}
            rows={5}
            placeholder="Describe tu establecimiento: instalaciones, servicios, horarios especiales, promociones..."
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-b-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 resize-none"
            suppressHydrationWarning={true}
          />
          <p className="text-xs text-gray-400 mt-1">
            {config.description.length}/1000 caracteres
          </p>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Redes Sociales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <Instagram className="h-4 w-4 text-pink-400" />
                <span>Instagram</span>
              </div>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
              <input
                type="text"
                value={config.instagram}
                onChange={(e) => {
                  setConfig(prev => ({ ...prev, instagram: e.target.value }));
                  setUnsavedChanges(true);
                }}
                placeholder="tu_establecimiento"
                className="w-full pl-8 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <Facebook className="h-4 w-4 text-blue-400" />
                <span>Facebook</span>
              </div>
            </label>
            <input
              type="text"
              value={config.facebook}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, facebook: e.target.value }));
                setUnsavedChanges(true);
              }}
              placeholder="https://facebook.com/tu-pagina"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <Twitter className="h-4 w-4 text-sky-400" />
                <span>Twitter / X</span>
              </div>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
              <input
                type="text"
                value={config.twitter}
                onChange={(e) => {
                  setConfig(prev => ({ ...prev, twitter: e.target.value }));
                  setUnsavedChanges(true);
                }}
                placeholder="tu_establecimiento"
                className="w-full pl-8 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-emerald-400" />
                <span>Sitio Web</span>
              </div>
            </label>
            <input
              type="url"
              value={config.website}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, website: e.target.value }));
                setUnsavedChanges(true);
              }}
              placeholder="https://www.tu-sitio.com"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Galería de Fotos</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Arrastra para reordenar las imágenes</p>
          </div>
          <label className={`flex items-center space-x-2 px-4 py-2 text-white rounded-xl cursor-pointer transition-colors ${
            uploadingImages ? 'bg-gray-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}>
            <Upload className={`h-4 w-4 ${uploadingImages ? 'animate-spin' : ''}`} />
            <span>{uploadingImages ? 'Subiendo...' : 'Subir Fotos'}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              disabled={uploadingImages}
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                
                setUploadingImages(true);
                try {
                  const uploadedUrls: string[] = [];
                  for (const file of files) {
                    const result = await apiClient.uploadImage(file);
                    if (result.success) {
                      uploadedUrls.push(result.url);
                    }
                  }
                  
                  if (uploadedUrls.length > 0) {
                    setConfig((prev: any) => ({
                      ...prev,
                      galleryImages: [...prev.galleryImages, ...uploadedUrls]
                    }));
                    setUnsavedChanges(true);
                  }
                } catch (error) {
                  console.error('Error uploading images:', error);
                  alert('Error al subir las imágenes');
                } finally {
                  setUploadingImages(false);
                  // Reset input
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
          </label>
        </div>
        
        {config.galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {config.galleryImages.map((image: string, index: number) => (
              <div
                key={index}
                className="relative group aspect-video bg-gray-700 rounded-lg overflow-hidden cursor-move"
              >
                <img
                  src={apiClient.getImageUrl(image)}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    title="Mover"
                  >
                    <GripVertical className="h-4 w-4 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfig((prev: any) => ({
                        ...prev,
                        galleryImages: prev.galleryImages.filter((_: string, i: number) => i !== index)
                      }));
                      setUnsavedChanges(true);
                    }}
                    className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center">
            <ImageIcon className="h-12 w-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No hay fotos en la galería</p>
            <p className="text-sm text-gray-500">
              Sube fotos de tus instalaciones, canchas y servicios
            </p>
          </div>
        )}
        
        {config.galleryImages.length > 0 && (
          <p className="text-sm text-gray-400 mt-4">
            {config.galleryImages.length} foto{config.galleryImages.length !== 1 ? 's' : ''} • La primera foto será la imagen principal
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuración Regional</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Zona Horaria</label>
            <select
              value={config.timezone}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, timezone: e.target.value }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
              <option value="America/Argentina/Cordoba">Córdoba (GMT-3)</option>
              <option value="America/Argentina/Mendoza">Mendoza (GMT-3)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Idioma</label>
            <select
              value={config.language}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, language: e.target.value }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Moneda</label>
            <select
              value={config.currency}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, currency: e.target.value }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ARS">Peso Argentino (ARS)</option>
              <option value="USD">Dólar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Horarios de Funcionamiento</h3>
        <div className="space-y-4">
          {Object.entries(config.businessHours).map(([day, hours]) => {
            const dayHours = hours as { open: string; close: string; closed: boolean };
            return (
              <div key={day} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-20">
                    <span className="text-gray-900 dark:text-white font-medium capitalize">
                      {day === 'monday' ? 'Lunes' :
                       day === 'tuesday' ? 'Martes' :
                       day === 'wednesday' ? 'Miércoles' :
                       day === 'thursday' ? 'Jueves' :
                       day === 'friday' ? 'Viernes' :
                       day === 'saturday' ? 'Sábado' : 'Domingo'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!dayHours.closed}
                      onChange={(e) => handleConfigChange('businessHours', day, { ...dayHours, closed: !e.target.checked })}
                      className="rounded border-gray-400 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-600 dark:text-gray-300">Abierto</span>
                  </div>
                </div>
                {!dayHours.closed && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">Desde:</span>
                      <input
                        type="time"
                        value={dayHours.open}
                        onChange={(e) => handleConfigChange('businessHours', day, { ...dayHours, open: e.target.value })}
                        className="px-3 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">Hasta:</span>
                      <input
                        type="time"
                        value={dayHours.close}
                        onChange={(e) => handleConfigChange('businessHours', day, { ...dayHours, close: e.target.value })}
                        className="px-3 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Closed Days Section - Annual Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Días Cerrados</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500"></div>
              <span className="text-gray-400">Cerrado manual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500/30 border border-orange-500"></div>
              <span className="text-gray-400">Feriado nacional</span>
            </div>
          </div>
        </div>
        
        {/* National Holidays Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium">Feriados Nacionales</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Marcar automáticamente los feriados de Argentina como cerrados</p>
            </div>
          </div>
          <button
            onClick={() => {
              setConfig((prev: any) => ({ ...prev, nationalHolidays: !prev.nationalHolidays }));
              setUnsavedChanges(true);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.nationalHolidays ? 'bg-emerald-600' : 'bg-gray-600'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              config.nationalHolidays ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Annual Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, monthIndex) => {
            const year = new Date().getFullYear();
            const firstDay = new Date(year, monthIndex, 1);
            const lastDay = new Date(year, monthIndex + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startDayOfWeek = firstDay.getDay();
            
            const monthName = firstDay.toLocaleDateString('es-AR', { month: 'long' });
            
            return (
              <div key={monthIndex} className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3">
                <h4 className="text-gray-900 dark:text-white font-medium text-center mb-2 capitalize">{monthName}</h4>
                
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-xs text-gray-500 font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: startDayOfWeek }, (_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}
                  
                  {/* Actual days */}
                  {Array.from({ length: daysInMonth }, (_, dayIndex) => {
                    const day = dayIndex + 1;
                    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isManualClosed = config.closedDates.includes(dateStr);
                    const holiday = NATIONAL_HOLIDAYS.find(h => h.date === dateStr);
                    const isHoliday = holiday && config.nationalHolidays;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    
                    const toggleDate = () => {
                      if (isManualClosed) {
                        // Remove from closed dates
                        setConfig((prev: any) => ({
                          ...prev,
                          closedDates: prev.closedDates.filter((d: string) => d !== dateStr)
                        }));
                      } else {
                        // Add to closed dates
                        setConfig((prev: any) => ({
                          ...prev,
                          closedDates: [...prev.closedDates, dateStr].sort()
                        }));
                      }
                      setUnsavedChanges(true);
                    };
                    
                    return (
                      <button
                        key={day}
                        onClick={toggleDate}
                        title={holiday?.name || (isManualClosed ? 'Cerrado - Click para abrir' : 'Click para cerrar')}
                        className={`
                          aspect-square flex items-center justify-center text-xs rounded transition-all cursor-pointer hover:scale-110
                          ${isToday ? 'ring-2 ring-emerald-500' : ''}
                          ${isManualClosed 
                            ? 'bg-red-500/30 border border-red-500 text-red-400 dark:text-red-300' 
                            : isHoliday 
                              ? 'bg-orange-500/30 border border-orange-500 text-orange-400 dark:text-orange-300'
                              : 'bg-gray-200 dark:bg-gray-600/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CalendarX className="h-4 w-4 text-red-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {config.closedDates.length} día{config.closedDates.length !== 1 ? 's' : ''} cerrado{config.closedDates.length !== 1 ? 's' : ''} manualmente
              </span>
            </div>
            {config.nationalHolidays && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-400" />
                <span className="text-gray-600 dark:text-gray-300">
                  {NATIONAL_HOLIDAYS.filter(h => new Date(h.date).getFullYear() === new Date().getFullYear()).length} feriados nacionales
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Staff Management Tab
  const renderStaffTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usuarios del Establecimiento</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Gestiona el acceso del personal al sistema</p>
          </div>
          <button
            onClick={() => {
              setEditingStaff(null);
              setNewStaff({ name: '', email: '', phone: '', password: '', role: 'employee', allowedSections: ['reservas', 'canchas', 'clientes', 'resenas', 'marketing', 'cupones', 'ventas', 'gastos', 'stock', 'cuentas', 'analytics', 'finanzas', 'integraciones', 'caja', 'configuracion'] });
              setShowStaffModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Agregar Usuario</span>
          </button>
        </div>

        {/* Role Legend */}
        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
          {Object.entries(ROLE_LABELS).map(([key, { label, color, icon: Icon }]) => (
            <div key={key} className="flex items-center space-x-2">
              <div className={`p-1.5 rounded ${color}`}>
                <Icon className="h-3 w-3" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
            </div>
          ))}
        </div>

        {/* Staff List */}
        {staffLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400">Cargando usuarios...</p>
          </div>
        ) : staffList.length > 0 ? (
          <div className="space-y-3">
            {staffList.map((staff) => {
              const roleInfo = ROLE_LABELS[staff.role];
              const RoleIcon = roleInfo?.icon || User;
              return (
                <div
                  key={staff.id}
                  className={`flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg ${
                    !staff.isActive ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${roleInfo?.color || 'bg-gray-600'}`}>
                      <RoleIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-gray-900 dark:text-white font-medium">{staff.name}</h4>
                        {!staff.isActive && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{staff.email}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-500 text-xs">{roleInfo?.label}</p>
                        {staff.phone && <p className="text-gray-500 text-xs">• {staff.phone}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingStaff(staff);
                        setNewStaff({
                          name: staff.name,
                          email: staff.email,
                          phone: staff.phone || '',
                          password: '',
                          role: staff.role || 'employee',
                          allowedSections: staff.allowedSections || ['reservas', 'canchas', 'clientes', 'resenas', 'marketing', 'cupones', 'ventas', 'gastos', 'stock', 'cuentas', 'analytics', 'finanzas', 'integraciones', 'caja', 'configuracion'],
                        });
                        setShowStaffModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!establishment?.id) return;
                        const newStatus = !staff.isActive;
                        try {
                          await apiClient.updateStaff(establishment.id, staff.id, { isActive: newStatus });
                          await loadStaff();
                        } catch (error) {
                          console.error('Error updating staff status:', error);
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        staff.isActive 
                          ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' 
                          : 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10'
                      }`}
                      title={staff.isActive ? 'Desactivar' : 'Activar'}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!establishment?.id) return;
                        if (confirm(`¿Estás seguro de eliminar a ${staff.name}?`)) {
                          try {
                            await apiClient.deleteStaff(establishment.id, staff.id);
                            await loadStaff();
                          } catch (error) {
                            console.error('Error deleting staff:', error);
                          }
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No hay usuarios registrados</p>
            <p className="text-gray-500 text-sm">
              Agrega usuarios para que puedan acceder al sistema
            </p>
          </div>
        )}
      </div>

      {/* Staff Sidebar */}
      <AnimatePresence>
        {showStaffModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowStaffModal(false); setEditingStaff(null); }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-md bg-gray-800 border-l border-gray-700 z-[9999] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">
                  {editingStaff ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
                <button
                  onClick={() => { setShowStaffModal(false); setEditingStaff(null); }}
                  className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre completo *</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  placeholder="juan@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña {editingStaff ? '(dejar vacío para mantener)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newStaff.password}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 pr-10"
                    placeholder={editingStaff ? '••••••••' : 'Mínimo 6 caracteres'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rol *</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="admin">Administrador</option>
                  <option value="employee">Empleado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Secciones permitidas</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'reservas', label: 'Reservas', icon: Calendar },
                    { id: 'canchas', label: 'Canchas', icon: Building2 },
                    { id: 'clientes', label: 'Clientes', icon: Users },
                    { id: 'resenas', label: 'Reseñas', icon: Star },
                    { id: 'marketing', label: 'Marketing', icon: Megaphone },
                    { id: 'cupones', label: 'Cupones', icon: Ticket },
                    { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
                    { id: 'gastos', label: 'Gastos', icon: Receipt },
                    { id: 'stock', label: 'Stock', icon: Package },
                    { id: 'cuentas', label: 'Cuentas', icon: Wallet },
                    { id: 'analytics', label: 'Análisis', icon: BarChart3 },
                    { id: 'finanzas', label: 'Finanzas', icon: TrendingUp },
                    { id: 'integraciones', label: 'Integrac.', icon: Link2 },
                    { id: 'caja', label: 'Caja', icon: DollarSign },
                    { id: 'configuracion', label: 'Config.', icon: Settings },
                  ].map(section => {
                    const isSelected = newStaff.allowedSections.includes(section.id);
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewStaff(prev => ({ ...prev, allowedSections: prev.allowedSections.filter(s => s !== section.id) }));
                          } else {
                            setNewStaff(prev => ({ ...prev, allowedSections: [...prev.allowedSections, section.id] }));
                          }
                        }}
                        className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{section.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowStaffModal(false);
                  setEditingStaff(null);
                  setNewStaff({ name: '', email: '', phone: '', password: '', role: 'employee', allowedSections: ['reservas', 'canchas', 'clientes', 'resenas', 'marketing', 'cupones', 'ventas', 'gastos', 'stock', 'cuentas', 'analytics', 'finanzas', 'integraciones', 'caja', 'configuracion'] });
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                disabled={staffSaving}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!establishment?.id) return;
                  
                  // Validate
                  if (!newStaff.name || !newStaff.email) {
                    alert('Nombre y email son requeridos');
                    return;
                  }
                  if (!editingStaff && (!newStaff.password || newStaff.password.length < 6)) {
                    alert('La contraseña debe tener al menos 6 caracteres');
                    return;
                  }
                  
                  setStaffSaving(true);
                  try {
                    if (editingStaff) {
                      // Update existing
                      const updateData: any = {
                        name: newStaff.name,
                        email: newStaff.email,
                        phone: newStaff.phone,
                        role: newStaff.role,
                        allowedSections: newStaff.allowedSections
                      };
                      if (newStaff.password) {
                        updateData.password = newStaff.password;
                      }
                      await apiClient.updateStaff(establishment.id, editingStaff.id, updateData);
                    } else {
                      // Create new
                      await apiClient.createStaff(establishment.id, {
                        name: newStaff.name,
                        email: newStaff.email,
                        phone: newStaff.phone,
                        password: newStaff.password,
                        role: newStaff.role,
                        allowedSections: newStaff.allowedSections
                      });
                    }
                    
                    // Reload staff list
                    await loadStaff();
                    setShowStaffModal(false);
                    setEditingStaff(null);
                    setNewStaff({ name: '', email: '', phone: '', password: '', role: 'employee', allowedSections: ['reservas', 'canchas', 'clientes', 'resenas', 'marketing', 'cupones', 'ventas', 'gastos', 'stock', 'cuentas', 'analytics', 'finanzas', 'integraciones', 'caja', 'configuracion'] });
                  } catch (error: any) {
                    console.error('Error saving staff:', error);
                    alert(error.message || 'Error al guardar usuario');
                  } finally {
                    setStaffSaving(false);
                  }
                }}
                disabled={!newStaff.name || !newStaff.email || (!editingStaff && !newStaff.password) || staffSaving}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center space-x-2"
              >
                {staffSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>{editingStaff ? 'Guardar Cambios' : 'Crear Usuario'}</span>
              </button>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  const renderBookingTab = () => (
    <div className="space-y-6">
      {/* General Booking Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuración General de Reservas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Días máximos de anticipación</label>
            <input
              type="number"
              value={config.maxAdvanceBookingDays}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, maxAdvanceBookingDays: parseInt(e.target.value) }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-gray-400 mt-1">Cuántos días en el futuro se puede reservar</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Horas mínimas de anticipación</label>
            <input
              type="number"
              value={config.minAdvanceBookingHours}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, minAdvanceBookingHours: parseInt(e.target.value) }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-gray-400 mt-1">Tiempo mínimo antes del horario reservado</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium">Permitir reservas el mismo día</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Los clientes pueden hacer reservas para el día actual</p>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, allowSameDayBooking: !prev.allowSameDayBooking }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.allowSameDayBooking ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.allowSameDayBooking ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Deposit/Seña Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuración de Señas</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Define cómo se manejan los pagos anticipados</p>
          </div>
          <button
            onClick={() => {
              setConfig(prev => ({ ...prev, requireDeposit: !prev.requireDeposit }));
              setUnsavedChanges(true);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.requireDeposit ? 'bg-emerald-600' : 'bg-gray-600'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              config.requireDeposit ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {config.requireDeposit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6"
          >
            {/* Deposit Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Tipo de seña</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setConfig(prev => ({ ...prev, depositType: 'percentage' }));
                    setUnsavedChanges(true);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    config.depositType === 'percentage'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-2">%</div>
                  <div className="text-gray-900 dark:text-white font-medium">Porcentaje</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Del total de la reserva</div>
                </button>
                <button
                  onClick={() => {
                    setConfig(prev => ({ ...prev, depositType: 'fixed' }));
                    setUnsavedChanges(true);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    config.depositType === 'fixed'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-2">$</div>
                  <div className="text-gray-900 dark:text-white font-medium">Monto Fijo</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Cantidad específica</div>
                </button>
              </div>
            </div>

            {/* Deposit Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.depositType === 'percentage' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Porcentaje de seña</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={config.depositPercentage}
                      onChange={(e) => {
                        setConfig(prev => ({ ...prev, depositPercentage: parseInt(e.target.value) || 0 }));
                        setUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Ej: Para una reserva de $10.000, la seña será ${(10000 * config.depositPercentage / 100).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Monto fijo de seña</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      min="0"
                      value={config.depositFixedAmount}
                      onChange={(e) => {
                        setConfig(prev => ({ ...prev, depositFixedAmount: parseInt(e.target.value) || 0 }));
                        setUnsavedChanges(true);
                      }}
                      className="w-full pl-8 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Monto fijo independiente del precio de la reserva</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Tiempo límite para pagar seña</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={config.depositPaymentDeadlineHours}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, depositPaymentDeadlineHours: parseInt(e.target.value) || 1 }));
                      setUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">horas</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">La reserva se cancela si no se paga en este tiempo</p>
              </div>
            </div>

            {/* Full Payment Option */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.allowFullPayment}
                  onChange={(e) => {
                    setConfig(prev => ({ ...prev, allowFullPayment: e.target.checked }));
                    setUnsavedChanges(true);
                  }}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-gray-900 dark:text-white font-medium">Permitir pago completo online</span>
                  <p className="text-xs text-gray-400">Los clientes podrán elegir entre pagar solo la seña o el monto completo</p>
                </div>
              </label>
            </div>

            {/* Preview */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <h4 className="text-emerald-600 dark:text-emerald-400 font-medium mb-2">Vista previa</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {config.depositType === 'percentage' 
                  ? `Se requerirá el ${config.depositPercentage}% del total como seña.`
                  : `Se requerirá $${config.depositFixedAmount.toLocaleString()} como seña fija.`}
                {' '}El cliente tendrá {config.depositPaymentDeadlineHours} hora{config.depositPaymentDeadlineHours !== 1 ? 's' : ''} para completar el pago.
                {config.allowFullPayment && ' También podrán optar por pagar el monto completo.'}
              </p>
            </div>
          </motion.div>
        )}

        {!config.requireDeposit && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Sin seña requerida, las reservas se confirman sin pago anticipado.
            </p>
          </div>
        )}
      </div>

      {/* Cancellation Policy */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Política de Cancelación</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Horas límite para cancelar</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={config.cancellationDeadlineHours}
                onChange={(e) => {
                  setConfig(prev => ({ ...prev, cancellationDeadlineHours: parseInt(e.target.value) || 0 }));
                  setUnsavedChanges(true);
                }}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">horas</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Antes del horario de la reserva</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Política de reembolso</label>
            <select
              value={config.cancellationPolicy}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, cancellationPolicy: e.target.value as any }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="full_refund">Reembolso total</option>
              <option value="partial_refund">Reembolso parcial</option>
              <option value="credit">Crédito para futuras reservas</option>
              <option value="no_refund">Sin reembolso</option>
            </select>
          </div>
        </div>

        {config.cancellationPolicy === 'partial_refund' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Porcentaje de reembolso</label>
            <div className="relative w-full md:w-1/2">
              <input
                type="number"
                min="0"
                max="100"
                value={config.refundPercentage}
                onChange={(e) => {
                  setConfig(prev => ({ ...prev, refundPercentage: parseInt(e.target.value) || 0 }));
                  setUnsavedChanges(true);
                }}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Del monto pagado (seña o total)</p>
          </div>
        )}

        {/* No-Show Penalty */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium">Penalidad por no asistir</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Cobrar cuando el cliente no se presenta</p>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, noShowPenalty: !prev.noShowPenalty }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.noShowPenalty ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.noShowPenalty ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {config.noShowPenalty && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Tipo de penalidad</label>
                <select
                  value={config.noShowPenaltyType}
                  onChange={(e) => {
                    setConfig(prev => ({ ...prev, noShowPenaltyType: e.target.value as any }));
                    setUnsavedChanges(true);
                  }}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="full_charge">Cobrar el total de la reserva</option>
                  <option value="deposit_only">Solo retener la seña</option>
                  <option value="percentage">Porcentaje personalizado</option>
                </select>
              </div>
              {config.noShowPenaltyType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Porcentaje de penalidad</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={config.noShowPenaltyPercentage}
                      onChange={(e) => {
                        setConfig(prev => ({ ...prev, noShowPenaltyPercentage: parseInt(e.target.value) || 0 }));
                        setUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Policy Summary */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h4 className="text-blue-600 dark:text-blue-400 font-medium mb-2">Resumen de política</h4>
          <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-1">
            <li>• Cancelación permitida hasta {config.cancellationDeadlineHours} horas antes</li>
            <li>• Al cancelar a tiempo: {
              config.cancellationPolicy === 'full_refund' ? 'Reembolso total' :
              config.cancellationPolicy === 'partial_refund' ? `Reembolso del ${config.refundPercentage}%` :
              config.cancellationPolicy === 'credit' ? 'Crédito para futuras reservas' :
              'Sin reembolso'
            }</li>
            {config.noShowPenalty && (
              <li>• No asiste: {
                config.noShowPenaltyType === 'full_charge' ? 'Se cobra el total' :
                config.noShowPenaltyType === 'deposit_only' ? 'Se retiene la seña' :
                `Se cobra el ${config.noShowPenaltyPercentage}%`
              }</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Canales de Notificación</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-400" />
              <div>
                <h4 className="text-white font-medium">Notificaciones por Email</h4>
                <p className="text-gray-400 text-sm">Recibir notificaciones por correo electrónico</p>
              </div>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.emailNotifications ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-green-400" />
              <div>
                <h4 className="text-white font-medium">Notificaciones SMS</h4>
                <p className="text-gray-400 text-sm">Recibir notificaciones por mensaje de texto</p>
              </div>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, smsNotifications: !prev.smsNotifications }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.smsNotifications ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.smsNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-purple-400" />
              <div>
                <h4 className="text-white font-medium">Notificaciones Push</h4>
                <p className="text-gray-400 text-sm">Recibir notificaciones en el navegador</p>
              </div>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.pushNotifications ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.pushNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Tipos de Notificación</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Nuevas reservas</h4>
              <p className="text-gray-400 text-sm">Notificar cuando se realice una nueva reserva</p>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, notifyNewBookings: !prev.notifyNewBookings }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.notifyNewBookings ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.notifyNewBookings ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Cancelaciones</h4>
              <p className="text-gray-400 text-sm">Notificar cuando se cancele una reserva</p>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, notifyCancellations: !prev.notifyCancellations }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.notifyCancellations ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.notifyCancellations ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Pagos recibidos</h4>
              <p className="text-gray-400 text-sm">Notificar cuando se reciba un pago</p>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, notifyPayments: !prev.notifyPayments }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.notifyPayments ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.notifyPayments ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-6">
      {/* Payment Methods for Admin Dashboard */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Métodos de Pago</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Métodos de pago disponibles para reservas y ventas desde el panel de administración</p>
          </div>
          <button
            onClick={() => setShowNewPaymentMethodForm(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar</span>
          </button>
        </div>
        
        {paymentMethodsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method.isActive ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-gray-200 dark:bg-gray-600/50'}`}>
                    {method.code === 'cash' && <DollarSign className={`h-5 w-5 ${method.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`} />}
                    {method.code === 'transfer' && <Building2 className={`h-5 w-5 ${method.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />}
                    {(method.code === 'credit_card' || method.code === 'debit_card') && <CreditCard className={`h-5 w-5 ${method.isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`} />}
                    {!['cash', 'transfer', 'credit_card', 'debit_card'].includes(method.code) && <DollarSign className={`h-5 w-5 ${method.isActive ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500'}`} />}
                  </div>
                  <div>
                    <h4 className={`font-medium ${method.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{method.name}</h4>
                    <p className="text-gray-500 text-xs">{method.code}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleTogglePaymentMethod(method.id, method.isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      method.isActive ? 'bg-emerald-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      method.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            ))}
            
            {paymentMethods.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay métodos de pago configurados</p>
                <p className="text-sm">Se crearán los métodos por defecto automáticamente</p>
              </div>
            )}
          </div>
        )}
        
        {/* New Payment Method Form */}
        {showNewPaymentMethodForm && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="text-gray-900 dark:text-white font-medium mb-3">Nuevo Método de Pago</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newPaymentMethod.name}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Cheque, Cuenta corriente..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Código (identificador único)</label>
                <input
                  type="text"
                  value={newPaymentMethod.code}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Ej: cheque, cuenta_corriente..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCreatePaymentMethod}
                  disabled={savingPaymentMethod || !newPaymentMethod.name || !newPaymentMethod.code}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {savingPaymentMethod ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    setShowNewPaymentMethodForm(false);
                    setNewPaymentMethod({ name: '', code: '' });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expense Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Categorías de Gastos</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Categorías para clasificar los gastos y egresos de caja</p>
          </div>
          <button
            onClick={() => setShowNewExpenseCategoryForm(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar</span>
          </button>
        </div>

        {expenseCategoriesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {expenseCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color + '30' }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <div>
                    <p className={`font-medium ${category.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                      {category.name}
                    </p>
                    {category.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleExpenseCategory(category.id, category.isActive)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      category.isActive 
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                        : 'bg-gray-600/50 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {category.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                  <button
                    onClick={() => handleDeleteExpenseCategory(category.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {expenseCategories.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay categorías de gastos configuradas</p>
                <p className="text-sm">Agrega categorías para clasificar los egresos de caja</p>
              </div>
            )}
          </div>
        )}
        
        {/* New Expense Category Form */}
        {showNewExpenseCategoryForm && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="text-gray-900 dark:text-white font-medium mb-3">Nueva Categoría de Gastos</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={newExpenseCategory.name}
                  onChange={(e) => setNewExpenseCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Limpieza, Mantenimiento, Insumos..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={newExpenseCategory.description}
                  onChange={(e) => setNewExpenseCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción de la categoría..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={newExpenseCategory.color}
                    onChange={(e) => setNewExpenseCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={newExpenseCategory.color}
                    onChange={(e) => setNewExpenseCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateExpenseCategory}
                  disabled={savingExpenseCategory || !newExpenseCategory.name}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {savingExpenseCategory ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    setShowNewExpenseCategoryForm(false);
                    setNewExpenseCategory({ name: '', description: '', color: '#6B7280' });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mercado Pago for Customer Self-Service */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mercado Pago (Reservas Online)</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Para que los clientes paguen señas al reservar online</p>
          </div>
          <button
            onClick={() => {
              setConfig(prev => ({ ...prev, mercadoPagoEnabled: !prev.mercadoPagoEnabled }));
              setUnsavedChanges(true);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.mercadoPagoEnabled ? 'bg-emerald-600' : 'bg-gray-600'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              config.mercadoPagoEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {config.mercadoPagoEnabled && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conectar Cuenta de Mercado Pago</h3>
          
          {mpStatus.loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
            </div>
          ) : mpStatus.connected ? (
            <div className="space-y-4">
              {/* Connected State */}
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 dark:text-white font-medium">Cuenta conectada</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {mpStatus.mpUserId}
                    {mpStatus.mpEmail && ` • ${mpStatus.mpEmail}`}
                  </p>
                  {mpStatus.connectedAt && (
                    <p className="text-xs text-gray-500">
                      Conectada el {new Date(mpStatus.connectedAt).toLocaleDateString('es-AR')}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">¿Cómo funciona?</h5>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <li>• Los pagos de reservas van directo a tu cuenta de Mercado Pago</li>
                  <li>• La plataforma cobra una pequeña comisión por servicio</li>
                  <li>• Recibís el dinero en tu cuenta automáticamente</li>
                </ul>
              </div>
              
              <button
                onClick={handleDisconnectMP}
                className="w-full py-2 px-4 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors text-sm"
              >
                Desconectar cuenta
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Not Connected State */}
              <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Conectá tu cuenta para recibir pagos</h5>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <li>• Recibí pagos de reservas directamente en tu cuenta</li>
                  <li>• Proceso seguro con un solo clic</li>
                  <li>• Sin necesidad de configurar credenciales manualmente</li>
                </ul>
              </div>
              
              <button
                onClick={handleConnectMP}
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
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Conectar con Mercado Pago
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Serás redirigido a Mercado Pago para autorizar la conexión
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Configuración de Seguridad</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Verificación de email obligatoria</h4>
              <p className="text-gray-400 text-sm">Los usuarios deben verificar su email para registrarse</p>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, requireEmailVerification: !prev.requireEmailVerification }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.requireEmailVerification ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Autenticación de dos factores</h4>
              <p className="text-gray-400 text-sm">Requerir 2FA para cuentas de administrador</p>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, enableTwoFactor: !prev.enableTwoFactor }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enableTwoFactor ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.enableTwoFactor ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tiempo de sesión (minutos)</label>
            <input
              type="number"
              value={config.sessionTimeout}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Longitud mínima de contraseña</label>
            <input
              type="number"
              value={config.passwordMinLength}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Header controls for topbar
  const headerControls = (
    <div className="flex items-center w-full space-x-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex-shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Save button and unsaved changes indicator */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        {unsavedChanges && (
          <div className="flex items-center space-x-2 text-yellow-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Cambios sin guardar</span>
          </div>
        )}
        <button 
          onClick={handleSave}
          disabled={!unsavedChanges || saving || loading}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            unsavedChanges && !saving && !loading
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Guardando...' : 'Guardar'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Render controls in header via portal */}
      {headerPortalContainer && createPortal(headerControls, headerPortalContainer)}
      
      <div className="p-6">
        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none p-6">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'business' && renderBusinessTab()}
          {activeTab === 'staff' && renderStaffTab()}
          {activeTab === 'booking' && renderBookingTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'payments' && renderPaymentsTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </div>
      </div>
    </>
  );
};

export default ConfigurationPage;
