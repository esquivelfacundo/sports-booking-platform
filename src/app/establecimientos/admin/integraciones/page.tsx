'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plug, 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Loader2,
  RefreshCw,
  Trash2,
  ExternalLink,
  Shield,
  CheckCircle,
  Settings,
  Zap,
  Link2,
  Copy,
  Bot,
  Receipt,
  Plus
} from 'lucide-react';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import Image from 'next/image';
import ApiDocsContent from './docs/ApiDocsContent';

interface Integration {
  id: string;
  type: 'OPENAI';
  maskedApiKey: string;
  isActive: boolean;
  lastTestedAt: string | null;
  lastTestSuccess: boolean | null;
  phoneNumberId?: string;
  businessAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

type IntegrationType = 'OPENAI' | 'MERCADOPAGO' | 'WHATSAPP_BOT' | 'AFIP';

interface ArcaConfig {
  id: string;
  cuit: string;
  razonSocial: string;
  domicilioFiscal: string;
  condicionFiscal: 'monotributista' | 'responsable_inscripto';
  inicioActividades: string;
  certExpiration?: string | null;
  isActive: boolean;
  isVerified: boolean;
  lastTestedAt?: string | null;
  lastTestResult?: any;
  hasCertificate?: boolean;
  hasPrivateKey?: boolean;
  puntosVenta?: ArcaPuntoVenta[];
}

interface ArcaPuntoVenta {
  id: string;
  numero: number;
  descripcion?: string;
  isDefault: boolean;
  isActive: boolean;
}

interface IntegrationCardData {
  id: IntegrationType;
  name: string;
  description: string;
  logo: string;
  logoSize: number;
  color: string;
  gradient: string;
  bgColor: string;
  features: string[];
  docsUrl?: string;
}

const INTEGRATION_CARDS: IntegrationCardData[] = [
  {
    id: 'WHATSAPP_BOT',
    name: 'Bot de WhatsApp',
    description: 'API para integrar bots y automatizar reservas',
    logo: '/assets/logos-empresas/whatsapp.svg',
    logoSize: 36,
    color: 'text-green-400',
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    features: ['API REST', 'Webhooks', 'Reservas automáticas'],
    docsUrl: '/establecimientos/admin/integraciones/docs',
  },
  {
    id: 'MERCADOPAGO',
    name: 'Mercado Pago',
    description: 'Recibe pagos online de tus clientes',
    logo: '/assets/logos-empresas/mercadopago.svg',
    logoSize: 66,
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    features: ['Pagos con tarjeta', 'Transferencias', 'QR'],
    docsUrl: 'https://www.mercadopago.com.ar/developers',
  },
  {
    id: 'OPENAI',
    name: 'OpenAI',
    description: 'OCR inteligente para facturas',
    logo: '/assets/logos-empresas/openai.svg',
    logoSize: 48,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    features: ['OCR de facturas', 'GPT-4 Vision'],
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'AFIP' as IntegrationType,
    name: 'AFIP (ARCA)',
    description: 'Facturación electrónica',
    logo: '/assets/logos-empresas/arca.png',
    logoSize: 48,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-cyan-500',
    bgColor: 'bg-emerald-500/10',
    features: ['Comprobantes AFIP', 'Puntos de venta', 'PDF con QR'],
  },
];

export default function IntegrationsPage() {
  const { establishment } = useEstablishment();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeIntegration, setActiveIntegration] = useState<IntegrationType | null>(null);
  const [activeTab, setActiveTab] = useState<'integrations' | 'docs'>('integrations');
  const [headerPortalContainer, setHeaderPortalContainer] = useState<HTMLElement | null>(null);

  const [arcaConfig, setArcaConfig] = useState<ArcaConfig | null>(null);
  const [arcaConfigLoading, setArcaConfigLoading] = useState(false);
  const [arcaTestingResult, setArcaTestingResult] = useState<TestResult | null>(null);
  const [arcaSaving, setArcaSaving] = useState(false);
  const [arcaToggling, setArcaToggling] = useState(false);

