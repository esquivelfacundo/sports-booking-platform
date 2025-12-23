'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Save,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Shield
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface SetupPinSidebarProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function SetupPinSidebar({ isOpen, onComplete }: SetupPinSidebarProps) {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate PIN format
    if (!pin || !/^[0-9]{4}$/.test(pin)) {
      setError('El PIN debe ser de 4 dígitos');
      return;
    }

    // Validate PIN confirmation
    if (pin !== confirmPin) {
      setError('Los PINs no coinciden');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/staff/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pin })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('PIN configurado correctamente');
        setTimeout(() => {
          onComplete();
        }, 1000);
      } else {
        setError(data.message || 'Error al configurar el PIN');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - no click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-800 border-l border-gray-700 z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Configurar PIN de Seguridad</h2>
                  <p className="text-sm text-gray-400">Requerido para continuar</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Alert */}
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-200 font-medium">PIN requerido</p>
                    <p className="text-xs text-amber-300/70 mt-1">
                      Para garantizar la seguridad de las operaciones, debes configurar un PIN de 4 dígitos. 
                      Este PIN se te solicitará al realizar acciones importantes como crear reservas, 
                      cambiar estados de reservas, o abrir/cerrar caja.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-emerald-400">{success}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">PIN (4 dígitos)</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setPin(value);
                      }}
                      placeholder="••••"
                      className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-2xl placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent tracking-[0.5em]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                      {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Confirmar PIN</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setConfirmPin(value);
                      }}
                      placeholder="••••"
                      className="w-full pl-10 pr-10 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-2xl placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent tracking-[0.5em]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                    >
                      {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* PIN Match Indicator */}
                {pin && confirmPin && (
                  <div className={`flex items-center gap-2 text-sm ${pin === confirmPin ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pin === confirmPin ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Los PINs coinciden</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>Los PINs no coinciden</span>
                      </>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              <button
                onClick={handleSubmit}
                disabled={saving || !pin || !confirmPin || pin !== confirmPin}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Configurar PIN
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
