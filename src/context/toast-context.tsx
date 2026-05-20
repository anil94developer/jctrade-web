import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { JC } from '@/constants/jc-theme';

export type ToastType = 'success' | 'error' | 'info';

type ToastState = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_HIDE_MS = 4000;

function ToastBanner({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    return () => {
      opacity.setValue(0);
    };
  }, [toast.id, opacity]);

  const bg =
    toast.type === 'success' ? JC.green : toast.type === 'error' ? JC.red : JC.black;
  const icon = toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ';

  return (
    <Animated.View
      style={[
        styles.wrap,
        { top: insets.top + 8, opacity },
      ]}
      pointerEvents="box-none">
      <Pressable style={[styles.banner, { backgroundColor: bg }]} onPress={onDismiss}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.message}>{toast.message}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const show = useCallback(
    (type: ToastType, message: string) => {
      const text = message.trim() || (type === 'error' ? 'Something went wrong' : 'Done');
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ id: Date.now(), type, message: text });
      timerRef.current = setTimeout(dismiss, AUTO_HIDE_MS);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      showSuccess: (message: string) => show('success', message),
      showError: (message: string) => show('error', message),
      showInfo: (message: string) => show('info', message),
    }),
    [show]
  );

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastBanner toast={toast} onDismiss={dismiss} /> : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    left: 12,
    right: 12,
    zIndex: 999999,
    alignItems: 'center',
    maxWidth: JC.maxWidth,
    alignSelf: 'center',
    width: '100%',
    ...(Platform.OS === 'web'
      ? { marginLeft: 'auto' as const, marginRight: 'auto' as const }
      : {}),
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: JC.maxWidth,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    color: JC.white,
    fontSize: 18,
    fontWeight: '800',
  },
  message: {
    flex: 1,
    color: JC.white,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
