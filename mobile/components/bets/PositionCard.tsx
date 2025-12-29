import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Position, Market } from '@/types';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { shareWin } from '@/lib/share';

interface PositionCardProps {
  position: Position & { market?: Market };
  onClaim?: () => void;
  isClaimLoading?: boolean;
}

const formatMove = (octas: number) => (octas / 1e8).toFixed(2);

export function PositionCard({ position, onClaim, isClaimLoading }: PositionCardProps) {
  const { market } = position;

  const isActive = !market?.settled;
  const didWin = market?.settled && position.isYes === market.outcome;
  const canClaim = didWin && !position.claimed;

  const calculatePayout = () => {
    if (!market) return 0;
    const totalPool = market.totalYesStake + market.totalNoStake;
    const winningPool = position.isYes ? market.totalYesStake : market.totalNoStake;
    if (winningPool === 0) return 0;
    return (position.amount * totalPool) / winningPool;
  };

  const payout = calculatePayout();

  const handleShare = async () => {
    if (!didWin || !market) return;

    await shareWin({
      marketId: String(market.id),
      question: market.question,
      prediction: position.isYes ? 'YES' : 'NO',
      payout: payout,
    });
  };

  return (
    <View style={styles.card}>
      {/* Status Badge */}
      <View style={[
        styles.statusBadge,
        isActive ? styles.activeBadge : didWin ? styles.wonBadge : styles.lostBadge
      ]}>
        <Text style={styles.statusText}>
          {isActive ? 'ACTIVE' : didWin ? 'WON' : 'LOST'}
        </Text>
      </View>

      {/* Question */}
      <Text style={styles.question} numberOfLines={2}>
        {market?.question || 'Loading...'}
      </Text>

      {/* Bet Details */}
      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Your Bet</Text>
          <View style={styles.betDirection}>
            <Ionicons
              name={position.isYes ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={position.isYes ? COLORS.yes : COLORS.no}
            />
            <Text style={[styles.detailValue, { color: position.isYes ? COLORS.yes : COLORS.no }]}>
              {position.isYes ? 'YES' : 'NO'}
            </Text>
          </View>
        </View>

        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.detailValue}>{formatMove(position.amount)} MOVE</Text>
        </View>

        <View style={styles.detail}>
          <Text style={styles.detailLabel}>{isActive ? 'Potential' : 'Payout'}</Text>
          <Text style={[
            styles.detailValue,
            didWin && styles.winValue,
            !isActive && !didWin && styles.lostValue,
          ]}>
            {didWin || isActive ? `${formatMove(payout)} MOVE` : '0 MOVE'}
          </Text>
        </View>
      </View>

      {/* Claim Button */}
      {canClaim && (
        <Pressable style={styles.claimButton} onPress={onClaim} disabled={isClaimLoading}>
          <Text style={styles.claimButtonText}>
            {isClaimLoading ? 'Claiming...' : 'Claim Winnings'}
          </Text>
        </Pressable>
      )}

      {/* Already Claimed */}
      {didWin && position.claimed && (
        <View style={styles.claimedBadge}>
          <Ionicons name="checkmark" size={14} color={COLORS.success} />
          <Text style={styles.claimedText}>Claimed</Text>
        </View>
      )}

      {/* Share Win Button */}
      {didWin && (
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
          <Text style={styles.shareButtonText}>Share Win</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  activeBadge: { backgroundColor: COLORS.primary + '40' },
  wonBadge: { backgroundColor: COLORS.success + '40' },
  lostBadge: { backgroundColor: COLORS.error + '40' },
  statusText: { fontSize: 10, fontWeight: 'bold', color: COLORS.textPrimary },
  question: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.md },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detail: { alignItems: 'center' },
  detailLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  betDirection: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  winValue: { color: COLORS.success },
  lostValue: { color: COLORS.error },
  claimButton: {
    backgroundColor: COLORS.success,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  claimButtonText: { color: COLORS.textPrimary, fontWeight: 'bold' },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: SPACING.md,
  },
  claimedText: { color: COLORS.success, fontSize: 12 },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  shareButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
