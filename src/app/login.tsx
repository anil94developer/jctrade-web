import * as Google from 'expo-auth-session/providers/google';
import { GoogleLogin } from '@react-oauth/google';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { JcLogo } from '@/components/jc-logo';
import { MobileShell } from '@/components/mobile-shell';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { api, type User } from '@/lib/api';
import { GOOGLE_CLIENT_ID, getNativeRedirectUri } from '@/lib/google-auth';
import { JC } from '@/constants/jc-theme';

WebBrowser.maybeCompleteAuthSession();

function getWebOrigins(): string[] {
  if (typeof window === 'undefined') return ['http://localhost:8081'];
  const o = window.location.origin;
  const list = new Set([o, 'http://localhost:8081', 'http://127.0.0.1:8081']);
  return [...list];
}

export default function LoginScreen() {
  if (Platform.OS === 'web') {
    return <WebLogin />;
  }
  return <NativeLogin />;
}

function getReferralCodeFromUrl(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return String(params.get('ref') || params.get('referralCode') || '').trim();
}

function useGoogleSignIn() {
  const { signIn, token } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const referralCode = Platform.OS === 'web' ? getReferralCodeFromUrl() : '';

  useEffect(() => {
    if (token) {
      router.replace('/(tabs)');
    }
  }, [token]);

  const goHome = useCallback(() => {
    router.replace('/(tabs)');
  }, []);

  const handleGoogleToken = useCallback(
    async (idToken: string) => {
      if (!idToken || loading) return;
      setLoading(true);
      try {
        const data = await api<{ token: string; user: User }>('/auth/google', {
          method: 'POST',
          body: JSON.stringify({
            idToken,
            credential: idToken,
            referralCode: referralCode || undefined,
            ref: referralCode || undefined,
          }),
        });
        await signIn(data.token, data.user);
        toast.showSuccess('Login successful');
        goHome();
      } catch (err) {
        toast.showError(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setLoading(false);
      }
    },
    [signIn, loading, goHome, toast, referralCode]
  );

  return { loading, handleGoogleToken };
}

function WebLogin() {
  const { loading, handleGoogleToken } = useGoogleSignIn();
  const toast = useToast();
  const handledRef = useRef(false);
  const origins = getWebOrigins();
  /** GSI injects DOM that never matches SSR — mount only after hydration. */
  const [googleReady, setGoogleReady] = useState(false);
  useEffect(() => {
    setGoogleReady(true);
  }, []);

  return (
    <LoginLayout>
      <View style={styles.googleWrap}>
        {loading || !googleReady ? (
          <ActivityIndicator color={JC.black} size="large" />
        ) : (
          <GoogleLogin
            onSuccess={(res) => {
              if (handledRef.current) return;
              if (!res.credential) {
                toast.showError('Google sign-in failed. Check Authorized JavaScript origins in Google Console.');
                return;
              }
              handledRef.current = true;
              handleGoogleToken(res.credential);
            }}
            onError={() => {
              toast.showError(
                `Google blocked this site. Add origins in Console: ${origins.join(', ')}`
              );
            }}
            useOneTap={false}
            auto_select={false}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width={300}
          />
        )}
      </View>
      {/* <Text style={styles.warn}>
        Open app at http://localhost:8081 (not IP address)
      </Text>
      <Text style={styles.hint}>
        Google Console → JavaScript origins (add all):{'\n'}
        {origins.map((o) => (
          <Text key={o} style={styles.hintMono}>
            {o}
            {'\n'}
          </Text>
        ))}
      </Text> */}
    </LoginLayout>
  );
}

function NativeLogin() {
  const { loading, handleGoogleToken } = useGoogleSignIn();
  const redirectUri = getNativeRedirectUri();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) handleGoogleToken(idToken);
    }
  }, [response, handleGoogleToken]);

  return (
    <LoginLayout>
      <Pressable
        style={[styles.googleBtn, loading && styles.disabled]}
        onPress={() => promptAsync()}
        disabled={loading || !request}>
        {loading ? (
          <ActivityIndicator color={JC.black} />
        ) : (
          <>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </>
        )}
      </Pressable>
    </LoginLayout>
  );
}

function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <MobileShell>
      <SafeAreaView style={styles.safe}>
        <View style={styles.yellowBg} />
        <View style={styles.card}>
          <JcLogo size="md" />
          <Text style={styles.welcome}>Welcome to JCTRADE</Text>
          <Text style={styles.sub}>Sign in with your Gmail to continue</Text>
          {children}
        </View>
      </SafeAreaView>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  yellowBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: JC.yellow,
  },
  card: {
    flex: 1,
    marginTop: 120,
    marginHorizontal: 20,
    backgroundColor: JC.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  welcome: { fontSize: 20, fontWeight: '700', marginTop: 20, color: JC.black },
  sub: { fontSize: 14, color: JC.gray, marginTop: 8, marginBottom: 28, textAlign: 'center' },
  googleWrap: { width: 300, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: JC.white,
    borderWidth: 1,
    borderColor: JC.grayBorder,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    gap: 12,
  },
  disabled: { opacity: 0.6 },
  googleG: { fontSize: 20, fontWeight: '700', color: '#4285F4' },
  googleText: { fontSize: 16, fontWeight: '600', color: JC.black },
  warn: {
    marginTop: 16,
    fontSize: 12,
    color: JC.red,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: { marginTop: 12, fontSize: 11, color: JC.gray, textAlign: 'center', lineHeight: 16, width: '100%' },
  hintMono: { fontFamily: Platform.OS === 'web' ? 'monospace' : undefined, fontSize: 10 },
});
