import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSocket } from '@/context/socket-context';
import { JC } from '@/constants/jc-theme';

export function OtpAlertBanner() {
  const { otpAlert, dismissOtpAlert } = useSocket();
  if (!otpAlert) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>OTP received</Text>
      <Text style={styles.body}>
        {otpAlert.message || 'You received an OTP on your mobile number. Enter it in Sell Orders.'}
      </Text>
      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={() => router.push('/transactions')}>
          <Text style={styles.primaryText}>Enter OTP</Text>
        </Pressable>
        <Pressable style={styles.dismissBtn} onPress={() => dismissOtpAlert()}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  title: { fontSize: 15, fontWeight: '800', color: '#1565C0', marginBottom: 6 },
  body: { fontSize: 13, color: '#333', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  primaryBtn: {
    flex: 1,
    backgroundColor: JC.green,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryText: { color: JC.white, fontWeight: '700', fontSize: 14 },
  dismissBtn: {
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  dismissText: { color: JC.gray, fontWeight: '600', fontSize: 13 },
});
