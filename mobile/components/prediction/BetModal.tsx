import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Market, BetConfirmation } from '@/types';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { BET_LIMITS } from '@/constants/contracts';
import { BetAmountSelector } from './BetAmountSelector';

interface BetModalProps {
  visible: boolean;
  market: Market | null;
  isYes: boolean;
  userBalance: number;
  isLoading: boolean;
  onConfirm: (bet: BetConfirmation) => void;
  onCancel: () => void;
  calculatePayout: (amount: number) => Promise<number>;
}

export function BetModal({
  visible,
  market,
  isYes,
  userBalance,
  isLoading,
  onConfirm,
  onCancel,
  calculatePayout,
}: BetModalProps) {
  const [amount, setAmount] = useState<number>(BET_LIMITS.DEFAULT);
  const [payout, setPayout] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate payout when amount changes
  useEffect(() => {
    if (!market || amount === 0) {
      setPayout(null);
      return;
    }

    setIsCalculating(true);
    calculatePayout(amount)
      .then(setPayout)
      .catch(() => setPayout(null))
      .finally(() => setIsCalculating(false));
  }, [amount, market, calculatePayout]);

  const handleConfirm = () => {
    if (!market) return;
    onConfirm({
      marketId: market.id,
      isYes,
      amount,
    });
  };

  const canAfford = amount <= userBalance;
  const isValidBet = amount >= BET_LIMITS.MIN && amount <= BET_LIMITS.MAX;

  if (!market) return null;

  const formatMove = (octas: number) => (octas / 1e8).toFixed(2);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[
              styles.directionBadge,
              { backgroundColor: isYes ? COLORS.yes : COLORS.no }
            ]}>
              <Text style={styles.directionText}>
                {isYes ? 'YES' : 'NO'}
              </Text>
            </View>
            <Pressable onPress={onCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          {/* Question */}
          <Text style={styles.question} numberOfLines={2}>
            {market.question}
          </Text>

          {/* Amount Selector */}
          <BetAmountSelector
            amount={amount}
            onAmountChange={setAmount}
            maxAmount={Math.min(userBalance, BET_LIMITS.MAX)}
          />

          {/* Balance Info */}
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Your Balance:</Text>
            <Text style={[
              styles.balanceValue,
              !canAfford && styles.insufficientBalance
            ]}>
              {formatMove(userBalance)} MOVE
            </Text>
          </View>

          {/* Payout Preview */}
          <View style={styles.payoutContainer}>
            <Text style={styles.payoutLabel}>Potential Payout:</Text>
            {isCalculating ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.payoutValue}>
                {payout ? `${formatMove(payout)} MOVE` : '---'}
              </Text>
            )}
          </View>

          {/* Confirm Button */}
          <Pressable
            style={[
              styles.confirmButton,
              { backgroundColor: isYes ? COLORS.yes : COLORS.no },
              (!canAfford || !isValidBet || isLoading) && styles.disabledButton,
            ]}
            onPress={handleConfirm}
            disabled={!canAfford || !isValidBet || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.textPrimary} />
            ) : (
              <Text style={styles.confirmText}>
                {!canAfford
                  ? 'Insufficient Balance'
                  : `Bet ${formatMove(amount)} MOVE on ${isYes ? 'YES' : 'NO'}`}
              </Text>
            )}
          </Pressable>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            Swipe up on cards to skip without betting
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  directionBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  directionText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  question: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  balanceLabel: {
    color: COLORS.textSecondary,
  },
  balanceValue: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  insufficientBalance: {
    color: COLORS.error,
  },
  payoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  payoutLabel: {
    color: COLORS.textSecondary,
  },
  payoutValue: {
    color: COLORS.success,
    fontSize: 20,
    fontWeight: 'bold',
  },
  confirmButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  disabledButton: {
    opacity: 0.5,
  },
  confirmText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
