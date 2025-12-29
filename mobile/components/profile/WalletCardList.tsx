import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '@/constants/theme';

interface WalletAccount {
  address: string;
  public_key: string;
}

interface WalletCardListProps {
  wallets: WalletAccount[];
  activeAddress: string | undefined;
  onSelectWallet: (address: string) => void;
}

function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletCardList({ wallets, activeAddress, onSelectWallet }: WalletCardListProps) {
  return (
    <View style={styles.container}>
      {wallets.map((wallet, index) => {
        const isActive = activeAddress === wallet.address;
        return (
          <Pressable
            key={`${wallet.address}-${index}`}
            style={[styles.walletCard, isActive && styles.walletCardActive]}
            onPress={() => onSelectWallet(wallet.address)}
          >
            <View style={styles.walletCardHeader}>
              <View style={styles.walletIconContainer}>
                <Ionicons name="wallet" size={24} color="#5b21b6" />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Movement Wallet {index + 1}</Text>
                <Text style={styles.walletAddress}>{formatAddress(wallet.address)}</Text>
              </View>
            </View>
            {isActive && (
              <View style={styles.walletCardFooter}>
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                  <Text style={styles.badgeText}>Active</Text>
                </View>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    gap: 12,
  },
  walletCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  walletCardActive: {
    borderColor: '#5b21b6',
    backgroundColor: '#faf5ff',
  },
  walletCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f3ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  walletCardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
});
