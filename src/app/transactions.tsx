import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { StackHeader } from '@/components/stack-header';
import { MobileShell } from '@/components/mobile-shell';
import { PaginationBar } from '@/components/pagination-bar';
import { useSocket } from '@/context/socket-context';
import { useToast } from '@/context/toast-context';
import { api, type PaginatedResponse, type Transaction } from '@/lib/api';
import { JC } from '@/constants/jc-theme';

export default function TransactionsScreen() {
  const toast = useToast();
  const { clearOtpAlertAfterSuccess } = useSocket();
  const [list, setList] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Transaction>['pagination'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpModalTx, setOtpModalTx] = useState<Transaction | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [submittingOtp, setSubmittingOtp] = useState(false);

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

  function openOtpModal(item: Transaction) {
    setOtpModalTx(item);
    setOtpInput('');
  }

  function closeOtpModal() {
    setOtpModalTx(null);
    setOtpInput('');
  }

  async function submitOtp() {
    if (!otpModalTx) return;
    const code = otpInput.trim();
    if (code.length < 4) {
      toast.showError('Enter the OTP you received');
      return;
    }
    setSubmittingOtp(true);
    try {
      await api(`/transactions/mine/${otpModalTx._id}/submit-otp`, {
        method: 'POST',
        body: JSON.stringify({ otp: code }),
      });
      toast.showSuccess('OTP submitted. Waiting for admin approval.');
      await clearOtpAlertAfterSuccess(otpModalTx._id);
      closeOtpModal();
      load(page);
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : 'OTP submit failed');
    } finally {
      setSubmittingOtp(false);
    }
  }

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
        renderItem={({ item }) => {
          const canEnterOtp =
            item.status === 'pending' &&
            item.otpSent &&
            !item.userSubmittedOtp &&
            !item.blocked;
          return (
            <View style={styles.card}>
              <Pressable onPress={() => router.push(`/transaction/${item._id}`)}>
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
                {item.userSubmittedOtp ? (
                  <Text style={styles.otpOk}>OTP submitted — awaiting admin approval</Text>
                ) : item.otpSent ? (
                  <Text style={styles.otpWait}>Enter the OTP you received on your phone</Text>
                ) : null}
                <Text style={styles.link}>View details ›</Text>
              </Pressable>
              {canEnterOtp ? (
                <Pressable style={styles.otpBtn} onPress={() => openOtpModal(item)}>
                  <Text style={styles.otpBtnText}>Enter OTP</Text>
                </Pressable>
              ) : null}
            </View>
          );
        }}
      />

      <Modal visible={!!otpModalTx} transparent animationType="fade" onRequestClose={closeOtpModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter OTP</Text>
            <Text style={styles.modalSub}>
              Enter the OTP sent to your mobile number for this withdrawal request.
            </Text>
            <TextInput
              style={styles.otpInput}
              value={otpInput}
              onChangeText={setOtpInput}
              placeholder="6-digit OTP"
              placeholderTextColor={JC.gray}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={closeOtpModal} disabled={submittingOtp}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSubmit, submittingOtp && styles.disabled]}
                onPress={submitOtp}
                disabled={submittingOtp}>
                {submittingOtp ? (
                  <ActivityIndicator color={JC.white} />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit OTP</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  otpOk: { fontSize: 12, color: JC.green, fontWeight: '600', marginTop: 8 },
  otpWait: { fontSize: 12, color: '#1565C0', fontWeight: '600', marginTop: 8 },
  link: { fontSize: 14, color: JC.blue, fontWeight: '600', marginTop: 10 },
  otpBtn: {
    marginTop: 12,
    backgroundColor: JC.green,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  otpBtnText: { color: JC.white, fontWeight: '700', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: JC.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  modalSub: { fontSize: 14, color: JC.gray, lineHeight: 20, marginBottom: 16 },
  otpInput: {
    borderWidth: 1,
    borderColor: JC.grayBorder,
    borderRadius: 12,
    padding: 14,
    fontSize: 22,
    letterSpacing: 6,
    textAlign: 'center',
    fontWeight: '700',
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: JC.grayBorder,
  },
  modalCancelText: { fontWeight: '600', color: JC.gray },
  modalSubmit: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: JC.black,
  },
  modalSubmitText: { fontWeight: '700', color: JC.white },
  disabled: { opacity: 0.6 },
});
