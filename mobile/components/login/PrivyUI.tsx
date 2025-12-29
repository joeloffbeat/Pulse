import { useLogin } from "@privy-io/expo/ui";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  ScrollView,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { COLORS, SPACING, BORDER_RADIUS } from "@/constants/theme";

const { width } = Dimensions.get('window');

export default function PrivyUI() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { login } = useLogin();

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Background rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleLogin = () => {
    setError("");
    setIsLoading(true);
    
    login({ 
      loginMethods: [
        "email", 
        "twitter", 
        "tiktok", 
        "google", 
        "apple", 
        "github", 
        "discord", 
        "linkedin"
      ] 
    })
      .then((session) => {
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.error?.message || "Failed to login. Please try again.");
        setIsLoading(false);
      });
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const loginMethods = [
    { name: "Email", icon: "mail" },
    { name: "Google", icon: "logo-google" },
    { name: "Apple", icon: "logo-apple" },
    { name: "Twitter", icon: "logo-twitter" },
    { name: "GitHub", icon: "logo-github" },
    { name: "Discord", icon: "logo-discord" },
    { name: "LinkedIn", icon: "logo-linkedin" },
    { name: "TikTok", icon: "musical-notes" },
  ];

  return (
    <View style={styles.container}>
      {/* Animated background elements */}
      <Animated.View 
        style={[
          styles.bgCircle1,
          { transform: [{ rotate }] }
        ]} 
      />
      <Animated.View 
        style={[
          styles.bgCircle2,
          { transform: [{ rotate: rotate }] }
        ]} 
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.logoOuter}>
              <View style={styles.logoInner}>
                <Ionicons name="pulse" size={48} color={COLORS.primary} />
              </View>
            </View>
          </Animated.View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Welcome to Pulse</Text>
            <Text style={styles.subtitle}>
              Connect your account to start predicting
            </Text>
          </View>

          {/* Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
              isLoading && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <View style={styles.buttonGradient}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Animated.View
                    style={{ transform: [{ rotate: rotate }] }}
                  >
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

          {/* Supported Methods */}
          <View style={styles.methodsContainer}>
            <Text style={styles.methodsTitle}>Supported login methods</Text>
            <View style={styles.methodsGrid}>
              {loginMethods.map((method, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.methodTag,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <Ionicons name={method.icon as any} size={16} color={COLORS.textMuted} />
                  <Text style={styles.methodTagText}>{method.name}</Text>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <Animated.View
              style={[
                styles.errorContainer,
                { opacity: fadeAnim }
              ]}
            >
              <Ionicons name="warning" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
              <Text style={styles.footerText}>
                Secured by{" "}
                <Text style={styles.footerLink}>Privy</Text>
              </Text>
            </View>
          </View>

          {/* Terms */}
          <View style={styles.terms}>
            <Text style={styles.termsText}>
              By connecting, you agree to our Terms of Service
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '60',
  },
  titleSection: {
    marginBottom: 48,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  loginButton: {
    width: '100%',
    marginBottom: 32,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  loginButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  methodsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  methodsTitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  methodTag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodTagText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  errorContainer: {
    width: '100%',
    backgroundColor: COLORS.error + '20',
    borderWidth: 1,
    borderColor: COLORS.error + '40',
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  terms: {
    paddingTop: 8,
  },
  termsText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  bgCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: COLORS.primary + '10',
    top: -200,
    right: -100,
    zIndex: 0,
  },
  bgCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.secondary + '10',
    bottom: -150,
    left: -50,
    zIndex: 0,
  },
});