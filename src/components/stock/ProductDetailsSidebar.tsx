'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Package,
  DollarSign,
  BarChart3,
  Tag,
  Hash,
  FileText,
  Save,
  Trash2,
  AlertCircle,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  description?: string;
  barcode?: string;
  sku?: string;
  image?: string;
  costPrice: number;
  salePrice: number;
  profitMargin: number;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  isActive: boolean;
  trackStock: boolean;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ProductDetailsSidebarProps {
  isOpen: boolean;
  product: Product | null;
  categories: Category[];
  establishmentId: string;
  onClose: () => void;
  onSave: () => void;
  onDelete?: (productId: string) => void;
}

export const ProductDetailsSidebar: React.FC<ProductDetailsSidebarProps> = ({
  isOpen,
  product,
  categories,
  establishmentId,
  onClose,
  onSave,
  onDelete
}) => {
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    categoryId: '',
    costPrice: '',
    salePrice: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unit: 'unidad',
    isActive: true,
    trackStock: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        barcode: product.barcode || '',
        sku: product.sku || '',
        categoryId: product.categoryId || '',
        costPrice: product.costPrice?.toString() || '',
        salePrice: product.salePrice?.toString() || '',
        currentStock: product.currentStock?.toString() || '0',
        minStock: product.minStock?.toString() || '0',
        maxStock: product.maxStock?.toString() || '',
        unit: product.unit || 'unidad',
        isActive: product.isActive ?? true,
        trackStock: product.trackStock ?? true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        barcode: '',
        sku: '',
        categoryId: '',
        costPrice: '',
        salePrice: '',
        currentStock: '0',
        minStock: '0',
        maxStock: '',
        unit: 'unidad',
        isActive: true,
        trackStock: true
      });
    }
    setError('');
  }, [product]);

  const calculateMargin = () => {
    const cost = parseFloat(formData.costPrice) || 0;
    const sale = parseFloat(formData.salePrice) || 0;
    if (cost === 0) return 0;
    return ((sale - cost) / cost * 100).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const data = {
        ...formData,
        establishmentId,
        costPrice: parseFloat(formData.costPrice) || 0,
        salePrice: parseFloat(formData.salePrice) || 0,
        currentStock: parseInt(formData.currentStock) || 0,
        minStock: parseInt(formData.minStock) || 0,
        maxStock: formData.maxStock ? parseInt(formData.maxStock) : null,
        categoryId: formData.categoryId || null
      };

      if (product) {
        await apiClient.updateProduct(product.id, data);
      } else {
        await apiClient.createProduct(data);
      }

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.error || 'Error al guardar el producto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !onDelete) return;
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      setIsSaving(true);
      await apiClient.deleteProduct(product.id);
      onDelete(product.id);
      onClose();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.error || 'Error al eliminar el producto');
    } finally {
      setIsSaving(false);
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[600px] bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {product ? 'Editar Producto' : 'Nuevo Producto'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {product ? 'Modifica los datos del producto' : 'Completa la información del producto'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-6" id="product-form">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Información Básica
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    placeholder="Ej: Coca Cola 500ml"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    placeholder="Descripción del producto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SKU
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        placeholder="SKU-001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Código de Barras
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        placeholder="7790123456789"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Precios
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Precio de Costo *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Precio de Venta *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={formData.salePrice}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {formData.costPrice && formData.salePrice && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">Margen de Ganancia</span>
                      </div>
                      <span className="text-lg font-bold text-blue-400">
                        {calculateMargin()}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Control de Stock
                </h3>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="trackStock"
                    checked={formData.trackStock}
                    onChange={(e) => setFormData({ ...formData, trackStock: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 bg-gray-800 border-gray-700 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="trackStock" className="text-sm text-gray-300">
                    Controlar stock de este producto
                  </label>
                </div>

                {formData.trackStock && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Stock Actual
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.currentStock}
                          onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                          placeholder="0"
                          disabled={!!product}
                        />
                        {product && (
                          <p className="text-xs text-gray-500 mt-1">
                            Usa movimientos de stock para modificar
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Unidad
                        </label>
                        <input
                          type="text"
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                          placeholder="unidad"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Stock Mínimo
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.minStock}
                          onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Alerta cuando el stock sea menor
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Stock Máximo
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.maxStock}
                          onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Estado
                </h3>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 bg-gray-800 border-gray-700 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-300">
                    Producto activo (visible para venta)
                  </label>
                </div>
              </div>
              </form>
            </div>

            {/* Footer - Fixed Actions */}
            <div className="flex-shrink-0 bg-gray-900 border-t border-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                {product && onDelete ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    form="product-form"
                    disabled={isSaving}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{product ? 'Guardar Cambios' : 'Crear Producto'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(sidebarContent, document.body);
};
