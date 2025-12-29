import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { SwipeCard } from './SwipeCard';
import { Market, BetConfirmation } from '@/types';
import { COLORS, SPACING } from '@/constants/theme';

interface CardStackProps {
  markets: Market[];
  isLoading: boolean;
  onBet: (bet: BetConfirmation) => void;
  onSkip: (market: Market) => void;
  onRefresh: () => void;
}

export function CardStack({
  markets,
  isLoading,
  onBet,
  onSkip,
}: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeRight = useCallback((market: Market) => {
    onBet({ marketId: market.id, isYes: true, amount: 0 });
    setCurrentIndex((prev) => prev + 1);
  }, [onBet]);

  const handleSwipeLeft = useCallback((market: Market) => {
    onBet({ marketId: market.id, isYes: false, amount: 0 });
    setCurrentIndex((prev) => prev + 1);
  }, [onBet]);

  const handleSwipeUp = useCallback((market: Market) => {
    onSkip(market);
    setCurrentIndex((prev) => prev + 1);
  }, [onSkip]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading predictions...</Text>
      </View>
    );
  }

  if (markets.length === 0 || currentIndex >= markets.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No more predictions!</Text>
        <Text style={styles.emptySubtext}>
          Check back later for new markets
        </Text>
      </View>
    );
  }

  const visibleCards = markets.slice(currentIndex, currentIndex + 3);

  return (
    <View style={styles.container}>
      {visibleCards.map((market, index) => (
        <SwipeCard
          key={market.id}
          market={market}
          isFirst={index === 0}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
          onSwipeUp={handleSwipeUp}
        />
      )).reverse()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  emptyText: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
