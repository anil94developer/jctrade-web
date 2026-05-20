import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StackHeader } from '@/components/stack-header';
import { MobileShell } from '@/components/mobile-shell';
import { api, type Transaction } from '@/lib/api';
import { JC } from '@/constants/jc-theme';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api<Transaction>(`/transactions/mine/${id}`)
      .then(setTx)
      .catch(() => setTx(null))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <MobileShell>
      <StackHeader title="Transaction Details" />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={JC.yellow} />
      ) : !tx ? (
        <Text style={styles.empty}>Not found</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.badge, styles[`badge_${tx.status}` as keyof typeof styles]]}>
            <Text style={styles.badgeText}>{tx.status}</Text>
          </View>
          <Detail label="Transaction Hash" value={tx.transactionHash} />
          <Detail label="Name" value={tx.name} />
          <Detail label="Value" value={`₹ ${tx.value}`} />
          <Detail label="UPI ID on Receive" value={tx.upiId} />
          <Detail label="Date" value={new Date(tx.createdAt).toLocaleString()} />
        </ScrollView>
      )}
    </MobileShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { marginBottom: 20 },
  label: { fontSize: 13, color: JC.gray, marginBottom: 6 },
  value: { fontSize: 16, fontWeight: '600', color: JC.black },
});

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  empty: { textAlign: 'center', marginTop: 40, color: JC.gray },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginBottom: 20 },
  badge_pending: { backgroundColor: '#FFF3CD' },
  badge_approved: { backgroundColor: JC.yellow },
  badge_rejected: { backgroundColor: '#FFEBEE' },
  badge_blocked: { backgroundColor: '#212121' },
  badgeText: { fontWeight: '700', textTransform: 'capitalize' },
});
