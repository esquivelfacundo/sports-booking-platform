'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Tag,
  Plus,
  Edit,
  Trash2,
  Save,
  AlertCircle,
  Loader2,
  Palette
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
}

interface CategoryManagementSidebarProps {
  isOpen: boolean;
  categories: Category[];
  establishmentId: string;
  onClose: () => void;
  onSave: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Orange
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

export const CategoryManagementSidebar: React.FC<CategoryManagementSidebarProps> = ({
  isOpen,
  categories,
  establishmentId,
  onClose,
  onSave
}) => {
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0]
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        color: PRESET_COLORS[0]
      });
      setEditingId(null);
      setError('');
    }
  }, [isOpen]);

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      color: PRESET_COLORS[0]
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const data = {
        ...formData,
        establishmentId
      };

      if (editingId) {
        await apiClient.updateProductCategory(editingId, data);
      } else {
        await apiClient.createProductCategory(data);
      }

      handleCancelEdit();
      onSave();
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.error || 'Error al guardar la categoría');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Los productos asociados quedarán sin categoría.')) {
      return;
    }

    try {
      setIsSaving(true);
      await apiClient.deleteProductCategory(categoryId);
      onSave();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.response?.data?.error || 'Error al eliminar la categoría');
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
            className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Gestionar Categorías
                  </h2>
                  <p className="text-sm text-gray-400">
                    Organiza tus productos por categorías
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Add/Edit Form */}
              <form onSubmit={handleSubmit} id="category-form" className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Ej: Bebidas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Descripción opcional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-full h-10 rounded-lg transition-all ${
                          formData.color === color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-gray-400" />
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-20 h-8 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-400">o elige un color personalizado</span>
                  </div>
                </div>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar Edición
                  </button>
                )}
              </form>

              {/* Categories List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Categorías Existentes ({categories.length})
                </h3>

                {categories.length === 0 ? (
                  <div className="text-center py-8 bg-gray-800/50 rounded-lg border border-gray-700">
                    <Tag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No hay categorías creadas</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-gray-800 rounded-lg border ${
                          editingId === category.id
                            ? 'border-purple-500'
                            : 'border-gray-700'
                        } p-4 hover:border-gray-600 transition-colors`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${category.color}20` }}
                            >
                              <Tag
                                className="w-5 h-5"
                                style={{ color: category.color }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{category.name}</h4>
                              {category.description && (
                                <p className="text-gray-400 text-sm">{category.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(category)}
                              disabled={isSaving}
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              disabled={isSaving}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Fixed Actions */}
            <div className="flex-shrink-0 bg-gray-900 border-t border-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  form="category-form"
                  disabled={isSaving}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingId ? 'Actualizar' : 'Crear'} Categoría</span>
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
