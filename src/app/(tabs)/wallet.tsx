import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { PaymentQrBlock } from '@/components/payment-qr-block';
import { useAuth } from '@/context/auth-context';
import { api, type PaginatedResponse, type WalletEntry } from '@/lib/api';
import { JC } from '@/constants/jc-theme';

export default function WalletScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WalletEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      api<PaginatedResponse<WalletEntry>>('/wallet?page=1&limit=5')
        .then((res) => setEntries(res.data))
        .catch(() => setEntries([]));
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>UPI Payment</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PaymentQrBlock />

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balance}>₹ {user?.balance?.toFixed(2) ?? '0.00'}</Text>
          {user?.upiId ? <Text style={styles.upi}>Your UPI: {user.upiId}</Text> : null}
        </View>

        <Pressable style={styles.menuItem} onPress={() => router.push('/wallet-history')}>
          <Text style={styles.menuText}>Wallet History</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => router.push('/transactions')}>
          <Text style={styles.menuText}>All Transactions</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Text style={styles.recentTitle}>Recent</Text>
        {entries.length === 0 ? (
          <Text style={styles.empty}>No wallet entries yet</Text>
        ) : (
          entries.slice(0, 5).map((e) => (
            <View key={e._id} style={styles.entry}>
              <View>
                <Text style={styles.entryTitle}>{e.title}</Text>
                <Text style={styles.entryDate}>{new Date(e.createdAt).toLocaleString()}</Text>
              </View>
              <Text style={[styles.entryAmt, e.type === 'income' ? styles.income : styles.expense]}>
                {e.type === 'income' ? '+' : '-'}
                {e.amount}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: JC.white },
  header: { backgroundColor: JC.green, padding: 16 },
  title: { fontSize: 18, fontWeight: '800', textAlign: 'center', color: JC.white },
  scroll: { padding: 16 },
  balanceCard: {
    backgroundColor: JC.greenLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: JC.greenMuted,
  },
  balanceLabel: { fontSize: 14, color: JC.greenDark },
  balance: { fontSize: 32, fontWeight: '800', marginTop: 4, color: JC.greenDark },
  upi: { fontSize: 13, marginTop: 8, color: '#333' },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: JC.grayBorder,
  },
  menuText: { fontSize: 16, fontWeight: '600' },
  chevron: { fontSize: 22, color: JC.gray },
  recentTitle: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 12, color: JC.green },
  empty: { color: JC.gray, textAlign: 'center', padding: 24 },
  entry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: JC.grayBorder,
  },
  entryTitle: { fontWeight: '600' },
  entryDate: { fontSize: 12, color: JC.gray, marginTop: 4 },
  entryAmt: { fontWeight: '700', fontSize: 16 },
  income: { color: JC.green },
  expense: { color: JC.red },
});
