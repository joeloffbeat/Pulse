import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/constants/contracts';

interface ReferralStats {
  referralCount: number;
  totalEarnings: number;
}

export function useReferrals(address: string | undefined) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/referrals/${address}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setStats({
        referralCount: data.referralCount,
        totalEarnings: data.totalEarnings,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}
