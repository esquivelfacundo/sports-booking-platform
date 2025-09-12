'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, X, User, MessageCircle, Clock, Users, Target } from 'lucide-react';
import { useRatings } from '@/contexts/RatingContext';
import { RatingForm } from '@/types/ratings';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  matchId?: string;
  matchTitle?: string;
}

const RatingModal = ({ 
  isOpen, 
  onClose, 
  playerId, 
  playerName, 
  playerAvatar,
  matchId,
  matchTitle 
}: RatingModalProps) => {
  const { submitRating, isLoading } = useRatings();
  const [formData, setFormData] = useState<RatingForm>({
    rating: 0,
    review: '',
    categories: {
      skill: 0,
      sportsmanship: 0,
      punctuality: 0,
      communication: 0
    },
    isAnonymous: false
  });

  const handleStarClick = (field: keyof RatingForm['categories'] | 'rating', value: number) => {
    if (field === 'rating') {
      setFormData(prev => ({ ...prev, rating: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [field]: value
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      alert('Por favor selecciona una calificación general');
      return;
    }

    const success = await submitRating(playerId, formData, matchId);
    if (success) {
      onClose();
      // Reset form
      setFormData({
        rating: 0,
        review: '',
        categories: {
          skill: 0,
          sportsmanship: 0,
          punctuality: 0,
          communication: 0
        },
        isAnonymous: false
      });
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label, 
    required = false 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
    required?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-600 hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Calificar Jugador</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Player Info */}
        <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
            {playerAvatar ? (
              <img 
                src={playerAvatar} 
                alt={playerName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-medium">
                {playerName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">{playerName}</h3>
            {matchTitle && (
              <p className="text-sm text-gray-400">{matchTitle}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <StarRating
            value={formData.rating}
            onChange={(value) => handleStarClick('rating', value)}
            label="Calificación General"
            required
          />

          {/* Category Ratings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Calificaciones por Categoría</h3>
            
            <StarRating
              value={formData.categories.skill}
              onChange={(value) => handleStarClick('skill', value)}
              label="Habilidad Técnica"
            />

            <StarRating
              value={formData.categories.sportsmanship}
              onChange={(value) => handleStarClick('sportsmanship', value)}
              label="Deportividad"
            />

            <StarRating
              value={formData.categories.punctuality}
              onChange={(value) => handleStarClick('punctuality', value)}
              label="Puntualidad"
            />

            <StarRating
              value={formData.categories.communication}
              onChange={(value) => handleStarClick('communication', value)}
              label="Comunicación"
            />
          </div>

          {/* Review */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Comentario (Opcional)
            </label>
            <textarea
              value={formData.review}
              onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
              rows={4}
              placeholder="Comparte tu experiencia jugando con este jugador..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
              className="rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-300">
              Enviar calificación de forma anónima
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || formData.rating === 0}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Enviar Calificación'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RatingModal;
