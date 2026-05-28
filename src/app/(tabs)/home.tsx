import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { HomeBannerCarousel } from '@/components/home-banner-carousel';
import { MaintenanceBanner } from '@/components/maintenance-banner';
import { OtpAlertBanner } from '@/components/otp-alert-banner';
import { useAuth } from '@/context/auth-context';
import { useSocket } from '@/context/socket-context';
import { api, getHomeBanners, getPublicSettings, type HomeBanner, type PublicSettings, type UserStats } from '@/lib/api';
import { JC } from '@/constants/jc-theme';

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const { refreshPendingOtpAlert } = useSocket();
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    inTransaction: 0,
    success: 0,
    inTransactionAmount: 0,
    successAmount: 0,
  });
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
      setStats({ inTransaction: 0, success: 0, inTransactionAmount: 0, successAmount: 0 });
    }
    setBannersLoading(true);
    try {
      const b = await getHomeBanners();
      setBanners(b);
    } catch {
      setBanners([]);
    } finally {
      setBannersLoading(false);
    }
    await refreshUser();
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
      refreshPendingOtpAlert().catch(() => {});
    }, [load, refreshPendingOtpAlert])
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

        {/* <View style={styles.menuGrid}>
          <Pressable style={styles.menuItem} onPress={() => router.push('/sell')}>
            <Text style={styles.menuItemTitle}>Order</Text>
            <Text style={styles.menuItemSub}>Sell USDT</Text>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => router.push('/team')}>
            <Text style={styles.menuItemTitle}>Team</Text>
            <Text style={styles.menuItemSub}>Referral</Text>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => router.push('/support')}>
            <Text style={styles.menuItemTitle}>Support</Text>
            <Text style={styles.menuItemSub}>Help Center</Text>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => router.push('/profile')}>
            <Text style={styles.menuItemTitle}>Profile</Text>
            <Text style={styles.menuItemSub}>My Account</Text>
          </Pressable>
        </View> */}

        <OtpAlertBanner />

        <HomeBannerCarousel
          banners={banners}
          loading={bannersLoading}
          fallbackTitle="We have some gift for you!"
          fallbackSubtitle={
            settings && settings.referralReward > 0
              ? `Invite friends — earn ₹${settings.referralReward} each`
              : undefined
          }
        />

        {settings?.maintenanceMode && <MaintenanceBanner />}

        <Pressable style={styles.tradeCard} onPress={() => router.push('/sell')}>
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

        <Pressable style={styles.tradeCard} onPress={() => router.push('/team')}>
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
          <Text style={styles.balanceLabel}>Assets balance</Text>
          <Text style={styles.balanceValue}>₹ {user?.balance?.toFixed(2) ?? '0.00'}</Text>
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
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  menuItem: {
    width: '48%',
    backgroundColor: JC.grayLight,
    borderWidth: 1,
    borderColor: JC.grayBorder,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  menuItemTitle: { fontSize: 14, fontWeight: '700', color: JC.black },
  menuItemSub: { fontSize: 12, color: JC.gray, marginTop: 4 },
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
});
