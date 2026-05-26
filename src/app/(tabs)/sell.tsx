import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import { MaintenanceBanner } from '@/components/maintenance-banner';
import { PaymentQrBlock } from '@/components/payment-qr-block';
import { useToast } from '@/context/toast-context';
import { api, getPublicSettings, type PublicSettings } from '@/lib/api';
import { JC } from '@/constants/jc-theme';

export default function SellScreen() {
  const toast = useToast();
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [settingsError, setSettingsError] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [transactionHash, setTransactionHash] = useState('');
  const [name, setName] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  const loadSettings = useCallback(() => {
    setSettingsLoading(true);
    setSettingsError('');
    getPublicSettings()
      .then((d) => {
        setSettings(d);
        setSettingsError('');
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : 'Failed to load settings';
        setSettings(null);
        setSettingsError(msg);
        toast.showError(msg);
      })
      .finally(() => setSettingsLoading(false));
  }, [toast]);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  async function copyAddress() {
    if (!settings?.walletAddress) {
      toast.showError('Admin has not set wallet address yet');
      return;
    }
    try {
      await Clipboard.setStringAsync(settings.walletAddress);
      toast.showSuccess('Wallet address copied');
    } catch {
      toast.showInfo(settings.walletAddress);
    }
  }

  async function handleSubmit() {
    if (settings?.maintenanceMode) {
      toast.showError('System is under maintenance. Try again later.');
      return;
    }
    if (!transactionHash.trim() || !name.trim() || !usdtAmount.trim() || !upiId.trim()) {
      toast.showError('Fill all fields: hash, name, USDT amount, UPI ID');
      return;
    }
    const usdt = Number(usdtAmount);
    if (!Number.isFinite(usdt) || usdt <= 0) {
      toast.showError('Enter a valid USDT amount');
      return;
    }
    const platformRate = settings?.usdtPrice ?? 0;
    const inrValue = usdt * platformRate;
    setLoading(true);
    try {
      await api('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          transactionHash: transactionHash.trim(),
          name: name.trim(),
          usdtAmount: usdt,
          value: inrValue,
          upiId: upiId.trim(),
        }),
      });
      toast.showSuccess('Sell request submitted successfully');
      setTransactionHash('');
      setName('');
      setUsdtAmount('');
      setUpiId('');
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  }

  const platformPrice = settings?.usdtPrice ?? 0;
  const binancePrice = settings?.binancePrice || platformPrice;
  const spread = Math.max(0, platformPrice - binancePrice);
  const usdtNum = Number(usdtAmount) || 0;
  const estimatedInr = usdtNum * platformPrice;
  const estimatedEarn = usdtNum * spread;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Sell USDT</Text>
          </View>

          {settings?.maintenanceMode && <MaintenanceBanner />}

          <View style={styles.priceBanner}>
            <Text style={styles.priceLabel}>Current rate</Text>
            <Text style={styles.price}>₹ {platformPrice.toFixed(2)} / USDT</Text>
            <Text style={styles.spreadNote}>
              Binance ₹{binancePrice.toFixed(2)} · Spread ₹{spread.toFixed(2)}/USDT
            </Text>
          </View>

          <PaymentQrBlock
            title="Scan QR to pay (UPI)"
            hint="After payment, send USDT to the wallet below and fill the form"
          />

          <View style={styles.stepBox}>
            <Text style={styles.stepNum}>STEP 1</Text>
            <Text style={styles.stepTitle}>Send USDT to this wallet</Text>
            {settingsLoading ? (
              <Text style={styles.muted}>Loading wallet address...</Text>
            ) : settingsError ? (
              <View>
                <Text style={styles.noAddr}>{settingsError}</Text>
                <Pressable style={styles.copyBtn} onPress={loadSettings}>
                  <Text style={styles.copyBtnText}>Retry</Text>
                </Pressable>
              </View>
            ) : settings?.walletAddress ? (
              <>
                <Text style={styles.walletAddr} selectable>
                  {settings.walletAddress}
                </Text>
                <Pressable style={styles.copyBtn} onPress={copyAddress}>
                  <Text style={styles.copyBtnText}>Copy Address</Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.noAddr}>
                Admin has not set wallet address yet. Ask admin to add it in Settings → Wallet Address, then tap Retry.
              </Text>
            )}
            {!settingsLoading && !settingsError && !settings?.walletAddress ? (
              <Pressable style={[styles.copyBtn, { marginTop: 10, backgroundColor: JC.yellow }]} onPress={loadSettings}>
                <Text style={[styles.copyBtnText, { color: JC.black }]}>Retry</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.stepBox}>
            <Text style={styles.stepNum}>STEP 2</Text>
            <Text style={styles.stepTitle}>Submit your payment proof</Text>
            <Text style={styles.stepSub}>After sending USDT, fill the form below</Text>
          </View>

          <Field label="Transaction Hash" value={transactionHash} onChangeText={setTransactionHash} placeholder="0x..." />
          <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          <Field
            label="Sell USDT amount"
            value={usdtAmount}
            onChangeText={setUsdtAmount}
            placeholder="e.g. 100"
            keyboardType="decimal-pad"
          />
          {usdtNum > 0 && platformPrice > 0 ? (
            <View style={styles.estimateBox}>
              <Text style={styles.estimateLine}>
                Receive (platform): ₹ {estimatedInr.toFixed(2)} ({usdtNum} × {platformPrice.toFixed(2)})
              </Text>
              <Text style={styles.estimateEarn}>
                Est. earning when approved: ₹ {estimatedEarn.toFixed(2)} ({usdtNum} × {spread.toFixed(2)})
              </Text>
            </View>
          ) : null}
          <Field label="UPI ID on Receive" value={upiId} onChangeText={setUpiId} placeholder="name@upi" />

          <Pressable
            style={[styles.submit, (loading || settings?.maintenanceMode) && styles.disabled]}
            onPress={handleSubmit}
            disabled={loading || settings?.maintenanceMode}>
            {loading ? (
              <ActivityIndicator color={JC.white} />
            ) : (
              <Text style={styles.submitText}>Submit Sell Request</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad';
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={fieldStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={JC.gray}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: JC.black },
  input: {
    borderWidth: 1,
    borderColor: JC.grayBorder,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: JC.white,
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: JC.white },
  scroll: { padding: 16, paddingBottom: 40 },
  header: {
    backgroundColor: JC.yellow,
    marginHorizontal: -16,
    marginTop: -16,
    padding: 16,
    paddingTop: 8,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  priceBanner: {
    backgroundColor: JC.yellowLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  priceLabel: { fontSize: 13, color: JC.gray },
  price: { fontSize: 24, fontWeight: '800', marginTop: 4 },
  spreadNote: { fontSize: 12, color: JC.gray, marginTop: 6 },
  estimateBox: {
    backgroundColor: JC.greenLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: JC.greenMuted,
  },
  estimateLine: { fontSize: 13, color: '#333' },
  estimateEarn: { fontSize: 13, fontWeight: '700', color: JC.greenDark, marginTop: 6 },
  stepBox: {
    borderWidth: 1,
    borderColor: JC.yellow,
    backgroundColor: JC.yellowLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  stepNum: { fontSize: 11, fontWeight: '800', color: JC.gray, letterSpacing: 1 },
  stepTitle: { fontWeight: '700', fontSize: 15, marginTop: 4 },
  stepSub: { fontSize: 13, color: JC.gray, marginTop: 4, marginBottom: 8 },
  walletAddr: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: JC.white,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    lineHeight: 20,
  },
  noAddr: { fontSize: 13, color: JC.red, marginTop: 8, lineHeight: 20 },
  muted: { fontSize: 13, color: JC.gray, marginTop: 8 },
  copyBtn: {
    backgroundColor: JC.black,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  copyBtnText: { color: JC.white, fontWeight: '700' },
  submit: {
    backgroundColor: JC.black,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabled: { opacity: 0.5 },
  submitText: { color: JC.white, fontWeight: '700', fontSize: 16 },
});
