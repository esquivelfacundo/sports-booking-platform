'use client';

import { useEffect, useRef } from 'react';
import { onRateLimitHit } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

/**
 * RateLimitNotifier - Listens for rate limit events from the API client
 * and displays user-friendly notifications using the Toast system.
 * 
 * This component should be mounted once at the app root level.
 */
export function RateLimitNotifier() {
  const { showWarning, showError } = useToast();
  const lastNotificationTime = useRef<number>(0);
  const hasShownMaxRetriesError = useRef<boolean>(false);
  
  // Minimum time between notifications (in ms) to avoid spamming the user
  const NOTIFICATION_COOLDOWN = 5000; // 5 seconds

  useEffect(() => {
    const unsubscribe = onRateLimitHit((retryAfter: number, attemptNumber: number) => {
      const now = Date.now();
      
      // Check if we're within the cooldown period
      if (now - lastNotificationTime.current < NOTIFICATION_COOLDOWN) {
        return;
      }
      
      lastNotificationTime.current = now;
      
      if (attemptNumber === 1) {
        // First retry attempt - show a gentle warning
        showWarning(
          'Conexión lenta',
          'Estamos procesando tu solicitud. Por favor, espera un momento.'
        );
        hasShownMaxRetriesError.current = false;
      } else if (attemptNumber === 2) {
        // Second retry - show a more informative message
        showWarning(
          'Muchas solicitudes',
          'Estás navegando muy rápido. Reintentando automáticamente...'
        );
      } else if (attemptNumber >= 3 && !hasShownMaxRetriesError.current) {
        // Max retries reached - show error with guidance
        hasShownMaxRetriesError.current = true;
        showError(
          'Límite de solicitudes alcanzado',
          `Por favor, espera ${retryAfter} segundos antes de continuar navegando.`
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [showWarning, showError]);

  // This component doesn't render anything visible
  return null;
}

export default RateLimitNotifier;
