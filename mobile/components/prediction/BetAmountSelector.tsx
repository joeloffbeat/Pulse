import React from 'react';
import { StyleSheet, View, Text, Pressable, TextInput } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { BET_PRESETS, BET_LIMITS } from '@/constants/contracts';

interface BetAmountSelectorProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  maxAmount: number;
}

export function BetAmountSelector({
  amount,
  onAmountChange,
  maxAmount,
}: BetAmountSelectorProps) {
  const formatMove = (octas: number) => (octas / 1e8).toFixed(2);

  const handlePresetSelect = (value: number) => {
    if (value <= maxAmount) {
      onAmountChange(value);
    }
  };

  const handleCustomInput = (text: string) => {
    const moveAmount = parseFloat(text) || 0;
    const octasAmount = Math.round(moveAmount * 1e8);
    const clampedAmount = Math.min(
      Math.max(octasAmount, 0),
      Math.min(maxAmount, BET_LIMITS.MAX)
    );
    onAmountChange(clampedAmount);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Amount</Text>

      {/* Preset Buttons */}
      <View style={styles.presetRow}>
        {BET_PRESETS.map((preset) => {
          const isSelected = amount === preset.value;
          const isDisabled = preset.value > maxAmount;

          return (
            <Pressable
              key={preset.value}
              style={[
                styles.presetButton,
                isSelected && styles.presetSelected,
                isDisabled && styles.presetDisabled,
              ]}
              onPress={() => handlePresetSelect(preset.value)}
              disabled={isDisabled}
            >
              <Text
                style={[
                  styles.presetText,
                  isSelected && styles.presetTextSelected,
                  isDisabled && styles.presetTextDisabled,
                ]}
              >
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Custom Input */}
      <View style={styles.customInputContainer}>
        <Text style={styles.customLabel}>Or enter custom:</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={formatMove(amount)}
            onChangeText={handleCustomInput}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
          />
          <Text style={styles.inputSuffix}>MOVE</Text>
        </View>
      </View>

      {/* Min/Max Info */}
      <View style={styles.limitsRow}>
        <Text style={styles.limitText}>
          Min: {formatMove(BET_LIMITS.MIN)} MOVE
        </Text>
        <Text style={styles.limitText}>
          Max: {formatMove(Math.min(maxAmount, BET_LIMITS.MAX))} MOVE
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  presetButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.card,
  },
  presetSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}30`,
  },
  presetDisabled: {
    opacity: 0.4,
  },
  presetText: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  presetTextSelected: {
    color: COLORS.primary,
  },
  presetTextDisabled: {
    color: COLORS.textMuted,
  },
  customInputContainer: {
    marginTop: SPACING.md,
  },
  customLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 18,
    paddingVertical: SPACING.md,
  },
  inputSuffix: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  limitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  limitText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
