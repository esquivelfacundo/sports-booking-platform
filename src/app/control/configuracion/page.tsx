'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Percent, Save, CreditCard, Link2, Check } from 'lucide-react';
import { superAdminApi } from '@/services/superAdminApi';
import UnifiedLoader from '@/components/ui/UnifiedLoader';

export default function ConfiguracionPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultFeePercent, setDefaultFeePercent] = useState(10);
  const [mpConnected, setMpConnected] = useState(false);
  const [mpEmail, setMpEmail] = useState('');

  useEffect(() => {
    setMounted(true);
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const stats = await superAdminApi.getPlatformStats();
      // Platform config would be loaded here if the endpoint exists
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Save config via API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated
      alert('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  // Topbar content via portal
  const topbarContent = mounted && document.getElementById('header-page-controls') ? createPortal(
    <div className="flex items-center gap-4 flex-1">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">Configuración</h1>
      
      <div className="ml-auto">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar
            </>
          )}
        </button>
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
      <div className="p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Platform Fee */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <Percent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comisión de Plataforma</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Porcentaje que cobra la plataforma por cada reserva</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={defaultFeePercent}
                  onChange={(e) => setDefaultFeePercent(parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg font-semibold focus:ring-2 focus:ring-orange-500"
                />
                <span className="ml-2 text-lg text-gray-500 dark:text-gray-400">%</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Esta comisión se aplica por defecto a todos los establecimientos. Puedes personalizar la comisión de cada establecimiento individualmente.
              </p>
            </div>
          </div>

          {/* Mercado Pago Connection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mercado Pago de la Plataforma</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cuenta donde se reciben las comisiones de la plataforma</p>
              </div>
            </div>
            
            {mpConnected ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg">
                <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-medium text-emerald-800 dark:text-emerald-400">Conectado</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-500">{mpEmail}</p>
                </div>
                <button className="ml-auto px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  Desconectar
                </button>
              </div>
            ) : (
              <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
                <Link2 className="w-4 h-4" />
                Conectar Mercado Pago
              </button>
            )}
          </div>

          {/* General Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configuración General</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ajustes generales de la plataforma</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Aprobación automática</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aprobar automáticamente nuevos establecimientos</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Notificaciones por email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recibir notificaciones de nuevos registros</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Modo mantenimiento</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Desactivar acceso público temporalmente</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
