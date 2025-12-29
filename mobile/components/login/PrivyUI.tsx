import { useLogin } from "@privy-io/expo/ui";
import { View, Text, Animated, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { COLORS } from "@/constants/theme";
import { styles } from "./PrivyUI.styles";

const LOGIN_METHODS = [
  { name: "Email", icon: "mail" },
  { name: "Google", icon: "logo-google" },
  { name: "Apple", icon: "logo-apple" },
  { name: "Twitter", icon: "logo-twitter" },
  { name: "GitHub", icon: "logo-github" },
  { name: "Discord", icon: "logo-discord" },
  { name: "LinkedIn", icon: "logo-linkedin" },
  { name: "TikTok", icon: "musical-notes" },
];

export default function PrivyUI() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { login } = useLogin();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 20000, useNativeDriver: true })
    ).start();
  }, []);

  const handleLogin = () => {
    setError("");
    setIsLoading(true);
    login({
      loginMethods: ["email", "twitter", "tiktok", "google", "apple", "github", "discord", "linkedin"]
    })
      .then(() => setIsLoading(false))
      .catch((err) => {
        setError(err.error?.message || "Failed to login. Please try again.");
        setIsLoading(false);
      });
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bgCircle1, { transform: [{ rotate }] }]} />
      <Animated.View style={[styles.bgCircle2, { transform: [{ rotate }] }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.logoOuter}>
              <View style={styles.logoInner}>
                <Ionicons name="pulse" size={48} color={COLORS.primary} />
              </View>
            </View>
          </Animated.View>

          <View style={styles.titleSection}>
            <Text style={styles.title}>Welcome to Pulse</Text>
            <Text style={styles.subtitle}>Connect your account to start predicting</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <View style={styles.buttonGradient}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Animated.View style={{ transform: [{ rotate }] }}>
                    <Ionicons name="sync" size={20} color={COLORS.textPrimary} />
                  </Animated.View>
                  <Text style={styles.buttonText}>Connecting...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="wallet" size={22} color={COLORS.textPrimary} />
                  <Text style={styles.buttonText}>Connect Wallet</Text>
                </View>
              )}
            </View>
          </Pressable>

          <View style={styles.methodsContainer}>
            <Text style={styles.methodsTitle}>Supported login methods</Text>
            <View style={styles.methodsGrid}>
              {LOGIN_METHODS.map((method, i) => (
                <Animated.View key={i} style={[styles.methodTag, { opacity: fadeAnim }]}>
                  <Ionicons name={method.icon as any} size={16} color={COLORS.textMuted} />
                  <Text style={styles.methodTagText}>{method.name}</Text>
                </Animated.View>
              ))}
            </View>
          </View>

          {error && (
            <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
              <Ionicons name="warning" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
              <Text style={styles.footerText}>Secured by <Text style={styles.footerLink}>Privy</Text></Text>
            </View>
          </View>
          <View style={styles.terms}>
            <Text style={styles.termsText}>By connecting, you agree to our Terms of Service</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
