import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { usePrivy } from '@privy-io/expo';
import { PositionCard } from '@/components/bets/PositionCard';
import { usePositions } from '@/hooks/usePositions';
import { useMovementWallet } from '@/hooks/useMovement';
import { COLORS, SPACING } from '@/constants/theme';
import { MODULES } from '@/constants/contracts';

type TabType = 'active' | 'won' | 'lost';

export default function BetsScreen() {
  const { user } = usePrivy();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const wallet = useMemo(() => {
    return user?.linked_accounts?.find(
      (a: any) => a.type === 'wallet' && a.chain_type === 'aptos'
    ) as any;
  }, [user?.linked_accounts]);

  const { activePositions, claimablePositions, settledPositions, isLoading, refetch } =
    usePositions(wallet?.address || '');

  const { signAndSubmitTransaction } = useMovementWallet();

  const displayedPositions = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return activePositions;
      case 'won':
        return settledPositions.filter((p) => p.isYes === p.market?.outcome);
      case 'lost':
        return settledPositions.filter((p) => p.isYes !== p.market?.outcome);
      default:
        return [];
    }
  }, [activeTab, activePositions, settledPositions]);

  const handleClaim = useCallback(async (positionId: string) => {
    if (!wallet) return;

    setClaimingId(positionId);
    try {
      await signAndSubmitTransaction(
        wallet.public_key,
        wallet.address,
        `${MODULES.POSITION}::claim_winnings`,
        [],
        [positionId]
      );
      await refetch();
    } catch (error) {
      console.error('Claim failed:', error);
    } finally {
      setClaimingId(null);
    }
  }, [wallet, signAndSubmitTransaction, refetch]);

  const wonCount = settledPositions.filter((p) => p.isYes === p.market?.outcome).length;
  const lostCount = settledPositions.filter((p) => p.isYes !== p.market?.outcome).length;

  const tabs: { key: TabType; label: string; count: number; badge?: number }[] = [
    { key: 'active', label: 'Active', count: activePositions.length },
    { key: 'won', label: 'Won', count: wonCount, badge: claimablePositions.length },
    { key: 'lost', label: 'Lost', count: lostCount },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Bets</Text>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <View style={styles.tabContent}>
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label} ({tab.count})
              </Text>
              {tab.badge && tab.badge > 0 && (
                <View style={styles.claimBadge}>
                  <Text style={styles.claimBadgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={displayedPositions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PositionCard
            position={item}
            onClaim={() => handleClaim(item.id)}
            isClaimLoading={claimingId === item.id}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bets yet</Text>
            <Text style={styles.emptySubtext}>Start swiping to make predictions!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textPrimary, padding: SPACING.lg },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activeTab: { borderBottomColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontWeight: '500' },
  activeTabText: { color: COLORS.primary },
  claimBadge: {
    backgroundColor: COLORS.success,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  claimBadgeText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700' },
  listContent: { padding: SPACING.lg },
  emptyContainer: { alignItems: 'center', paddingTop: SPACING.xxl },
  emptyText: { fontSize: 18, color: COLORS.textSecondary, fontWeight: '600' },
  emptySubtext: { color: COLORS.textMuted, marginTop: SPACING.sm },
});
