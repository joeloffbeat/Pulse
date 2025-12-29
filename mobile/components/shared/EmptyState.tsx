import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

type EmptyStateType = 'no_markets' | 'no_positions' | 'no_winnings' | 'offline' | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  onRetry?: () => void;
}

const emptyStateConfig: Record<EmptyStateType, {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}> = {
  no_markets: {
    icon: 'flame-outline',
    title: 'No Markets Available',
    subtitle: 'Check back soon for new prediction markets!',
  },
  no_positions: {
    icon: 'receipt-outline',
    title: 'No Bets Yet',
    subtitle: 'Swipe on markets to place your first prediction!',
  },
  no_winnings: {
    icon: 'trophy-outline',
    title: 'No Winnings to Claim',
    subtitle: 'Your winnings will appear here when markets settle.',
  },
  offline: {
    icon: 'cloud-offline-outline',
    title: 'You\'re Offline',
    subtitle: 'Check your internet connection and try again.',
  },
  error: {
    icon: 'alert-circle-outline',
    title: 'Something Went Wrong',
    subtitle: 'We couldn\'t load this content. Please try again.',
  },
};

export function EmptyState({ type, onRetry }: EmptyStateProps) {
  const config = emptyStateConfig[type];

  return (
    <View style={styles.container}>
      <Ionicons name={config.icon} size={64} color={COLORS.textMuted} />
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.subtitle}>{config.subtitle}</Text>
      {onRetry && (
        <Pressable style={styles.button} onPress={onRetry}>
          <Ionicons name="refresh" size={18} color={COLORS.textPrimary} />
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
