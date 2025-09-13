'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import MobileSearchModal from './MobileSearchModal';

interface MobileSearchModalContextType {
  showMobileSearch: boolean;
  setShowMobileSearch: (show: boolean) => void;
}

const MobileSearchModalContext = createContext<MobileSearchModalContextType | undefined>(undefined);

export const useMobileSearchModal = () => {
  const context = useContext(MobileSearchModalContext);
  if (!context) {
    throw new Error('useMobileSearchModal must be used within a MobileSearchModalProvider');
  }
  return context;
};

interface MobileSearchModalProviderProps {
  children: ReactNode;
}

export const MobileSearchModalProvider = ({ children }: MobileSearchModalProviderProps) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <MobileSearchModalContext.Provider value={{ showMobileSearch, setShowMobileSearch }}>
      {children}
      <MobileSearchModal 
        isOpen={showMobileSearch} 
        onClose={() => setShowMobileSearch(false)} 
      />
    </MobileSearchModalContext.Provider>
  );
};