  const [arcaForm, setArcaForm] = useState({
    cuit: '',
    razonSocial: '',
    domicilioFiscal: '',
    condicionFiscal: 'monotributista' as 'monotributista' | 'responsable_inscripto',
    inicioActividades: '',
    certificado: '',
    clavePrivada: ''
  });

  const [puntosVenta, setPuntosVenta] = useState<ArcaPuntoVenta[]>([]);
  const [puntosVentaLoading, setPuntosVentaLoading] = useState(false);
  const [puntosVentaAfip, setPuntosVentaAfip] = useState<any[]>([]);
  const [puntosVentaAfipLoading, setPuntosVentaAfipLoading] = useState(false);
  const [nuevoPuntoVenta, setNuevoPuntoVenta] = useState({ numero: '', descripcion: '', isDefault: true });
  const [creandoPuntoVenta, setCreandoPuntoVenta] = useState(false);

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
    if (tabParam && ['integrations', 'docs'].includes(tabParam)) {
      setActiveTab(tabParam as 'integrations' | 'docs');
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: 'integrations' | 'docs') => {
    setActiveTab(tab);
    router.push(`/establecimientos/admin/integraciones?tab=${tab}`, { scroll: false });
  };
  
  const [mpStatus, setMpStatus] = useState<{
    connected: boolean;
    mpUserId?: string;
    mpEmail?: string;
    loading: boolean;
  }>({ connected: false, loading: true });
  const [mpConnecting, setMpConnecting] = useState(false);
  
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [openaiTestResult, setOpenaiTestResult] = useState<TestResult | null>(null);
  
  // API Key for WhatsApp Bot
  const [botApiKey, setBotApiKey] = useState<string | null>(null);
  const [botApiKeyLoading, setBotApiKeyLoading] = useState(true);
  const [showBotApiKey, setShowBotApiKey] = useState(false);
  const [generatingBotKey, setGeneratingBotKey] = useState(false);
  
