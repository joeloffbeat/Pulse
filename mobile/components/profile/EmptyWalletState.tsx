import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyWalletStateProps {
  type: 'not_logged_in' | 'creating_wallet' | 'loading';
}

export function EmptyWalletState({ type }: EmptyWalletStateProps) {
  if (type === 'creating_wallet') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5b21b6" />
        <Text style={styles.text}>Creating your Movement wallet...</Text>
        <Text style={styles.subtext}>This will only take a moment</Text>
      </View>
    );
  }

  if (type === 'loading') {
    return (
      <View style={styles.container}>
        <Ionicons name="wallet-outline" size={64} color="#cbd5e1" />
        <Text style={styles.text}>Setting up your wallet...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="wallet-outline" size={64} color="#cbd5e1" />
      <Text style={styles.text}>Please login to view your wallets</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
});
