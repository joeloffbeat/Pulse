import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

interface LeaderboardEntry {
  address: string;
  winRate: number;
  totalVolume: number;
  rank: number;
}

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  currentUserAddress?: string;
}

export function LeaderboardList({ entries, currentUserAddress }: LeaderboardListProps) {
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatMove = (octas: number) => (octas / 1e8).toFixed(2);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return { name: 'trophy' as const, color: '#FFD700' };
      case 2: return { name: 'medal' as const, color: '#C0C0C0' };
      case 3: return { name: 'medal' as const, color: '#CD7F32' };
      default: return null;
    }
  };

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isCurrentUser = item.address === currentUserAddress;
    const rankIcon = getRankIcon(item.rank);

    return (
      <View style={[styles.row, isCurrentUser && styles.currentUserRow]}>
        <View style={styles.rankContainer}>
          {rankIcon ? (
            <Ionicons name={rankIcon.name} size={20} color={rankIcon.color} />
          ) : (
            <Text style={styles.rank}>{item.rank}</Text>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text style={[styles.address, isCurrentUser && styles.currentUserText]}>
            {formatAddress(item.address)}
            {isCurrentUser && ' (You)'}
          </Text>
          <Text style={styles.volume}>
            Volume: {formatMove(item.totalVolume)} MOVE
          </Text>
        </View>

        <View style={styles.winRateContainer}>
          <Text style={[
            styles.winRate,
            item.winRate >= 60 ? styles.highWinRate :
            item.winRate >= 50 ? styles.medWinRate : styles.lowWinRate
          ]}>
            {item.winRate.toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  if (entries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Top Predictors</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="podium-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No rankings yet</Text>
          <Text style={styles.emptySubtext}>Be the first on the leaderboard!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Predictors</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.address}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  currentUserRow: {
    backgroundColor: COLORS.primary + '20',
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  rankContainer: { width: 36, alignItems: 'center' },
  rank: { fontSize: 16, fontWeight: '600', color: COLORS.textMuted },
  userInfo: { flex: 1, marginLeft: SPACING.sm },
  address: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  currentUserText: { color: COLORS.primary },
  volume: { fontSize: 12, color: COLORS.textMuted },
  winRateContainer: { minWidth: 50, alignItems: 'flex-end' },
  winRate: { fontSize: 16, fontWeight: 'bold' },
  highWinRate: { color: COLORS.success },
  medWinRate: { color: COLORS.warning },
  lowWinRate: { color: COLORS.error },
  emptyContainer: { alignItems: 'center', padding: SPACING.xl },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, marginTop: SPACING.md },
  emptySubtext: { fontSize: 14, color: COLORS.textMuted },
});
