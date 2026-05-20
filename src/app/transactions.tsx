import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { StackHeader } from '@/components/stack-header';
import { MobileShell } from '@/components/mobile-shell';
import { PaginationBar } from '@/components/pagination-bar';
import { api, type PaginatedResponse, type Transaction } from '@/lib/api';
import { JC } from '@/constants/jc-theme';

export default function TransactionsScreen() {
  const [list, setList] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Transaction>['pagination'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback((p: number) => {
    setLoading(true);
    api<PaginatedResponse<Transaction>>(`/transactions/mine?page=${p}&limit=10`)
      .then((res) => {
        setList(res.data);
        setPagination(res.pagination);
        setPage(p);
      })
      .catch(() => {
        setList([]);
        setPagination(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(1);
    }, [load])
  );

  return (
    <MobileShell>
      <StackHeader title="Sell Orders" />
      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={loading && list.length === 0 ? <ActivityIndicator color={JC.yellow} style={{ marginVertical: 24 }} /> : null}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.empty}>No Data</Text>
            </View>
          ) : null
        }
        ListFooterComponent={<PaginationBar pagination={pagination} onPageChange={load} loading={loading} />}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/transaction/${item._id}`)}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>Sell USDT</Text>
              <View style={[styles.badge, styles[`badge_${item.status}` as keyof typeof styles]]}>
                <Text style={[styles.badgeText, item.status === 'blocked' && styles.badgeTextLight]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.value}>₹ {item.value}</Text>
            <Text style={styles.meta}>Hash: {item.transactionHash.slice(0, 24)}...</Text>
            <Text style={styles.meta}>{new Date(item.createdAt).toLocaleString()}</Text>
            <Text style={styles.link}>View details ›</Text>
          </Pressable>
        )}
      />
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 32 },
  emptyWrap: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { color: JC.gray, fontSize: 16 },
  card: {
    backgroundColor: JC.white,
    borderWidth: 1,
    borderColor: JC.grayBorder,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: '700', fontSize: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badge_pending: { backgroundColor: '#FFF3CD' },
  badge_approved: { backgroundColor: JC.yellow },
  badge_rejected: { backgroundColor: '#FFEBEE' },
  badge_blocked: { backgroundColor: '#212121' },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize', color: JC.black },
  badgeTextLight: { color: JC.white },
  value: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  meta: { fontSize: 12, color: JC.gray, marginTop: 4 },
  link: { fontSize: 14, color: JC.blue, fontWeight: '600', marginTop: 10 },
});
