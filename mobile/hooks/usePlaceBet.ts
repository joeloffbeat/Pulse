import { useState, useCallback } from 'react';
import { useMovementWallet } from './useMovement';
import { BetConfirmation } from '@/types';
import { MODULES, API_BASE_URL } from '@/constants/contracts';

interface UsePlaceBetOptions {
  walletAddress: string;
  publicKey: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export function usePlaceBet({
  walletAddress,
  publicKey,
  onSuccess,
  onError,
}: UsePlaceBetOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { signAndSubmitTransaction } = useMovementWallet();

  const placeBet = useCallback(async (bet: BetConfirmation) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signAndSubmitTransaction(
        publicKey,
        walletAddress,
        `${MODULES.POSITION}::place_bet`,
        [],
        [
          bet.marketId,
          bet.isYes,
          bet.amount.toString(),
        ]
      );

      if (result.success) {
        onSuccess?.(result.transactionHash);
        return result;
      } else {
        throw new Error(result.vmStatus || 'Transaction failed');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, publicKey, signAndSubmitTransaction, onSuccess, onError]);

  const calculatePayout = useCallback(async (
    marketId: string,
    isYes: boolean,
    amount: number
  ): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/markets/${marketId}/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isYes, amount }),
      });

      if (!response.ok) throw new Error('Failed to calculate payout');

      const data = await response.json();
      return data.payout;
    } catch (err) {
      console.error('Error calculating payout:', err);
      return 0;
    }
  }, []);

  return {
    placeBet,
    calculatePayout,
    isLoading,
    error,
  };
}
