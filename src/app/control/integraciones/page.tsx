'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plug, 
  Webhook, 
  Send, 
  Check, 
  X, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Clock,
  MessageSquare,
  Copy,
  CheckCircle2
} from 'lucide-react';

interface WebhookConfig {
  url: string;
  isActive: boolean;
  lastTestAt: string | null;
  lastTestStatus: 'success' | 'error' | null;
  updatedAt?: string;
}

export default function IntegracionesPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [config, setConfig] = useState<WebhookConfig>({
    url: '',
    isActive: false,
    lastTestAt: null,
    lastTestStatus: null
  });

  const [formData, setFormData] = useState({
    url: '',
    isActive: false
  });

  useEffect(() => {
    setMounted(true);
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superAdminToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

      const response = await fetch(`${apiUrl}/api/admin/integrations/webhook`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.data);
        setFormData({
          url: data.data.url || '',
          isActive: data.data.isActive || false
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('superAdminToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

      const response = await fetch(`${apiUrl}/api/admin/integrations/webhook`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.data);
        setTestResult({ success: true, message: 'Configuración guardada correctamente' });
        setTimeout(() => setTestResult(null), 3000);
      } else {
        const error = await response.json();
        setTestResult({ success: false, message: error.message || 'Error al guardar' });
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setTestResult({ success: false, message: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!formData.url) {
      setTestResult({ success: false, message: 'Ingresa una URL primero' });
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      const token = localStorage.getItem('superAdminToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

      const response = await fetch(`${apiUrl}/api/admin/integrations/webhook/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: formData.url })
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult({ success: true, message: '¡Prueba enviada correctamente! Revisa Make.com' });
        fetchConfig(); // Refresh to get updated lastTestAt
      } else {
        setTestResult({ success: false, message: data.message || 'Error al enviar prueba' });
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      setTestResult({ success: false, message: 'Error de conexión' });
    } finally {
      setTesting(false);
    }
  };

  const copyPayloadExample = () => {
    const payload = {
      type: 'booking_confirmed',
      timestamp: new Date().toISOString(),
      establishment: {
        name: 'Nombre del Establecimiento',
        address: 'Dirección',
        phone: '+54 11 1234-5678'
      },
      player: {
        name: 'Nombre del Jugador',
        phone: '+54 9 11 9876-5432',
        email: 'email@ejemplo.com'
      },
      booking: {
        id: 'booking-id',
        date: '2026-01-10',
        startTime: '18:00',
        endTime: '19:00',
        courtName: 'Cancha 1',
        totalPrice: 15000,
        amountPaid: 5000,
        pendingAmount: 10000,
        qrCodeUrl: 'https://...'
      }
    };
    
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Portal for topbar controls
  const topbarContent = mounted && document.getElementById('header-page-controls') ? createPortal(
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Plug className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
          Integraciones
        </h1>
      </div>
    </div>,
    document.getElementById('header-page-controls')!
  ) : null;

  if (loading) {
    return (
      <>
        {topbarContent}
        <div className="p-4 lg:p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      </>
    );
  }

  return (
    <>
      {topbarContent}
      
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Notificaciones WhatsApp</h2>
              <p className="text-orange-100 mt-1">
                Envía notificaciones automáticas a los jugadores cuando confirman una reserva usando Make.com
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Webhook Configuration */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Webhook className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Webhook de Make.com</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configura el webhook para recibir datos de reservas
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL del Webhook
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://hook.us2.make.com/..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Pega aquí la URL del Custom Webhook de Make.com
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Activar notificaciones</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enviar datos automáticamente al confirmar reservas
                  </p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Last Test Status */}
              {config.lastTestAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    Última prueba: {new Date(config.lastTestAt).toLocaleString('es-AR')}
                    {config.lastTestStatus && (
                      <span className={`ml-2 ${config.lastTestStatus === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                        ({config.lastTestStatus === 'success' ? 'Exitosa' : 'Fallida'})
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* Result Message */}
              <AnimatePresence>
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      testResult.success 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {testResult.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span>{testResult.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleTest}
                  disabled={testing || !formData.url}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-orange-600 text-orange-600 dark:text-orange-400 dark:border-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Enviar Prueba</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Guardar Configuración</span>
                </button>
              </div>
            </div>
          </div>

          {/* Payload Example */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Estructura del Payload</h4>
              <button
                onClick={copyPayloadExample}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "type": "booking_confirmed",
  "timestamp": "2026-01-06T20:00:00.000Z",
  "establishment": {
    "name": "Nombre del Establecimiento",
    "address": "Dirección",
    "phone": "+54 11 1234-5678",
    "email": "email@establecimiento.com"
  },
  "player": {
    "name": "Nombre del Jugador",
    "phone": "+54 9 11 9876-5432",
    "email": "jugador@email.com"
  },
  "booking": {
    "id": "abc123",
    "date": "2026-01-10",
    "startTime": "18:00",
    "endTime": "19:00",
    "courtName": "Cancha 1",
    "sportType": "padel",
    "totalPrice": 15000,
    "amountPaid": 5000,
    "pendingAmount": 10000,
    "status": "confirmed",
    "qrCodeUrl": "https://www.mismatchs.com/reserva/abc123/qr"
  }
}`}
            </pre>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Este es el formato JSON que recibirás en Make.com cuando se confirme una reserva.
              Usa estos campos como variables en tu escenario de WhatsApp.
            </p>
          </div>

          {/* How to use */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Cómo configurar</h4>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Crea un nuevo escenario en Make.com con el módulo "Custom Webhook"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Copia la URL del webhook y pégala arriba</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Haz clic en "Enviar Prueba" para que Make detecte la estructura de datos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Conecta el módulo de WhatsApp Business API y mapea los campos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <span>Activa las notificaciones y guarda la configuración</span>
              </li>
            </ol>
            <a 
              href="https://www.make.com/en/help/tools/webhooks" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-orange-600 dark:text-orange-400 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Ver documentación de Make.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
