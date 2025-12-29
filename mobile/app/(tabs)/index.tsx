import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, SafeAreaView, Text } from 'react-native';
import { usePrivy } from '@privy-io/expo';
import { CardStack } from '@/components/prediction/CardStack';
import { BetModal } from '@/components/prediction/BetModal';
import { useMarkets } from '@/hooks/useMarkets';
import { usePlaceBet } from '@/hooks/usePlaceBet';
import { useMovementWallet } from '@/hooks/useMovement';
import { Market, BetConfirmation } from '@/types';
import { COLORS, SPACING } from '@/constants/theme';

export default function FeedScreen() {
  const { user } = usePrivy();
  const { markets, isLoading, refetch } = useMarkets();
  const { getWalletBalance } = useMovementWallet();

  // Get wallet info from Privy
  const wallet = useMemo(() => {
    const aptosWallet = user?.linked_accounts?.find(
      (a: any) => a.type === 'wallet' && a.chain_type === 'aptos'
    );
    return aptosWallet as any;
  }, [user?.linked_accounts]);

  const [balance, setBalance] = useState(0);
  const [pendingBet, setPendingBet] = useState<{
    market: Market;
    isYes: boolean;
  } | null>(null);

  // Fetch balance on mount
  React.useEffect(() => {
    if (wallet?.address) {
      getWalletBalance(wallet.address)
        .then((b) => setBalance(b))
        .catch(console.error);
    }
  }, [wallet?.address, getWalletBalance]);

  const { placeBet, calculatePayout, isLoading: isBetting } = usePlaceBet({
    walletAddress: wallet?.address || '',
    publicKey: wallet?.public_key || '',
    onSuccess: (txHash) => {
      console.log('Bet placed:', txHash);
      setPendingBet(null);
      // Refresh balance
      if (wallet?.address) {
        getWalletBalance(wallet.address).then(setBalance);
      }
    },
    onError: (error) => {
      console.error('Bet failed:', error);
    },
  });

  const handleBet = useCallback((bet: BetConfirmation) => {
    const market = markets.find((m) => m.id === bet.marketId);
    if (market) {
      setPendingBet({ market, isYes: bet.isYes });
    }
  }, [markets]);

  const handleSkip = useCallback((market: Market) => {
    console.log('Skipped:', market.id);
  }, []);

  const handleConfirmBet = useCallback(async (bet: BetConfirmation) => {
    try {
      await placeBet(bet);
    } catch (error) {
      // Error handled in hook
    }
  }, [placeBet]);

  const handleCalculatePayout = useCallback(async (amount: number) => {
    if (!pendingBet) return 0;
    return calculatePayout(pendingBet.market.id, pendingBet.isYes, amount);
  }, [pendingBet, calculatePayout]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pulse</Text>
        <Text style={styles.balance}>
          {(balance / 1e8).toFixed(2)} MOVE
        </Text>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        <CardStack
          markets={markets}
          isLoading={isLoading}
          onBet={handleBet}
          onSkip={handleSkip}
          onRefresh={refetch}
        />
      </View>

      {/* Bet Modal */}
      <BetModal
        visible={pendingBet !== null}
        market={pendingBet?.market ?? null}
        isYes={pendingBet?.isYes ?? true}
        userBalance={balance}
        isLoading={isBetting}
        onConfirm={handleConfirmBet}
        onCancel={() => setPendingBet(null)}
        calculatePayout={handleCalculatePayout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  balance: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
});
