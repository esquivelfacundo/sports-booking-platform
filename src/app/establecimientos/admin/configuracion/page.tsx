'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Save,
  RefreshCw,
  Bell,
  Shield,
  Globe,
  Clock,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Camera,
  Palette,
  Database,
  Key,
  Users,
  Calendar,
  CreditCard,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  Volume2,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';

const ConfigurationPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

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

  // Configuration state
  const [config, setConfig] = useState({
    // General Settings
    establishmentName: 'Club Deportivo Central',
    description: 'Centro deportivo con canchas de fútbol, tenis y paddle',
    address: 'Av. Libertador 1234, Buenos Aires',
    phone: '+54 11 4567-8900',
    email: 'info@clubcentral.com',
    website: 'www.clubcentral.com',
    timezone: 'America/Argentina/Buenos_Aires',
    language: 'es',
    currency: 'ARS',
    
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
    requireDeposit: true,
    depositPercentage: 50,
    
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

  // Load saved configuration on component mount
  useEffect(() => {
    const savedConfig = loadSavedConfig();
    if (savedConfig) {
      setConfig(prev => ({ ...prev, ...savedConfig }));
      // Apply saved theme immediately
      applyThemePreview(savedConfig.primaryColor || 'emerald', savedConfig.accentColor || 'cyan');
    }
  }, []);

  // Apply theme preview when colors change
  useEffect(() => {
    if (previewMode || activeTab === 'appearance') {
      applyThemePreview(config.primaryColor, config.accentColor);
    }
  }, [config.primaryColor, config.accentColor, previewMode, activeTab]);

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'business', name: 'Horarios', icon: Clock },
    { id: 'booking', name: 'Reservas', icon: Calendar },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'payments', name: 'Pagos', icon: CreditCard },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'appearance', name: 'Apariencia', icon: Palette }
  ];

  const handleConfigChange = (section: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: typeof prev[section as keyof typeof prev] === 'object' 
        ? { ...prev[section as keyof typeof prev] as any, [field]: value }
        : value
    }));
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    // Save configuration to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardThemeConfig', JSON.stringify({
        darkMode: config.darkMode,
        primaryColor: config.primaryColor,
        accentColor: config.accentColor
      }));
    }
    
    // Apply theme permanently
    applyThemePreview(config.primaryColor, config.accentColor);
    
    // Simulate save
    setTimeout(() => {
      setUnsavedChanges(false);
      alert('Configuración guardada exitosamente');
    }, 1000);
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Información del Establecimiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Establecimiento</label>
            <input
              type="text"
              value={config.establishmentName}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, establishmentName: e.target.value }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
              suppressHydrationWarning={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
            <input
              type="tel"
              value={config.phone}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, phone: e.target.value }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
              suppressHydrationWarning={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, email: e.target.value }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
              suppressHydrationWarning={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sitio Web</label>
            <input
              type="url"
              value={config.website}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, website: e.target.value }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
              suppressHydrationWarning={true}
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
          <input
            type="text"
            value={config.address}
            onChange={(e) => {
              setConfig(prev => ({ ...prev, address: e.target.value }));
              setUnsavedChanges(true);
            }}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
            suppressHydrationWarning={true}
          />
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
          <textarea
            value={config.description}
            onChange={(e) => {
              setConfig(prev => ({ ...prev, description: e.target.value }));
              setUnsavedChanges(true);
            }}
            rows={3}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
            suppressHydrationWarning={true}
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Configuración Regional</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Zona Horaria</label>
            <select
              value={config.timezone}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, timezone: e.target.value }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
              <option value="America/Argentina/Cordoba">Córdoba (GMT-3)</option>
              <option value="America/Argentina/Mendoza">Mendoza (GMT-3)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Idioma</label>
            <select
              value={config.language}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, language: e.target.value }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Moneda</label>
            <select
              value={config.currency}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, currency: e.target.value }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
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
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Horarios de Funcionamiento</h3>
        <div className="space-y-4">
          {Object.entries(config.businessHours).map(([day, hours]) => (
            <div key={day} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-20">
                  <span className="text-white font-medium capitalize">
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
                    checked={!hours.closed}
                    onChange={(e) => handleConfigChange('businessHours', day, { ...hours, closed: !e.target.checked })}
                    className="rounded border-gray-600 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-300">Abierto</span>
                </div>
              </div>
              {!hours.closed && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">Desde:</span>
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleConfigChange('businessHours', day, { ...hours, open: e.target.value })}
                      className="px-3 py-1 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">Hasta:</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleConfigChange('businessHours', day, { ...hours, close: e.target.value })}
                      className="px-3 py-1 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBookingTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Configuración de Reservas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Días máximos de anticipación</label>
            <input
              type="number"
              value={config.maxAdvanceBookingDays}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, maxAdvanceBookingDays: parseInt(e.target.value) }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Horas mínimas de anticipación</label>
            <input
              type="number"
              value={config.minAdvanceBookingHours}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, minAdvanceBookingHours: parseInt(e.target.value) }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Horas límite para cancelación</label>
            <input
              type="number"
              value={config.cancellationDeadlineHours}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, cancellationDeadlineHours: parseInt(e.target.value) }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Porcentaje de seña (%)</label>
            <input
              type="number"
              value={config.depositPercentage}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, depositPercentage: parseInt(e.target.value) }));
                setUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Permitir reservas el mismo día</h4>
              <p className="text-gray-400 text-sm">Los clientes pueden hacer reservas para el día actual</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Requerir seña</h4>
              <p className="text-gray-400 text-sm">Solicitar un pago parcial al momento de la reserva</p>
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
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Métodos de Pago Aceptados</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <h4 className="text-white font-medium">Efectivo</h4>
                <p className="text-gray-400 text-sm">Aceptar pagos en efectivo</p>
              </div>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, acceptCash: !prev.acceptCash }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.acceptCash ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.acceptCash ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-blue-400" />
              <div>
                <h4 className="text-white font-medium">Tarjetas de Crédito/Débito</h4>
                <p className="text-gray-400 text-sm">Aceptar pagos con tarjeta</p>
              </div>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, acceptCards: !prev.acceptCards }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.acceptCards ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.acceptCards ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-5 w-5 text-purple-400" />
              <div>
                <h4 className="text-white font-medium">Transferencias Bancarias</h4>
                <p className="text-gray-400 text-sm">Aceptar transferencias bancarias</p>
              </div>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, acceptTransfers: !prev.acceptTransfers }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.acceptTransfers ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.acceptTransfers ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Procesadores de Pago</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Mercado Pago</h4>
              <p className="text-gray-400 text-sm">Integración con Mercado Pago para Argentina</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Stripe</h4>
              <p className="text-gray-400 text-sm">Procesador de pagos internacional</p>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, stripeEnabled: !prev.stripeEnabled }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.stripeEnabled ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.stripeEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
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

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Tema y Apariencia</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Moon className="h-5 w-5 text-blue-400" />
              <div>
                <h4 className="text-white font-medium">Modo Oscuro</h4>
                <p className="text-gray-400 text-sm">Usar tema oscuro en la interfaz</p>
              </div>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, darkMode: !prev.darkMode }));
                setUnsavedChanges(true);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.darkMode ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.darkMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Color Primario</label>
            <div className="grid grid-cols-4 gap-3">
              {['emerald', 'blue', 'purple', 'orange'].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setConfig(prev => ({ ...prev, primaryColor: color }));
                    setUnsavedChanges(true);
                    setPreviewMode(true);
                  }}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    config.primaryColor === color ? 'border-white' : 'border-gray-600'
                  } ${
                    color === 'emerald' ? 'bg-emerald-500' :
                    color === 'blue' ? 'bg-blue-500' :
                    color === 'purple' ? 'bg-purple-500' : 'bg-orange-500'
                  }`}
                >
                  {config.primaryColor === color && (
                    <Check className="h-6 w-6 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Color de Acento</label>
            <div className="grid grid-cols-4 gap-3">
              {['cyan', 'pink', 'yellow', 'green'].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setConfig(prev => ({ ...prev, accentColor: color }));
                    setUnsavedChanges(true);
                    setPreviewMode(true);
                  }}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    config.accentColor === color ? 'border-white' : 'border-gray-600'
                  } ${
                    color === 'cyan' ? 'bg-cyan-500' :
                    color === 'pink' ? 'bg-pink-500' :
                    color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                >
                  {config.accentColor === color && (
                    <Check className="h-6 w-6 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Notice */}
          {previewMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4"
            >
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-400" />
                <div>
                  <h4 className="text-blue-400 font-medium">Vista Previa Activa</h4>
                  <p className="text-blue-300 text-sm">Los cambios se están mostrando en tiempo real. Guarda para aplicar permanentemente.</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Configuración</h1>
          <p className="text-gray-400 mt-1">Administra la configuración del sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          {unsavedChanges && (
            <div className="flex items-center space-x-2 text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Cambios sin guardar</span>
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={!unsavedChanges}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
              unsavedChanges 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="h-4 w-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'business' && renderBusinessTab()}
          {activeTab === 'booking' && renderBookingTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'payments' && renderPaymentsTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'appearance' && renderAppearanceTab()}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPage;
