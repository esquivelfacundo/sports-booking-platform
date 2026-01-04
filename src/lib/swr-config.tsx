'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { apiClient } from '@/lib/api';

/**
 * Global SWR Configuration
 * 
 * This provides default settings for all SWR hooks in the application.
 * Can be overridden per-hook basis when needed.
 */

// Default fetcher that uses our apiClient
const fetcher = async (url: string) => {
  // The url is the endpoint, apiClient handles the base URL
  return apiClient.get(url);
};

// Global SWR configuration options
const swrConfig = {
  fetcher,
  // Revalidation settings
  revalidateOnFocus: true,           // Revalidate when window gets focus
  revalidateOnReconnect: true,       // Revalidate when browser regains connection
  revalidateIfStale: true,           // Revalidate if data is stale
  
  // Deduplication - prevents multiple identical requests
  dedupingInterval: 2000,            // 2 seconds - requests to same key are deduped
  
  // Cache settings
  refreshInterval: 0,                // No auto-refresh by default (set per-hook)
  
  // Error retry settings
  errorRetryCount: 3,                // Retry 3 times on error
  errorRetryInterval: 1000,          // Wait 1 second between retries
  
  // Loading state
  keepPreviousData: true,            // Keep showing old data while fetching new
  
  // Performance
  suspense: false,                   // Don't use React Suspense (more control)
  
  // Error handler (global)
  onError: (error: Error, key: string) => {
    // Don't log 401 errors (handled by apiClient)
    if (error.message?.includes('401') || error.message?.includes('Session expired')) {
      return;
    }
    console.error(`SWR Error for ${key}:`, error);
  },
};

interface SWRProviderProps {
  children: ReactNode;
}

/**
 * SWRProvider - Wrap your app with this to enable SWR caching
 */
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}

export default SWRProvider;
