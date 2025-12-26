'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye, 
  Moon, 
  Sun, 
  Globe, 
  Smartphone,
  Mail,
  Lock,
  Trash2,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsSectionProps {
  activeTab?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ activeTab: externalActiveTab }) => {
  const { user } = useAuth();
  const [internalActiveTab, setInternalActiveTab] = useState('notifications');
  const activeTab = externalActiveTab || internalActiveTab;
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      bookingReminders: true,
      matchInvitations: true,
      friendRequests: true,
      promotionalEmails: false,
    },
    privacy: {
      profileVisibility: 'public', // public, friends, private
      showLocation: true,
      showPhone: false,
      showEmail: false,
      showStats: true,
      allowFriendRequests: true,
    },
    preferences: {
      theme: 'dark', // dark, light, system
      language: 'es',
      timezone: 'America/Argentina/Buenos_Aires',
      currency: 'ARS',
      distanceUnit: 'km',
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: 30, // minutes
    }
  });

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'privacy', label: 'Privacidad', icon: Eye },
    { id: 'preferences', label: 'Preferencias', icon: Settings },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'account', label: 'Cuenta', icon: Lock },
  ];

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones por Email</h3>
        <div className="space-y-3">
          {[
            { key: 'emailNotifications', label: 'Recibir notificaciones por email', desc: 'Notificaciones generales del sistema' },
            { key: 'bookingReminders', label: 'Recordatorios de reservas', desc: 'Te avisamos antes de tus partidos' },
            { key: 'matchInvitations', label: 'Invitaciones a partidos', desc: 'Cuando te inviten a jugar' },
            { key: 'friendRequests', label: 'Solicitudes de amistad', desc: 'Nuevas solicitudes de conexión' },
            { key: 'promotionalEmails', label: 'Emails promocionales', desc: 'Ofertas y promociones especiales' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <p className="text-gray-900 font-medium">{label}</p>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
              <button
                onClick={() => updateSetting('notifications', key, !settings.notifications[key as keyof typeof settings.notifications])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications[key as keyof typeof settings.notifications] ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications[key as keyof typeof settings.notifications] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones Push</h3>
        <div className="space-y-3">
          {[
            { key: 'pushNotifications', label: 'Notificaciones push', desc: 'Notificaciones en tiempo real' },
            { key: 'smsNotifications', label: 'Notificaciones SMS', desc: 'Mensajes de texto importantes' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <p className="text-gray-900 font-medium">{label}</p>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
              <button
                onClick={() => updateSetting('notifications', key, !settings.notifications[key as keyof typeof settings.notifications])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications[key as keyof typeof settings.notifications] ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications[key as keyof typeof settings.notifications] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visibilidad del Perfil</h3>
        <div className="space-y-3">
          <select
            value={settings.privacy.profileVisibility}
            onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="public">Público - Visible para todos</option>
            <option value="friends">Amigos - Solo mis amigos</option>
            <option value="private">Privado - Solo yo</option>
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Visible</h3>
        <div className="space-y-3">
          {[
            { key: 'showLocation', label: 'Mostrar ubicación', desc: 'Tu ciudad y provincia' },
            { key: 'showPhone', label: 'Mostrar teléfono', desc: 'Número de WhatsApp' },
            { key: 'showEmail', label: 'Mostrar email', desc: 'Dirección de correo electrónico' },
            { key: 'showStats', label: 'Mostrar estadísticas', desc: 'Partidos jugados y rating' },
            { key: 'allowFriendRequests', label: 'Permitir solicitudes de amistad', desc: 'Otros usuarios pueden enviarte solicitudes' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <p className="text-gray-900 font-medium">{label}</p>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
              <button
                onClick={() => updateSetting('privacy', key, !settings.privacy[key as keyof typeof settings.privacy])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.privacy[key as keyof typeof settings.privacy] ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.privacy[key as keyof typeof settings.privacy] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Apariencia</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Tema</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'dark', label: 'Oscuro', icon: Moon },
                { value: 'light', label: 'Claro', icon: Sun },
                { value: 'system', label: 'Sistema', icon: Smartphone },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateSetting('preferences', 'theme', value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.preferences.theme === value
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-white" />
                  <p className="text-white text-sm">{label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Región y Formato</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Idioma</label>
            <select
              value={settings.preferences.language}
              onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Zona Horaria</label>
            <select
              value={settings.preferences.timezone}
              onChange={(e) => updateSetting('preferences', 'timezone', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
              <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
              <option value="America/Santiago">Santiago (GMT-3)</option>
              <option value="America/Bogota">Bogotá (GMT-5)</option>
              <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Moneda</label>
              <select
                value={settings.preferences.currency}
                onChange={(e) => updateSetting('preferences', 'currency', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ARS">ARS - Peso Argentino</option>
                <option value="USD">USD - Dólar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="BRL">BRL - Real Brasileño</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Distancia</label>
              <select
                value={settings.preferences.distanceUnit}
                onChange={(e) => updateSetting('preferences', 'distanceUnit', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="km">Kilómetros</option>
                <option value="mi">Millas</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Autenticación</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <p className="text-white font-medium">Autenticación de dos factores</p>
              <p className="text-gray-400 text-sm">Agrega una capa extra de seguridad</p>
            </div>
            <button
              onClick={() => updateSetting('security', 'twoFactorEnabled', !settings.security.twoFactorEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.twoFactorEnabled ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <p className="text-white font-medium">Alertas de inicio de sesión</p>
              <p className="text-gray-400 text-sm">Te avisamos cuando alguien accede a tu cuenta</p>
            </div>
            <button
              onClick={() => updateSetting('security', 'loginAlerts', !settings.security.loginAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.loginAlerts ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.security.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sesión</h3>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Tiempo de inactividad (minutos)</label>
          <select
            value={settings.security.sessionTimeout}
            onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={15}>15 minutos</option>
            <option value={30}>30 minutos</option>
            <option value={60}>1 hora</option>
            <option value={120}>2 horas</option>
            <option value={0}>Nunca</option>
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Acciones de Seguridad</h3>
        <div className="space-y-3">
          <button className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
            Cambiar Contraseña
          </button>
          <button className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors">
            Ver Dispositivos Conectados
          </button>
          <button className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors">
            Cerrar Sesión en Todos los Dispositivos
          </button>
        </div>
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Datos de la Cuenta</h3>
        <div className="space-y-3">
          <button className="w-full p-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Descargar mis Datos</span>
          </button>
          <button className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Importar Datos</span>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Suscripciones</h3>
        <div className="p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white font-medium">Plan Actual</p>
            <span className="px-3 py-1 bg-emerald-500 text-white text-sm rounded-full">Gratuito</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">Acceso básico a todas las funcionalidades</p>
          <button className="w-full p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-lg text-white font-medium transition-all">
            Actualizar a Premium
          </button>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Zona de Peligro</span>
        </h3>
        <div className="space-y-3">
          <button className="w-full p-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center space-x-2">
            <Trash2 className="w-5 h-5" />
            <span>Eliminar Cuenta</span>
          </button>
          <p className="text-gray-500 text-sm text-center">
            Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.
          </p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return renderNotificationsTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'preferences':
        return renderPreferencesTab();
      case 'security':
        return renderSecurityTab();
      case 'account':
        return renderAccountTab();
      default:
        return renderNotificationsTab();
    }
  };

  // If external tab is provided, render without internal navigation
  if (externalActiveTab) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {renderTabContent()}
      </div>
    );
  }

  // Fallback with internal navigation (for standalone use)
  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Configuración</h1>
          <p className="text-gray-500 text-sm">Personaliza tu experiencia en la plataforma</p>
        </motion.div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
