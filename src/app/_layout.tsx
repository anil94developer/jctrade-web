import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GoogleProvider } from '@/components/google-provider';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { SocketProvider } from '@/context/socket-context';
import { ToastProvider } from '@/context/toast-context';
import { JC } from '@/constants/jc-theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const PROTECTED_SEGMENTS = new Set([
  '(tabs)',
  'transactions',
  'transaction',
  'profile-edit',
  'support',
]);

function AuthNavigationGuard() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const root = segments[0];
    if (!token && root && PROTECTED_SEGMENTS.has(root)) {
      router.replace('/login');
    }
    if (token && root === 'login') {
      router.replace('/(tabs)/home');
    }
  }, [token, loading, segments, router]);

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const ua = navigator.userAgent || '';
    const isAndroidWebView = /\bwv\b/.test(ua) || /;\s*wv\)/.test(ua);
    const isExplicitWebView = params.get('webview') === '1';
    const isWebView = isAndroidWebView || isExplicitWebView;
    document.documentElement.classList.toggle('is-webview', isWebView);
    document.body.classList.toggle('is-webview', isWebView);
  }, []);

  return (
    <SafeAreaProvider>
      <GoogleProvider>
        <AuthProvider>
          <ToastProvider>
          <SocketProvider>
          <AuthNavigationGuard />
        <StatusBar style="dark" />
        <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: JC.white },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      
        
        <Stack.Screen name="transactions" options={{ presentation: 'card' }} />
        <Stack.Screen name="transaction/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile-edit" options={{ presentation: 'card' }} />
      </Stack>
          </SocketProvider>
          </ToastProvider>
        </AuthProvider>
      </GoogleProvider>
    </SafeAreaProvider>
  );
}
