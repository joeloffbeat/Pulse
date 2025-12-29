import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/types';
import { API_BASE_URL } from '@/constants/contracts';

interface UseUserStatsResult {
  stats: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useUserStats(userAddress: string): UseUserStatsResult {
  const [stats, setStats] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userAddress) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/stats/${userAddress}`);
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();

      setStats({
        address: userAddress,
        totalBets: parseInt(data.stats.totalBets) || 0,
        totalWon: parseInt(data.stats.totalWon) || 0,
        winRate: data.stats.totalBets > 0
          ? Math.round((data.stats.totalWon / data.stats.totalBets) * 100)
          : 0,
        streak: 0, // Would need additional tracking
        totalVolume: parseInt(data.stats.totalVolume) || 0,
      });
    } catch (err) {
      // If user has no stats yet, set defaults
      setStats({
        address: userAddress,
        totalBets: 0,
        totalWon: 0,
        winRate: 0,
        streak: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
