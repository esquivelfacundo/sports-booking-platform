'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
}

interface StockMovementModalProps {
  establishmentId: string;
  onClose: () => void;
  onSave: () => void;
}

const StockMovementModal = ({ establishmentId, onClose, onSave }: StockMovementModalProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'entrada' as 'entrada' | 'salida' | 'ajuste' | 'merma',
    quantity: 0,
    unitCost: '',
    reason: '',
    notes: '',
    invoiceNumber: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [establishmentId]);

  useEffect(() => {
    if (formData.productId) {
      const product = products.find(p => p.id === formData.productId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, products]);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.getProducts({
        establishmentId,
        isActive: true
      }) as any;
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = {
        establishmentId,
        productId: formData.productId,
        type: formData.type,
        quantity: formData.quantity,
        unitCost: formData.unitCost ? parseFloat(formData.unitCost) : undefined,
        reason: formData.reason || undefined,
        notes: formData.notes || undefined,
        invoiceNumber: formData.invoiceNumber || undefined
      };

      await apiClient.createStockMovement(data);
      onSave();
    } catch (err: any) {
      console.error('Error saving movement:', err);
      setError(err.response?.data?.error || 'Error al registrar el movimiento');
    } finally {
      setSaving(false);
    }
  };

  const getNewStock = () => {
    if (!selectedProduct) return 0;
    
    switch (formData.type) {
      case 'entrada':
        return selectedProduct.currentStock + formData.quantity;
      case 'salida':
      case 'merma':
        return selectedProduct.currentStock - formData.quantity;
      case 'ajuste':
        return formData.quantity;
      default:
        return selectedProduct.currentStock;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Registrar Movimiento de Stock</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Producto *
            </label>
            <select
              required
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Seleccionar producto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (Stock: {product.currentStock} {product.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Movement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Movimiento *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="entrada">Entrada (Compra/Recepción)</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste de Inventario</option>
              <option value="merma">Merma/Pérdida</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {formData.type === 'ajuste' ? 'Stock Nuevo *' : 'Cantidad *'}
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              placeholder="0"
            />
            {formData.type === 'ajuste' && (
              <p className="text-sm text-gray-400 mt-1">
                Ingresa el stock total que debería tener el producto
              </p>
            )}
          </div>

          {/* Unit Cost (only for entrada) */}
          {formData.type === 'entrada' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Costo Unitario
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                placeholder="0.00"
              />
              {formData.unitCost && formData.quantity > 0 && (
                <p className="text-sm text-emerald-400 mt-1">
                  Costo Total: ${(parseFloat(formData.unitCost) * formData.quantity).toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* Invoice Number (only for entrada) */}
          {formData.type === 'entrada' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número de Factura/Remito
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                placeholder="Ej: 0001-00001234"
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Motivo
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              placeholder="Ej: Compra a proveedor, Inventario físico, etc."
            />
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
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              placeholder="Notas adicionales..."
            />
          </div>

          {/* Stock Preview */}
          {selectedProduct && formData.quantity > 0 && (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">Vista Previa</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Stock Actual</p>
                  <p className="text-white font-semibold">
                    {selectedProduct.currentStock} {selectedProduct.unit}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Cambio</p>
                  <p className={`font-semibold ${
                    formData.type === 'entrada' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {formData.type === 'entrada' ? '+' : formData.type === 'ajuste' ? '±' : '-'}
                    {formData.type === 'ajuste' 
                      ? Math.abs(formData.quantity - selectedProduct.currentStock)
                      : formData.quantity
                    } {selectedProduct.unit}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Stock Nuevo</p>
                  <p className="text-white font-semibold">
                    {getNewStock()} {selectedProduct.unit}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Registrar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StockMovementModal;
