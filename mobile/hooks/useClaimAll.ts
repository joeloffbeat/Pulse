import { useState, useCallback, useMemo } from 'react';
import { usePrivy } from '@privy-io/expo';
import { useMovementWallet } from './useMovement';
import { usePositions } from './usePositions';
import { MODULES } from '@/constants/contracts';
import * as Haptics from 'expo-haptics';

interface ClaimProgress {
  current: number;
  total: number;
}

interface UseClaimAllResult {
  claimableAmount: number;
  claimableCount: number;
  isClaiming: boolean;
  claimProgress: ClaimProgress | null;
  showCelebration: boolean;
  claimAll: () => Promise<boolean>;
  resetCelebration: () => void;
  refetch: () => Promise<void>;
}

export function useClaimAll(): UseClaimAllResult {
  const { user } = usePrivy();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimProgress, setClaimProgress] = useState<ClaimProgress | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const wallet = useMemo(() => {
    return user?.linked_accounts?.find(
      (a: any) => a.type === 'wallet' && a.chain_type === 'aptos'
    ) as any;
  }, [user?.linked_accounts]);

  const { claimablePositions, refetch } = usePositions(wallet?.address || '');
  const { signAndSubmitTransaction } = useMovementWallet();

  const claimableAmount = useMemo(() => {
    return claimablePositions.reduce((sum, p) => {
      if (!p.market) return sum;
      const total = p.market.totalYesStake + p.market.totalNoStake;
      const winnerPool = p.isYes ? p.market.totalYesStake : p.market.totalNoStake;
      const payout = winnerPool > 0 ? (p.amount / winnerPool) * total : 0;
      return sum + payout;
    }, 0);
  }, [claimablePositions]);

  const claimAll = useCallback(async (): Promise<boolean> => {
    if (!wallet || claimablePositions.length === 0) return false;

    setIsClaiming(true);
    setClaimProgress({ current: 0, total: claimablePositions.length });

    let successCount = 0;

    for (let i = 0; i < claimablePositions.length; i++) {
      const position = claimablePositions[i];
      setClaimProgress({ current: i + 1, total: claimablePositions.length });

      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await signAndSubmitTransaction(
          wallet.public_key,
          wallet.address,
          `${MODULES.POSITION}::claim_winnings`,
          [],
          [position.id]
        );
        successCount++;
      } catch (error) {
        console.error(`Failed to claim position ${position.id}:`, error);
        // Continue claiming other positions
      }
    }

    setIsClaiming(false);
    setClaimProgress(null);

    if (successCount > 0) {
      setShowCelebration(true);
      await refetch();
      return true;
    }

    return false;
  }, [wallet, claimablePositions, signAndSubmitTransaction, refetch]);

  const resetCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  return {
    claimableAmount,
    claimableCount: claimablePositions.length,
    isClaiming,
    claimProgress,
    showCelebration,
    claimAll,
    resetCelebration,
    refetch,
  };
}
