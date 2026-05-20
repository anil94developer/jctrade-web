import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { StackHeader } from '@/components/stack-header';
import { MobileShell } from '@/components/mobile-shell';
import { PaginationBar } from '@/components/pagination-bar';
import { api, type PaginatedResponse, type WalletEntry } from '@/lib/api';
import { JC } from '@/constants/jc-theme';

type Tab = 'all' | 'income' | 'expense';

export default function WalletHistoryScreen() {
  const [tab, setTab] = useState<Tab>('all');
  const [entries, setEntries] = useState<WalletEntry[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<WalletEntry>['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    (p: number, t: Tab) => {
      setLoading(true);
      const typeQ = t === 'all' ? '' : `&type=${t}`;
      api<PaginatedResponse<WalletEntry>>(`/wallet?page=${p}&limit=10${typeQ}`)
        .then((res) => {
          setEntries(res.data);
          setPagination(res.pagination);
        })
        .catch(() => {
          setEntries([]);
          setPagination(null);
        })
        .finally(() => setLoading(false));
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      load(1, tab);
    }, [tab, load])
  );

  function onTabChange(t: Tab) {
    setTab(t);
    load(1, t);
  }

  return (
    <MobileShell>
      <StackHeader title="Balance Record" />
      <View style={styles.tabs}>
        {(['all', 'income', 'expense'] as Tab[]).map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => onTabChange(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'all' ? 'All' : t === 'income' ? 'Income' : 'Expense'}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={loading && entries.length === 0 ? <ActivityIndicator color={JC.yellow} style={{ marginVertical: 24 }} /> : null}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No records</Text> : null}
        ListFooterComponent={
          <PaginationBar
            pagination={pagination}
            onPageChange={(p) => load(p, tab)}
            loading={loading}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDate}>{new Date(item.createdAt).toLocaleString()}</Text>
              <Text style={styles.balance}>
                Remaining balance: <Text style={styles.balanceVal}>{item.balance}</Text>
              </Text>
            </View>
            <Text style={[styles.amt, item.type === 'income' ? styles.income : styles.expense]}>
              {item.type === 'income' ? '+' : '-'}
              {item.amount}
            </Text>
          </View>
        )}
      />
    </MobileShell>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', padding: 12, gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: JC.grayLight },
  tabActive: { backgroundColor: JC.yellow },
  tabText: { fontSize: 13, color: JC.gray, fontWeight: '600' },
  tabTextActive: { color: JC.black },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { textAlign: 'center', color: JC.gray, marginTop: 40 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: JC.grayBorder,
  },
  rowLeft: { flex: 1, paddingRight: 12 },
  rowTitle: { fontWeight: '700', fontSize: 15 },
  rowDate: { fontSize: 12, color: JC.gray, marginTop: 4 },
  balance: { fontSize: 12, color: JC.gray, marginTop: 6 },
  balanceVal: { fontWeight: '700', color: JC.black },
  amt: { fontWeight: '700', fontSize: 16 },
  income: { color: JC.black },
  expense: { color: JC.black },
});
