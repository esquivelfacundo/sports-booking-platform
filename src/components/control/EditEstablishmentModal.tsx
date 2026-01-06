'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Building2, Mail, Lock, Loader2, Save } from 'lucide-react';
import { EstablishmentData } from '@/services/superAdminApi';

interface EditEstablishmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  establishment: EstablishmentData | null;
}

const EditEstablishmentModal = ({ isOpen, onClose, onSuccess, establishment }: EditEstablishmentModalProps) => {
  const [formData, setFormData] = useState({
    accessEmail: '',
    accessPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (establishment && isOpen) {
      // Reset form when modal opens
      setFormData({
        accessEmail: '',
        accessPassword: '',
      });
      setError('');
      setSuccess('');
    }
  }, [establishment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!establishment) return;
    
    if (!formData.accessEmail && !formData.accessPassword) {
      setError('Debes ingresar al menos un campo para actualizar');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('superAdminToken');
      
      const payload: { accessEmail?: string; accessPassword?: string } = {};
      if (formData.accessEmail) payload.accessEmail = formData.accessEmail;
      if (formData.accessPassword) payload.accessPassword = formData.accessPassword;

      console.log('Updating establishment credentials:', { establishmentId: establishment.id, payload });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/admin/establishments/${establishment.id}/credentials`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log('Response:', { status: response.status, data });

      if (response.ok) {
        setSuccess('Credenciales actualizadas correctamente');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1500);
      } else {
        setError(data.error || data.message || 'Error al actualizar las credenciales');
      }
    } catch (err) {
      console.error('Exception updating credentials:', err);
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      accessEmail: '',
      accessPassword: '',
    });
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen || !establishment) return null;

  return (
    <>
      <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed inset-0 z-[99999] overflow-y-auto pointer-events-none">
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Editar Credenciales</h2>
                  <p className="text-sm text-gray-400">{establishment.name}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    Actualiza el email y/o contraseña de acceso para este establecimiento.
                    Deja los campos vacíos si no deseas cambiarlos.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nuevo Email de Acceso
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.accessEmail}
                      onChange={(e) => setFormData({ ...formData, accessEmail: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="nuevo@email.com"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Deja vacío para mantener el actual</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.accessPassword}
                      onChange={(e) => setFormData({ ...formData, accessPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Deja vacío para mantener la actual</p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm text-emerald-400">{success}</p>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || (!formData.accessEmail && !formData.accessPassword)}
                className="px-6 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default EditEstablishmentModal;
