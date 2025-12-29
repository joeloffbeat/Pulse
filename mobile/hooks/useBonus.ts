import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/expo';
import { useMovementWallet } from './useMovement';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const PULSE_ADDRESS = '0x78a349ed835712bb5056761595110896ccf3497de4ef8af46acf8cc719b32e8e';

interface BonusState {
  balance: number;
  hasClaimed: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useBonus() {
  const { user } = usePrivy();
  const { signAndSubmitTransaction } = useMovementWallet();
  const [state, setState] = useState<BonusState>({
    balance: 0,
    hasClaimed: false,
    isLoading: true,
    error: null,
  });
  const [isClaiming, setIsClaiming] = useState(false);

  // Get wallet address from Privy
  const walletAddress = user?.linked_accounts?.find(
    (a: any) => a.type === 'wallet' && a.chain_type === 'aptos'
  )?.address as string | undefined;

  const fetchBonusBalance = useCallback(async () => {
    if (!walletAddress) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bonus/${walletAddress}`);
      const data = await response.json();

      if (data.success) {
        setState({
          balance: data.balance || 0,
          hasClaimed: data.hasClaimed || false,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false, balance: 0, hasClaimed: false }));
      }
    } catch (error) {
      console.error('Error fetching bonus:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch bonus balance',
      }));
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchBonusBalance();
  }, [fetchBonusBalance]);

  const claimWelcomeBonus = useCallback(async () => {
    if (!walletAddress || state.hasClaimed || isClaiming) {
      return { success: false, error: 'Cannot claim bonus' };
    }

    setIsClaiming(true);

    try {
      const wallet = user?.linked_accounts?.find(
        (a: any) => a.type === 'wallet' && a.chain_type === 'aptos'
      ) as any;

      if (!wallet) {
        throw new Error('No wallet found');
      }

      const result = await signAndSubmitTransaction(
        wallet.public_key,
        wallet.address,
        `${PULSE_ADDRESS}::bonus::claim_welcome_bonus`,
        [],
        []
      );

      if (result.success) {
        // Refresh balance
        await fetchBonusBalance();
        return { success: true, txHash: result.transactionHash };
      } else {
        throw new Error(result.vmStatus || 'Transaction failed');
      }
    } catch (error: any) {
      console.error('Error claiming bonus:', error);
      return { success: false, error: error.message || 'Failed to claim bonus' };
    } finally {
      setIsClaiming(false);
    }
  }, [walletAddress, state.hasClaimed, isClaiming, user, signAndSubmitTransaction, fetchBonusBalance]);

  // Format balance for display
  const balanceFormatted = (state.balance / 1e8).toFixed(2);
  const hasBonus = state.balance > 0;

  return {
    bonusBalance: state.balance,
    bonusBalanceFormatted: balanceFormatted,
    hasClaimed: state.hasClaimed,
    hasBonus,
    isLoading: state.isLoading,
    isClaiming,
    error: state.error,
    claimWelcomeBonus,
    refetch: fetchBonusBalance,
  };
}
