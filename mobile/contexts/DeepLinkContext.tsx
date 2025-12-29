import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const REFERRAL_CODE_KEY = 'pulse_referral_code';

interface DeepLinkContextType {
  targetMarketId: string | null;
  referralCode: string | null;
  clearTargetMarket: () => void;
  consumeReferralCode: () => Promise<string | null>;
}

const DeepLinkContext = createContext<DeepLinkContextType | null>(null);

export function DeepLinkProvider({ children }: { children: React.ReactNode }) {
  const [targetMarketId, setTargetMarketId] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Load stored referral code on mount
  useEffect(() => {
    AsyncStorage.getItem(REFERRAL_CODE_KEY).then((code) => {
      if (code) setReferralCode(code);
    });
  }, []);

  const handleDeepLink = useCallback(async ({ url }: { url: string }) => {
    const { path } = Linking.parse(url);
    if (!path) return;

    const segments = path.split('/').filter(Boolean);
    console.log('Deep link received:', segments);

    if (segments[0] === 'market' && segments[1]) {
      setTargetMarketId(segments[1]);
      router.replace('/(tabs)');
    } else if (segments[0] === 'ref' && segments[1]) {
      await AsyncStorage.setItem(REFERRAL_CODE_KEY, segments[1]);
      setReferralCode(segments[1]);
      console.log('Referral code saved:', segments[1]);
    } else if (segments[0] === 'bets') {
      router.replace('/(tabs)/bets');
    } else if (segments[0] === 'profile') {
      router.replace('/(tabs)/profile');
    }
  }, []);

  // Subscribe to deep links
  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [handleDeepLink]);

  const clearTargetMarket = useCallback(() => {
    setTargetMarketId(null);
  }, []);

  const consumeReferralCode = useCallback(async () => {
    const code = referralCode;
    if (code) {
      await AsyncStorage.removeItem(REFERRAL_CODE_KEY);
      setReferralCode(null);
    }
    return code;
  }, [referralCode]);

  return (
    <DeepLinkContext.Provider
      value={{
        targetMarketId,
        referralCode,
        clearTargetMarket,
        consumeReferralCode,
      }}
    >
      {children}
    </DeepLinkContext.Provider>
  );
}

export function useDeepLinkContext() {
  const context = useContext(DeepLinkContext);
  if (!context) {
    throw new Error('useDeepLinkContext must be used within DeepLinkProvider');
  }
  return context;
}
