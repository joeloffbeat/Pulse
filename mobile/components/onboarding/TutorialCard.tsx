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
import { COLORS, BORDER_RADIUS, SPACING } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;
const ROTATION_ANGLE = 15;

interface TutorialCardProps {
  onSwipeComplete: () => void;
}

export function TutorialCard({ onSwipeComplete }: TutorialCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const hasCompleted = useSharedValue(false);

  const handleSwipe = () => {
    if (!hasCompleted.value) {
      hasCompleted.value = true;
      onSwipeComplete();
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (hasCompleted.value) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      if (hasCompleted.value) return;

      const swipedRight = translateX.value > SWIPE_THRESHOLD;
      const swipedLeft = translateX.value < -SWIPE_THRESHOLD;

      if (swipedRight) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(handleSwipe)();
      } else if (swipedLeft) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(handleSwipe)();
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

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Animated.View style={[styles.indicator, styles.yesIndicator, yesStyle]}>
          <Text style={styles.indicatorText}>YES</Text>
        </Animated.View>

        <Animated.View style={[styles.indicator, styles.noIndicator, noStyle]}>
          <Text style={styles.indicatorText}>NO</Text>
        </Animated.View>

        <View style={styles.demoBadge}>
          <Text style={styles.demoText}>DEMO</Text>
        </View>

        <Text style={styles.question}>Will BTC hit $100k by end of 2025?</Text>

        <View style={styles.oddsContainer}>
          <View style={styles.oddsBar}>
            <View style={[styles.yesBar, { width: '65%' }]} />
          </View>
          <View style={styles.oddsLabels}>
            <Text style={styles.yesLabel}>YES 65%</Text>
            <Text style={styles.noLabel}>NO 35%</Text>
          </View>
        </View>

        <View style={styles.multipliersRow}>
          <View style={styles.multiplierBox}>
            <Text style={styles.multiplierLabel}>YES pays</Text>
            <Text style={[styles.multiplierValue, { color: COLORS.yes }]}>1.54x</Text>
          </View>
          <View style={styles.multiplierBox}>
            <Text style={styles.multiplierLabel}>NO pays</Text>
            <Text style={[styles.multiplierValue, { color: COLORS.no }]}>2.86x</Text>
          </View>
        </View>

        <View style={styles.swipeHint}>
          <Text style={styles.hintText}>← Swipe to try →</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 80,
    height: 340,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  indicator: {
    position: 'absolute',
    top: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
    zIndex: 10,
  },
  yesIndicator: {
    right: 20,
    borderColor: COLORS.yes,
    backgroundColor: COLORS.yes + '20',
    transform: [{ rotate: '15deg' }],
  },
  noIndicator: {
    left: 20,
    borderColor: COLORS.no,
    backgroundColor: COLORS.no + '20',
    transform: [{ rotate: '-15deg' }],
  },
  indicatorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  demoBadge: {
    alignSelf: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  demoText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginVertical: SPACING.sm,
  },
  oddsContainer: {
    marginVertical: SPACING.sm,
  },
  oddsBar: {
    height: 8,
    backgroundColor: COLORS.no,
    borderRadius: 4,
    overflow: 'hidden',
  },
  yesBar: {
    height: '100%',
    backgroundColor: COLORS.yes,
  },
  oddsLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  yesLabel: {
    color: COLORS.yes,
    fontWeight: '600',
    fontSize: 13,
  },
  noLabel: {
    color: COLORS.no,
    fontWeight: '600',
    fontSize: 13,
  },
  multipliersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  multiplierBox: {
    alignItems: 'center',
  },
  multiplierLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  multiplierValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  swipeHint: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  hintText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
});
