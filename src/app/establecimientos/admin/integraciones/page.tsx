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
  Bot
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

type IntegrationType = 'OPENAI' | 'MERCADOPAGO' | 'WHATSAPP_BOT';

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
    return !!getIntegration(type as 'OPENAI');
  };

  const openSidebar = (type: IntegrationType) => { setActiveIntegration(type); setSidebarOpen(true); };
  const closeSidebar = () => {
    setSidebarOpen(false);
    setActiveIntegration(null);
    setOpenaiApiKey(''); setOpenaiTestResult(null);
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
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"><div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-400" /><div><p className="text-emerald-400 font-medium">API Key configurada</p><p className="text-sm text-gray-400 font-mono">{getIntegration('OPENAI')?.maskedApiKey}</p></div></div></div>
                  <button onClick={handleTestOpenAI} disabled={testing === 'OPENAI'} className="w-full px-4 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl font-medium hover:bg-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2">{testing === 'OPENAI' ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}Probar conexión</button>
                  {openaiTestResult && <div className={`p-4 rounded-xl ${openaiTestResult.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}><p className={openaiTestResult.success ? 'text-emerald-400' : 'text-red-400'}>{openaiTestResult.message}</p></div>}
                  <div className="pt-4 border-t border-gray-700"><p className="text-sm text-gray-400 mb-3">Actualizar API Key</p><div className="space-y-3"><div className="relative"><input type={showOpenaiKey ? 'text' : 'password'} value={openaiApiKey} onChange={(e) => setOpenaiApiKey(e.target.value)} placeholder="sk-..." className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono pr-12" /><button type="button" onClick={() => setShowOpenaiKey(!showOpenaiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showOpenaiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div><button onClick={handleSaveOpenAI} disabled={saving || !openaiApiKey.trim()} className="w-full px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}Guardar</button></div></div>
                  <button onClick={handleDeleteOpenAI} className="w-full px-4 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" />Eliminar</button>
                </>
              ) : (
                <>
                  <div className="p-4 bg-gray-800 rounded-xl"><div className="flex items-start gap-3"><Shield className="w-5 h-5 text-blue-400 mt-0.5" /><p className="text-gray-300 text-sm">Tu API Key se almacena encriptada.</p></div></div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-2">API Key de OpenAI</label><div className="relative"><input type={showOpenaiKey ? 'text' : 'password'} value={openaiApiKey} onChange={(e) => setOpenaiApiKey(e.target.value)} placeholder="sk-..." className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono pr-12" /><button type="button" onClick={() => setShowOpenaiKey(!showOpenaiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showOpenaiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div><a href={card.docsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline mt-2 inline-flex items-center gap-1">Obtener API Key <ExternalLink className="w-3 h-3" /></a></div>
                  <button onClick={handleSaveOpenAI} disabled={saving || !openaiApiKey.trim()} className="w-full px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}Conectar OpenAI</button>
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
        <div className="min-h-screen p-6">
          <div className="max-w-6xl mx-auto">
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
