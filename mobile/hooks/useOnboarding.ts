import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  onboardingComplete: '@pulse_onboarding_complete',
  tutorialComplete: '@pulse_tutorial_complete',
  welcomeBonusClaimed: '@pulse_welcome_bonus_claimed',
  firstBetPlaced: '@pulse_first_bet_placed',
};

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  hasCompletedTutorial: boolean;
  hasClaimedWelcomeBonus: boolean;
  hasPlacedFirstBet: boolean;
}

const initialState: OnboardingState = {
  hasCompletedOnboarding: false,
  hasCompletedTutorial: false,
  hasClaimedWelcomeBonus: false,
  hasPlacedFirstBet: false,
};

export function useOnboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<OnboardingState>(initialState);

  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      const [onboarding, tutorial, bonus, firstBet] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.onboardingComplete),
        AsyncStorage.getItem(STORAGE_KEYS.tutorialComplete),
        AsyncStorage.getItem(STORAGE_KEYS.welcomeBonusClaimed),
        AsyncStorage.getItem(STORAGE_KEYS.firstBetPlaced),
      ]);

      setState({
        hasCompletedOnboarding: onboarding === 'true',
        hasCompletedTutorial: tutorial === 'true',
        hasClaimedWelcomeBonus: bonus === 'true',
        hasPlacedFirstBet: firstBet === 'true',
      });
    } catch (error) {
      console.error('Error loading onboarding state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.onboardingComplete, 'true');
      setState(prev => ({ ...prev, hasCompletedOnboarding: true }));
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, []);

  const completeTutorial = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.tutorialComplete, 'true');
      setState(prev => ({ ...prev, hasCompletedTutorial: true }));
    } catch (error) {
      console.error('Error completing tutorial:', error);
    }
  }, []);

  const claimWelcomeBonus = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.welcomeBonusClaimed, 'true');
      setState(prev => ({ ...prev, hasClaimedWelcomeBonus: true }));
    } catch (error) {
      console.error('Error claiming welcome bonus:', error);
    }
  }, []);

  const markFirstBetPlaced = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.firstBetPlaced, 'true');
      setState(prev => ({ ...prev, hasPlacedFirstBet: true }));
    } catch (error) {
      console.error('Error marking first bet:', error);
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.onboardingComplete),
        AsyncStorage.removeItem(STORAGE_KEYS.tutorialComplete),
        AsyncStorage.removeItem(STORAGE_KEYS.welcomeBonusClaimed),
        AsyncStorage.removeItem(STORAGE_KEYS.firstBetPlaced),
      ]);
      setState(initialState);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  }, []);

  return {
    isLoading,
    ...state,
    completeOnboarding,
    completeTutorial,
    claimWelcomeBonus,
    markFirstBetPlaced,
    resetOnboarding,
  };
}
