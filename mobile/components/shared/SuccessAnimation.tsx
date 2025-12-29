import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface SuccessAnimationProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onComplete?: () => void;
  duration?: number;
}

export function SuccessAnimation({
  visible,
  title = 'Success!',
  subtitle,
  onComplete,
  duration = 2000,
}: SuccessAnimationProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate in
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(checkScale, {
          toValue: 1,
          tension: 150,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start(() => {
          scale.setValue(0);
          checkScale.setValue(0);
          onComplete?.();
        });
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [visible, duration, scale, opacity, checkScale, onComplete]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.checkCircle,
              { transform: [{ scale: checkScale }] },
            ]}
          >
            <Ionicons name="checkmark" size={48} color={COLORS.textPrimary} />
          </Animated.View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
