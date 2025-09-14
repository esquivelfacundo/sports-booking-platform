'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import EstablishmentRegistrationWizard from '@/components/establishment/EstablishmentRegistrationWizard';
import { EstablishmentRegistration } from '@/types/establishment';

// Dynamically import components to avoid SSR issues
const EstablishmentRegistrationIntro = dynamic(
  () => import('@/components/establishment/EstablishmentRegistrationIntro'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
);

const EstablishmentRegistrationWizardDynamic = dynamic(
  () => import('@/components/establishment/EstablishmentRegistrationWizard'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
);

const EstablishmentRegistrationPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const handleRegistrationComplete = async (data: EstablishmentRegistration) => {
    setIsSubmitting(true);
    
    try {
      // For new establishments, we need to create a user account first
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        // Create user account first, then register establishment
        const { apiClient } = await import('@/lib/api');
        
        // Create account with establishment owner data
        const registerResponse = await apiClient.register({
          email: data.representative?.email || data.basicInfo?.email || '',
          password: 'temp_password_123', // This should be collected in the wizard
          firstName: data.representative?.fullName?.split(' ')[0] || 'Propietario',
          lastName: data.representative?.fullName?.split(' ').slice(1).join(' ') || 'Establecimiento',
          phone: data.basicInfo?.phone || '',
          userType: 'establishment'
        }) as any;
        
        if (!registerResponse.tokens?.accessToken) {
          throw new Error('Error al crear la cuenta de usuario');
        }
        
        // Store the new token
        localStorage.setItem('auth_token', registerResponse.tokens.accessToken);
      }
      
      // Import API dynamically to avoid SSR issues
      const { establishmentAPI } = await import('@/lib/api/establishments');
      
      const response = await establishmentAPI.registerEstablishment(data);
      
      if (response.success) {
        // Store registration success in localStorage for dashboard
        localStorage.setItem('registrationSuccess', JSON.stringify({
          establishment: response.establishment,
          status: response.status,
          timestamp: new Date().toISOString()
        }));
        
        // Also update the registration data with the establishment ID
        const updatedData = {
          ...data,
          id: response.establishment?.id,
          establishmentId: response.establishment?.id,
          status: response.status
        };
        localStorage.setItem('establishmentRegistrationData', JSON.stringify(updatedData));
        
        // Redirect to establishment dashboard
        router.push('/establecimientos/admin?registered=true');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
      
    } catch (error) {
      console.error('Error registering establishment:', error);
      // TODO: Show proper error message to user
      alert(`Error al registrar establecimiento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProgress = (data: Partial<EstablishmentRegistration>) => {
    // Auto-save progress to localStorage
    localStorage.setItem('establishmentRegistrationProgress', JSON.stringify(data));
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Registrando Establecimiento</h2>
          <p className="text-gray-400">Configurando tu cuenta y espacios deportivos...</p>
        </motion.div>
      </div>
    );
  }

  // Show intro first, then wizard
  if (!showWizard) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <EstablishmentRegistrationIntro
          onContinue={() => setShowWizard(true)}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <EstablishmentRegistrationWizard
        onComplete={handleRegistrationComplete}
        onSaveProgress={handleSaveProgress}
      />
    </Suspense>
  );
};

export default EstablishmentRegistrationPage;
