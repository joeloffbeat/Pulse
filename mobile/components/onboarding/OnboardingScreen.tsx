import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePrivy } from '@privy-io/expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { useMovementWallet } from '@/hooks/useMovement';
import { useOnboarding } from '@/hooks/useOnboarding';
import { WelcomeBonusAnimation } from './WelcomeBonusAnimation';
import { TutorialCard } from './TutorialCard';

const { width } = Dimensions.get('window');

interface Props {
  onComplete: () => void;
}

type SlideType = 'welcome' | 'howItWorks' | 'freeCredit' | 'demo';

export function OnboardingScreen({ onComplete }: Props) {
  const [currentSlide, setCurrentSlide] = useState<SlideType>('welcome');
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [demoCompleted, setDemoCompleted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const { user } = usePrivy();
  const { requestFaucet, getWalletBalance } = useMovementWallet();
  const { claimWelcomeBonus, completeTutorial, completeOnboarding, hasClaimedWelcomeBonus } = useOnboarding();

  const walletAddress = useMemo(() => {
    if (!user?.linked_accounts) return null;
    const aptosWallet = user.linked_accounts.find(
      (account: any) => account.type === 'wallet' && account.chain_type === 'aptos'
    );
    return (aptosWallet as any)?.address ?? null;
  }, [user?.linked_accounts]);

  const slides: SlideType[] = ['welcome', 'howItWorks', 'freeCredit', 'demo'];
  const currentIndex = slides.indexOf(currentSlide);

  const fadeToNext = useCallback((nextSlide: SlideType) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setCurrentSlide(nextSlide), 150);
  }, [fadeAnim]);

  const handleClaimBonus = useCallback(async () => {
    if (!walletAddress || hasClaimedWelcomeBonus) return;

    setIsClaimingBonus(true);
    try {
      await requestFaucet(walletAddress, 100000000); // 1 MOVE = 100000000 octas
      await claimWelcomeBonus();
      setBonusClaimed(true);
      setTimeout(() => fadeToNext('demo'), 1500);
    } catch (error) {
      console.error('Faucet error:', error);
      // Still proceed even if faucet fails
      setBonusClaimed(true);
      setTimeout(() => fadeToNext('demo'), 1000);
    } finally {
      setIsClaimingBonus(false);
    }
  }, [walletAddress, requestFaucet, claimWelcomeBonus, hasClaimedWelcomeBonus, fadeToNext]);

  const handleDemoComplete = useCallback(async () => {
    setDemoCompleted(true);
    await completeTutorial();
    setTimeout(async () => {
      await completeOnboarding();
      onComplete();
    }, 1500);
  }, [completeTutorial, completeOnboarding, onComplete]);

  const handleSkip = useCallback(async () => {
    // Claim bonus if not yet claimed and on faucet slide
    if (currentSlide === 'freeCredit' && walletAddress && !hasClaimedWelcomeBonus) {
      try {
        await requestFaucet(walletAddress, 100000000);
        await claimWelcomeBonus();
      } catch (error) {
        console.error('Faucet error on skip:', error);
      }
    }
    await completeOnboarding();
    onComplete();
  }, [currentSlide, walletAddress, hasClaimedWelcomeBonus, requestFaucet, claimWelcomeBonus, completeOnboarding, onComplete]);

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < slides.length) {
      fadeToNext(slides[nextIndex]);
    }
  }, [currentIndex, slides, fadeToNext]);

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index === currentIndex && styles.dotActive]}
        />
      ))}
    </View>
  );

  const renderSlideContent = () => {
    switch (currentSlide) {
      case 'welcome':
        return (
          <View style={styles.slideContent}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="pulse" size={80} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Welcome to Pulse</Text>
            <Text style={styles.description}>Predict outcomes. Win rewards.</Text>
            <Pressable style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
          </View>
        );

      case 'howItWorks':
        return (
          <View style={styles.slideContent}>
            <View style={styles.swipeDemo}>
              <View style={[styles.swipeArrow, styles.swipeLeft]}>
                <Ionicons name="arrow-back" size={32} color={COLORS.no} />
                <Text style={[styles.swipeText, { color: COLORS.no }]}>NO</Text>
              </View>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.yes + '20' }]}>
                <Ionicons name="swap-horizontal" size={80} color={COLORS.yes} />
              </View>
              <View style={[styles.swipeArrow, styles.swipeRight]}>
                <Ionicons name="arrow-forward" size={32} color={COLORS.yes} />
                <Text style={[styles.swipeText, { color: COLORS.yes }]}>YES</Text>
              </View>
            </View>
            <Text style={styles.title}>Swipe to Predict</Text>
            <Text style={styles.description}>
              Swipe RIGHT if you think YES{'\n'}Swipe LEFT if you think NO
            </Text>
            <Pressable style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.buttonText}>Got it</Text>
            </Pressable>
          </View>
        );

      case 'freeCredit':
        return (
          <View style={styles.slideContent}>
            <WelcomeBonusAnimation
              isLoading={isClaimingBonus}
              isSuccess={bonusClaimed}
              amount="1 MOVE"
            />
            {!isClaimingBonus && !bonusClaimed && (
              <>
                <Text style={styles.title}>Here's 1 MOVE on us!</Text>
                <Text style={styles.description}>Start predicting right away</Text>
                <Pressable
                  style={[styles.primaryButton, styles.claimButton]}
                  onPress={handleClaimBonus}
                >
                  <Ionicons name="gift" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Claim My 1 MOVE</Text>
                </Pressable>
              </>
            )}
          </View>
        );

      case 'demo':
        return (
          <GestureHandlerRootView style={styles.slideContent}>
            {!demoCompleted ? (
              <>
                <Text style={styles.title}>Try it yourself!</Text>
                <Text style={styles.description}>Swipe to make your first prediction</Text>
                <View style={styles.demoCardContainer}>
                  <TutorialCard onSwipeComplete={handleDemoComplete} />
                </View>
              </>
            ) : (
              <View style={styles.celebrationContainer}>
                <View style={[styles.iconContainer, { backgroundColor: COLORS.success + '20' }]}>
                  <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
                </View>
                <Text style={[styles.title, { color: COLORS.success }]}>You're ready!</Text>
                <Text style={styles.description}>Let's find some predictions</Text>
              </View>
            )}
          </GestureHandlerRootView>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <Animated.View style={[styles.slideWrapper, { opacity: fadeAnim }]}>
        {renderSlideContent()}
      </Animated.View>

      {renderDots()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  skipButton: { position: 'absolute', top: 60, right: 20, zIndex: 10 },
  skipText: { color: COLORS.textSecondary, fontSize: 16 },
  slideWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  slideContent: { alignItems: 'center', paddingHorizontal: SPACING.xl, width },
  iconContainer: {
    width: 160, height: 160, borderRadius: 80,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 28, fontWeight: '700', color: COLORS.textPrimary,
    textAlign: 'center', marginBottom: SPACING.md,
  },
  description: {
    fontSize: 16, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xl,
  },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl, borderRadius: BORDER_RADIUS.lg, gap: SPACING.sm,
  },
  claimButton: { backgroundColor: COLORS.warning },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  dotsContainer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginBottom: 40,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.textMuted, marginHorizontal: 4,
  },
  dotActive: { width: 24, backgroundColor: COLORS.primary },
  swipeDemo: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: SPACING.lg, gap: SPACING.md,
  },
  swipeArrow: { alignItems: 'center' },
  swipeLeft: { marginRight: SPACING.md },
  swipeRight: { marginLeft: SPACING.md },
  swipeText: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  demoCardContainer: { marginTop: SPACING.lg, alignItems: 'center' },
  celebrationContainer: { alignItems: 'center' },
});
