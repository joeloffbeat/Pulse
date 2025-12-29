import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '@/constants/theme';

interface QuickActionsProps {
  onSendTransaction: () => void;
  onGetAccountInfo: () => void;
  onRequestFaucet: () => void;
  isLoadingSend: boolean;
  isLoadingInfo: boolean;
  isLoadingFaucet: boolean;
}

export function QuickActions({
  onSendTransaction,
  onGetAccountInfo,
  onRequestFaucet,
  isLoadingSend,
  isLoadingInfo,
  isLoadingFaucet,
}: QuickActionsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <Pressable
        style={styles.actionButton}
        onPress={onSendTransaction}
        disabled={isLoadingSend}
      >
        <View style={styles.actionIconContainer}>
          <Ionicons name="send" size={22} color="#5b21b6" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Send 1 MOVE</Text>
          <Text style={styles.actionSubtitle}>
            {isLoadingSend ? 'Sending...' : 'Send 1 MOVE to test address'}
          </Text>
        </View>
        {isLoadingSend ? (
          <ActivityIndicator size="small" color="#5b21b6" />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        )}
      </Pressable>

      <Pressable
        style={styles.actionButton}
        onPress={onGetAccountInfo}
        disabled={isLoadingInfo}
      >
        <View style={styles.actionIconContainer}>
          <Ionicons name="information-circle" size={22} color="#0891b2" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Account Info</Text>
          <Text style={styles.actionSubtitle}>
            {isLoadingInfo ? 'Loading...' : 'View account details'}
          </Text>
        </View>
        {isLoadingInfo ? (
          <ActivityIndicator size="small" color="#5b21b6" />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        )}
      </Pressable>

      <Pressable
        style={[styles.actionButton, styles.faucetButton]}
        onPress={onRequestFaucet}
        disabled={isLoadingFaucet}
      >
        <View style={styles.actionIconContainer}>
          <Ionicons name="water" size={22} color="#f59e0b" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Request Faucet</Text>
          <Text style={styles.actionSubtitle}>
            {isLoadingFaucet ? 'Requesting...' : 'Get testnet tokens'}
          </Text>
        </View>
        {isLoadingFaucet ? (
          <ActivityIndicator size="small" color="#f59e0b" />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  faucetButton: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
});
