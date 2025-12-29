import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Market } from '@/types';
import { COLORS, BORDER_RADIUS, SPACING } from '@/constants/theme';
import { usePrices } from '@/hooks/usePrices';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const ROTATION_ANGLE = 15;

interface SwipeCardProps {
  market: Market;
  onSwipeLeft: (market: Market) => void;
  onSwipeRight: (market: Market) => void;
  onSwipeUp: (market: Market) => void;
  isFirst: boolean;
}

// Helper to extract asset from question
const extractAsset = (question: string): string | null => {
  const cryptoMatch = question.match(/\b(BTC|ETH|SOL|MOVE)\b/i);
  return cryptoMatch ? cryptoMatch[1].toUpperCase() : null;
};

export function SwipeCard({
  market,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  isFirst,
}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isFirst ? 1 : 0.95);

  const { getPrice, formatPrice } = usePrices();
  const asset = extractAsset(market.question);
  const currentPrice = asset ? getPrice(`${asset}_USD`) : null;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      const swipedRight = translateX.value > SWIPE_THRESHOLD;
      const swipedLeft = translateX.value < -SWIPE_THRESHOLD;
      const swipedUp = translateY.value < -SWIPE_THRESHOLD;

      if (swipedRight) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(onSwipeRight)(market);
      } else if (swipedLeft) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(onSwipeLeft)(market);
      } else if (swipedUp) {
        translateY.value = withTiming(-SCREEN_WIDTH, { duration: 300 });
        runOnJS(onSwipeUp)(market);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-ROTATION_ANGLE, 0, ROTATION_ANGLE],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
        { scale: scale.value },
      ],
    };
  });

  const yesStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const noStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const totalStake = market.totalYesStake + market.totalNoStake;
  const yesPercent = totalStake > 0
    ? Math.round((market.totalYesStake / totalStake) * 100)
    : 50;
  const noPercent = 100 - yesPercent;

  const yesMultiplier = market.totalYesStake > 0
    ? (totalStake / market.totalYesStake).toFixed(2)
    : '2.00';
  const noMultiplier = market.totalNoStake > 0
    ? (totalStake / market.totalNoStake).toFixed(2)
    : '2.00';

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Animated.View style={[styles.indicator, styles.yesIndicator, yesStyle]}>
          <Text style={styles.indicatorText}>YES</Text>
        </Animated.View>

        <Animated.View style={[styles.indicator, styles.noIndicator, noStyle]}>
          <Text style={styles.indicatorText}>NO</Text>
        </Animated.View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{market.category.toUpperCase()}</Text>
        </View>

        <Text style={styles.question}>{market.question}</Text>

        {/* Live Price Display */}
        {currentPrice && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Current Price</Text>
            <Text style={styles.priceValue}>{formatPrice(currentPrice)}</Text>
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>LIVE</Text>
            </View>
          </View>
        )}

        <View style={styles.oddsContainer}>
          <View style={styles.oddsBar}>
            <View style={[styles.yesBar, { width: `${yesPercent}%` }]} />
          </View>
          <View style={styles.oddsLabels}>
            <Text style={styles.yesLabel}>YES {yesPercent}%</Text>
            <Text style={styles.noLabel}>NO {noPercent}%</Text>
          </View>
        </View>

        <View style={styles.multipliersRow}>
          <View style={styles.multiplierBox}>
            <Text style={styles.multiplierLabel}>YES pays</Text>
            <Text style={[styles.multiplierValue, { color: COLORS.yes }]}>
              {yesMultiplier}x
            </Text>
          </View>
          <View style={styles.multiplierBox}>
            <Text style={styles.multiplierLabel}>NO pays</Text>
            <Text style={[styles.multiplierValue, { color: COLORS.no }]}>
              {noMultiplier}x
            </Text>
          </View>
        </View>

        <Text style={styles.resolutionTime}>
          Resolves: {new Date(market.resolutionTime * 1000).toLocaleString()}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: 420,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  indicator: {
    position: 'absolute',
    top: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
  },
  yesIndicator: {
    right: 20,
    borderColor: COLORS.yes,
    transform: [{ rotate: '15deg' }],
  },
  noIndicator: {
    left: 20,
    borderColor: COLORS.no,
    transform: [{ rotate: '-15deg' }],
  },
  indicatorText: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  categoryText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '600' },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  oddsContainer: { marginVertical: SPACING.md },
  oddsBar: {
    height: 8,
    backgroundColor: COLORS.no,
    borderRadius: 4,
    overflow: 'hidden',
  },
  yesBar: { height: '100%', backgroundColor: COLORS.yes },
  oddsLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  yesLabel: { color: COLORS.yes, fontWeight: '600' },
  noLabel: { color: COLORS.no, fontWeight: '600' },
  multipliersRow: { flexDirection: 'row', justifyContent: 'space-around' },
  multiplierBox: { alignItems: 'center' },
  multiplierLabel: { color: COLORS.textSecondary, fontSize: 12 },
  multiplierValue: { fontSize: 28, fontWeight: 'bold' },
  resolutionTime: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  priceBadge: {
    backgroundColor: COLORS.yes,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  priceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});
