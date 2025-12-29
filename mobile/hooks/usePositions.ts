import { useState, useEffect, useCallback, useMemo } from 'react';
import { Position, Market } from '@/types';
import { API_BASE_URL } from '@/constants/contracts';

interface PositionWithMarket extends Position {
  market?: Market;
}

interface UsePositionsResult {
  positions: PositionWithMarket[];
  activePositions: PositionWithMarket[];
  claimablePositions: PositionWithMarket[];
  settledPositions: PositionWithMarket[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function getCategoryName(category: number): string {
  const categories = ['crypto', 'sports', 'politics', 'entertainment', 'weather', 'custom'];
  return categories[category] || 'custom';
}

function transformMarket(m: any): Market {
  return {
    id: m.id.toString(),
    question: m.question,
    category: getCategoryName(m.category) as Market['category'],
    resolutionTime: m.resolution_time,
    totalYesStake: parseInt(m.total_yes_stake),
    totalNoStake: parseInt(m.total_no_stake),
    outcome: m.outcome?.vec?.[0] ?? null,
    settled: m.settled,
    creator: m.creator,
    createdAt: m.created_at,
  };
}

export function usePositions(userAddress: string): UsePositionsResult {
  const [positions, setPositions] = useState<PositionWithMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!userAddress) {
      setPositions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const positionsRes = await fetch(`${API_BASE_URL}/positions/${userAddress}`);
      if (!positionsRes.ok) throw new Error('Failed to fetch positions');
      const positionsData = await positionsRes.json();

      const transformedPositions: PositionWithMarket[] = positionsData.positions.map((p: any) => ({
        id: p.id.toString(),
        marketId: p.market_id.toString(),
        user: p.user,
        isYes: p.is_yes,
        amount: parseInt(p.amount),
        createdAt: p.created_at,
        claimed: p.claimed,
      }));

      const positionsWithMarkets = await Promise.all(
        transformedPositions.map(async (position) => {
          try {
            const marketRes = await fetch(`${API_BASE_URL}/markets/${position.marketId}`);
            if (marketRes.ok) {
              const marketData = await marketRes.json();
              return { ...position, market: transformMarket(marketData.market) };
            }
          } catch (e) {
            console.error('Error fetching market:', e);
          }
          return position;
        })
      );

      setPositions(positionsWithMarkets);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const activePositions = useMemo(
    () => positions.filter((p) => !p.market?.settled),
    [positions]
  );

  const claimablePositions = useMemo(
    () => positions.filter((p) =>
      p.market?.settled && !p.claimed && p.isYes === p.market?.outcome
    ),
    [positions]
  );

  const settledPositions = useMemo(
    () => positions.filter((p) => p.market?.settled),
    [positions]
  );

  return {
    positions,
    activePositions,
    claimablePositions,
    settledPositions,
    isLoading,
    error,
    refetch: fetchPositions,
  };
}
