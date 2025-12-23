'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Key,
  Save,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface UserProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

interface UserProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: string;
  hasPin: boolean;
  establishment?: {
    id: string;
    name: string;
    logo?: string;
  };
}

export function UserProfileSidebar({ isOpen, onClose, onUpdate }: UserProfileSidebarProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<'staff' | 'owner'>('owner');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // Mode: 'profile' | 'password' | 'pin'
  const [editMode, setEditMode] = useState<'profile' | 'password' | 'pin'>('profile');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
      setEditMode('profile'); // Reset to profile mode when opening
    }
  }, [isOpen]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/staff/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success && data.profile) {
        setProfile(data.profile);
        setUserType(data.userType || 'owner');
        setName(data.profile.name || '');
        setEmail(data.profile.email || '');
        setPhone(data.profile.phone || '');
        // PIN is masked, so we don't set it - user must enter new one
        setPin('');
      } else {
        setError(data.message || 'Error al cargar el perfil');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate based on current mode
    if (editMode === 'password') {
      if (!currentPassword) {
        setError('Debes ingresar tu contraseña actual');
        return;
      }
      if (!newPassword) {
        setError('Debes ingresar una nueva contraseña');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    }

    if (editMode === 'pin') {
      if (!pin) {
        setError('Debes ingresar un PIN');
        return;
      }
      if (!/^[0-9]{4}$/.test(pin)) {
        setError('El PIN debe ser de 4 dígitos');
        return;
      }
      if (pin !== confirmPin) {
        setError('Los PINs no coinciden');
        return;
      }
      if (profile?.hasPin && !currentPin) {
        setError('Debes ingresar tu PIN actual para cambiarlo');
        return;
      }
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      const body: Record<string, string | undefined> = {};

      // Only send profile data in profile mode
      if (editMode === 'profile') {
        body.name = name;
        body.email = email;
        body.phone = phone || undefined;
      }

      // Only send password data in password mode
      if (editMode === 'password') {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      // Only send PIN data in pin mode
      if (editMode === 'pin') {
        body.pin = pin;
        if (profile?.hasPin) {
          body.currentPin = currentPin;
        }
      }

      const response = await fetch(`${API_URL}/api/staff/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        const successMessages = {
          profile: 'Perfil actualizado correctamente',
          password: 'Contraseña actualizada correctamente',
          pin: 'PIN actualizado correctamente'
        };
        setSuccess(successMessages[editMode]);
        
        // Reload profile to get updated data
        await loadProfile();
        
        // Clear sensitive fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPin('');
        setPin('');
        setConfirmPin('');
        
        // Update localStorage only for profile changes
        if (editMode === 'profile') {
          const userData = localStorage.getItem('user_data');
          if (userData) {
            const user = JSON.parse(userData);
            user.name = name;
            user.email = email;
            user.phone = phone;
            localStorage.setItem('user_data', JSON.stringify(user));
          }
        }
        
        // Return to profile mode after successful password/pin change
        if (editMode !== 'profile') {
          setEditMode('profile');
        }
        
        onUpdate?.();
        
        // Reload page after profile update to refresh displayed data
        if (editMode === 'profile') {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        setError(data.message || 'Error al actualizar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      manager: 'Gerente',
      receptionist: 'Recepcionista',
      staff: 'Personal'
    };
    return roles[role] || role;
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Mi Perfil</h2>
                    {profile?.role && (
                      <p className="text-sm text-gray-400">{getRoleName(profile.role)}</p>
                    )}
                    {!profile?.role && userType === 'owner' && (
                      <p className="text-sm text-gray-400">Propietario</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>{success}</span>
                    </motion.div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400"
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Profile Mode - Basic Info */}
                  {editMode === 'profile' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Información básica
                      </h3>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Opcional"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Password Mode */}
                  {editMode === 'password' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        Cambiar contraseña
                      </h3>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Contraseña actual</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña actual"
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Nueva contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Ingresa tu nueva contraseña"
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Confirmar nueva contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repetir nueva contraseña"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PIN Mode */}
                  {editMode === 'pin' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        {profile?.hasPin ? 'Cambiar PIN de seguridad' : 'Configurar PIN de seguridad'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        El PIN se usa para confirmar operaciones importantes como crear reservas o abrir/cerrar caja.
                      </p>

                      {profile?.hasPin && (
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">PIN actual</label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type={showCurrentPin ? 'text' : 'password'}
                              inputMode="numeric"
                              maxLength={4}
                              value={currentPin}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                setCurrentPin(value);
                              }}
                              placeholder="••••"
                              className="w-full pl-10 pr-10 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent tracking-widest"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPin(!showCurrentPin)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                            >
                              {showCurrentPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          {profile?.hasPin ? 'Nuevo PIN (4 dígitos)' : 'PIN (4 dígitos)'}
                        </label>
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
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent tracking-widest"
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
                        <label className="block text-sm text-gray-400 mb-1">Confirmar PIN</label>
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
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent tracking-widest"
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
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Footer */}
            {!loading && (
              <div className="p-6 border-t border-gray-700 space-y-3">
                {/* Mode toggle buttons - only show in profile mode */}
                {editMode === 'profile' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setEditMode('password');
                      }}
                      className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Cambiar contraseña
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPin('');
                        setPin('');
                        setConfirmPin('');
                        setEditMode('pin');
                      }}
                      className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      Cambiar PIN
                    </button>
                  </div>
                )}

                {/* Cancel button - only show in password/pin mode */}
                {editMode !== 'profile' && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode('profile');
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setCurrentPin('');
                      setPin('');
                      setConfirmPin('');
                      setError(null);
                    }}
                    className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                )}

                {/* Save button */}
                <button
                  onClick={handleSubmit}
                  disabled={saving}
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
                      Guardar cambios
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
