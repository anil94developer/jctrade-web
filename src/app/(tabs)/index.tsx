import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { MaintenanceBanner } from '@/components/maintenance-banner';
import { useAuth } from '@/context/auth-context';
import { api, getPublicSettings, type PublicSettings, type UserStats } from '@/lib/api';
import { JC } from '@/constants/jc-theme';

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [stats, setStats] = useState<UserStats>({ inTransaction: 0, success: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getPublicSettings();
      setSettings(data);
    } catch {
      setSettings(null);
    }
    try {
      const s = await api<UserStats>('/users/me/stats');
      setStats(s);
    } catch {
      setStats({ inTransaction: 0, success: 0 });
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

  const platformPrice = settings?.usdtPrice ?? 0;
  const binancePrice = settings?.binancePrice || platformPrice;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={JC.green} />}>
        <View style={styles.header}>
          <Text style={styles.logo}>JCTrade</Text>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>We have some gift for you!</Text>
          {settings && settings.referralReward > 0 && (
            <Text style={styles.referralText}>Invite friends — earn ₹{settings.referralReward} each</Text>
          )}
        </View>

        {settings?.maintenanceMode && <MaintenanceBanner />}

        <View style={styles.actionRow}>
          <Pressable style={[styles.actionBtn, styles.buyBtn]} onPress={() => router.push('/(tabs)/sell')}>
            <Text style={styles.actionIcon}>↓</Text>
            <Text style={styles.actionLabel}>Buy</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, styles.sellBtn]} onPress={() => router.push('/(tabs)/sell')}>
            <Text style={styles.actionIcon}>↑</Text>
            <Text style={styles.actionLabel}>Sell</Text>
          </Pressable>
        </View>

        <Pressable style={styles.tradeCard} onPress={() => router.push('/(tabs)/sell')}>
          <View style={styles.tradeCardHead}>
            <Text style={styles.tradeTitle}>Sell USDT by INR</Text>
            <Text style={styles.tradeArrow}>›</Text>
          </View>
          <Text style={styles.tradeSub}>Submit hash & UPI — get paid at platform price</Text>
          <View style={styles.priceCompare}>
            <View style={styles.priceBox}>
              <Text style={styles.priceBoxLabel}>Binance Price (₹)</Text>
              <Text style={styles.priceBoxValue}>{binancePrice.toFixed(2)}</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceBoxLabel}>Platform Price (₹)</Text>
              <Text style={[styles.priceBoxValue, styles.platformPrice]}>{platformPrice.toFixed(2)}</Text>
            </View>
          </View>
        </Pressable>

        <Pressable style={styles.tradeCard} onPress={() => router.push('/(tabs)/team' as '/(tabs)/sell')}>
          <View style={styles.tradeCardHead}>
            <Text style={styles.tradeTitle}>Join by Rupee / Referral</Text>
            <Text style={styles.tradeArrow}>›</Text>
          </View>
          <Text style={styles.tradeSub}>
            Cashback up to {settings?.sellCashbackPercent ?? 0.4}% sell · {settings?.buyCashbackPercent ?? 0.3}% buy
          </Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Today's Sell</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statYellow]}>
            <Text style={styles.statNum}>{stats.inTransaction}</Text>
            <Text style={styles.statLabel}>In Transaction</Text>
          </View>
          <View style={[styles.statCard, styles.statGreen]}>
            <Text style={styles.statNum}>{stats.success}</Text>
            <Text style={styles.statLabel}>Success</Text>
          </View>
        </View>

        <View style={styles.balanceStrip}>
          <Text style={styles.balanceLabel}>Wallet balance</Text>
          <Text style={styles.balanceValue}>₹ {user?.balance?.toFixed(2) ?? '0.00'}</Text>
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
          <Text style={styles.link} onPress={() => router.push('/(tabs)/wallet')}>
            → UPI / Payment QR
          </Text>
          <Text style={styles.link} onPress={() => router.push('/transactions')}>
            → Transaction History
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: JC.white },
  scroll: { padding: 16, paddingBottom: 16 },
  header: { marginBottom: 12 },
  logo: { fontSize: 26, fontWeight: '800', fontStyle: 'italic', color: JC.green },
  banner: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    minHeight: 80,
    justifyContent: 'center',
  },
  bannerText: { color: JC.white, fontSize: 18, fontWeight: '700' },
  referralText: { color: JC.white, fontSize: 13, marginTop: 8, opacity: 0.95 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtn: { backgroundColor: JC.green },
  sellBtn: { backgroundColor: JC.blueSell },
  actionIcon: { fontSize: 22, color: JC.white, fontWeight: '800' },
  actionLabel: { color: JC.white, fontWeight: '700', fontSize: 16, marginTop: 4 },
  tradeCard: {
    backgroundColor: JC.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: JC.grayBorder,
  },
  tradeCardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tradeTitle: { fontSize: 16, fontWeight: '700', color: JC.black },
  tradeArrow: { fontSize: 22, color: JC.green, fontWeight: '600' },
  tradeSub: { fontSize: 13, color: JC.gray, marginTop: 6, marginBottom: 12 },
  priceCompare: { flexDirection: 'row', gap: 10 },
  priceBox: {
    flex: 1,
    backgroundColor: JC.grayLight,
    borderRadius: 10,
    padding: 12,
  },
  priceBoxLabel: { fontSize: 11, color: JC.gray },
  priceBoxValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  platformPrice: { color: JC.green },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: JC.green, marginTop: 8, marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, padding: 16 },
  statYellow: { backgroundColor: '#FFF3E0' },
  statGreen: { backgroundColor: JC.greenLight },
  statNum: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 13, color: JC.gray, marginTop: 4 },
  balanceStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: JC.greenLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  balanceLabel: { fontSize: 14, color: JC.greenDark, fontWeight: '600' },
  balanceValue: { fontSize: 22, fontWeight: '800', color: JC.greenDark },
  walletPreview: {
    backgroundColor: JC.grayLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  walletLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  walletAddr: { fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },
  quickLinks: { gap: 12, marginBottom: 8 },
  link: { fontSize: 15, fontWeight: '600', color: JC.green },
});
