import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';

interface ClaimableBannerProps {
  totalClaimable: number;
  claimCount: number;
  onClaimAll: () => Promise<boolean>;
  isVisible: boolean;
  isClaiming: boolean;
  claimProgress?: { current: number; total: number };
  showCelebration?: boolean;
  onCelebrationComplete?: () => void;
}

export function ClaimableBanner({
  totalClaimable,
  claimCount,
  onClaimAll,
  isVisible,
  isClaiming,
  claimProgress,
  showCelebration,
  onCelebrationComplete,
}: ClaimableBannerProps) {
  const confettiRef = useRef<ConfettiCannon>(null);
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible && !isClaiming) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 300 });
    } else if (!isVisible) {
      translateY.value = withTiming(-100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible, isClaiming]);

  useEffect(() => {
    if (showCelebration) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      confettiRef.current?.start();
    }
  }, [showCelebration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const formatAmount = (amount: number) => {
    const moveAmount = amount / 100_000_000;
    return moveAmount.toFixed(2);
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClaimAll();
  };

  if (!isVisible && !showCelebration) return null;

  return (
    <>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.content}>
          <View style={styles.leftContent}>
            <Text style={styles.emoji}>🎉</Text>
            <View>
              <Text style={styles.title}>
                {isClaiming
                  ? `Claiming ${claimProgress?.current || 1} of ${claimProgress?.total || claimCount}...`
                  : `You have ${formatAmount(totalClaimable)} MOVE to claim!`}
              </Text>
              <Text style={styles.subtitle}>
                {claimCount} winning {claimCount === 1 ? 'bet' : 'bets'}
              </Text>
            </View>
          </View>
          <Pressable
            style={[styles.claimButton, isClaiming && styles.claimButtonDisabled]}
            onPress={handlePress}
            disabled={isClaiming}
          >
            {isClaiming ? (
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            ) : (
              <>
                <Text style={styles.claimButtonText}>Claim All</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.textPrimary} />
              </>
            )}
          </Pressable>
        </View>
      </Animated.View>
      {showCelebration && (
        <ConfettiCannon
          ref={confettiRef}
          count={100}
          origin={{ x: 200, y: -20 }}
          fadeOut
          autoStart={false}
          onAnimationEnd={onCelebrationComplete}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: COLORS.success,
    paddingTop: SPACING.xl + 44, // Account for status bar
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: { fontSize: 28, marginRight: SPACING.sm },
  title: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  claimButton: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 100,
    justifyContent: 'center',
  },
  claimButtonDisabled: { opacity: 0.7 },
  claimButtonText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 14 },
});
