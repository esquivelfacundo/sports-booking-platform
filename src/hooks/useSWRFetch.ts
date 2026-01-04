import useSWR, { SWRConfiguration, mutate } from 'swr';
import { apiClient } from '@/lib/api';

/**
 * Custom SWR hook that integrates with our apiClient
 * Provides a consistent interface for data fetching with caching
 */

interface UseSWRFetchOptions<T> extends SWRConfiguration<T> {
  // Whether to fetch immediately or wait for a condition
  enabled?: boolean;
}

/**
 * Generic SWR fetch hook
 * @param key - The cache key (usually the API endpoint)
 * @param options - SWR configuration options
 */
export function useSWRFetch<T = any>(
  key: string | null,
  options: UseSWRFetchOptions<T> = {}
) {
  const { enabled = true, ...swrOptions } = options;

  const { data, error, isLoading, isValidating, mutate: boundMutate } = useSWR<T>(
    enabled && key ? key : null,
    async (url: string) => apiClient.get<T>(url),
    {
      revalidateOnFocus: false, // Override global - don't refetch on every focus
      ...swrOptions,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate: boundMutate,
    // Convenience method to refresh this specific data
    refresh: () => boundMutate(),
  };
}

/**
 * Hook for fetching establishment-specific data
 * Automatically includes establishmentId in the key for proper caching
 */
export function useEstablishmentData<T = any>(
  endpoint: string,
  establishmentId: string | null,
  options: UseSWRFetchOptions<T> = {}
) {
  const key = establishmentId ? `${endpoint}?establishmentId=${establishmentId}` : null;
  
  return useSWRFetch<T>(key, {
    ...options,
    enabled: options.enabled !== false && !!establishmentId,
  });
}

/**
 * Utility to invalidate/refresh specific cached data
 * @param key - The cache key to invalidate
 */
export function invalidateCache(key: string | string[]) {
  if (Array.isArray(key)) {
    key.forEach(k => mutate(k));
  } else {
    mutate(key);
  }
}

/**
 * Utility to invalidate all cache keys that match a pattern
 * Useful for invalidating all establishment-related data
 */
export function invalidateCachePattern(pattern: string | RegExp) {
  mutate(
    (key) => {
      if (typeof key !== 'string') return false;
      if (typeof pattern === 'string') {
        return key.includes(pattern);
      }
      return pattern.test(key);
    },
    undefined,
    { revalidate: true }
  );
}

/**
 * Pre-built hooks for common data fetching scenarios
 */

// Hook for cash register data with polling
export function useCashRegister(establishmentId: string | null) {
  return useSWRFetch(
    establishmentId ? `/api/cash-registers/active?establishmentId=${establishmentId}` : null,
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true,
    }
  );
}

// Hook for courts data
export function useCourts(establishmentId: string | null) {
  return useSWRFetch(
    establishmentId ? `/api/courts?establishmentId=${establishmentId}` : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds dedup
    }
  );
}

// Hook for establishment stats
export function useEstablishmentStats(establishmentId: string | null) {
  return useSWRFetch(
    establishmentId ? `/api/bookings/establishment/${establishmentId}/stats` : null,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );
}

// Hook for notifications
export function useNotifications() {
  return useSWRFetch('/api/notifications', {
    refreshInterval: 30000, // Poll every 30 seconds
    revalidateOnFocus: true,
  });
}

export default useSWRFetch;
