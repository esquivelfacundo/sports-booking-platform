'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Settings, Heart, Calendar, Users, Search, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface UserAvatarProps {
  onLoginClick: () => void;
}

const UserAvatar = ({ onLoginClick }: UserAvatarProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={onLoginClick}
        className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <User className="w-4 h-4" />
        <span className="block">Acceder</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <span className="hidden sm:block text-white font-medium">{user.name}</span>
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50"
          >
            {/* User Info */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{user.name}</p>
                  <p className="text-sm text-gray-400 truncate">{user.email}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      {user.level}
                    </span>
                    <span className="text-xs text-gray-400">
                      {user.stats.totalGames} partidos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <Link
                href="/perfil"
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <User className="w-5 h-5" />
                <span>Mi Perfil</span>
              </Link>
              <Link
                href="/mis-reservas"
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <Calendar className="w-5 h-5" />
                <span>Mis Reservas</span>
              </Link>
              <Link
                href="/favoritos"
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <Heart className="w-5 h-5" />
                <span>Mis Favoritos</span>
              </Link>
              <Link
                href="/amigos"
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <Users className="w-5 h-5" />
                <span>Mis Amigos</span>
              </Link>
              <Link
                href="/buscar-jugadores"
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <Search className="w-5 h-5" />
                <span>Buscar Jugadores</span>
              </Link>
              <Link
                href="/equipos"
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <Users className="w-5 h-5" />
                <span>Mis Equipos</span>
              </Link>
              <Link
                href="/recomendaciones"
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <span className="text-lg">✨</span>
                <span>Recomendaciones</span>
              </Link>
              <Link
                href="/actividad"
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <span className="text-lg">📱</span>
                <span>Actividad Social</span>
              </Link>
              <Link
                href="/calificaciones"
                className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <Star className="w-5 h-5" />
                <span>Calificaciones</span>
              </Link>

              <div className="border-t border-gray-700 my-2" />

              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                className="w-full flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default UserAvatar;
