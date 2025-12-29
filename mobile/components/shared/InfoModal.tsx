import React from 'react';
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { SPACING, BORDER_RADIUS } from '@/constants/theme';

interface InfoModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function InfoModal({ visible, title, message, onClose }: InfoModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView style={styles.scrollContainer}>
            <Text style={styles.message}>{message}</Text>
          </ScrollView>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0f172a',
  },
  scrollContainer: {
    maxHeight: 300,
  },
  message: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    marginTop: SPACING.lg,
    backgroundColor: '#5b21b6',
    padding: 12,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
