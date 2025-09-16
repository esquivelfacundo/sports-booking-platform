'use client';

import { useState, useEffect } from 'react';

interface TutorialState {
  isActive: boolean;
  hasCompletedFirstLogin: boolean;
  hasCompletedDashboard: boolean;
  lastCompletedStep: string | null;
}

const TUTORIAL_STORAGE_KEY = 'establishment_tutorial_state';

export function useTutorial() {
  const [tutorialState, setTutorialState] = useState<TutorialState>({
    isActive: false,
    hasCompletedFirstLogin: false,
    hasCompletedDashboard: false,
    lastCompletedStep: null
  });

  // Load tutorial state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setTutorialState(parsed);
      } catch (error) {
        console.error('Error parsing tutorial state:', error);
      }
    }
  }, []);

  // Save tutorial state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(tutorialState));
  }, [tutorialState]);

  const startFirstLoginTutorial = () => {
    setTutorialState(prev => ({
      ...prev,
      isActive: true,
      hasCompletedFirstLogin: false
    }));
  };

  const startDashboardTutorial = () => {
    setTutorialState(prev => ({
      ...prev,
      isActive: true
    }));
  };

  const completeTutorial = (tutorialType: 'firstLogin' | 'dashboard') => {
    setTutorialState(prev => ({
      ...prev,
      isActive: false,
      hasCompletedFirstLogin: tutorialType === 'firstLogin' ? true : prev.hasCompletedFirstLogin,
      hasCompletedDashboard: tutorialType === 'dashboard' ? true : prev.hasCompletedDashboard
    }));
  };

  const skipTutorial = () => {
    setTutorialState(prev => ({
      ...prev,
      isActive: false,
      hasCompletedFirstLogin: true,
      hasCompletedDashboard: true
    }));
  };

  const resetTutorial = () => {
    setTutorialState({
      isActive: false,
      hasCompletedFirstLogin: false,
      hasCompletedDashboard: false,
      lastCompletedStep: null
    });
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
  };

  const shouldShowFirstLoginTutorial = () => {
    return !tutorialState.hasCompletedFirstLogin;
  };

  const shouldShowDashboardTutorial = () => {
    return !tutorialState.hasCompletedDashboard;
  };

  return {
    tutorialState,
    startFirstLoginTutorial,
    startDashboardTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorial,
    shouldShowFirstLoginTutorial,
    shouldShowDashboardTutorial
  };
}
