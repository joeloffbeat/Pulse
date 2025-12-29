import Constants from "expo-constants";
import { Stack } from "expo-router";
import { PrivyProvider } from "@privy-io/expo";
import { PrivyElements } from "@privy-io/expo/ui";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { usePrivy } from "@privy-io/expo";
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import LoginScreen from "@/components/LoginScreen";
import { COLORS } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';

function RootLayoutContent() {
  const { user, isReady } = usePrivy();
  const { isLoading: onboardingLoading, hasCompletedOnboarding, completeOnboarding } = useOnboarding();

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      const { path, queryParams } = Linking.parse(url);
      // Handle /market/:id or /ref/:code routes
      console.log('Deep link received:', path, queryParams);
      // TODO: Navigate to appropriate screen based on path
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  if (!isReady || onboardingLoading) {
    return null; // Loading
  }

  // Show onboarding for new users (even before login)
  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <PrivyProvider
        appId={Constants.expoConfig?.extra?.privyAppId}
        clientId={Constants.expoConfig?.extra?.privyClientId}
      >
        <RootLayoutContent />
        <PrivyElements />
      </PrivyProvider>
    </GestureHandlerRootView>
  );
}
