'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Ticket,
  Search,
  User,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Clock,
  Tag,
  Loader2,
  Check
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_booking';
  discountValue: number;
  maxDiscount?: number;
  minPurchaseAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usageCount: number;
  startDate?: string;
  endDate?: string;
  applicableDays?: number[];
  newCustomersOnly?: boolean;
  individualUseOnly?: boolean;
  specificClients?: string[];
  isActive: boolean;
}

interface CouponSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: Coupon | null;
  establishmentId: string;
  onSave: () => void;
}

const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CouponSidebar({ 
  isOpen, 
  onClose, 
  coupon, 
  establishmentId,
  onSave 
}: CouponSidebarProps) {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [searchingClients, setSearchingClients] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed_amount' | 'free_booking',
    discountValue: 0,
    maxDiscount: '',
    minPurchaseAmount: '',
    usageLimit: '',
    usageLimitPerUser: '1',
    startDate: '',
    endDate: '',
    applicableDays: [] as number[],
    newCustomersOnly: false,
    individualUseOnly: true,
    isActive: true
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount?.toString() || '',
        minPurchaseAmount: coupon.minPurchaseAmount?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || '',
        usageLimitPerUser: coupon.usageLimitPerUser?.toString() || '1',
        startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
        endDate: coupon.endDate ? coupon.endDate.split('T')[0] : '',
        applicableDays: coupon.applicableDays || [],
        newCustomersOnly: coupon.newCustomersOnly || false,
        individualUseOnly: coupon.individualUseOnly !== false,
        isActive: coupon.isActive
      });
      // Load selected clients if any
      if (coupon.specificClients && coupon.specificClients.length > 0) {
        loadSelectedClients(coupon.specificClients);
      }
    } else {
      resetForm();
    }
  }, [coupon]);

  const loadSelectedClients = async (clientIds: string[]) => {
    try {
      const token = localStorage.getItem('auth_token');
      const clientsData: Client[] = [];
      
      for (const clientId of clientIds) {
        const response = await fetch(`${API_URL}/api/clients/${clientId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data) {
          clientsData.push(data.data);
        }
      }
      
      setSelectedClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const searchClients = async (query: string) => {
    if (!query || query.length < 2) {
      setClients([]);
      return;
    }

    setSearchingClients(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/clients/establishment/${establishmentId}?search=${encodeURIComponent(query)}&limit=10`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        // Filter out already selected clients
        const filtered = (data.data || []).filter(
          (c: Client) => !selectedClients.some(sc => sc.id === c.id)
        );
        setClients(filtered);
      }
    } catch (error) {
      console.error('Error searching clients:', error);
    } finally {
      setSearchingClients(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (clientSearch) {
        searchClients(clientSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [clientSearch]);

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      maxDiscount: '',
      minPurchaseAmount: '',
      usageLimit: '',
      usageLimitPerUser: '1',
      startDate: '',
      endDate: '',
      applicableDays: [],
      newCustomersOnly: false,
      individualUseOnly: true,
      isActive: true
    });
    setSelectedClients([]);
    setClientSearch('');
    setClients([]);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const addClient = (client: Client) => {
    setSelectedClients(prev => [...prev, client]);
    setClients(prev => prev.filter(c => c.id !== client.id));
    setClientSearch('');
  };

  const removeClient = (clientId: string) => {
    setSelectedClients(prev => prev.filter(c => c.id !== clientId));
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      alert('El código y nombre son requeridos');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const url = coupon 
        ? `${API_URL}/api/coupons/${coupon.id}`
        : `${API_URL}/api/coupons`;
      
      const response = await fetch(url, {
        method: coupon ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          establishmentId,
          ...formData,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : 0,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          usageLimitPerUser: formData.usageLimitPerUser ? parseInt(formData.usageLimitPerUser) : 1,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          specificClients: selectedClients.map(c => c.id)
        })
      });

      const data = await response.json();
      if (data.success) {
        onSave();
        onClose();
      } else {
        alert(data.message || 'Error al guardar el cupón');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Error al guardar el cupón');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  const sidebarContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-800 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  {coupon ? 'Editar Cupón' : 'Nuevo Cupón'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Code and Name */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Código del cupón *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="VERANO20"
                      className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="px-4 py-2.5 bg-gray-600 text-gray-300 rounded-xl hover:bg-gray-500 text-sm font-medium transition-colors"
                    >
                      Generar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Nombre interno *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Promoción de verano"
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Descripción (visible para clientes)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="20% de descuento en tu reserva"
                    rows={2}
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Discount Type and Value */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Descuento
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Tipo</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as any }))}
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed_amount">Monto fijo ($)</option>
                      <option value="free_booking">Reserva gratis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      {formData.discountType === 'percentage' ? 'Porcentaje' : 'Monto'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {formData.discountType === 'percentage' ? '%' : '$'}
                      </span>
                      <input
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        max={formData.discountType === 'percentage' ? 100 : undefined}
                        className="w-full pl-8 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                      Descuento máximo ($)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
                      placeholder="Sin límite"
                      min="0"
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Usage Limits */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Límites de uso
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Mínimo ($)</label>
                    <input
                      type="number"
                      value={formData.minPurchaseAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, minPurchaseAmount: e.target.value }))}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Usos total</label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                      placeholder="∞"
                      min="1"
                      className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Por cliente</label>
                    <input
                      type="number"
                      value={formData.usageLimitPerUser}
                      onChange={(e) => setFormData(prev => ({ ...prev, usageLimitPerUser: e.target.value }))}
                      placeholder="1"
                      min="1"
                      className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Validez
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Desde</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Hasta</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Applicable Days */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Días válidos (dejar vacío para todos)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dayLabels.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          const days = formData.applicableDays.includes(index)
                            ? formData.applicableDays.filter(d => d !== index)
                            : [...formData.applicableDays, index];
                          setFormData(prev => ({ ...prev, applicableDays: days }));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          formData.applicableDays.includes(index)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Client Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Clientes específicos
                </h3>
                
                <p className="text-xs text-gray-500">
                  Deja vacío para que cualquier cliente pueda usar el cupón, o selecciona clientes específicos.
                </p>

                {/* Selected Clients */}
                {selectedClients.length > 0 && (
                  <div className="space-y-2">
                    {selectedClients.map(client => (
                      <div 
                        key={client.id}
                        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{client.name}</p>
                            {client.email && (
                              <p className="text-xs text-gray-400">{client.email}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeClient(client.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Client Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Buscar cliente por nombre, email o teléfono..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  {searchingClients && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                  )}
                </div>

                {/* Search Results */}
                {clients.length > 0 && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {clients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => addClient(client)}
                        className="w-full flex items-center gap-3 p-3 bg-gray-700/30 hover:bg-gray-700 rounded-xl transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{client.name}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {client.email || client.phone || 'Sin contacto'}
                          </p>
                        </div>
                        <Check className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl cursor-pointer">
                  <span className="text-sm text-gray-300">Solo para nuevos clientes</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, newCustomersOnly: !prev.newCustomersOnly }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      formData.newCustomersOnly ? 'bg-emerald-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.newCustomersOnly ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </label>
                
                <label className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl cursor-pointer">
                  <span className="text-sm text-gray-300">No combinable con otros cupones</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, individualUseOnly: !prev.individualUseOnly }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      formData.individualUseOnly ? 'bg-emerald-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.individualUseOnly ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl cursor-pointer">
                  <span className="text-sm text-gray-300">Cupón activo</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      formData.isActive ? 'bg-emerald-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.code || !formData.name}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    coupon ? 'Guardar Cambios' : 'Crear Cupón'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(sidebarContent, document.body);
}
