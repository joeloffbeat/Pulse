import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/constants/contracts';

interface LeaderboardEntry {
  address: string;
  totalBets: number;
  totalWon: number;
  totalVolume: number;
  winRate: number;
  profit: number;
  rank: number;
}

interface UseLeaderboardResult {
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useLeaderboard(period: 'daily' | 'weekly' | 'allTime' = 'daily'): UseLeaderboardResult {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      const data = await response.json();

      const entries: LeaderboardEntry[] = (data.leaderboard || []).map(
        (entry: any, index: number) => ({
          address: entry.address,
          totalBets: entry.totalBets || 0,
          totalWon: entry.totalWon || 0,
          totalVolume: entry.totalVolume || 0,
          winRate: entry.winRate || 0,
          profit: entry.profit || 0,
          rank: index + 1,
        })
      );

      setLeaderboard(entries);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    isLoading,
    error,
    refetch: fetchLeaderboard,
  };
}
