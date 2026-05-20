import { Pressable, StyleSheet, Text, View } from 'react-native';

import { JC } from '@/constants/jc-theme';

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type Props = {
  pagination: Pagination | null;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

export function PaginationBar({ pagination, onPageChange, loading }: Props) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.btn, !pagination.hasPrev && styles.disabled]}
        disabled={!pagination.hasPrev || loading}
        onPress={() => onPageChange(pagination.page - 1)}>
        <Text style={styles.btnText}>Prev</Text>
      </Pressable>
      <Text style={styles.info}>
        Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
      </Text>
      <Pressable
        style={[styles.btn, !pagination.hasNext && styles.disabled]}
        disabled={!pagination.hasNext || loading}
        onPress={() => onPageChange(pagination.page + 1)}>
        <Text style={styles.btnText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: JC.grayBorder,
    marginTop: 8,
  },
  btn: {
    backgroundColor: JC.yellow,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 72,
    alignItems: 'center',
  },
  disabled: { opacity: 0.4 },
  btnText: { fontWeight: '700', fontSize: 14, color: JC.black },
  info: { fontSize: 12, color: JC.gray, textAlign: 'center', flex: 1, paddingHorizontal: 8 },
});
