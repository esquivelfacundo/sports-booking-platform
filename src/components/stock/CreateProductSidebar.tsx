'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Save, Loader2, Plus, Tag } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CreateProductSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  establishmentId: string;
  initialName?: string;
  initialCostPrice?: number;
  onSave: (product: any) => void;
}

export default function CreateProductSidebar({
  isOpen,
  onClose,
  establishmentId,
  initialName = '',
  initialCostPrice = 0,
  onSave
}: CreateProductSidebarProps) {
  // Product fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [costPrice, setCostPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [profitMargin, setProfitMargin] = useState(30);
  const [minStock, setMinStock] = useState(0);
  const [unit, setUnit] = useState('unidad');
  
  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // New category form
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#10b981');
  const [savingCategory, setSavingCategory] = useState(false);
  
  // State
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryColors = [
    '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setName(initialName);
      setCostPrice(initialCostPrice);
      calculateSalePrice(initialCostPrice, profitMargin);
    }
  }, [isOpen, initialName, initialCostPrice]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await apiClient.getProductCategories(establishmentId) as any;
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSku('');
    setBarcode('');
    setDescription('');
    setCategoryId('');
    setCostPrice(0);
    setSalePrice(0);
    setProfitMargin(30);
    setMinStock(0);
    setUnit('unidad');
    setError(null);
    setShowNewCategory(false);
    setNewCategoryName('');
  };

  const calculateSalePrice = (cost: number, margin: number) => {
    const sale = cost * (1 + margin / 100);
    setSalePrice(Math.round(sale * 100) / 100);
  };

  const handleCostPriceChange = (value: number) => {
    setCostPrice(value);
    calculateSalePrice(value, profitMargin);
  };

  const handleMarginChange = (value: number) => {
    setProfitMargin(value);
    calculateSalePrice(costPrice, value);
  };

  const handleSalePriceChange = (value: number) => {
    setSalePrice(value);
    if (costPrice > 0) {
      const margin = ((value - costPrice) / costPrice) * 100;
      setProfitMargin(Math.round(margin * 100) / 100);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setSavingCategory(true);
    try {
      const response = await apiClient.createProductCategory({
        establishmentId,
        name: newCategoryName.trim(),
        color: newCategoryColor
      }) as any;
      
      setCategories(prev => [...prev, response.category]);
      setCategoryId(response.category.id);
      setShowNewCategory(false);
      setNewCategoryName('');
    } catch (err: any) {
      setError(err.message || 'Error al crear la categoría');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.createProduct({
        establishmentId,
        name: name.trim(),
        sku: sku.trim() || null,
        barcode: barcode.trim() || null,
        description: description.trim() || null,
        categoryId: categoryId || null,
        costPrice,
        salePrice,
        profitMargin,
        currentStock: 0,
        minStock,
        unit,
        trackStock: true,
        isActive: true,
      }) as any;

      onSave(response.product);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear el producto');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-800 border-l border-gray-700 z-50 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Nuevo Producto</h2>
                <p className="text-sm text-gray-400">Completa los datos del producto</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Coca Cola 500ml"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* SKU & Barcode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SKU / Código
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU-001"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Código de Barras
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="7790001234567"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categoría
            </label>
            {!showNewCategory ? (
              <div className="flex gap-2">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Sin categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowNewCategory(true)}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-gray-900 rounded-xl border border-gray-600">
                <div className="flex items-center gap-2 text-sm text-blue-400 mb-2">
                  <Tag className="w-4 h-4" />
                  Nueva Categoría
                </div>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nombre de la categoría"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  {categoryColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newCategoryColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNewCategory(false)}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateCategory}
                    disabled={savingCategory || !newCategoryName.trim()}
                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Crear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Prices */}
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-600 space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Precios</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Precio de Costo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => handleCostPriceChange(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Margen (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={profitMargin}
                    onChange={(e) => handleMarginChange(parseFloat(e.target.value) || 0)}
                    className="w-full pr-7 pl-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    min="0"
                    step="1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Precio de Venta</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => handleSalePriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-lg font-semibold focus:outline-none focus:border-emerald-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Stock Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stock Mínimo
              </label>
              <input
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Unidad
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
              >
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="g">Gramo</option>
                <option value="l">Litro</option>
                <option value="ml">Mililitro</option>
                <option value="caja">Caja</option>
                <option value="pack">Pack</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional del producto..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Crear Producto
          </button>
        </div>
      </motion.div>
    </>
  );
}
