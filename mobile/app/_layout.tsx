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
import LoginScreen from "@/components/LoginScreen";
import { COLORS } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { DeepLinkProvider } from '@/contexts/DeepLinkContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function RootLayoutContent() {
  const { user, isReady } = usePrivy();
  const { isLoading: onboardingLoading, hasCompletedOnboarding, completeOnboarding } = useOnboarding();

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
        <ErrorBoundary>
          <ToastProvider>
            <DeepLinkProvider>
              <RootLayoutContent />
            </DeepLinkProvider>
          </ToastProvider>
        </ErrorBoundary>
        <PrivyElements />
      </PrivyProvider>
    </GestureHandlerRootView>
  );
}
