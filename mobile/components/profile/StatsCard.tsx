import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '@/types';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

interface StatsCardProps {
  stats: UserProfile;
}

export function StatsCard({ stats }: StatsCardProps) {
  const statItems = [
    {
      icon: 'receipt-outline' as const,
      label: 'Total Bets',
      value: stats.totalBets.toString(),
      color: COLORS.primary,
    },
    {
      icon: 'trophy-outline' as const,
      label: 'Won',
      value: stats.totalWon.toString(),
      color: COLORS.success,
    },
    {
      icon: 'trending-up-outline' as const,
      label: 'Win Rate',
      value: `${stats.winRate}%`,
      color: stats.winRate >= 50 ? COLORS.success : COLORS.warning,
    },
    {
      icon: 'flame-outline' as const,
      label: 'Streak',
      value: stats.streak.toString(),
      color: COLORS.secondary,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Stats</Text>
      <View style={styles.grid}>
        {statItems.map((item) => (
          <View key={item.label} style={styles.statItem}>
            <Ionicons name={item.icon} size={24} color={item.color} />
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
