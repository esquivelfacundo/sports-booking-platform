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
  const [error, setError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<Partial<EstablishmentRegistration> | null>(null);

  const handleRegistrationComplete = async (data: EstablishmentRegistration) => {
    console.log('RegistrationPage: Starting registration with data:', data);
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Import API dynamically to avoid SSR issues
      const { establishmentAPI } = await import('@/lib/api/establishments');
      
      console.log('RegistrationPage: Calling API registerEstablishment');
      const response = await establishmentAPI.registerEstablishment(data);
      console.log('RegistrationPage: API response received:', response);
      
      if (response.success) {
        console.log('RegistrationPage: Registration successful, storing data');
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
        
        console.log('RegistrationPage: Redirecting to login page');
        // Redirect to login page so user can authenticate properly
        router.push('/establecimientos/login?registered=true');
      } else {
        console.error('RegistrationPage: Registration failed - success is false');
        throw new Error(response.message || 'Registration failed');
      }
      
    } catch (error) {
      console.error('RegistrationPage: Error registering establishment:', error);
      setRegistrationData(data); // Save data to allow editing
      setError(error instanceof Error ? error.message : 'Error desconocido al registrar el establecimiento');
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

  if (error && registrationData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error en el Registro</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                setError(null);
                setShowWizard(true);
              }}
              className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors duration-200"
            >
              Editar y Corregir Datos
            </button>
            <button
              onClick={() => {
                setError(null);
                setRegistrationData(null);
                setShowWizard(false);
              }}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
            >
              Empezar de Nuevo
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-700 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors duration-200"
            >
              Volver al Inicio
            </button>
          </div>
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
        initialData={registrationData}
      />
    </Suspense>
  );
};

export default EstablishmentRegistrationPage;
