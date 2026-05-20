import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { JcLogo } from '@/components/jc-logo';
import { MobileShell } from '@/components/mobile-shell';
import { useAuth } from '@/context/auth-context';
import { JC } from '@/constants/jc-theme';

export default function SplashScreenPage() {
  const { token, loading } = useAuth();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, [fade]);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      if (token) router.replace('/(tabs)');
      else router.replace('/login');
    }, 2200);
    return () => clearTimeout(timer);
  }, [loading, token]);

  return (
    <MobileShell>
      <View style={styles.container}>
        <View style={styles.yellowTop} />
        <Animated.View style={[styles.content, { opacity: fade }]}>
          <JcLogo size="lg" />
          <Text style={styles.tagline}>Trade smarter. Earn together.</Text>
        </Animated.View>
        <View style={styles.footer}>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: JC.white },
  yellowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: JC.yellow,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  tagline: { marginTop: 16, fontSize: 14, color: JC.gray, textAlign: 'center' },
  footer: { paddingBottom: 48, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: JC.grayBorder },
  dotActive: { backgroundColor: JC.yellow, width: 20 },
});
