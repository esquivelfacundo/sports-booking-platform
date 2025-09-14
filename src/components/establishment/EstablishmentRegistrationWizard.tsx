'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Building2,
  MapPin,
  Users,
  ChevronRight,
  Clock,
  Star,
  Camera
} from 'lucide-react';
import { EstablishmentRegistration, REGISTRATION_STEPS, RegistrationStep } from '@/types/establishment';
import BasicInfoOnlyStep from './steps/BasicInfoOnlyStep';
import LocationStep from './steps/LocationStep';
import ScheduleStep from './steps/ScheduleStep';
import AmenitiesStep from './steps/AmenitiesStep';
import ImagesStep from './steps/ImagesStep';
import CourtsStep from './steps/CourtsStep';
import StaffStep from './steps/StaffStep';

interface EstablishmentRegistrationWizardProps {
  onComplete: (data: EstablishmentRegistration) => void;
  onSaveProgress?: (data: Partial<EstablishmentRegistration>) => void;
}

const EstablishmentRegistrationWizard: React.FC<EstablishmentRegistrationWizardProps> = ({
  onComplete,
  onSaveProgress
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<RegistrationStep[]>(REGISTRATION_STEPS);
  const [registrationData, setRegistrationData] = useState<Partial<EstablishmentRegistration>>({
    basicInfo: {
      name: '',
      description: '',
      phone: '',
      email: ''
    },
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    schedule: {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '22:00', closed: false },
      saturday: { open: '08:00', close: '22:00', closed: false },
      sunday: { open: '08:00', close: '22:00', closed: false }
    },
    amenities: [],
    images: {
      photos: []
    },
    courts: [],
    staff: [],
    registrationStatus: {
      basicInfo: false,
      location: false,
      schedule: false,
      amenities: false,
      images: false,
      courts: false,
      staff: false
    }
  });

  // Auto-save progress
  useEffect(() => {
    if (onSaveProgress) {
      onSaveProgress(registrationData);
    }
  }, [registrationData, onSaveProgress]);

  const updateRegistrationData = (stepData: Partial<EstablishmentRegistration>) => {
    setRegistrationData(prev => ({
      ...prev,
      ...stepData
    }));
  };

  const markStepCompleted = (stepIndex: number, completed: boolean) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, completed } : step
    ));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipStep = () => {
    markStepCompleted(currentStep, false);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const completeData: EstablishmentRegistration = {
      ...registrationData,
      registrationStatus: {
        basicInfo: steps[0].completed,
        location: steps[1].completed,
        schedule: steps[2].completed,
        amenities: steps[3].completed,
        images: steps[4].completed,
        courts: steps[5].completed,
        staff: steps[6].completed,
        completedAt: new Date()
      }
    } as EstablishmentRegistration;
    
    onComplete(completeData);
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'basic': return Building2;
      case 'location': return MapPin;
      case 'schedule': return Clock;
      case 'amenities': return Star;
      case 'images': return Camera;
      case 'courts': return MapPin;
      case 'staff': return Users;
      default: return Building2;
    }
  };

  const renderCurrentStep = () => {
    const currentStepData = steps[currentStep];
    
    switch (currentStepData.id) {
      case 'basic':
        return (
          <BasicInfoOnlyStep
            data={registrationData}
            onUpdate={updateRegistrationData}
            onValidation={(isValid: boolean) => markStepCompleted(currentStep, isValid)}
          />
        );
      case 'location':
        return (
          <LocationStep
            data={registrationData}
            onUpdate={updateRegistrationData}
            onValidation={(isValid: boolean) => markStepCompleted(currentStep, isValid)}
          />
        );
      case 'schedule':
        return (
          <ScheduleStep
            data={registrationData}
            onUpdate={updateRegistrationData}
            onValidation={(isValid: boolean) => markStepCompleted(currentStep, isValid)}
          />
        );
      case 'amenities':
        return (
          <AmenitiesStep
            data={registrationData}
            onUpdate={updateRegistrationData}
            onValidation={(isValid: boolean) => markStepCompleted(currentStep, isValid)}
          />
        );
      case 'images':
        return (
          <ImagesStep
            data={registrationData}
            onUpdate={updateRegistrationData}
            onValidation={(isValid: boolean) => markStepCompleted(currentStep, isValid)}
          />
        );
      case 'courts':
        return (
          <CourtsStep
            data={registrationData}
            onUpdate={updateRegistrationData}
            onValidation={(isValid: boolean) => markStepCompleted(currentStep, isValid)}
          />
        );
      case 'staff':
        return (
          <StaffStep
            data={registrationData}
            onUpdate={updateRegistrationData}
            onValidation={(isValid: boolean) => markStepCompleted(currentStep, isValid)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <Building2 className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">Registro de Establecimiento</h1>
          </motion.div>
          <p className="text-gray-400 text-lg">
            Configura tu establecimiento en simples pasos
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {steps.map((step, index) => {
              const Icon = getStepIcon(step.id);
              const isActive = index === currentStep;
              const isCompleted = step.completed;
              const isPast = index < currentStep;

              return (
                <React.Fragment key={step.id}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex flex-col items-center ${
                      isActive ? 'z-10' : ''
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : isActive
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : isPast
                          ? 'bg-gray-700 border-gray-600 text-gray-400'
                          : 'bg-gray-800 border-gray-700 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-emerald-400' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </div>
                      {step.required && (
                        <div className="text-xs text-orange-400 mt-1">
                          Obligatorio
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-8 mb-8"
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              currentStep === 0
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center space-x-4">
            {!steps[currentStep].required && currentStep > 0 && (
              <button
                onClick={handleSkipStep}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors duration-200"
              >
                Lo haré más tarde
              </button>
            )}

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Star className="w-5 h-5" />
                <span>Finalizar Registro</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={steps[currentStep].required && !steps[currentStep].completed}
                className={`flex items-center space-x-2 px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                  steps[currentStep].required && !steps[currentStep].completed
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600'
                }`}
              >
                <span>Continuar</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstablishmentRegistrationWizard;
