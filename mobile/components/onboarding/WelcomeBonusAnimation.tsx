import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@/constants/theme';

interface Props {
  isLoading: boolean;
  isSuccess: boolean;
  amount?: string;
}

export function WelcomeBonusAnimation({ isLoading, isSuccess, amount = '$1' }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const coinScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      // Pulse animation while loading
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotate animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isSuccess) {
      // Reset animations
      scaleAnim.stopAnimation();
      rotateAnim.stopAnimation();

      // Celebration animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          friction: 3,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Bounce coins in
      Animated.spring(coinScale, {
        toValue: 1,
        friction: 4,
        tension: 150,
        useNativeDriver: true,
      }).start();

      // Bounce effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ).start();
    }
  }, [isSuccess]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }, { rotate: spin }],
            },
          ]}
        >
          <Ionicons name="gift" size={80} color={COLORS.warning} />
        </Animated.View>
        <Text style={styles.loadingText}>Getting your bonus ready...</Text>
      </View>
    );
  }

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.successContainer,
            { transform: [{ scale: scaleAnim }, { translateY: bounceAnim }] },
          ]}
        >
          <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          <Animated.View style={[styles.coinBadge, { transform: [{ scale: coinScale }] }]}>
            <Text style={styles.coinText}>{amount}</Text>
          </Animated.View>
        </Animated.View>
        <Text style={styles.successText}>Bonus Claimed!</Text>
        <Text style={styles.successSubtext}>Your wallet is ready to go</Text>
      </View>
    );
  }

  // Default state - gift icon
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, styles.giftContainer]}>
        <Ionicons name="gift" size={80} color={COLORS.warning} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftContainer: {
    backgroundColor: COLORS.warning + '20',
  },
  successContainer: {
    position: 'relative',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  coinText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  successText: {
    marginTop: SPACING.lg,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.success,
  },
  successSubtext: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
