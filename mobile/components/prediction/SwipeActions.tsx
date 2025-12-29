import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@/constants/theme';

interface SwipeActionsProps {
  onNo: () => void;
  onSkip: () => void;
  onYes: () => void;
  disabled?: boolean;
}

export function SwipeActions({
  onNo,
  onSkip,
  onYes,
  disabled = false,
}: SwipeActionsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, styles.noButton, disabled && styles.disabled]}
        onPress={onNo}
        disabled={disabled}
      >
        <Ionicons name="close" size={32} color={COLORS.no} />
      </Pressable>

      <Pressable
        style={[styles.button, styles.skipButton, disabled && styles.disabled]}
        onPress={onSkip}
        disabled={disabled}
      >
        <Ionicons name="arrow-up" size={24} color={COLORS.skip} />
      </Pressable>

      <Pressable
        style={[styles.button, styles.yesButton, disabled && styles.disabled]}
        onPress={onYes}
        disabled={disabled}
      >
        <Ionicons name="checkmark" size={32} color={COLORS.yes} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  noButton: {
    borderColor: COLORS.no,
    backgroundColor: `${COLORS.no}20`,
  },
  skipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderColor: COLORS.skip,
    backgroundColor: `${COLORS.skip}20`,
  },
  yesButton: {
    borderColor: COLORS.yes,
    backgroundColor: `${COLORS.yes}20`,
  },
  disabled: {
    opacity: 0.5,
  },
});
