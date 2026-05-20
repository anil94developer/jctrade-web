import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { SectionTitle } from '@/components/section-title';
import { useAuth } from '@/context/auth-context';
import { MaintenanceBanner } from '@/components/maintenance-banner';
import { api, getPublicSettings, type PublicSettings } from '@/lib/api';
import { JC } from '@/constants/jc-theme';

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getPublicSettings();
      setSettings(data);
    } catch {
      setSettings(null);
    }
    await refreshUser();
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={JC.yellow} />}>
        <View style={styles.header}>
          <Text style={styles.logo}>JCTrade</Text>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>Invite friends to earn money!</Text>
          {settings && settings.referralReward > 0 && (
            <Text style={styles.referralText}>Referral reward: ₹{settings.referralReward} per invite</Text>
          )}
        </View>

        {settings?.maintenanceMode && <MaintenanceBanner />}

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Current USDT Price</Text>
          <View style={styles.priceRow}>
            <View style={styles.coin}>
              <Text style={styles.coinText}>₹</Text>
            </View>
            <Text style={styles.priceValue}>{(settings?.usdtPrice ?? 0).toFixed(2)}</Text>
            <View style={styles.flex1} />
            <Text style={styles.inrNote}>INR per USDT</Text>
          </View>
          <Text style={styles.adminNote}>Price set by admin</Text>
        </View>

        <SectionTitle title="Asset Balance" />
        <View style={styles.balanceRow}>
          <View style={styles.coin}>
            <Text style={styles.coinText}>₹</Text>
          </View>
          <Text style={styles.balance}>{user?.balance?.toFixed(2) ?? '0.00'}</Text>
          <View style={styles.flex1} />
          <Text style={styles.pegged}>1 INRC = 1 INR</Text>
        </View>

        <SectionTitle title="Today's Sell" />
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statYellow]}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>In Transaction</Text>
          </View>
          <View style={[styles.statCard, styles.statBlue]}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Success</Text>
          </View>
        </View>

        <View style={styles.rewardBox}>
          <Text style={styles.rewardTitle}>Trading Rewards</Text>
          <Text style={styles.rewardSub}>You will receive profit on each USDT sell transaction</Text>
          <View style={styles.rewardCard}>
            <Text style={styles.rewardExample}>
              Sell USDT at the current admin price. Submit your transaction hash, name, value and UPI ID to receive
              payment.
            </Text>
          </View>
        </View>

        {settings?.walletAddress ? (
          <View style={styles.walletPreview}>
            <Text style={styles.walletLabel}>Send USDT to:</Text>
            <Text style={styles.walletAddr} numberOfLines={2}>
              {settings.walletAddress}
            </Text>
          </View>
        ) : null}

        <View style={styles.quickLinks}>
          <Text style={styles.link} onPress={() => router.push('/(tabs)/sell')}>
            → Sell USDT
          </Text>
          <Text style={styles.link} onPress={() => router.push('/transactions')}>
            → Transaction History
          </Text>
          <Text style={styles.link} onPress={() => router.push('/wallet-history')}>
            → Wallet History
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: JC.white },
  scroll: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16 },
  logo: { fontSize: 26, fontWeight: '800', fontStyle: 'italic', color: JC.black },
  banner: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    minHeight: 90,
    justifyContent: 'center',
  },
  bannerText: { color: JC.white, fontSize: 18, fontWeight: '700' },
  referralText: { color: JC.white, fontSize: 13, marginTop: 8, opacity: 0.95 },
  priceCard: {
    backgroundColor: JC.yellowLight,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: JC.yellow,
    marginBottom: 24,
  },
  priceLabel: { fontSize: 14, color: JC.gray, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex1: { flex: 1 },
  coin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: JC.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinText: { fontWeight: '800', fontSize: 16 },
  priceValue: { fontSize: 36, fontWeight: '800', color: JC.black },
  inrNote: { fontSize: 12, color: JC.gray },
  adminNote: { fontSize: 12, color: JC.gray, marginTop: 8 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  balance: { fontSize: 32, fontWeight: '800' },
  pegged: { fontSize: 12, color: JC.gray },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 14, padding: 16 },
  statYellow: { backgroundColor: '#FFF3E0' },
  statBlue: { backgroundColor: '#E3F2FD' },
  statNum: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 13, color: JC.gray, marginTop: 4 },
  rewardBox: { marginBottom: 20 },
  rewardTitle: { textAlign: 'center', fontWeight: '700', fontSize: 16, marginBottom: 6 },
  rewardSub: { textAlign: 'center', fontSize: 13, color: JC.gray, marginBottom: 12 },
  rewardCard: {
    borderWidth: 1,
    borderColor: JC.yellow,
    backgroundColor: JC.yellowLight,
    borderRadius: 12,
    padding: 14,
  },
  rewardExample: { fontSize: 13, lineHeight: 20, color: JC.black },
  walletPreview: {
    backgroundColor: JC.yellowLight,
    borderWidth: 1,
    borderColor: JC.yellow,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  walletLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  walletAddr: { fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },
  quickLinks: { gap: 12 },
  link: { fontSize: 15, fontWeight: '600', color: JC.blue },
});
