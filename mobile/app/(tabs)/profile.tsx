import React, { useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePrivy } from '@privy-io/expo';
import { StatsCard } from '@/components/profile/StatsCard';
import { LeaderboardList } from '@/components/profile/LeaderboardList';
import { useUserStats } from '@/hooks/useUserStats';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useMovementWallet } from '@/hooks/useMovement';
import { useReferrals } from '@/hooks/useReferrals';
import { COLORS } from '@/constants/theme';
import { shareReferral } from '@/lib/share';
import { styles } from './profile.styles';

export default function ProfileScreen() {
  const { user, logout } = usePrivy();
  const { getWalletBalance } = useMovementWallet();
  const [balance, setBalance] = React.useState(0);

  const wallet = useMemo(() => {
    return user?.linked_accounts?.find(
      (a: any) => a.type === 'wallet' && a.chain_type === 'aptos'
    ) as any;
  }, [user?.linked_accounts]);

  const { stats, isLoading: statsLoading, refetch: refetchStats } = useUserStats(wallet?.address || '');
  const { leaderboard, isLoading: leaderboardLoading, refetch: refetchLeaderboard } = useLeaderboard('daily');
  const { stats: referralStats, refetch: refetchReferrals } = useReferrals(wallet?.address);

  React.useEffect(() => {
    if (wallet?.address) {
      getWalletBalance(wallet.address).then(setBalance).catch(console.error);
    }
  }, [wallet?.address, getWalletBalance]);

  const handleRefresh = async () => {
    await Promise.all([refetchStats(), refetchLeaderboard(), refetchReferrals()]);
    if (wallet?.address) {
      getWalletBalance(wallet.address).then(setBalance);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-6)}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={statsLoading || leaderboardLoading}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Pressable style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          </Pressable>
        </View>

        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletIcon}>
            <Ionicons name="wallet" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Movement Wallet</Text>
            <Text style={styles.walletAddress}>
              {wallet?.address ? formatAddress(wallet.address) : 'Not connected'}
            </Text>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceValue}>
              {(balance / 1e8).toFixed(2)} MOVE
            </Text>
          </View>
        </View>

        {/* Invite Friends Button */}
        {wallet?.address && (
          <Pressable
            style={styles.shareReferralButton}
            onPress={() => shareReferral(wallet.address, stats?.winRate)}
          >
            <Ionicons name="person-add-outline" size={20} color="#fff" />
            <Text style={styles.shareReferralText}>Invite Friends</Text>
          </Pressable>
        )}

        {/* Referral Stats */}
        {referralStats && referralStats.referralCount > 0 && (
          <View style={styles.referralCard}>
            <Text style={styles.referralTitle}>Your Referrals</Text>
            <View style={styles.referralStatsRow}>
              <View style={styles.referralStat}>
                <Text style={styles.referralValue}>{referralStats.referralCount}</Text>
                <Text style={styles.referralLabel}>Friends Invited</Text>
              </View>
              <View style={styles.referralStat}>
                <Text style={styles.referralValue}>
                  {(referralStats.totalEarnings / 100_000_000).toFixed(2)} MOVE
                </Text>
                <Text style={styles.referralLabel}>Bonus Earned</Text>
              </View>
            </View>
          </View>
        )}

        {/* Stats */}
        {stats && <StatsCard stats={stats} />}

        {/* Leaderboard */}
        <LeaderboardList
          entries={leaderboard}
          currentUserAddress={wallet?.address}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
