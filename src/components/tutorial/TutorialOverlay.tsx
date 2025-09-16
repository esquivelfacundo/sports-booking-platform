'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, SkipForward } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'none';
  actionText?: string;
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function TutorialOverlay({ steps, isActive, onComplete, onSkip }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const targetElement = document.querySelector(steps[currentStep].target);
    if (targetElement) {
      setHighlightedElement(targetElement);
      
      // Calculate tooltip position
      const rect = targetElement.getBoundingClientRect();
      const position = steps[currentStep].position;
      
      let x = 0, y = 0;
      
      switch (position) {
        case 'top':
          x = rect.left + rect.width / 2;
          y = rect.top - 20;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2;
          y = rect.bottom + 20;
          break;
        case 'left':
          x = rect.left - 20;
          y = rect.top + rect.height / 2;
          break;
        case 'right':
          x = rect.right + 20;
          y = rect.top + rect.height / 2;
          break;
        case 'center':
          x = window.innerWidth / 2;
          y = window.innerHeight / 2;
          break;
      }
      
      setTooltipPosition({ x, y });
      
      // Scroll element into view
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }
  }, [currentStep, isActive, steps]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isActive || !steps[currentStep]) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9998]"
            style={{ pointerEvents: 'none' }}
          />
          
          {/* Highlight spotlight */}
          {highlightedElement && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed z-[9999] pointer-events-none"
              style={{
                left: highlightedElement.getBoundingClientRect().left - 8,
                top: highlightedElement.getBoundingClientRect().top - 8,
                width: highlightedElement.getBoundingClientRect().width + 16,
                height: highlightedElement.getBoundingClientRect().height + 16,
                boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6)',
                borderRadius: '12px',
                border: '2px solid #3B82F6',
              }}
            />
          )}
          
          {/* Tutorial tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed z-[10000] bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-sm w-full mx-4"
            style={{
              left: Math.max(16, Math.min(tooltipPosition.x - 200, window.innerWidth - 416)),
              top: Math.max(16, Math.min(tooltipPosition.y, window.innerHeight - 200)),
              transform: currentStepData.position === 'center' ? 'translate(-50%, -50%)' : 'none'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{currentStepData.title}</h3>
                  <p className="text-xs text-gray-500">
                    Paso {currentStep + 1} de {steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {currentStepData.description}
              </p>
              
              {currentStepData.actionText && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-blue-800 text-xs font-medium">
                    💡 {currentStepData.actionText}
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <button
                onClick={handleSkip}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                <span>Saltar tutorial</span>
              </button>
              
              <div className="flex items-center space-x-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>
                )}
                
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  <span>{currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</span>
                  {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-1 bg-gray-100">
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
