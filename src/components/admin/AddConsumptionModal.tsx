'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search,
  Plus,
  Minus,
  ShoppingCart,
  Package,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  salePrice: number;
  currentStock: number;
  unit: string;
  image?: string;
  category?: {
    name: string;
    color: string;
  };
}

interface AddConsumptionModalProps {
  isOpen: boolean;
  bookingId: string;
  establishmentId: string;
  onClose: () => void;
  onAdded: () => void;
}

export const AddConsumptionModal: React.FC<AddConsumptionModalProps> = ({
  isOpen,
  bookingId,
  establishmentId,
  onClose,
  onAdded
}) => {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    } else {
      setSearchTerm('');
      setSelectedItems(new Map());
    }
  }, [isOpen, establishmentId]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getProducts({
        establishmentId,
        isActive: true
      }) as any;
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (productId: string, delta: number) => {
    const newItems = new Map(selectedItems);
    const current = newItems.get(productId) || 0;
    const newQuantity = Math.max(0, current + delta);
    
    if (newQuantity === 0) {
      newItems.delete(productId);
    } else {
      newItems.set(productId, newQuantity);
    }
    
    setSelectedItems(newItems);
  };

  const handleAddConsumptions = async () => {
    if (selectedItems.size === 0) return;

    setAdding(true);
    try {
      // Add each consumption
      const promises = Array.from(selectedItems.entries()).map(([productId, quantity]) =>
        apiClient.addBookingConsumption({
          bookingId,
          productId,
          quantity
        })
      );

      await Promise.all(promises);
      onAdded();
      onClose();
    } catch (error) {
      console.error('Error adding consumptions:', error);
      alert('Error al agregar consumos');
    } finally {
      setAdding(false);
    }
  };

  const getTotalAmount = () => {
    let total = 0;
    selectedItems.forEach((quantity, productId) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        total += product.salePrice * quantity;
      }
    });
    return total;
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-gray-900 rounded-xl shadow-2xl z-50 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Agregar Consumos</h2>
                  <p className="text-sm text-gray-400">Selecciona productos para agregar a la reserva</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Products List */}
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                  <p className="text-gray-400 mt-4">Cargando productos...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No se encontraron productos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => {
                    const quantity = selectedItems.get(product.id) || 0;
                    return (
                      <div
                        key={product.id}
                        className={`bg-gray-800 rounded-lg p-4 border transition-colors ${
                          quantity > 0 ? 'border-emerald-500' : 'border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">{product.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-emerald-400 font-semibold">
                                  ${product.salePrice.toLocaleString('es-AR')}
                                </span>
                                {product.category && (
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: `${product.category.color}20`,
                                      color: product.category.color
                                    }}
                                  >
                                    {product.category.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Stock: {product.currentStock} {product.unit}
                              </p>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(product.id, -1)}
                              disabled={quantity === 0}
                              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </button>
                            <div className="w-12 text-center">
                              <span className="text-white font-semibold text-lg">{quantity}</span>
                            </div>
                            <button
                              onClick={() => handleQuantityChange(product.id, 1)}
                              disabled={quantity >= product.currentStock}
                              className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-900 border-t border-gray-800 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Total a agregar</p>
                  <p className="text-2xl font-bold text-white">
                    ${getTotalAmount().toLocaleString('es-AR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Productos</p>
                  <p className="text-lg font-semibold text-emerald-400">
                    {selectedItems.size}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  disabled={adding}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddConsumptions}
                  disabled={adding || selectedItems.size === 0}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {adding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Agregando...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Agregar Consumos</span>
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

  return createPortal(modalContent, document.body);
};
