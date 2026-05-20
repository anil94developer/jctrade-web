import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { StackHeader } from '@/components/stack-header';
import { MobileShell } from '@/components/mobile-shell';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { JC } from '@/constants/jc-theme';

export default function ProfileEditScreen() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setUpiId(user?.upiId || '');
  }, [user]);

  async function save() {
    setLoading(true);
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name, phone, upiId }),
      });
      await refreshUser();
      Alert.alert('Saved', 'Profile updated');
      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell>
      <StackHeader title="Edit Profile" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Your details</Text>
            <Text style={styles.infoSub}>Name, phone and UPI ID can be edited anytime</Text>
          </View>
          <Field label="Name" value={name} onChangeText={setName} />
          <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Field label="UPI ID" value={upiId} onChangeText={setUpiId} placeholder="name@upi" />
          <Pressable style={[styles.save, loading && styles.disabled]} onPress={save} disabled={loading}>
            {loading ? <ActivityIndicator color={JC.white} /> : <Text style={styles.saveText}>Save</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </MobileShell>
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
  keyboardType?: 'default' | 'phone-pad';
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
  wrap: { marginBottom: 16, paddingHorizontal: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: JC.grayBorder, borderRadius: 12, padding: 14, fontSize: 15 },
});

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  infoBox: {
    margin: 16,
    borderWidth: 1,
    borderColor: JC.yellow,
    backgroundColor: JC.yellowLight,
    borderRadius: 12,
    padding: 14,
  },
  infoTitle: { fontWeight: '700' },
  infoSub: { fontSize: 13, color: JC.gray, marginTop: 4 },
  save: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: JC.black,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  disabled: { opacity: 0.6 },
  saveText: { color: JC.white, fontWeight: '700', fontSize: 16 },
});
