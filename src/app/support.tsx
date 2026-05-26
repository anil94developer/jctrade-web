import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { getPublicSettings, type PublicSettings } from '@/lib/api';
import { JC } from '@/constants/jc-theme';

export default function SupportScreen() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getPublicSettings()
      .then(setSettings)
      .catch((e) => {
        setSettings(null);
        setError(e instanceof Error ? e.message : 'Failed to load');
      })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  /** Show when admin entered a value (visibility off only if value is empty). */
  const showPhone = Boolean(settings?.supportPhone?.trim());
  const showTelegram = Boolean(settings?.supportTelegram?.trim());
  const showWhatsapp = Boolean(settings?.supportWhatsapp?.trim());

  const items = settings
    ? [
        showPhone && {
          key: 'phone',
          icon: 'call-outline' as const,
          label: 'Phone',
          value: settings.supportPhone,
          action: () => Linking.openURL(`tel:${settings.supportPhone.replace(/\s/g, '')}`),
        },
        showTelegram && {
          key: 'telegram',
          icon: 'paper-plane-outline' as const,
          label: 'Telegram',
          value: settings.supportTelegram,
          action: () => {
            const t = settings.supportTelegram;
            const url = t.startsWith('http') ? t : `https://t.me/${t.replace('@', '')}`;
            Linking.openURL(url);
          },
        },
        showWhatsapp && {
          key: 'whatsapp',
          icon: 'logo-whatsapp' as const,
          label: 'WhatsApp',
          value: settings.supportWhatsapp,
          action: () => {
            const num = settings.supportWhatsapp.replace(/\D/g, '');
            Linking.openURL(`https://wa.me/${num}`);
          },
        },
      ].filter(Boolean)
    : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Support</Text>
        <Text style={styles.sub}>Contact us for help</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading && <Text style={styles.muted}>Loading...</Text>}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={load}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && items.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎧</Text>
            <Text style={styles.emptyTitle}>Service</Text>
            <Text style={styles.muted}>
              No support contacts configured. Admin: Settings → add Phone, Telegram, or WhatsApp and save.
            </Text>
          </View>
        )}

        {items.map((item) => (
          <Pressable key={item.key} style={styles.card} onPress={item.action}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={28} color={JC.black} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardValue} numberOfLines={2}>
                {item.value}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: JC.white },
  header: {
    backgroundColor: JC.yellow,
    padding: 20,
    paddingTop: 8,
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800' },
  sub: { fontSize: 14, color: '#333', marginTop: 4 },
  scroll: { padding: 16, paddingBottom: 32 },
  muted: { textAlign: 'center', color: JC.gray, fontSize: 14 },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: { color: JC.red, fontSize: 14, marginBottom: 12 },
  retryBtn: {
    backgroundColor: JC.black,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  retryText: { color: JC.white, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JC.white,
    borderWidth: 1,
    borderColor: JC.grayBorder,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: JC.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '700' },
  cardValue: { fontSize: 13, color: JC.gray, marginTop: 4 },
  chevron: { fontSize: 28, color: JC.gray, fontWeight: '300' },
});
