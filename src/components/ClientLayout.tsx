'use client';

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SocialProvider } from "@/contexts/SocialContext";
import { BookingProvider } from "@/contexts/BookingContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { RatingProvider } from "@/contexts/RatingContext";

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/establecimientos/admin');
  const isLoginRoute = pathname === '/establecimientos/login';
  const isRegistrationRoute = pathname === '/establecimientos/registro';
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <AuthProvider>
      <SocialProvider>
        <BookingProvider>
          <NotificationProvider>
            <RatingProvider>
              {!isAdminRoute && !isLoginRoute && !isRegistrationRoute && (
                <Header 
                  onLoginClick={() => setShowLoginModal(true)}
                />
              )}
              {children}
              
              {/* Global Auth Modals - Rendered at root level */}
              <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwitchToRegister={handleSwitchToRegister}
              />
              <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={handleSwitchToLogin}
              />
            </RatingProvider>
          </NotificationProvider>
        </BookingProvider>
      </SocialProvider>
    </AuthProvider>
  );
};

export default ClientLayout;
