import { useState, useEffect, useCallback, useRef } from 'react';
import { Market } from '@/types';
import { API_BASE_URL } from '@/constants/contracts';

const CACHE_TTL = 30000; // 30 seconds

interface UseMarketsResult {
  markets: Market[];
  isLoading: boolean;
  error: Error | null;
  refetch: (force?: boolean) => Promise<void>;
}

export function useMarkets(): UseMarketsResult {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const lastFetch = useRef(0);
  const cache = useRef<Market[]>([]);

  const fetchMarkets = useCallback(async (force = false) => {
    const now = Date.now();

    // Return cached data if within TTL and not forced
    if (!force && now - lastFetch.current < CACHE_TTL && cache.current.length > 0) {
      setMarkets(cache.current);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/markets`);
      if (!response.ok) throw new Error('Failed to fetch markets');

      const data = await response.json();

      // Transform and filter active markets
      const activeMarkets: Market[] = data.markets
        .filter((m: any) => !m.settled)
        .map((m: any) => ({
          id: m.id.toString(),
          question: m.question,
          category: getCategoryName(m.category),
          resolutionTime: m.resolution_time,
          totalYesStake: parseInt(m.total_yes_stake),
          totalNoStake: parseInt(m.total_no_stake),
          outcome: m.outcome?.vec?.[0] ?? null,
          settled: m.settled,
          creator: m.creator,
          createdAt: m.created_at,
        }));

      // Update cache
      cache.current = activeMarkets;
      lastFetch.current = now;
      setMarkets(activeMarkets);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  return {
    markets,
    isLoading,
    error,
    refetch: fetchMarkets,
  };
}

function getCategoryName(category: number): string {
  const categories = ['crypto', 'sports', 'politics', 'entertainment', 'weather', 'custom'];
  return categories[category] || 'custom';
}
