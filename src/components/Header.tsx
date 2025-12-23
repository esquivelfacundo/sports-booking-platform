'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import UserAvatar from './UserAvatar';

interface HeaderProps {
  onLoginClick?: () => void;
}

const Header = ({ onLoginClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


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
            <div className="space-y-2">
              <Link 
                href="/establecimientos" 
                className="block text-gray-300 hover:text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                Anuncia tu establecimiento
              </Link>
            </div>
          </div>
        )}
      </div>


    </header>
  );
};

export default Header;
