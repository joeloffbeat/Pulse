import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_DURATION = 3000;

const toastConfig: Record<ToastType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  success: { icon: 'checkmark-circle', color: COLORS.success },
  error: { icon: 'alert-circle', color: COLORS.error },
  warning: { icon: 'warning', color: COLORS.warning },
  info: { icon: 'information-circle', color: COLORS.primary },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  const showSuccess = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const showError = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const showWarning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);
  const showInfo = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map(toast => {
          const config = toastConfig[toast.type];
          return (
            <Pressable
              key={toast.id}
              style={[styles.toast, { borderLeftColor: config.color }]}
              onPress={() => dismissToast(toast.id)}
            >
              <Ionicons name={config.icon} size={20} color={config.color} />
              <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
            </Pressable>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 1000,
    gap: SPACING.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
});
