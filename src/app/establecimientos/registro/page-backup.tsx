'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import EstablishmentRegistrationWizard from '@/components/establishment/EstablishmentRegistrationWizard';
import EstablishmentRegistrationIntro from '@/components/establishment/EstablishmentRegistrationIntro';
import { EstablishmentRegistration } from '@/types/establishment';

const EstablishmentRegistrationPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const handleRegistrationComplete = async (data: EstablishmentRegistration) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Implement API call to save establishment data
      console.log('Establishment registration data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store in localStorage for now (will be replaced with API)
      localStorage.setItem('establishmentRegistration', JSON.stringify(data));
      
      // Redirect to establishment dashboard
      router.push('/establecimientos/admin');
      
    } catch (error) {
      console.error('Error registering establishment:', error);
      // TODO: Show error message to user
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
      <EstablishmentRegistrationIntro
        onContinue={() => setShowWizard(true)}
      />
    );
  }

  return (
    <EstablishmentRegistrationWizard
      onComplete={handleRegistrationComplete}
      onSaveProgress={handleSaveProgress}
    />
  );
};

export default EstablishmentRegistrationPage;
