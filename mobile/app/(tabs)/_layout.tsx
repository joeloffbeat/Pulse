import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { ClaimableBanner } from '@/components/shared/ClaimableBanner';
import { useClaimAll } from '@/hooks/useClaimAll';

export default function TabLayout() {
  const {
    claimableAmount,
    claimableCount,
    isClaiming,
    claimProgress,
    showCelebration,
    claimAll,
    resetCelebration,
  } = useClaimAll();

  const hasClaimable = claimableCount > 0;

  return (
    <View style={styles.container}>
      <ClaimableBanner
        totalClaimable={claimableAmount}
        claimCount={claimableCount}
        onClaimAll={claimAll}
        isVisible={hasClaimable}
        isClaiming={isClaiming}
        claimProgress={claimProgress ?? undefined}
        showCelebration={showCelebration}
        onCelebrationComplete={resetCelebration}
      />
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.card,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Predict',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bets"
        options={{
          title: 'My Bets',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
