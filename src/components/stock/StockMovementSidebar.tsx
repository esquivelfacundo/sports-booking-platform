'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  FileText,
  Save,
  Loader2,
  Search
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  costPrice: number;
  category?: {
    name: string;
    color: string;
  };
}

interface StockMovementSidebarProps {
  isOpen: boolean;
  establishmentId: string;
  onClose: () => void;
  onSave: () => void;
}

const MOVEMENT_TYPES = [
  { value: 'entrada', label: 'Entrada', icon: TrendingUp, color: 'emerald', description: 'Compra o ingreso de mercadería' },
  { value: 'salida', label: 'Salida', icon: TrendingDown, color: 'red', description: 'Venta o egreso de mercadería' },
  { value: 'ajuste', label: 'Ajuste', icon: RefreshCw, color: 'blue', description: 'Corrección de inventario' },
  { value: 'venta', label: 'Venta', icon: ShoppingCart, color: 'purple', description: 'Venta directa' },
  { value: 'merma', label: 'Merma', icon: AlertTriangle, color: 'orange', description: 'Pérdida o deterioro' }
];

export const StockMovementSidebar: React.FC<StockMovementSidebarProps> = ({
  isOpen,
  establishmentId,
  onClose,
  onSave
}) => {
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    productId: '',
    type: 'entrada',
    quantity: '',
    unitCost: '',
    notes: '',
    invoiceNumber: ''
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    } else {
      resetForm();
    }
  }, [isOpen, establishmentId]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await apiClient.getProducts({
        establishmentId,
        isActive: true
      }) as any;
      setProducts(response.products || []);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      type: 'entrada',
      quantity: '',
      unitCost: '',
      notes: '',
      invoiceNumber: ''
    });
    setSelectedProduct(null);
    setSearchTerm('');
    setError('');
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      ...formData,
      productId: product.id,
      unitCost: product.costPrice.toString()
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      const data = {
        establishmentId,
        productId: formData.productId,
        type: formData.type,
        quantity,
        unitCost: parseFloat(formData.unitCost) || 0,
        notes: formData.notes || undefined,
        invoiceNumber: formData.invoiceNumber || undefined
      };

      await apiClient.createStockMovement(data);
      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error creating movement:', err);
      setError(err.message || err.response?.data?.error || 'Error al registrar el movimiento');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMovementType = MOVEMENT_TYPES.find(t => t.value === formData.type);
  const MovementIcon = selectedMovementType?.icon || Package;

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
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[600px] bg-gray-900 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-${selectedMovementType?.color}-500/20 rounded-lg flex items-center justify-center`}>
                  <MovementIcon className={`w-5 h-5 text-${selectedMovementType?.color}-400`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Registrar Movimiento
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedMovementType?.description}
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
              <form onSubmit={handleSubmit} className="p-6 space-y-6" id="movement-form">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Movement Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Tipo de Movimiento *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {MOVEMENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = formData.type === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: type.value })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? `border-${type.color}-500 bg-${type.color}-500/10`
                              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-2 ${
                            isSelected ? `text-${type.color}-400` : 'text-gray-400'
                          }`} />
                          <div className={`text-sm font-medium ${
                            isSelected ? `text-${type.color}-400` : 'text-gray-300'
                          }`}>
                            {type.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Product Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Producto *
                  </label>
                  
                  {!selectedProduct ? (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar producto..."
                          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-700 rounded-lg p-2">
                        {loadingProducts ? (
                          <div className="text-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                          </div>
                        ) : filteredProducts.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            No se encontraron productos
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleProductSelect(product)}
                              className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="text-white font-medium">{product.name}</div>
                                  <div className="text-sm text-gray-400">
                                    Stock actual: {product.currentStock} {product.unit}
                                  </div>
                                </div>
                                {product.category && (
                                  <span
                                    className="text-xs px-2 py-1 rounded-full"
                                    style={{
                                      backgroundColor: `${product.category.color}20`,
                                      color: product.category.color
                                    }}
                                  >
                                    {product.category.name}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-800 border border-emerald-500 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{selectedProduct.name}</div>
                          <div className="text-sm text-gray-400">
                            Stock actual: {selectedProduct.currentStock} {selectedProduct.unit}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(null);
                            setFormData({ ...formData, productId: '' });
                          }}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity and Cost */}
                {selectedProduct && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Cantidad *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Costo Unitario
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.unitCost}
                            onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Total Cost */}
                    {formData.quantity && formData.unitCost && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Costo Total</span>
                          <span className="text-lg font-bold text-blue-400">
                            ${(parseFloat(formData.quantity) * parseFloat(formData.unitCost)).toLocaleString('es-AR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Invoice Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Número de Factura/Comprobante
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                          type="text"
                          value={formData.invoiceNumber}
                          onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Notas
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                        placeholder="Observaciones adicionales..."
                      />
                    </div>

                    {/* New Stock Preview */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-2">Stock después del movimiento:</div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">
                          {selectedProduct.currentStock} {selectedProduct.unit}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className={`text-lg font-bold ${
                          formData.type === 'entrada' || formData.type === 'ajuste'
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}>
                          {formData.type === 'entrada' || formData.type === 'ajuste'
                            ? selectedProduct.currentStock + (parseInt(formData.quantity) || 0)
                            : selectedProduct.currentStock - (parseInt(formData.quantity) || 0)
                          } {selectedProduct.unit}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>

            {/* Footer - Fixed Actions */}
            <div className="flex-shrink-0 bg-gray-900 border-t border-gray-800 px-6 py-4">
              <div className="flex items-center justify-end space-x-3">
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
                  form="movement-form"
                  disabled={isSaving || !selectedProduct}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Registrar Movimiento</span>
                    </>
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
};
