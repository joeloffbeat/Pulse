import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '@/constants/theme';

interface WalletDetailsProps {
  address: string;
  balance: number | null;
  chainType?: string;
}

export function WalletDetails({ address, balance, chainType = 'Movement' }: WalletDetailsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Wallet Details</Text>
      <View style={styles.addressCard}>
        <View style={styles.addressHeader}>
          <Ionicons name="key" size={20} color="#64748b" />
          <Text style={styles.addressLabel}>Wallet Address</Text>
        </View>
        <View style={styles.addressContent}>
          <Text style={styles.addressText}>{address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Balance:</Text>
          <Text style={styles.infoValue}>
            {balance !== null ? `${balance} MOVE` : 'Loading...'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Chain Type:</Text>
          <Text style={styles.infoValue}>{chainType}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  addressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
  },
});