  // Courts UUIDs
  const [courts, setCourts] = useState<any[]>([]);
  const [courtsLoading, setCourtsLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
    loadMPStatus();
    loadBotApiKey();
    loadCourts();
  }, [establishment?.id]);

  useEffect(() => {
    if (activeIntegration === 'AFIP' && establishment?.id) {
      loadArcaConfig();
      loadArcaPuntosVenta();
    }
  }, [activeIntegration, establishment?.id]);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getIntegrations() as any;
      setIntegrations(response.data || []);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArcaConfig = async () => {
    if (!establishment?.id) return;
    try {
      setArcaConfigLoading(true);
      const response = await apiClient.getArcaConfig(establishment.id) as any;
      const config: ArcaConfig | null = response?.config || null;
      setArcaConfig(config);
      setArcaTestingResult(null);

      if (config) {
        setArcaForm(prev => ({
          ...prev,
          cuit: config.cuit || '',
          razonSocial: config.razonSocial || '',
          domicilioFiscal: config.domicilioFiscal || '',
          condicionFiscal: config.condicionFiscal || 'monotributista',
          inicioActividades: config.inicioActividades || '',
          certificado: '',
          clavePrivada: ''
        }));
        if (Array.isArray(config.puntosVenta)) {
          setPuntosVenta(config.puntosVenta);
        }
      } else {
        setPuntosVenta([]);
      }
    } catch (error: any) {
      console.error('Error loading ARCA config:', error);
      showError(error?.message || 'Error al cargar configuración AFIP');
    } finally {
      setArcaConfigLoading(false);
    }
  };

  const loadArcaPuntosVenta = async () => {
    if (!establishment?.id) return;
    try {
      setPuntosVentaLoading(true);
      const response = await apiClient.getArcaPuntosVenta(establishment.id) as any;
      setPuntosVenta(response || []);
    } catch (error: any) {
      console.error('Error loading puntos de venta:', error);
    } finally {
      setPuntosVentaLoading(false);
    }
  };

  const loadArcaPuntosVentaAfip = async () => {
    if (!establishment?.id) return;
    try {
      setPuntosVentaAfipLoading(true);
      const response = await apiClient.getArcaPuntosVentaFromAfip(establishment.id) as any;
      setPuntosVentaAfip(Array.isArray(response) ? response : []);
    } catch (error: any) {
      showError(error?.message || 'Error al consultar puntos de venta en AFIP');
    } finally {
      setPuntosVentaAfipLoading(false);
    }
  };

  const loadBotApiKey = async () => {
    if (!establishment?.id) return;
    try {
      setBotApiKeyLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/establishments/${establishment.id}/api-key`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setBotApiKey(data.data?.apiKey || null);
      }
    } catch (error) {
      console.error('Error loading bot API key:', error);
    } finally {
      setBotApiKeyLoading(false);
    }
  };

  const loadCourts = async () => {
    if (!establishment?.id) return;
    try {
      setCourtsLoading(true);
      const response = await apiClient.getCourts(establishment.id);
      setCourts(response.data || []);
    } catch (error) {
      console.error('Error loading courts:', error);
    } finally {
      setCourtsLoading(false);
    }
  };

  const handleGenerateBotApiKey = async () => {
    if (!establishment?.id) return;
    try {
      setGeneratingBotKey(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/establishments/${establishment.id}/api-key/generate`,
        { 
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } 
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBotApiKey(data.data?.apiKey || null);
        showSuccess('API Key generada exitosamente');
      } else {
        showError('Error al generar API Key');
      }
    } catch (error) {
      console.error('Error generating bot API key:', error);
      showError('Error al generar API Key');
    } finally {
      setGeneratingBotKey(false);
    }
  };

  const handleDeleteBotApiKey = async () => {
    if (!establishment?.id || !confirm('¿Eliminar la API Key? El bot dejará de funcionar.')) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/establishments/${establishment.id}/api-key`,
        { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } 
        }
      );
      if (response.ok) {
        setBotApiKey(null);
        showSuccess('API Key eliminada');
      }
    } catch (error) {
      console.error('Error deleting bot API key:', error);
      showError('Error al eliminar API Key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copiado al portapapeles');
  };

  const loadMPStatus = async () => {
    if (!establishment?.id) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/mp/oauth/status/${establishment.id}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setMpStatus({ connected: data.connected, mpUserId: data.mpUserId, mpEmail: data.mpEmail, loading: false });
      }
    } catch (error) {
      setMpStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const getIntegration = (type: 'OPENAI') => integrations.find(i => i.type === type);
  const isConnected = (type: IntegrationType): boolean => {
    if (type === 'MERCADOPAGO') return mpStatus.connected;
    if (type === 'WHATSAPP_BOT') return !!botApiKey;
    if (type === 'AFIP') return !!arcaConfig;
    return !!getIntegration(type as 'OPENAI');
  };

  const openSidebar = (type: IntegrationType) => { setActiveIntegration(type); setSidebarOpen(true); };
  const closeSidebar = () => {
    setSidebarOpen(false);
    setActiveIntegration(null);
    setOpenaiApiKey(''); setOpenaiTestResult(null);
    setArcaTestingResult(null);
    setPuntosVentaAfip([]);
    setNuevoPuntoVenta({ numero: '', descripcion: '', isDefault: true });
  };

  const handleSaveArca = async () => {
    if (!establishment?.id) return;

    if (!arcaForm.cuit.trim() || !arcaForm.razonSocial.trim() || !arcaForm.domicilioFiscal.trim() || !arcaForm.inicioActividades) {
      showError('Completá CUIT, Razón Social, Domicilio Fiscal e Inicio de Actividades');
      return;
    }

    try {
      setArcaSaving(true);
      await apiClient.saveArcaConfig(establishment.id, {
        cuit: arcaForm.cuit,
        razonSocial: arcaForm.razonSocial,
        domicilioFiscal: arcaForm.domicilioFiscal,
        condicionFiscal: arcaForm.condicionFiscal,
        inicioActividades: arcaForm.inicioActividades,
        ...(arcaForm.certificado.trim() ? { certificado: arcaForm.certificado } : {}),
        ...(arcaForm.clavePrivada.trim() ? { clavePrivada: arcaForm.clavePrivada } : {})
      });
      showSuccess('Configuración AFIP guardada');
      await loadArcaConfig();
    } catch (error: any) {
      showError(error?.message || 'Error al guardar configuración AFIP');
    } finally {
      setArcaSaving(false);
    }
  };

  const handleTestArca = async () => {
    if (!establishment?.id) return;
    try {
      setTesting('AFIP');
      setArcaTestingResult(null);
      const response = await apiClient.testArcaConfig(establishment.id) as any;
      const result: TestResult = {
        success: !!response?.success,
        message: response?.message || (response?.success ? 'Conexión exitosa' : 'Error'),
        details: response?.details
      };
      setArcaTestingResult(result);
      if (result.success) showSuccess('Conexión con AFIP exitosa');
      await loadArcaConfig();
    } catch (error: any) {
      setArcaTestingResult({ success: false, message: error?.message || 'Error al probar conexión' });
    } finally {
      setTesting(null);
    }
  };

  const handleToggleArcaActive = async (nextActive: boolean) => {
    if (!establishment?.id) return;
    try {
      setArcaToggling(true);
      await apiClient.setArcaConfigActive(establishment.id, nextActive);
      showSuccess(nextActive ? 'Facturación electrónica activada' : 'Facturación electrónica desactivada');
      await loadArcaConfig();
    } catch (error: any) {
      showError(error?.message || 'Error al cambiar estado');
    } finally {
      setArcaToggling(false);
    }
  };

  const handleCreatePuntoVenta = async () => {
    if (!establishment?.id) return;
    const numero = parseInt(nuevoPuntoVenta.numero, 10);
    if (!numero || numero < 1 || numero > 99999) {
      showError('Número de punto de venta inválido (1-99999)');
      return;
    }

    try {
      setCreandoPuntoVenta(true);
      await apiClient.createArcaPuntoVenta(establishment.id, {
        numero,
        descripcion: nuevoPuntoVenta.descripcion || undefined,
        isDefault: !!nuevoPuntoVenta.isDefault
      });
      showSuccess('Punto de venta creado');
      setNuevoPuntoVenta({ numero: '', descripcion: '', isDefault: false });
      await loadArcaPuntosVenta();
      await loadArcaConfig();
    } catch (error: any) {
      showError(error?.message || 'Error al crear punto de venta');
    } finally {
      setCreandoPuntoVenta(false);
    }
  };

  const handleSetDefaultPuntoVenta = async (pv: ArcaPuntoVenta) => {
    try {
      await apiClient.updateArcaPuntoVenta(pv.id, { isDefault: true });
      showSuccess('Punto de venta por defecto actualizado');
      await loadArcaPuntosVenta();
      await loadArcaConfig();
    } catch (error: any) {
      showError(error?.message || 'Error al actualizar punto de venta');
    }
  };

  const handleTogglePuntoVentaActive = async (pv: ArcaPuntoVenta) => {
    try {
      await apiClient.updateArcaPuntoVenta(pv.id, { isActive: !pv.isActive });
      showSuccess(!pv.isActive ? 'Punto de venta activado' : 'Punto de venta desactivado');
      await loadArcaPuntosVenta();
      await loadArcaConfig();
    } catch (error: any) {
      showError(error?.message || 'Error al actualizar punto de venta');
    }
  };

  const handleConnectMP = async () => {
    if (!establishment?.id) return;
    setMpConnecting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/mp/oauth/authorize?establishmentId=${establishment.id}&type=establishment&redirectUrl=${encodeURIComponent(window.location.href)}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } }
      );
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      }
    } catch (error) {
      showError('Error al conectar con Mercado Pago');
      setMpConnecting(false);
    }
  };

  const handleDisconnectMP = async () => {
    if (!establishment?.id || !confirm('¿Desconectar Mercado Pago?')) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/mp/oauth/disconnect/${establishment.id}`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } }
      );
      if (response.ok) { setMpStatus({ connected: false, loading: false }); showSuccess('Mercado Pago desconectado'); closeSidebar(); }
    } catch (error) { showError('Error al desconectar'); }
  };

  const handleSaveOpenAI = async () => {
    if (!openaiApiKey.trim()) { showError('Ingresa tu API Key'); return; }
    try {
      setSaving(true);
      await apiClient.saveIntegration({ type: 'OPENAI', apiKey: openaiApiKey.trim() });
      showSuccess('OpenAI conectado'); setOpenaiApiKey(''); await loadIntegrations(); closeSidebar();
    } catch (error: any) { showError(error.message || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleTestOpenAI = async () => {
    try {
      setTesting('OPENAI'); setOpenaiTestResult(null);
      const response = await apiClient.testIntegration('OPENAI') as any;
      setOpenaiTestResult(response.data);
      if (response.data.success) showSuccess('Conexión exitosa');
      await loadIntegrations();
    } catch (error: any) { setOpenaiTestResult({ success: false, message: error.message || 'Error' }); }
    finally { setTesting(null); }
  };

  const handleDeleteOpenAI = async () => {
    if (!confirm('¿Eliminar OpenAI?')) return;
    try { await apiClient.deleteIntegration('OPENAI'); await loadIntegrations(); showSuccess('OpenAI desconectado'); closeSidebar(); }
    catch (error: any) { showError(error.message || 'Error'); }
  };


  const renderSidebarContent = () => {
    if (!activeIntegration) return null;
    const card = INTEGRATION_CARDS.find(c => c.id === activeIntegration);
    if (!card) return null;

    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                <Image src={card.logo} alt={card.name} width={card.logoSize * 0.8} height={card.logoSize * 0.8} className="brightness-0 invert" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{card.name}</h2>
                <p className="text-sm text-gray-400">{card.description}</p>
              </div>
            </div>
            <button onClick={closeSidebar} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {activeIntegration === 'MERCADOPAGO' && (
            <div className="space-y-6">
              {mpStatus.connected ? (
                <>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-400" /><div><p className="text-blue-400 font-medium">Cuenta conectada</p>{mpStatus.mpEmail && <p className="text-sm text-gray-400">{mpStatus.mpEmail}</p>}</div></div>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-xl"><p className="text-sm text-gray-400 mb-2">ID de usuario</p><p className="text-white font-mono">{mpStatus.mpUserId}</p></div>
                  <button onClick={handleDisconnectMP} className="w-full px-4 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" />Desconectar</button>
                </>
              ) : (
                <>
                  <div className="p-4 bg-gray-800 rounded-xl"><p className="text-gray-300 text-sm">Conecta tu cuenta de Mercado Pago para recibir pagos online.</p></div>
                  <button onClick={handleConnectMP} disabled={mpConnecting} className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2">{mpConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link2 className="w-5 h-5" />}Conectar Mercado Pago</button>
                </>
              )}
            </div>
          )}
          {activeIntegration === 'WHATSAPP_BOT' && (
            <div className="space-y-6">
              {botApiKey ? (
                <>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /><div><p className="text-green-400 font-medium">API Key activa</p></div></div>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tu API Key</label>
                    <div className="flex items-center gap-2">
                      <input
                        type={showBotApiKey ? 'text' : 'password'}
                        value={botApiKey}
                        readOnly
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white font-mono text-sm"
                      />
                      <button
                        onClick={() => setShowBotApiKey(!showBotApiKey)}
                        className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300"
                      >
                        {showBotApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(botApiKey)}
                        className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">IDs de Canchas (JSON)</h3>
                    <div className="bg-gray-900 rounded-xl p-4">
                      <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                        {JSON.stringify(courts.map(c => ({ id: c.id, name: c.name, sport: c.sport })), null, 2)}
                      </pre>
                    </div>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(courts.map(c => ({ id: c.id, name: c.name, sport: c.sport })), null, 2))}
                      className="w-full mt-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300 flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar JSON
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleGenerateBotApiKey}
                      disabled={generatingBotKey}
                      className="flex-1 px-4 py-3 bg-yellow-500/20 text-yellow-400 rounded-xl font-medium hover:bg-yellow-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {generatingBotKey ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                      Regenerar
                    </button>
                    <button
                      onClick={handleDeleteBotApiKey}
                      className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-gray-800 rounded-xl">
                    <p className="text-gray-300 text-sm">Genera una API Key para conectar el bot de WhatsApp y gestionar reservas automáticamente.</p>
                  </div>
                  <button
                    onClick={handleGenerateBotApiKey}
                    disabled={generatingBotKey}
                    className="w-full px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generatingBotKey ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                    Generar API Key
                  </button>
                </>
              )}
            </div>
          )}
          {activeIntegration === 'OPENAI' && (
            <div className="space-y-6">
              {getIntegration('OPENAI') ? (
                <>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
                    <h4 className="text-emerald-400 font-medium mb-2">OCR Inteligente para Facturas</h4>
                    <p className="text-gray-300 text-sm">Utiliza GPT-4 Vision para extraer automáticamente los datos de tus facturas de proveedores.</p>
                  </div>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"><div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-400" /><div><p className="text-emerald-400 font-medium">API Key configurada</p><p className="text-sm text-gray-400 font-mono">{getIntegration('OPENAI')?.maskedApiKey}</p></div></div></div>
                  <button onClick={handleTestOpenAI} disabled={testing === 'OPENAI'} className="w-full px-4 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl font-medium hover:bg-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2">{testing === 'OPENAI' ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}Probar conexión</button>
                  {openaiTestResult && <div className={`p-4 rounded-xl ${openaiTestResult.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}><p className={openaiTestResult.success ? 'text-emerald-400' : 'text-red-400'}>{openaiTestResult.message}</p></div>}
                  <div className="pt-4 border-t border-gray-700"><p className="text-sm text-gray-400 mb-3">Actualizar API Key</p><div className="space-y-3"><div className="relative"><input type={showOpenaiKey ? 'text' : 'password'} value={openaiApiKey} onChange={(e) => setOpenaiApiKey(e.target.value)} placeholder="sk-..." className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono pr-12" /><button type="button" onClick={() => setShowOpenaiKey(!showOpenaiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showOpenaiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div><button onClick={handleSaveOpenAI} disabled={saving || !openaiApiKey.trim()} className="w-full px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}Guardar</button></div></div>
                  <button onClick={handleDeleteOpenAI} className="w-full px-4 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" />Eliminar</button>
                </>
              ) : (
                <>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
                    <h4 className="text-emerald-400 font-medium mb-2">OCR Inteligente para Facturas</h4>
                    <p className="text-gray-300 text-sm">Utiliza GPT-4 Vision para extraer automáticamente los datos de tus facturas de proveedores. Simplemente sube una foto o PDF y el sistema extraerá proveedor, productos, cantidades y precios.</p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded-xl"><div className="flex items-start gap-3"><Shield className="w-5 h-5 text-blue-400 mt-0.5" /><p className="text-gray-300 text-sm">Tu API Key se almacena encriptada.</p></div></div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-2">API Key de OpenAI</label><div className="relative"><input type={showOpenaiKey ? 'text' : 'password'} value={openaiApiKey} onChange={(e) => setOpenaiApiKey(e.target.value)} placeholder="sk-..." className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono pr-12" /><button type="button" onClick={() => setShowOpenaiKey(!showOpenaiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showOpenaiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div><a href={card.docsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline mt-2 inline-flex items-center gap-1">Obtener API Key <ExternalLink className="w-3 h-3" /></a></div>
                  <button onClick={handleSaveOpenAI} disabled={saving || !openaiApiKey.trim()} className="w-full px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}Conectar OpenAI</button>
                </>
              )}
            </div>
          )}

          {activeIntegration === 'AFIP' && (
            <div className="space-y-6">
              {arcaConfigLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Receipt className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <div>
                        <p className="text-emerald-400 font-medium">Facturación electrónica (AFIP)</p>
                        <p className="text-sm text-gray-300">Configura tus datos fiscales y certificados para emitir comprobantes desde la plataforma.</p>
                      </div>
                    </div>
                  </div>

                  {arcaConfig && (
                    <div className={`p-4 rounded-xl border ${arcaConfig.isVerified ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                      <div className="flex items-center gap-3">
                        {arcaConfig.isVerified ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Shield className="w-5 h-5 text-yellow-400" />
                        )}
                        <div>
                          <p className={`font-medium ${arcaConfig.isVerified ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {arcaConfig.isVerified ? 'Configuración verificada' : 'Configuración sin verificar'}
                          </p>
                          <p className="text-sm text-gray-400">
                            Certificado: {arcaConfig.hasCertificate ? 'cargado' : 'pendiente'} · Clave: {arcaConfig.hasPrivateKey ? 'cargada' : 'pendiente'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">CUIT</label>
                      <input
                        value={arcaForm.cuit}
                        onChange={(e) => setArcaForm(prev => ({ ...prev, cuit: e.target.value }))}
                        placeholder="20123456789"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Razón Social</label>
                      <input
                        value={arcaForm.razonSocial}
                        onChange={(e) => setArcaForm(prev => ({ ...prev, razonSocial: e.target.value }))}
                        placeholder="Mi Cancha SRL"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Domicilio Fiscal</label>
                      <input
                        value={arcaForm.domicilioFiscal}
                        onChange={(e) => setArcaForm(prev => ({ ...prev, domicilioFiscal: e.target.value }))}
                        placeholder="Calle 123, Ciudad"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Condición</label>
                        <select
                          value={arcaForm.condicionFiscal}
                          onChange={(e) => setArcaForm(prev => ({ ...prev, condicionFiscal: e.target.value as any }))}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="monotributista">Monotributista</option>
                          <option value="responsable_inscripto">Responsable Inscripto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Inicio Actividades</label>
                        <input
                          type="date"
                          value={arcaForm.inicioActividades}
                          onChange={(e) => setArcaForm(prev => ({ ...prev, inicioActividades: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Certificado (.crt en PEM)</label>
                      <textarea
                        value={arcaForm.certificado}
                        onChange={(e) => setArcaForm(prev => ({ ...prev, certificado: e.target.value }))}
                        placeholder="-----BEGIN CERTIFICATE-----\n..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                      />
                      {arcaConfig?.certExpiration && (
                        <p className="text-xs text-gray-400 mt-2">Vence: {new Date(arcaConfig.certExpiration).toLocaleDateString('es-AR')}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Clave privada (.key en PEM)</label>
                      <textarea
                        value={arcaForm.clavePrivada}
                        onChange={(e) => setArcaForm(prev => ({ ...prev, clavePrivada: e.target.value }))}
                        placeholder="-----BEGIN PRIVATE KEY-----\n..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                      />
                    </div>

                    <button
                      onClick={handleSaveArca}
                      disabled={arcaSaving}
                      className="w-full px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {arcaSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      Guardar configuración
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleTestArca}
                        disabled={testing === 'AFIP'}
                        className="w-full px-4 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl font-medium hover:bg-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {testing === 'AFIP' ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                        Probar
                      </button>
                      <button
                        onClick={() => handleToggleArcaActive(!arcaConfig?.isActive)}
                        disabled={arcaToggling || !arcaConfig}
                        className={`w-full px-4 py-3 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 ${arcaConfig?.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}`}
                      >
                        {arcaToggling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                        {arcaConfig?.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>

                    {arcaTestingResult && (
                      <div className={`p-4 rounded-xl ${arcaTestingResult.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <p className={arcaTestingResult.success ? 'text-emerald-400' : 'text-red-400'}>{arcaTestingResult.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-300">Puntos de venta</h3>
                      <button
                        onClick={loadArcaPuntosVentaAfip}
                        disabled={puntosVentaAfipLoading}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 text-sm flex items-center gap-2 disabled:opacity-50"
                      >
                        {puntosVentaAfipLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        AFIP
                      </button>
                    </div>

                    <div className="space-y-3">
                      {puntosVentaLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        </div>
                      ) : puntosVenta.length === 0 ? (
                        <div className="p-4 bg-gray-800 rounded-xl text-sm text-gray-300">No hay puntos de venta configurados.</div>
                      ) : (
                        <div className="space-y-2">
                          {puntosVenta.map((pv) => (
                            <div key={pv.id} className="p-3 bg-gray-800 rounded-xl flex items-center justify-between gap-3">
                              <div>
                                <p className="text-white font-medium">{pv.numero} {pv.isDefault ? <span className="text-xs text-emerald-400">(default)</span> : null}</p>
                                <p className="text-xs text-gray-400">{pv.descripcion || '-'}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSetDefaultPuntoVenta(pv)}
                                  className="px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30"
                                >
                                  Default
                                </button>
                                <button
                                  onClick={() => handleTogglePuntoVentaActive(pv)}
                                  className={`px-3 py-2 rounded-lg text-sm ${pv.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}`}
                                >
                                  {pv.isActive ? 'Off' : 'On'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
                        <p className="text-sm text-gray-300 font-medium mb-3">Agregar punto de venta</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Número</label>
                            <input
                              value={nuevoPuntoVenta.numero}
                              onChange={(e) => setNuevoPuntoVenta(prev => ({ ...prev, numero: e.target.value }))}
                              placeholder="1"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Default</label>
                            <select
                              value={nuevoPuntoVenta.isDefault ? 'yes' : 'no'}
                              onChange={(e) => setNuevoPuntoVenta(prev => ({ ...prev, isDefault: e.target.value === 'yes' }))}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                            >
                              <option value="yes">Sí</option>
                              <option value="no">No</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-xs text-gray-400 mb-1">Descripción (opcional)</label>
                          <input
                            value={nuevoPuntoVenta.descripcion}
                            onChange={(e) => setNuevoPuntoVenta(prev => ({ ...prev, descripcion: e.target.value }))}
                            placeholder="Mostrador"
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <button
                          onClick={handleCreatePuntoVenta}
                          disabled={creandoPuntoVenta}
                          className="w-full mt-4 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {creandoPuntoVenta ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                          Crear
                        </button>
                      </div>

                      {puntosVentaAfip.length > 0 && (
                        <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
                          <p className="text-sm text-gray-300 font-medium mb-2">Puntos de venta en AFIP</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {puntosVentaAfip.map((pv: any) => (
                              <div key={`${pv.numero}-${pv.emisionTipo}`} className="flex items-center justify-between text-sm bg-gray-800 rounded-lg p-2">
                                <span className="text-gray-200">{pv.numero}</span>
                                <span className="text-gray-400">{pv.emisionTipo}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Header controls for topbar
  const headerControls = (
    <div className="flex items-center w-full space-x-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex-shrink-0">
        <button
          onClick={() => handleTabChange('integrations')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'integrations'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Plug className="h-4 w-4" />
          Integraciones
        </button>
        <button
          onClick={() => handleTabChange('docs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'docs'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <ExternalLink className="h-4 w-4" />
          Documentación
        </button>
      </div>
    </div>
  );

  if (loading && mpStatus.loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  }

  return (
    <>
      {/* Render controls in header via portal */}
      {headerPortalContainer && createPortal(headerControls, headerPortalContainer)}
      
      {activeTab === 'docs' ? (
        <ApiDocsContent />
      ) : (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {INTEGRATION_CARDS.map((card, index) => {
            const connected = isConnected(card.id);
            return (
              <motion.div key={card.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer shadow-sm dark:shadow-none ${connected ? 'ring-2 ring-emerald-500/30' : ''}`} onClick={() => openSidebar(card.id)}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                      <Image src={card.logo} alt={card.name} width={card.logoSize} height={card.logoSize} className="brightness-0 invert" />
                    </div>
                    {connected && <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" />Conectado</span>}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{card.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{card.description}</p>
                  <div className="flex flex-wrap gap-1.5">{card.features.map((feature, i) => <span key={i} className={`px-2 py-0.5 ${card.bgColor} ${card.color} rounded text-xs`}>{feature}</span>)}</div>
                </div>
                <div className="px-5 py-3 bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                  <button className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${connected ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600' : `bg-gradient-to-r ${card.gradient} text-white hover:opacity-90`}`}>{connected ? <><Settings className="w-4 h-4" />Configurar</> : <><Zap className="w-4 h-4" />Conectar</>}</button>
                </div>
              </motion.div>
            );
          })}
        </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={closeSidebar} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-800 border-l border-gray-700 z-[101] shadow-2xl">{renderSidebarContent()}</motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
      )}
    </>
  );
}
