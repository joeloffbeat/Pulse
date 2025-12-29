import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/constants/contracts';

interface PriceData {
  price: number;
  confidence: number;
  timestamp: number;
  feedId: string;
}

interface Prices {
  BTC_USD?: PriceData;
  ETH_USD?: PriceData;
  MOVE_USD?: PriceData;
  SOL_USD?: PriceData;
}

interface UsePricesResult {
  prices: Prices;
  isLoading: boolean;
  error: Error | null;
  getPrice: (symbol: string) => number | null;
  formatPrice: (price: number) => string;
}

const REFRESH_INTERVAL = 5000; // 5 seconds

export function usePrices(): UsePricesResult {
  const [prices, setPrices] = useState<Prices>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prices`);
      if (!response.ok) throw new Error('Failed to fetch prices');

      const data = await response.json();
      setPrices(data.prices);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchPrices]);

  const getPrice = useCallback((symbol: string): number | null => {
    const key = symbol.toUpperCase().replace('/', '_') as keyof Prices;
    return prices[key]?.price ?? null;
  }, [prices]);

  const formatPrice = useCallback((price: number): string => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${price.toFixed(4)}`;
  }, []);

  return {
    prices,
    isLoading,
    error,
    getPrice,
    formatPrice,
  };
}
