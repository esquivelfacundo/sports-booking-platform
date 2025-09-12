'use client';

import { useEffect } from 'react';

export interface DashboardAction {
  action: string;
  timestamp: number;
}

export const useDashboardActions = (handlers: Record<string, () => void>) => {
  useEffect(() => {
    const checkForAction = () => {
      const storedAction = localStorage.getItem('dashboardAction');
      if (storedAction) {
        try {
          const action: DashboardAction = JSON.parse(storedAction);
          
          // Check if action is recent (within last 5 seconds)
          const isRecent = Date.now() - action.timestamp < 5000;
          
          if (isRecent && handlers[action.action]) {
            // Execute the handler
            handlers[action.action]();
            
            // Clear the action
            localStorage.removeItem('dashboardAction');
          } else if (!isRecent) {
            // Clear expired actions
            localStorage.removeItem('dashboardAction');
          }
        } catch (error) {
          console.error('Error parsing dashboard action:', error);
          localStorage.removeItem('dashboardAction');
        }
      }
    };

    // Check immediately
    checkForAction();

    // Also check when the window gains focus (in case of navigation)
    const handleFocus = () => {
      setTimeout(checkForAction, 100);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [handlers]);
};
