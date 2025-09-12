'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, User, Globe, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HeaderSearchBar from './HeaderSearchBar';
import UserAvatar from './UserAvatar';

interface HeaderProps {
  onLoginClick?: () => void;
}

const Header = ({ onLoginClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const pathname = usePathname();
  
  // Check if we're on homepage
  const isHomepage = pathname === '/';
  
  // Hero section height (approximately 600px based on py-24 and content)
  const heroHeight = 600;
  
  // Show search bar if not on homepage OR if scrolled past hero section
  const showSearchBar = !isHomepage || scrollY > heroHeight;

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    if (isHomepage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isHomepage]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Mis Canchas
            </div>
          </Link>

          {/* Desktop Search Bar - Hidden on homepage hero */}
          {showSearchBar && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <HeaderSearchBar />
            </motion.div>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/establecimientos" 
              className="text-gray-300 hover:text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium border border-gray-700 hover:border-gray-600"
            >
              Anuncia tu establecimiento
            </Link>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200">
                <Globe className="w-5 h-5" />
              </button>
              <UserAvatar onLoginClick={onLoginClick || (() => {})} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar - Hidden on homepage hero */}
        {showSearchBar && (
          <motion.div 
            className="lg:hidden pb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button 
              onClick={() => window.location.href = '/buscar'}
              className="w-full flex items-center border border-gray-600 rounded-xl py-3 px-4 bg-gray-800 hover:bg-gray-700 transition-all duration-200"
            >
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium text-white">¿A dónde vas?</div>
                <div className="text-xs text-gray-400">Ubicación • Deporte • Fecha</div>
              </div>
            </button>
          </motion.div>
        )}

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
              <button 
                onClick={() => window.location.href = '/buscar'}
                className="block w-full text-left text-gray-300 hover:text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                Buscar canchas
              </button>
              <div className="pt-2 border-t border-gray-700 mt-2">
                <UserAvatar onLoginClick={onLoginClick || (() => {})} />
              </div>
            </div>
          </div>
        )}
      </div>

    </header>
  );
};

export default Header;
