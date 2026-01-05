'use client';

import { useState } from 'react';
import { Menu, X, User, Calendar, Heart, LogIn } from 'lucide-react';
import Link from 'next/link';
import UserAvatar from './UserAvatar';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onLoginClick?: () => void;
}

const Header = ({ onLoginClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  console.log('Header - isAuthenticated:', isAuthenticated, 'user:', user);


  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/assets/logo-3.png" 
              alt="Mis Canchas" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/establecimientos" 
              className="text-gray-300 hover:text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium border border-gray-700 hover:border-gray-600"
            >
              Anuncia tu establecimiento
            </Link>
            
            <UserAvatar onLoginClick={onLoginClick || (() => {})} />
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-3">
            <UserAvatar onLoginClick={onLoginClick || (() => {})} />
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700 py-4">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                {/* User info */}
                <div className="flex items-center space-x-3 px-3 py-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                
                <Link 
                  href="/dashboard?section=reservations"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition-all duration-200"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Mis Reservas</span>
                </Link>
                <Link 
                  href="/dashboard?section=favorites"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition-all duration-200"
                >
                  <Heart className="w-5 h-5" />
                  <span>Favoritos</span>
                </Link>
                <div className="border-t border-gray-700 my-2" />
                <Link 
                  href="/establecimientos"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-300 hover:text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
                >
                  Anuncia tu establecimiento
                </Link>
              </div>
            ) : (
              <div className="space-y-4 px-3 py-2">
                {/* Not logged in message */}
                <div className="flex items-center space-x-3 py-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Todavía no iniciaste sesión</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLoginClick?.();
                  }}
                  className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Iniciar Sesión</span>
                </button>
                
                <div className="border-t border-gray-700 my-2" />
                <Link 
                  href="/establecimientos"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-300 hover:text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
                >
                  Anuncia tu establecimiento
                </Link>
              </div>
            )}
          </div>
        )}
      </div>


    </header>
  );
};

export default Header;
