import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = BORDER_RADIUS.md,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      <Skeleton height={200} borderRadius={BORDER_RADIUS.lg} />
      <View style={styles.cardContent}>
        <Skeleton width="80%" height={24} style={{ marginBottom: 12 }} />
        <Skeleton width="60%" height={16} style={{ marginBottom: 20 }} />
        <View style={styles.cardFooter}>
          <Skeleton width={80} height={32} />
          <Skeleton width={80} height={32} />
        </View>
      </View>
    </View>
  );
}

export function PositionSkeleton() {
  return (
    <View style={styles.positionContainer}>
      <View style={styles.positionRow}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.positionContent}>
          <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={14} />
        </View>
        <Skeleton width={60} height={24} />
      </View>
    </View>
  );
}

export function PositionListSkeleton() {
  return (
    <View>
      <PositionSkeleton />
      <PositionSkeleton />
      <PositionSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.surface,
  },
  cardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  positionContainer: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginBottom: 12,
  },
  positionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  positionContent: {
    flex: 1,
  },
});
