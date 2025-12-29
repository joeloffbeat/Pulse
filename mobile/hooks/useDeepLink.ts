import { useState, useEffect, useCallback } from 'react';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const REFERRAL_CODE_KEY = 'pulse_referral_code';

interface DeepLinkState {
  targetMarketId: string | null;
  referralCode: string | null;
}

export function useDeepLink() {
  const [state, setState] = useState<DeepLinkState>({
    targetMarketId: null,
    referralCode: null,
  });

  // Load stored referral code on mount
  useEffect(() => {
    AsyncStorage.getItem(REFERRAL_CODE_KEY).then((code) => {
      if (code) {
        setState((prev) => ({ ...prev, referralCode: code }));
      }
    });
  }, []);

  const handleDeepLink = useCallback(async ({ url }: { url: string }) => {
    const { path } = Linking.parse(url);
    if (!path) return;

    const segments = path.split('/').filter(Boolean);
    console.log('Deep link received:', segments);

    if (segments[0] === 'market' && segments[1]) {
      // Navigate to feed and set target market
      setState((prev) => ({ ...prev, targetMarketId: segments[1] }));
      router.replace('/(tabs)');
    } else if (segments[0] === 'ref' && segments[1]) {
      // Store referral code
      await AsyncStorage.setItem(REFERRAL_CODE_KEY, segments[1]);
      setState((prev) => ({ ...prev, referralCode: segments[1] }));
      console.log('Referral code saved:', segments[1]);
    } else if (segments[0] === 'bets') {
      router.replace('/(tabs)/bets');
    } else if (segments[0] === 'profile') {
      router.replace('/(tabs)/profile');
    }
  }, []);

  const clearTargetMarket = useCallback(() => {
    setState((prev) => ({ ...prev, targetMarketId: null }));
  }, []);

  const consumeReferralCode = useCallback(async () => {
    const code = state.referralCode;
    if (code) {
      await AsyncStorage.removeItem(REFERRAL_CODE_KEY);
      setState((prev) => ({ ...prev, referralCode: null }));
    }
    return code;
  }, [state.referralCode]);

  return {
    targetMarketId: state.targetMarketId,
    referralCode: state.referralCode,
    handleDeepLink,
    clearTargetMarket,
    consumeReferralCode,
  };
}
