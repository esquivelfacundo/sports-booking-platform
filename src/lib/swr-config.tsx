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
  
  // Error retry settings - DISABLED to prevent loops
  errorRetryCount: 0,                // Don't retry on error (prevents infinite loops)
  
  // Loading state
  keepPreviousData: true,            // Keep showing old data while fetching new
  
  // Performance
  suspense: false,                   // Don't use React Suspense (more control)
  
  // Custom error retry handler - don't retry on 429 or other client errors
  onErrorRetry: (error: any, key: string, config: any, revalidate: any, { retryCount }: { retryCount: number }) => {
    // Never retry on 429 (rate limit) or 4xx errors
    if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('rate limit')) {
      return;
    }
    // Never retry on 4xx client errors
    if (error?.status >= 400 && error?.status < 500) {
      return;
    }
    // Don't retry more than 2 times for other errors
    if (retryCount >= 2) return;
    // Retry after 5 seconds for server errors
    setTimeout(() => revalidate({ retryCount }), 5000);
  },
  
  // Error handler (global)
  onError: (error: Error, key: string) => {
    // Don't log 401 errors (handled by apiClient)
    if (error.message?.includes('401') || error.message?.includes('Session expired')) {
      return;
    }
    // Don't spam console with rate limit errors
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
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
