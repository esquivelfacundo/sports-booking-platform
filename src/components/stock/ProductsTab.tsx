'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Package,
  Filter,
  X
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import UnifiedLoader from '@/components/ui/UnifiedLoader';
import { ProductDetailsSidebar } from './ProductDetailsSidebar';
import { CategoryManagementSidebar } from './CategoryManagementSidebar';

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
  icon?: string;
}

interface ProductsTabProps {
  establishmentId: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  showProductSidebar: boolean;
  setShowProductSidebar: (value: boolean) => void;
  showCategorySidebar: boolean;
  setShowCategorySidebar: (value: boolean) => void;
  onCategoriesChange: () => void;
}

const ProductsTab = ({ 
  establishmentId,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  showProductSidebar,
  setShowProductSidebar,
  showCategorySidebar,
  setShowCategorySidebar,
  onCategoriesChange
}: ProductsTabProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [establishmentId, selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = { establishmentId, isActive: true };
      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await apiClient.getProducts(params) as any;
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getProductCategories(establishmentId) as any;
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await apiClient.deleteProduct(productId);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  const handleToggleSelect = (productId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`¿Estás seguro de eliminar ${selectedIds.size} producto${selectedIds.size !== 1 ? 's' : ''}?`)) return;
    
    setIsDeleting(true);
    try {
      await apiClient.bulkDeleteProducts(establishmentId, Array.from(selectedIds));
      setSelectedIds(new Set());
      fetchProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Error al eliminar los productos');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductSidebar(true);
  };

  const handleProductSaved = () => {
    fetchProducts();
  };

  const handleCategorySaved = () => {
    fetchCategories();
    onCategoriesChange();
  };

  const getStockStatus = (product: Product) => {
    if (!product.trackStock) return { color: 'gray', text: 'No controlado' };
    if (product.currentStock <= 0) return { color: 'red', text: 'Sin stock' };
    if (product.currentStock <= product.minStock) return { color: 'yellow', text: 'Stock bajo' };
    return { color: 'green', text: 'Stock OK' };
  };

  const lowStockProducts = products.filter(p => 
    p.trackStock && p.currentStock <= p.minStock
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-emerald-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Productos Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {products.filter(p => p.isActive).length}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Stock Bajo</p>
              <p className="text-2xl font-bold text-yellow-500 mt-1">
                {lowStockProducts.length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Categorías</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{categories.length}</p>
            </div>
            <Filter className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>
      </div>


      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-500 font-semibold">Productos con stock bajo</h3>
              <p className="text-gray-300 text-sm mt-1">
                {lowStockProducts.length} producto{lowStockProducts.length > 1 ? 's' : ''} necesita{lowStockProducts.length > 1 ? 'n' : ''} reposición
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <UnifiedLoader size="sm" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hay productos</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Comienza agregando tu primer producto</p>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setShowProductSidebar(true);
            }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Producto</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-none">
          {/* Selection Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <span className="text-sm text-emerald-700 dark:text-emerald-300">
                {selectedIds.size} producto{selectedIds.size !== 1 ? 's' : ''} seleccionado{selectedIds.size !== 1 ? 's' : ''}
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm rounded-lg transition-colors"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Eliminar Seleccionados
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-center w-12">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedIds.size === products.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-gray-700"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    SKU/Código
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Venta
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Margen
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedIds.has(product.id) ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => handleToggleSelect(product.id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-gray-700"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="text-gray-900 dark:text-white font-medium">{product.name}</div>
                            {product.description && (
                              <div className="text-gray-500 dark:text-gray-400 text-sm truncate max-w-xs">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {product.category ? (
                          <span 
                            className="inline-block text-xs px-2 py-1 rounded-full font-medium"
                            style={{ 
                              backgroundColor: `${product.category.color}20`,
                              color: product.category.color
                            }}
                          >
                            {product.category.name}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          {product.sku && (
                            <div className="text-gray-900 dark:text-white">{product.sku}</div>
                          )}
                          {product.barcode && (
                            <div className="text-gray-500 dark:text-gray-400 text-xs">{product.barcode}</div>
                          )}
                          {!product.sku && !product.barcode && (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className={`font-semibold ${
                          stockStatus.color === 'red' ? 'text-red-500' :
                          stockStatus.color === 'yellow' ? 'text-yellow-500' :
                          stockStatus.color === 'green' ? 'text-emerald-500' :
                          'text-gray-400'
                        }`}>
                          {product.currentStock}
                        </div>
                        <div className="text-gray-400 text-xs">{product.unit}</div>
                      </td>
                      <td className="px-4 py-4 text-right text-gray-900 dark:text-white">
                        ${Number(product.costPrice).toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-4 text-right text-emerald-400 font-semibold">
                        ${Number(product.salePrice).toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-4 text-right text-blue-400">
                        {product.profitMargin}%
                      </td>
                      <td className="px-4 py-4 text-right text-gray-900 dark:text-white font-medium">
                        ${(product.currentStock * product.costPrice).toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                          stockStatus.color === 'red' ? 'bg-red-500/20 text-red-400' :
                          stockStatus.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                          stockStatus.color === 'green' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <ProductDetailsSidebar
        isOpen={showProductSidebar}
        product={selectedProduct}
        categories={categories}
        establishmentId={establishmentId}
        onClose={() => {
          setShowProductSidebar(false);
          setSelectedProduct(null);
        }}
        onSave={handleProductSaved}
        onDelete={handleDeleteProduct}
      />

      <CategoryManagementSidebar
        isOpen={showCategorySidebar}
        categories={categories}
        establishmentId={establishmentId}
        onClose={() => setShowCategorySidebar(false)}
        onSave={handleCategorySaved}
      />
    </div>
  );
};

export default ProductsTab;
