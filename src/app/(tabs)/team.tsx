import { useCallback, useState } from 'react';
import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import { useToast } from '@/context/toast-context';
import { api, type ReferralMe } from '@/lib/api';
import { JC } from '@/constants/jc-theme';

export default function TeamScreen() {
  const toast = useToast();
  const [data, setData] = useState<ReferralMe | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await api<ReferralMe>('/referrals/me');
    setData(res);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => setData(null));
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

  async function copyText(label: string, value: string) {
    if (!value) {
      toast.showError(`${label} not available`);
      return;
    }
    await Clipboard.setStringAsync(value);
    toast.showSuccess(`${label} copied`);
  }

  async function shareLink() {
    if (!data?.referralLink) {
      toast.showError('Set referral base URL in admin settings');
      return;
    }
    try {
      await Share.share({
        message: `Join JCTRADE with my referral link:\n${data.referralLink}\nCode: ${data.referralCode}`,
      });
    } catch {
      /* cancelled */
    }
  }

  const sellPct = data?.sellCashbackPercent ?? 0.4;
  const buyPct = data?.buyCashbackPercent ?? 0.3;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Team</Text>
        <View style={styles.teamBadge}>
          <Text style={styles.teamBadgeText}>{data?.teamCount ?? 0} members</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={JC.green} />}>
        <View style={styles.rebateCard}>
          <View style={styles.rebateRow}>
            <Text style={styles.rebateLabel}>Total team rebates</Text>
            <Text style={styles.rebateValue}>₹{(data?.totalTeamRebates ?? 0).toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rebateRow}>
            <Text style={styles.rebateLabel}>Today team rebates</Text>
            <Text style={styles.rebateValue}>₹{(data?.todayTeamRebates ?? 0).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.cashbackCard}>
          <Text style={styles.cashbackTitle}>Team Cashback</Text>
          <View style={styles.cashbackRow}>
            <View style={styles.cashbackCol}>
              <Text style={styles.arrowUp}>↑</Text>
              <Text style={styles.cashbackPct}>{sellPct}%</Text>
              <Text style={styles.cashbackSub}>Sell USDT</Text>
            </View>
            <View style={styles.cashbackDivider} />
            <View style={styles.cashbackCol}>
              <Text style={styles.arrowDown}>↓</Text>
              <Text style={styles.cashbackPct}>{buyPct}%</Text>
              <Text style={styles.cashbackSub}>Buy INR</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Invite friends</Text>

        <Text style={styles.fieldLabel}>Referral link</Text>
        <View style={styles.copyRow}>
          <TextInput
            style={styles.copyInput}
            value={data?.referralLink || 'Configure base URL in admin'}
            editable={false}
            multiline
          />
          <Pressable style={styles.copyBtn} onPress={() => copyText('Link', data?.referralLink || '')}>
            <Text style={styles.copyBtnText}>Copy</Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>Referral code</Text>
        <View style={styles.copyRow}>
          <TextInput style={styles.copyInput} value={data?.referralCode || ''} editable={false} />
          <Pressable style={styles.copyBtn} onPress={() => copyText('Code', data?.referralCode || '')}>
            <Text style={styles.copyBtnText}>Copy</Text>
          </Pressable>
        </View>

        {data?.referralReward ? (
          <Text style={styles.rewardHint}>
            Earn ₹{data.referralReward} when your invite completes their first approved sell
          </Text>
        ) : null}

        <Text style={styles.sectionLabel}>Share to</Text>
        <View style={styles.shareRow}>
          <Pressable style={styles.shareBtn} onPress={() => Linking.openURL('https://t.me/share/url')}>
            <Text style={styles.shareIcon}>TG</Text>
          </Pressable>
          <Pressable style={styles.shareBtn} onPress={shareLink}>
            <Text style={styles.shareIcon}>↗</Text>
          </Pressable>
          <Pressable
            style={[styles.shareBtn, styles.shareWhatsapp]}
            onPress={() =>
              Linking.openURL(
                `whatsapp://send?text=${encodeURIComponent(
                  `Join JCTRADE: ${data?.referralLink || data?.referralCode || ''}`
                )}`
              ).catch(() => shareLink())
            }>
            <Text style={[styles.shareIcon, styles.shareIconLight]}>WA</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Team reminder tips</Text>
        <View style={styles.tipsBox}>
          <Text style={styles.tip}>• Share your referral link — friends must sign up with Google using your link.</Text>
          <Text style={styles.tip}>• You earn when they complete their first approved USDT sell.</Text>
          <Text style={styles.tip}>• Never share OTPs or passwords with anyone claiming to be support.</Text>
        </View>

        {data && data.team.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>My team</Text>
            {data.team.map((m) => (
              <View key={m._id} style={styles.memberRow}>
                <View style={styles.flex1}>
                  <Text style={styles.memberName}>{m.name || m.email}</Text>
                  <Text style={styles.memberMeta}>UID {m.uid}</Text>
                </View>
                <Text style={[styles.memberStatus, m.rewarded && styles.memberRewarded]}>
                  {m.rewarded ? 'Rewarded' : 'Pending'}
                </Text>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: JC.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: JC.green },
  teamBadge: {
    backgroundColor: JC.green,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  teamBadgeText: { color: JC.white, fontWeight: '700', fontSize: 12 },
  scroll: { padding: 16, paddingBottom: 8 },
  rebateCard: {
    backgroundColor: JC.green,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  rebateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rebateLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  rebateValue: { color: JC.white, fontSize: 22, fontWeight: '800' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 14 },
  cashbackCard: {
    backgroundColor: JC.greenLight,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: JC.greenMuted,
  },
  cashbackTitle: { fontSize: 16, fontWeight: '700', color: JC.green, marginBottom: 14, textAlign: 'center' },
  cashbackRow: { flexDirection: 'row', alignItems: 'center' },
  cashbackCol: { flex: 1, alignItems: 'center' },
  cashbackDivider: { width: 1, height: 48, backgroundColor: JC.greenMuted },
  arrowUp: { fontSize: 20, color: JC.green, fontWeight: '700' },
  arrowDown: { fontSize: 20, color: JC.blueSell, fontWeight: '700' },
  cashbackPct: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  cashbackSub: { fontSize: 13, color: JC.gray, marginTop: 4 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: JC.green, marginBottom: 10, marginTop: 8 },
  fieldLabel: { fontSize: 13, color: JC.gray, marginBottom: 6 },
  copyRow: { flexDirection: 'row', gap: 8, marginBottom: 14, alignItems: 'center' },
  copyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: JC.grayBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    backgroundColor: JC.grayLight,
    color: JC.black,
  },
  copyBtn: {
    backgroundColor: JC.green,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  copyBtnText: { color: JC.white, fontWeight: '700', fontSize: 13 },
  rewardHint: { fontSize: 13, color: JC.gray, marginBottom: 12, lineHeight: 18 },
  shareRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: JC.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareWhatsapp: { backgroundColor: '#25D366' },
  shareIcon: { color: JC.white, fontWeight: '800', fontSize: 14 },
  shareIconLight: { color: JC.white },
  tipsBox: {
    backgroundColor: JC.grayLight,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  tip: { fontSize: 13, lineHeight: 20, color: '#444' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: JC.grayBorder,
  },
  flex1: { flex: 1 },
  memberName: { fontWeight: '600', fontSize: 15 },
  memberMeta: { fontSize: 12, color: JC.gray, marginTop: 2 },
  memberStatus: { fontSize: 12, fontWeight: '600', color: JC.orange },
  memberRewarded: { color: JC.green },
});
