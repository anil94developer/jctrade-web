import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getPaymentQr, getPublicSettings, type PublicSettings } from '@/lib/api';
import { JC } from '@/constants/jc-theme';

type Props = {
  title?: string;
  hint?: string;
};

function pickQrImage(pub: PublicSettings, qr: { image: string | null } | null): string | null {
  if (pub.paymentQrImage && pub.paymentQrImage.length > 30) return pub.paymentQrImage;
  if (qr?.image && qr.image.length > 30) return qr.image;
  return null;
}

export function PaymentQrBlock({
  title = 'Scan UPI QR to pay',
  hint = 'Pay via UPI, then submit your transaction details below',
}: Props) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getPublicSettings()
      .then(async (pub) => {
        setSettings(pub);
        let image = pub.paymentQrImage && pub.paymentQrImage.length > 30 ? pub.paymentQrImage : null;
        if (!image && pub.hasPaymentQr) {
          try {
            const qr = await getPaymentQr();
            image = pickQrImage(pub, qr);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not load QR');
          }
        }
        setQrImage(image);
      })
      .catch((e) => {
        setSettings(null);
        setQrImage(null);
        setError(e instanceof Error ? e.message : 'Failed to load settings');
      })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const visible = settings?.paymentQrVisible !== false;
  const hasImage = Boolean(qrImage && qrImage.length > 30);

  if (loading) {
    return (
      <View style={styles.box}>
        <ActivityIndicator color={JC.green} />
        <Text style={styles.muted}>Loading payment QR...</Text>
      </View>
    );
  }

  if (!visible) return null;

  if (!hasImage) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          {settings?.hasPaymentQr
            ? 'QR is saved on server but could not load. Tap Retry or ask admin to re-upload after server deploy.'
            : 'Payment QR not uploaded yet. Admin: Settings → upload QR → Save Settings (use same API URL as the app).'}
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Pressable style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const uri = qrImage!.startsWith('data:') ? qrImage! : qrImage!;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    backgroundColor: JC.grayLight,
    borderRadius: 12,
  },
  muted: { marginTop: 8, fontSize: 13, color: JC.gray },
  placeholder: {
    backgroundColor: JC.grayLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  placeholderText: { fontSize: 13, color: JC.gray, textAlign: 'center', lineHeight: 20 },
  errorText: { fontSize: 12, color: JC.red, textAlign: 'center', marginTop: 8 },
  retryBtn: {
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: JC.green,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: { color: JC.white, fontWeight: '700' },
  card: {
    alignItems: 'center',
    backgroundColor: JC.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: JC.greenMuted,
  },
  title: { fontSize: 15, fontWeight: '700', color: JC.green, marginBottom: 12 },
  image: { width: 220, height: 220, borderRadius: 8, backgroundColor: JC.grayLight },
  hint: { fontSize: 12, color: JC.gray, textAlign: 'center', marginTop: 10, lineHeight: 18 },
});
