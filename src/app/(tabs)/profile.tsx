import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { JC } from '@/constants/jc-theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const [loggingOut, setLoggingOut] = useState(false);
  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut();
      toast.showSuccess('Logged out');
      if (router.canDismiss?.()) {
        router.dismissAll();
      }
      router.replace('/login');
    } catch {
      toast.showError('Logout failed. Please try again');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.uid}>Referral code: {user?.uid || '—'}</Text>
          </View>
        </View>

        <View style={styles.earnCard}>
          <View style={styles.earnHalf}>
            <Text style={styles.earnLabel}>Today&apos;s Earn</Text>
            <Text style={styles.earnValue}>₹ 0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.earnHalf}>
            <Text style={styles.earnLabel}>Total&apos;s Earn</Text>
            <Text style={styles.earnValue}>₹ {user?.balance?.toFixed(2) ?? '0.00'}</Text>
          </View>
        </View>

        <Text style={styles.section}>My Orders</Text>
        <View style={styles.ordersRow}>
          <OrderIcon label="Balance" color="#FF9800" emoji="💰" />
          <Pressable onPress={() => router.push('/wallet-history')}>
            <OrderIcon label="Earn Record" color="#4CAF50" emoji="₹" />
          </Pressable>
          <Pressable onPress={() => router.push('/transactions')}>
            <OrderIcon label="Sell Order" color="#F44336" emoji="📤" />
          </Pressable>
        </View>

        <Pressable style={styles.menuItem} onPress={() => router.push('/profile-edit')}>
          <Text style={styles.menuEmoji}>✏️</Text>
          <Text style={styles.menuText}>Edit Profile (Name, Phone, UPI)</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => router.push('/transactions')}>
          <Text style={styles.menuEmoji}>📋</Text>
          <Text style={styles.menuText}>Transaction History</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => router.push('/wallet-history')}>
          <Text style={styles.menuEmoji}>💳</Text>
          <Text style={styles.menuText}>Wallet History</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => router.push('/(tabs)/team' as '/(tabs)/sell')}>
          <Text style={styles.menuEmoji}>👥</Text>
          <Text style={styles.menuText}>Team & Referrals</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <View style={styles.details}>
          <Text style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name: </Text>
            {user?.name || '—'}
          </Text>
          <Text style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone: </Text>
            {user?.phone || '—'}
          </Text>
          <Text style={styles.detailRow}>
            <Text style={styles.detailLabel}>UPI ID: </Text>
            {user?.upiId || '—'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.logoutFooter}>
        <Pressable
          style={[styles.logout, loggingOut && styles.logoutDisabled]}
          onPress={handleLogout}
          disabled={loggingOut}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          {loggingOut ? (
            <ActivityIndicator color={JC.black} />
          ) : (
            <Text style={styles.logoutText}>LogOut</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function OrderIcon({ label, color, emoji }: { label: string; color: string; emoji: string }) {
  return (
    <View style={styles.orderItem}>
      <View style={[styles.orderCircle, { backgroundColor: color }]}>
        <Text style={styles.orderEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.orderLabel}>{label}</Text>
    </View>
  );
}

const FOOTER_HEIGHT = 76;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: JC.white },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 16,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F48FB1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: JC.white },
  userInfo: { flex: 1 },
  email: { fontSize: 15, fontWeight: '600' },
  uid: { fontSize: 13, color: JC.gray, marginTop: 4 },
  earnCard: {
    flexDirection: 'row',
    backgroundColor: JC.yellow,
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
  },
  earnHalf: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: 'rgba(0,0,0,0.15)' },
  earnLabel: { fontSize: 13, color: '#333' },
  earnValue: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  section: { fontSize: 17, fontWeight: '700', marginBottom: 14 },
  ordersRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  orderItem: { alignItems: 'center', gap: 8 },
  orderCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  orderEmoji: { fontSize: 22 },
  orderLabel: { fontSize: 12, fontWeight: '500' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: JC.grayBorder,
    gap: 12,
  },
  menuEmoji: { fontSize: 20 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '500' },
  chevron: { fontSize: 22, color: JC.gray },
  details: { marginTop: 20, padding: 14, backgroundColor: JC.grayLight, borderRadius: 12 },
  detailRow: { fontSize: 14, marginBottom: 8 },
  detailLabel: { fontWeight: '600' },
  logoutFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: JC.grayBorder,
    backgroundColor: JC.white,
    minHeight: FOOTER_HEIGHT,
    zIndex: 10,
  },
  logout: {
    backgroundColor: JC.yellow,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  logoutDisabled: { opacity: 0.7 },
  logoutText: { fontWeight: '800', fontSize: 16, color: JC.black },
});
